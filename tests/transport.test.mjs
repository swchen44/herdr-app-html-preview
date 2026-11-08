import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile, readFile, symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawn} from 'node:child_process';
import {stageFile} from '../poc/files-preview/transport.js';
const run = (command,args) => new Promise((resolve,reject) => {const p=spawn(command,args); let stdout='',stderr=''; p.stdout.on('data',x=>stdout+=x);p.stderr.on('data',x=>stderr+=x);p.on('error',reject);p.on('close',code=>resolve({code,stdout,stderr}));});
test('transfers multiple chunks byte-for-byte and refuses escape', async () => {
 const root=await mkdtemp(join(tmpdir(),'herdr-preview-test-')), home=join(root,'home'), space=join(root,'space');
 await mkdir(home); await mkdir(space);
 const src=join(space,'hello $ name.bin'), bytes=Buffer.from(Array.from({length:70001},(_,i)=>i%256));
 await writeFile(src,bytes);
 const staged=await stageFile(run,home,space,src,'test-machine');
 assert.deepEqual(await readFile(staged),bytes);
 await symlink('/etc/hosts',join(space,'outside'));
 await assert.rejects(stageFile(run,home,space,join(space,'outside'),'test-machine'));
});
