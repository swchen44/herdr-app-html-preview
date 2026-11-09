import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

test('installer creates personal layout and refuses to overwrite it', async () => {
  const home=await mkdtemp(join(tmpdir(),'herdr-install-test-'));
  await mkdir(join(home,'layouts'));
  const original=JSON.stringify({type:'block', content:{mod:'files'}});
  await writeFile(join(home,'layouts','main.json'),original);
  const run=()=>spawnSync('python3',['scripts/install.py','--app-home',home],{encoding:'utf8'});
  const first=run(); assert.equal(first.status,0,first.stderr);
  const layout=JSON.parse(await readFile(join(home,'layouts','files-preview.json'),'utf8'));
  assert.equal(layout.content.mod,'files-preview');
  assert.equal(await readFile(join(home,'layouts','main.json'),'utf8'),original);
  assert.match(await readFile(join(home,'mods','files-preview','main.js'),'utf8'),/export default class Files/);
  const second=run(); assert.notEqual(second.status,0);
});
