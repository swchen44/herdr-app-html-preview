import { stageFile, discardStagedFile } from './transport.js';

// Discover only explicit static dependencies; this is not a JavaScript interpreter.
const manifestScript = String.raw`import os,sys,json,re,stat,posixpath,hashlib
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
root=os.path.abspath(sys.argv[1]); entry=os.path.abspath(sys.argv[2])
if os.path.commonpath([root,entry])!=root: raise ValueError('entry outside Space')
if not hasattr(os,'O_NOFOLLOW') or not hasattr(os,'O_DIRECTORY'): raise ValueError('safe path traversal unavailable')
def read(relative):
 parts=relative.split('/')
 if any(x in ('','.','..') for x in parts): raise ValueError('invalid resource path')
 fd=os.open(root,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW)
 try:
  for p in parts[:-1]:
   nxt=os.open(p,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=fd); os.close(fd); fd=nxt
  item=os.open(parts[-1],os.O_RDONLY|os.O_NOFOLLOW|os.O_NONBLOCK,dir_fd=fd)
  try:
   if not stat.S_ISREG(os.fstat(item).st_mode): raise ValueError('resource is not a regular file')
   with os.fdopen(item,'rb',closefd=False) as f: data=f.read(5242881)
  finally: os.close(item)
 finally: os.close(fd)
 if len(data)>5242880: raise ValueError('resource exceeds 5 MiB')
 return data
def resolve(parent,url):
 url=url.strip()
 if not url or url.startswith('#'): return None
 parts=urlsplit(url)
 if parts.scheme or parts.netloc or url.startswith('//'): return None
 path=unquote(parts.path)
 if not path: return None
 if path.startswith('/') or '\\' in path or '\0' in path: raise ValueError('absolute or invalid resource URL')
 rel=posixpath.normpath(posixpath.join(posixpath.dirname(parent),path))
 if rel=='..' or rel.startswith('../'): raise ValueError('resource outside Space')
 return rel
class Page(HTMLParser):
 def __init__(self): super().__init__(); self.urls=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='base' and a.get('href'): raise ValueError('HTML base is unsupported')
  if tag=='script' and (a.get('type') or '').lower()=='module': raise ValueError('ES modules unsupported by file preview')
  for k in ('src','poster'):
   if a.get(k) and tag in ('script','img','source','video','audio','iframe','embed','input'): self.urls.append(a[k])
  if tag=='link' and a.get('href'): self.urls.append(a['href'])
  if a.get('srcset'):
   self.urls.extend(x.strip().split()[0] for x in a['srcset'].split(',') if x.strip())
  if a.get('style'): self.urls.extend(css(a['style']))
  if tag=='style': self.in_style=True
 def handle_endtag(self,tag):
  if tag=='style': self.in_style=False
 def handle_data(self,data):
  if getattr(self,'in_style',False): self.urls.extend(css(data))
def css(text):
 return [a or b or c for a,b,c in re.findall(r'url\(\s*(?:"([^"]+)"|\x27([^\x27]+)\x27|([^\)\s]+))\s*\)',text,flags=re.I)] + [a or b for a,b in re.findall(r'@import\s+(?:"([^"]+)"|\x27([^\x27]+)\x27)',text,flags=re.I)]
start=os.path.relpath(entry,root).replace(os.sep,'/'); pending=[start]; seen=set(); total=0; meta={}
while pending:
 rel=pending.pop(0)
 if rel in seen: continue
 if len(seen)>=64: raise ValueError('more than 64 resources')
 data=read(rel); total+=len(data)
 if total>20971520: raise ValueError('resources exceed 20 MiB')
 seen.add(rel); meta[rel]={'size':len(data),'sha256':hashlib.sha256(data).hexdigest()}; ext=posixpath.splitext(rel)[1].lower(); urls=[]
 if ext in ('.html','.htm'):
  page=Page(); page.feed(data.decode('utf-8')); urls=page.urls
 elif ext=='.css': urls=css(data.decode('utf-8'))
 # Static JS runtime URLs cannot be fully discovered. See documented limitations.
 for url in urls:
  dep=resolve(rel,url)
  if dep is not None and dep not in seen: pending.append(dep)
print(json.dumps({'entry':start,'files':sorted(seen),'meta':meta}))`;

