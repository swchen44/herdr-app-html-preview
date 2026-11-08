import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isHtml, previewTarget } from '../poc/files-preview/logic.mjs';

test('recognizes only HTML files regardless of case', () => {
  assert.equal(isHtml('a.HTM'), true);
  assert.equal(isHtml('a.html'), true);
  assert.equal(isHtml('a.html.js'), false);
});

test('does not turn remote paths into local Chrome paths', () => {
  assert.equal(previewTarget('/tmp/test.html', null), '/tmp/test.html');
  assert.throws(() => previewTarget('/tmp/test.html', 'remote'), /remote/i);
});
