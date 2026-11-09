// Only this mod's temporary directories are eligible, on a best-effort 7-day TTL.
export async function pruneCache(exec, home) {
  const code = `import os,sys,time,shutil\nbase=os.path.join(sys.argv[1],'data','files-preview')\nif os.path.isdir(base) and not os.path.islink(base):\n for e in os.scandir(base):\n  if e.name.startswith(('bundle-','media-','remote-')) and e.is_dir(follow_symlinks=False) and time.time()-e.stat(follow_symlinks=False).st_mtime>604800:\n   shutil.rmtree(e.path)`;
  const result=await exec('/usr/bin/python3',['-c',code,home]);
  if(result.code!==0) throw new Error(result.stderr || 'Cannot clean preview cache');
}
