// Temporary single-file transfer. Remote Python is required; no directory mirroring.
const chunkSize = 32768;
const maxBytes = 5 * 1024 * 1024;
const remoteScript = `import os,sys,json,base64,hashlib,stat
root,path,offset,count=sys.argv[1:]
root=os.path.abspath(root); path=os.path.abspath(path)
if os.path.commonpath([root,path])!=root: raise ValueError('path is outside space')
parts=os.path.relpath(path,root).split(os.sep)
if not parts or any(p in ('','.','..') for p in parts): raise ValueError('invalid path')
if not hasattr(os,'O_NOFOLLOW') or not hasattr(os,'O_DIRECTORY'): raise ValueError('safe path traversal unavailable')
fd=os.open(root,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW)
try:
 for part in parts[:-1]:
  nxt=os.open(part,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=fd); os.close(fd); fd=nxt
 item=os.open(parts[-1],os.O_RDONLY|os.O_NOFOLLOW|os.O_NONBLOCK,dir_fd=fd)
 try:
  if not stat.S_ISREG(os.fstat(item).st_mode): raise ValueError('not a regular file')
  with os.fdopen(item,'rb',closefd=False) as f: data=f.read(5242881)
 finally: os.close(item)
finally: os.close(fd)
if len(data)>5242880: raise ValueError('file exceeds 5 MiB')
print(json.dumps({'size':len(data),'hash':hashlib.sha256(data).hexdigest(),'chunk':base64.b64encode(data[int(offset):int(offset)+int(count)]).decode()}))`;
const localScript = `import os,sys,tempfile,base64,hashlib,shutil\nop=sys.argv[1]\nif op=='new':\n root=sys.argv[2]; base=os.path.join(root,'data','files-preview'); os.makedirs(base,mode=0o700,exist_ok=True); d=tempfile.mkdtemp(prefix='remote-',dir=base); print(os.path.join(d,os.path.basename(sys.argv[3])))\nelif op=='append':\n with open(sys.argv[2],'ab') as f: f.write(base64.b64decode(sys.argv[3],validate=True))\nelif op=='verify':\n with open(sys.argv[2],'rb') as f: data=f.read()\n if len(data)!=int(sys.argv[3]) or hashlib.sha256(data).hexdigest()!=sys.argv[4]: raise ValueError('transfer verification failed')\nelif op=='abort':\n base=os.path.abspath(os.path.join(sys.argv[2],'data','files-preview')); d=os.path.abspath(os.path.dirname(sys.argv[3]));\n if os.path.dirname(d)!=base or not os.path.basename(d).startswith('remote-') or os.path.islink(d): raise ValueError('unsafe cleanup path')\n shutil.rmtree(d)`;
async function run(exec, command, args, options) {
  const r = await exec(command, args, options);
  if (r.code !== 0) throw new Error(r.stderr || 'Transfer failed');
  return r.stdout.trim();
}
export async function stageFile(exec, home, root, path, on) {
  if (!on) return path;
  let local = null, expected = null;
  try {
  for (let offset = 0; ; offset += chunkSize) {
    const raw = await run(exec, 'python3', ['-c', remoteScript, root, path, String(offset), String(chunkSize)], {on});
    const item = JSON.parse(raw);
    if (!Number.isInteger(item.size) || item.size < 0 || item.size > maxBytes || !/^[0-9a-f]{64}$/.test(item.hash) || typeof item.chunk !== 'string') throw new Error('Invalid remote response');
    if (!expected) {
      expected = item;
      local = await run(exec, '/usr/bin/python3', ['-c', localScript, 'new', home, path]);
      if (!local.startsWith(home + '/data/files-preview/')) throw new Error('Invalid temporary path');
    }
    if (item.size !== expected.size || item.hash !== expected.hash) throw new Error('Remote file changed during transfer');
    await run(exec, '/usr/bin/python3', ['-c', localScript, 'append', local, item.chunk]);
    if (offset + chunkSize >= item.size) break;
  }
  await run(exec, '/usr/bin/python3', ['-c', localScript, 'verify', local, String(expected.size), expected.hash]);
  return local;
  } catch (error) {
    if (local) {
      try { await run(exec, '/usr/bin/python3', ['-c', localScript, 'abort', home, local]); }
      catch (cleanup) { throw new Error(`${error}; temporary cleanup failed: ${cleanup}`); }
    }
    throw error;
  }
}

// Only call for a temporary file returned by stageFile for a remote source.
export async function discardStagedFile(exec, home, staged) {
  await run(exec, '/usr/bin/python3', ['-c', localScript, 'abort', home, staged]);
}