const localScript = String.raw`import os,sys,tempfile,shutil,hashlib
op=sys.argv[1]; home=sys.argv[2]; base=os.path.join(home,'data','files-preview')
if op=='new':
 os.makedirs(base,mode=0o700,exist_ok=True); print(tempfile.mkdtemp(prefix='bundle-',dir=base))
elif op=='copy':
 bundle,rel,src,size,expected=sys.argv[3:]; target=os.path.abspath(os.path.join(bundle,rel))
 if os.path.commonpath([os.path.abspath(bundle),target])!=os.path.abspath(bundle): raise ValueError('invalid bundle path')
 os.makedirs(os.path.dirname(target),mode=0o700,exist_ok=True)
 with open(src,'rb') as f: data=f.read(5242881)
 if len(data)!=int(size) or hashlib.sha256(data).hexdigest()!=expected: raise ValueError('resource changed during bundle')
 with open(target,'xb') as out: out.write(data)
elif op=='abort':
 bundle=sys.argv[3]
 if os.path.dirname(os.path.abspath(bundle))!=os.path.abspath(base) or not os.path.basename(bundle).startswith('bundle-') or os.path.islink(bundle): raise ValueError('invalid bundle cleanup')
 shutil.rmtree(bundle)`;

async function run(exec, cmd, args, options) {
 const r=await exec(cmd,args,options);
 if(r.code!==0) throw new Error(r.stderr || 'Bundle operation failed');
 return r.stdout.trim();
}
export async function stageBundle(exec, home, root, path, on) {
 if(!on) return path;
 const manifest=JSON.parse(await run(exec,'python3',['-c',manifestScript,root,path],{on}));
 const valid = p => typeof p === 'string' && p.length>0 && !p.startsWith('/') && !p.split('/').some(part=>part===''||part==='.'||part==='..') && !p.includes('\\');
 if(!valid(manifest.entry)||!Array.isArray(manifest.files)||manifest.files.length>64||!manifest.files.includes(manifest.entry)||new Set(manifest.files).size!==manifest.files.length||manifest.files.some(p=>!valid(p))) throw new Error('Invalid remote bundle manifest');
 let total=0; for(const rel of manifest.files) { const m=manifest.meta?.[rel]; if(!m||!Number.isInteger(m.size)||m.size<0||m.size>5242880||!/^[0-9a-f]{64}$/.test(m.sha256)) throw new Error('Invalid resource metadata'); total+=m.size; }
 if(total>20971520) throw new Error('Bundle exceeds 20 MiB');
 const bundle=await run(exec,'/usr/bin/python3',['-c',localScript,'new',home]);
 if(!bundle.startsWith(home+'/data/files-preview/')) throw new Error('Invalid bundle path');
 try {
  for(const rel of manifest.files) {
   const staged=await stageFile(exec,home,root,`${root}/${rel}`,on);
   try { await run(exec,'/usr/bin/python3',['-c',localScript,'copy',home,bundle,rel,staged,String(manifest.meta[rel].size),manifest.meta[rel].sha256]); }
   finally { await discardStagedFile(exec,home,staged); }
  }
  return `${bundle}/${manifest.entry}`;
 } catch(error) {
  try { await run(exec,'/usr/bin/python3',['-c',localScript,'abort',home,bundle]); }
  catch(cleanup) { throw new Error(`${error}; bundle cleanup failed: ${cleanup}`); }
  throw error;
 }
}

export async function discardBundle(exec,home,entry) {
 const prefix=home+'/data/files-preview/';
 if(typeof entry!=='string'||!entry.startsWith(prefix)) throw new Error('Invalid bundle path');
 const name=entry.slice(prefix.length).split('/')[0];
 if(!/^bundle-[A-Za-z0-9_-]+$/.test(name)) throw new Error('Invalid bundle path');
 await run(exec,'/usr/bin/python3',['-c',localScript,'abort',home,prefix+name]);
}
