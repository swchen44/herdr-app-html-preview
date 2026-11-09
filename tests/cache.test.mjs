import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,utimes,symlink,readdir,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawn} from 'node:child_process';
import {pruneCache} from '../mods/files-preview/cache.js';
const run=(cmd,args)=>new Promise((resolve,reject)=>{const p=spawn(cmd,args);let stdout='',stderr='';p.stdout.on('data',b=>stdout+=b);p.stderr.on('data',b=>stderr+=b);p.on('error',reject);p.on('close',code=>resolve({code,stdout,stderr}));});
test('removes only old owned directories, never follows symlinks',async()=>{
 const home=await mkdtemp(join(tmpdir(),'herdr-cache-')), base=join(home,'data','files-preview'), other=join(home,'other');await mkdir(base,{recursive:true});await mkdir(other);
 await writeFile(join(other,'keep'),'safe');await mkdir(join(base,'bundle-old'));await mkdir(join(base,'media-new'));await mkdir(join(base,'foreign-old'));await symlink(other,join(base,'remote-link'));
 const old=new Date(Date.now()-9*24*60*60*1000);await utimes(join(base,'bundle-old'),old,old);await utimes(join(base,'foreign-old'),old,old);
 await pruneCache(run,home);
 assert.deepEqual((await readdir(base)).sort(),['foreign-old','media-new','remote-link']);assert.equal(await readFile(join(other,'keep'),'utf8'),'safe');
});
