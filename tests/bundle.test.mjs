import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {spawn} from 'node:child_process';
import {stageBundle} from '../mods/files-preview/bundle.js';
const run=(cmd,args)=>new Promise((resolve,reject)=>{const p=spawn(cmd,args);let stdout='',stderr='';p.stdout.on('data',x=>stdout+=x);p.stderr.on('data',x=>stderr+=x);p.on('error',reject);p.on('close',code=>resolve({code,stdout,stderr}));});
test('stages HTML and relative CSS, JS, images and nested CSS assets',async()=>{
 const t=await mkdtemp(join(tmpdir(),'herdr-bundle-')), home=join(t,'home'), root=join(t,'space');
 await mkdir(home);await mkdir(join(root,'assets'),{recursive:true});
 await writeFile(join(root,'index.html'),'<link rel="stylesheet" href="assets/app.css"><script src="assets/app.js"></script><img src="assets/icon.png">');
 await writeFile(join(root,'assets','app.css'),'body{background:url("bg.png")}');
 await writeFile(join(root,'assets','app.js'),'document.body.textContent="ok"');
 await writeFile(join(root,'assets','icon.png'),Buffer.from([0,1,2])); await writeFile(join(root,'assets','bg.png'),Buffer.from([7,8,9]));
 const entry=await stageBundle(run,home,root,join(root,'index.html'),'remote');
 assert.equal(await readFile(join(dirname(entry),'assets','app.js'),'utf8'),'document.body.textContent="ok"');
 assert.deepEqual(await readFile(join(dirname(entry),'assets','icon.png')),Buffer.from([0,1,2]));
 assert.deepEqual(await readFile(join(dirname(entry),'assets','bg.png')),Buffer.from([7,8,9]));
});
test('rejects resources that are symlinks outside the Space',async()=>{
 const t=await mkdtemp(join(tmpdir(),'herdr-bundle-')), home=join(t,'home'), root=join(t,'space');await mkdir(home);await mkdir(root);
 await writeFile(join(root,'index.html'),'<img src="outside">');await symlink('/etc/hosts',join(root,'outside'));
 await assert.rejects(stageBundle(run,home,root,join(root,'index.html'),'remote'));
});
test('fails closed if a resource changes after manifest discovery',async()=>{
 const t=await mkdtemp(join(tmpdir(),'herdr-bundle-change-')), home=join(t,'home'), root=join(t,'space');await mkdir(home);await mkdir(root);
 const asset=join(root,'app.js');await writeFile(join(root,'index.html'),'<script src="app.js"></script>');await writeFile(asset,'before');
 const changing=async(cmd,args,options)=>{const result=await run(cmd,args); if(options?.on && args[1]?.includes('HTMLParser')) await writeFile(asset,'after'); return result;};
 await assert.rejects(stageBundle(changing,home,root,join(root,'index.html'),'remote'),/changed/);
});
test('can remove only a bundle created in the mod cache', async()=>{
 const {discardBundle}=await import('../mods/files-preview/bundle.js');
 const {access}=await import('node:fs/promises');
 const t=await mkdtemp(join(tmpdir(),'herdr-bundle-clean-')), home=join(t,'home'), root=join(t,'space');await mkdir(home);await mkdir(root);
 await writeFile(join(root,'index.html'),'<h1>ok</h1>');
 const entry=await stageBundle(run,home,root,join(root,'index.html'),'remote');
 await discardBundle(run,home,entry); await assert.rejects(access(entry));
 await assert.rejects(discardBundle(run,home,'/etc/hosts'));
});
test('rejects ES modules and root-relative paths explicitly',async()=>{
 const t=await mkdtemp(join(tmpdir(),'herdr-bundle-unsupported-')), home=join(t,'home'), root=join(t,'space');await mkdir(home);await mkdir(root);
 const entry=join(root,'index.html');
 await writeFile(entry,'<script type="module" src="mod.js"></script>');
 await assert.rejects(stageBundle(run,home,root,entry,'remote'),/modules unsupported/);
 await writeFile(entry,'<img src="/assets/icon.png">');
 await assert.rejects(stageBundle(run,home,root,entry,'remote'),/absolute or invalid/);
});
