import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawn} from 'node:child_process';
import {stageFile} from '../mods/files-preview/transport.js';
import {stageBundle} from '../mods/files-preview/bundle.js';
import {dirname} from 'node:path';
const machine=process.env.HERDR_TEST_MACHINE, root=process.env.HERDR_TEST_ROOT, hc=process.env.HERDR_TEST_HC;
function spawnResult(cmd,args){return new Promise((resolve,reject)=>{const p=spawn(cmd,args);let out='',err='';p.stdout.on('data',b=>out+=b);p.stderr.on('data',b=>err+=b);p.on('error',reject);p.on('close',code=>resolve({code,stdout:out,stderr:err}));});}
async function exec(cmd,args,opts){
 if(!opts?.on)return spawnResult(cmd,args);
 const r=await spawnResult(hc,['exec','--json','--on',opts.on,'--',cmd,...args]);
 if(r.code!==0)throw Error(r.stderr || r.stdout);
 const result=JSON.parse(r.stdout);
 if(result.truncated||result.timed_out)throw Error('remote output truncated or timed out');
 return {code:result.code,stdout:Buffer.from(result.stdout,'base64').toString('utf8'),stderr:Buffer.from(result.stderr,'base64').toString('utf8')};
}
test('real Core connection transfers remote file', {skip:!machine||!root||!hc},async()=>{
 const home=await mkdtemp(join(tmpdir(),'herdr-real-core-'));
 const staged=await stageFile(exec,home,root,`${root}/index.html`,machine);
 assert.match(await readFile(staged,'utf8'),/Remote HTML Fixture/);
});

test('real Core rejects outside symlink and oversized input', {skip:!machine||!root||!hc},async()=>{
 const home=await mkdtemp(join(tmpdir(),'herdr-real-core-deny-'));
 await assert.rejects(stageFile(exec,home,root,`${root}/outside-link`,machine));
 await assert.rejects(stageFile(exec,home,root,`${root}/too-large.bin`,machine));
});

test('real Core stages remote HTML with CSS, JS and PNG', {skip:!machine||!root||!hc},async()=>{
 const home=await mkdtemp(join(tmpdir(),'herdr-real-bundle-'));
 const entry=await stageBundle(exec,home,root,`${root}/index.html`,machine); const dir=dirname(entry);
 assert.match(await readFile(entry,'utf8'),/Remote HTML Fixture/);
 assert.match(await readFile(join(dir,'assets','style.css'),'utf8'),/background/);
 assert.match(await readFile(join(dir,'assets','app.js'),'utf8'),/Clicked/);
 assert.deepEqual((await readFile(join(dir,'assets','image.png'))).subarray(0,8),Buffer.from([137,80,78,71,13,10,26,10]));
});
test('real Core transfers 1 MiB fixture', {skip:!machine||!root||!hc},async()=>{
 const home=await mkdtemp(join(tmpdir(),'herdr-real-big-'));const start=Date.now();
 const staged=await stageFile(exec,home,root,`${root}/one-mib.bin`,machine);
 assert.equal((await readFile(staged)).length,1048576);console.log(`1 MiB real Core transfer: ${Date.now()-start} ms`);
});
