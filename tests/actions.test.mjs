import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openChrome, saveCopy } from '../mods/files-preview/actions.js';

test('Chrome gets local path as an argument', async () => {
  const calls = [];
  await openChrome(async (...args) => { calls.push(args); return { code: 0 }; }, '/tmp/a $(test).html', null);
  assert.deepEqual(calls[0], ['/usr/bin/open', ['-a', 'Google Chrome', '/tmp/a $(test).html']]);
});

test('remote actions fail closed without a transfer', async () => {
  await assert.rejects(openChrome(() => assert.fail(), '/tmp/x.html', 'remote'), /Remote/);
  await assert.rejects(saveCopy(() => assert.fail(), () => assert.fail(), '/tmp/x', 'remote'), /Remote/);
});

test('cancelled save does not run a copy', async () => {
  assert.equal(await saveCopy(() => assert.fail(), async () => null, '/tmp/x', null), false);
});

test('save surfaces copy failure', async () => {
  await assert.rejects(saveCopy(async () => ({code: 1, stderr: 'exists'}), async () => '/tmp', '/tmp/x', null), /exists/);
});

test('Save As copies bytes and never overwrites an existing file', async () => {
  const {mkdtemp,mkdir,writeFile,readFile}=await import('node:fs/promises');
  const {tmpdir}=await import('node:os'); const {join}=await import('node:path');
  const {spawn}=await import('node:child_process');
  const root=await mkdtemp(join(tmpdir(),'herdr-save-test-')), dest=join(root,'destination'), src=join(root,'sample.html');
  await mkdir(dest); await writeFile(src,'original content');
  const run=(cmd,args)=>new Promise((resolve,reject)=>{const p=spawn(cmd,args);let stdout='',stderr='';p.stdout.on('data',b=>stdout+=b);p.stderr.on('data',b=>stderr+=b);p.on('error',reject);p.on('close',code=>resolve({code,stdout,stderr}));});
  assert.equal(await saveCopy(run,async()=>dest,src,null),true);
  assert.equal(await readFile(join(dest,'sample.html'),'utf8'),'original content');
  await writeFile(src,'changed content');
  await assert.rejects(saveCopy(run,async()=>dest,src,null));
  assert.equal(await readFile(join(dest,'sample.html'),'utf8'),'original content');
});
