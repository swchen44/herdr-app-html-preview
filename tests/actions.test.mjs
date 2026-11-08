import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openChrome, saveCopy } from '../poc/files-preview/actions.js';

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
