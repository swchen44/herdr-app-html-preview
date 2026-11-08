// Mac-only local file actions. Remote operations require a verified transport.
export async function openChrome(exec, path, on) {
  if (on) throw new Error('Remote Chrome preview requires a verified transfer');
  const r = await exec('/usr/bin/open', ['-a', 'Google Chrome', path]);
  if (r.code !== 0) throw new Error(r.stderr || 'Could not open Chrome');
}

export async function saveCopy(exec, pickFolder, path, on) {
  if (on) throw new Error('Remote Save As requires a verified transfer');
  const folder = await pickFolder({ prompt: 'Choose destination folder' });
  if (!folder) return false;
  const script = 'import os,sys,shutil\ns,d=sys.argv[1:]\nt=os.path.join(d,os.path.basename(s))\nwith open(s,"rb") as src, open(t,"xb") as dst: shutil.copyfileobj(src,dst)';
  const r = await exec('/usr/bin/python3', ['-c', script, path, folder]);
  if (r.code !== 0) throw new Error(r.stderr || 'Could not save copy');
  return true;
}
