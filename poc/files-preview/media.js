// Generate bounded local preview images inside the isolated Herdr app home.
export async function renderMedia(exec, home, path, on, pdf) {
  if (on) throw new Error('Remote images and PDFs require a verified transfer');
  const script = `import os,sys,tempfile,shutil,subprocess,json\nroot,src,pdf=sys.argv[1:]\nbase=os.path.join(root,'data','files-preview')\nos.makedirs(base,mode=0o700,exist_ok=True)\nout=tempfile.mkdtemp(prefix='preview-',dir=base)\nif pdf == '1':\n r=subprocess.run(['/usr/bin/qlmanage','-t','-s','1200','-o',out,src],capture_output=True,text=True,timeout=30)\n if r.returncode: raise RuntimeError(r.stderr)\n files=[os.path.join(out,n) for n in os.listdir(out) if n.lower().endswith('.png')]\n if len(files)!=1: raise RuntimeError('PDF thumbnail unavailable')\n dest=files[0]\nelse:\n dest=os.path.join(out,'image.png')\n r=subprocess.run(['/usr/bin/sips','-s','format','png',src,'--out',dest],capture_output=True,text=True,timeout=30)\n if r.returncode: raise RuntimeError(r.stderr)\nprint(os.path.relpath(dest,root))`;
  const r = await exec('/usr/bin/python3', ['-c', script, home, path, pdf ? '1' : '0']);
  if (r.code !== 0) throw new Error(r.stderr || 'Media preview failed');
  const result = r.stdout.trim();
  if (!result.startsWith('data/files-preview/')) throw new Error('Invalid preview path');
  return result;
}
