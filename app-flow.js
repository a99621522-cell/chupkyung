// 앱 흐름 검증 — 서버(mock 가능)를 띄운 뒤: node test/app-flow.js  (jsdom 필요: npm i -D jsdom)
const { JSDOM } = require('jsdom'); const fs=require('fs'); const path=require('path');
(async()=>{
const html=fs.readFileSync(path.join(__dirname,'..','app','index.html'),'utf8');
const dom=new JSDOM(html,{ runScripts:'dangerously', url:'http://localhost:8787/', pretendToBeVisual:true });
const w=dom.window; w.fetch=(u,o)=>fetch('http://localhost:8787'+(u.startsWith('http')?new URL(u).pathname:u),o); w.scrollTo=()=>{}; w.print=()=>{};
const d=w.document; const set=(id,v)=>{d.getElementById(id).value=v;}; let ok=0, fail=0; const t=(n,c)=>{ console.log((c?'✓ ':'✗ ')+n); c?ok++:fail++; };
set('y',1971); set('m',9); set('d',21); set('h',21); set('mi',30); d.getElementById('loc').value='128.6';
d.getElementById('go').click(); await new Promise(r=>setTimeout(r,3000));
t('판정 후 명식 화면', d.querySelector('.screen.on').id==='s-myeong');
t('팔자 신해정유기유을해', [...d.querySelectorAll('.pil')].map(p=>p.querySelector('.gan').textContent+p.querySelector('.ji').textContent).join('')==='신해정유기유을해');
t('신살 칩 4', d.querySelectorAll('#sinsal .chip').length===4);
t('격 카드 3', d.querySelectorAll('#gyeok .alias').length===3);
t('가능성 카드·건강 항목', d.querySelectorAll('#poss .poss').length>=10 && d.querySelectorAll('#health .poss').length>=3);
t('대운 9점·월운 12점', d.querySelectorAll('#daeunChart circle').length===9 && d.querySelectorAll('#wolChart circle').length===12);
d.getElementById('askBook').click(); set('q','귀문살이 뭐야'); d.getElementById('ask').click(); await new Promise(r=>setTimeout(r,3000));
t('책 문답 카드+출처', d.querySelectorAll('#answers .card').length===1 && !!d.querySelector('#answers .src'));
d.querySelector('nav.tabbar button[data-s="s-report"]').click(); t('간명서 섹션 ≥8', d.querySelectorAll('#report .card').length>=8);
console.log(`\n앱 흐름: ${ok} 통과 / ${fail} 실패`); process.exit(fail?1:0);
})().catch(e=>{ console.error('ERR',e.message); process.exit(1); });
