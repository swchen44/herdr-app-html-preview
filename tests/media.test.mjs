import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawn} from 'node:child_process';
import {renderMedia} from '../mods/files-preview/media.js';
const run=(cmd,args)=>new Promise((resolve,reject)=>{const p=spawn(cmd,args);let stdout='',stderr='';p.stdout.on('data',x=>stdout+=x);p.stderr.on('data',x=>stderr+=x);p.on('error',reject);p.on('close',code=>resolve({code,stdout,stderr}));});
function makePdf() {
 const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 600] >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 300] >>'];
 let s='%PDF-1.4\n', offsets=[0]; for(let i=0;i<objects.length;i++){offsets.push(Buffer.byteLength(s));s+=`${i+1} 0 obj\n${objects[i]}\nendobj\n`;} const start=Buffer.byteLength(s);s+=`xref\n0 5\n0000000000 65535 f \n`;for(const o of offsets.slice(1))s+=`${String(o).padStart(10,'0')} 00000 n \n`;s+=`trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n${start}\n%%EOF\n`;return s;
}
test('renders each PDF page with correct orientation', async () => {
 const home=await mkdtemp(join(tmpdir(),'herdr-media-test-'));await mkdir(join(home,'input'));const file=join(home,'input','two.pdf');await writeFile(file,makePdf());
 const pages=await renderMedia(run,home,file,null,true);
 assert.equal(pages.length,2);assert.ok(pages[0].height>pages[0].width);assert.ok(pages[1].width>pages[1].height);
});
