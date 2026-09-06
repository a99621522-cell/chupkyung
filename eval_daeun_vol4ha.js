// 대운 실검: 4권下 정답표 210건의 해설에서 「○○運 → 사건」을 뽑아(길/흉 라벨) 엔진 judgeUn 등급과 대조
// node docs/eval_daeun_vol4ha.js
const fs=require('fs'),path=require('path');
const {analyzeAll}=require('../chapgyeong-master.js'); const U=require('../chapgyeong-un.js');
const H={甲:'갑',乙:'을',丙:'병',丁:'정',戊:'무',己:'기',庚:'경',辛:'신',壬:'임',癸:'계',子:'자',丑:'축',寅:'인',卯:'묘',辰:'진',巳:'사',午:'오',未:'미',申:'신',酉:'유',戌:'술',亥:'해'};
const hg=p=>p.split('').map(c=>H[c]||c).join('');
const S=a=>({yStem:a[0][0],yBranch:a[0][1],mStem:a[1][0],mBranch:a[1][1],dStem:a[2][0],dBranch:a[2][1],tStem:a[3][0],tBranch:a[3][1]});
const all=JSON.parse(fs.readFileSync(path.join(__dirname,'vol4ha_silrye_scan_ALL.json'))).silrye.filter(x=>x.conf!=='C');
const BAD=/사망|死亡|不祿|불록|歸泉|귀천|崩|終命|종명|溺沒|溺死|沒|落職|낙직|落選|낙선|失國|失明|실명|蕩盡|탕진|敗|패|破|파산|破産|위험|危|退位|퇴위|退職|퇴직|不吉|불길|苦|고생|손상|損傷|병중|病重|沖旺|絶|殃|凶|흉|몰락|沈滯|침체|부진|不振|허송|虛送|流失|유실|이별|離別|失敗|실패|停職|귀결.*死|납치|拉致|사고|事故|感減|減|降|不利|불리|投獄|波瀁|波動|파동|위기/;
const GOOD=/大發|대발|大成|대성|發福|발복|發身|발신|富貴|부귀|大富|대부|登科|등과|합격|合格|등극|登極|당선|當選|성공|成功|昇進|승진|起發|기발|發達|발달|發|富興|安定|안정|安逸|안일|吉|길|興|흥|大吉|富|榲|승상|丞相|총통|總統|宰相|재상|次官|차관|長官|장관|議員|명진|振|回春|회춘|중흥|中興|大貴|대귀|富豪|재산|資産|大用|대용|享福|향복|順|순탄|好|喜|榮|영화|貴/;
// 운 언급 추출: 「甲子運/甲子大運」(간지) 또는 「亥子運/申酉運/巳午未運」(지지열) 뒤 30자 안의 사건
function extract(x){
  const t=(x.gyeok_wonmun||'')+' '+(x.note||'')+' '+(x.label||'');
  const out=[]; const re=/((?:[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])+|[子丑寅卯辰巳午未申酉戌亥]{1,3})(?:大)?運/g; let m;
  while((m=re.exec(t))){ const tok=m[1]; let after=t.slice(m.index+m[0].length, m.index+m[0].length+28).split(/[.。/;]/)[0]; const cut=after.search(/[甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥]{1,4}(大)?運|[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]年/); if(cut>=0) after=after.slice(0,cut); // 다음 운·연 언급 전까지만
    const bad=BAD.test(after), good=GOOD.test(after); if(bad===good) continue; // 둘 다/둘 다 아님 → 버림
    const neg=/못|不|無|안 |아니|않/.test(after.slice(0,6)); // 「大發하지 못」류 부정은 반전
    const lab = (bad!==neg) ? '흉' : '길';
    if(/^[甲-癸]/.test(tok)) { for(let i=0;i<tok.length;i+=2) out.push({운:hg(tok.slice(i,i+2)),지지만:false,lab,after:after.slice(0,20)}); }
    else { for(const b of tok) out.push({운:hg(b),지지만:true,lab,after:after.slice(0,20)}); }
  }
  return out;
}
const useAuthorY = process.argv.includes('--author-yongsin');
const authorYongsin=(()=>{ const src=fs.readFileSync(path.join(__dirname,'eval_vol4ha_yongsin.js'),'utf8'); const body=src.slice(src.indexOf('function authorYongsin'),src.indexOf('const all ='));
 const GEUK={목:'토',화:'금',토:'수',금:'목',수:'화'},SAENG={목:'화',화:'토',토:'금',금:'수',수:'목'},INSU={목:'수',화:'목',토:'화',금:'토',수:'금'},GWAN={목:'금',화:'수',토:'목',금:'화',수:'토'},CH_OH={木:'목',火:'화',土:'토',金:'금',水:'수'},OH={갑:'목',을:'목',병:'화',정:'화',무:'토',기:'토',경:'금',신:'금',임:'수',계:'수'};
 return new Function('H','GEUK','SAENG','INSU','GWAN','CH_OH','OH',body+'; return authorYongsin;')(H,GEUK,SAENG,INSU,GWAN,CH_OH,OH); })();
const rows=[]; let n=0,hit=0, nG=0,hG=0,nB=0,hB=0; const conf={};
for(const x of all){ const evs=extract(x); if(!evs.length) continue; const ko=x.myeongjo.map(hg); const sex=/坤命|여명|婦|夫人|女|妓|婢|尼/.test(x.label+x.gyeok_wonmun)?'여':'남';
  let r; try{ r=analyzeAll(S(ko),sex); }catch(e){ continue; }
  if (useAuthorY) { const au=authorYongsin(x, {갑:'목',을:'목',병:'화',정:'화',무:'토',기:'토',경:'금',신:'금',임:'수',계:'수'}[ko[2][0]]); if(!au) continue; const yy={용신오행:au.오행,종격여부:/종/.test(au.근거)}; try{ const by=require('../chapgyeong-yongsin.js').byeongyak(S(ko),yy); if(by){yy.병=by.병;yy.약=by.약;} }catch(e){} r={용신:yy}; }
  for(const e of evs){ const gj = e.지지만 ? (e.운) : e.운; let j; try{ j=U.judgeUn(S(ko), e.지지만 ? ' '+gj : gj, r.용신); }catch(err){ continue; }
    n++; const pred=j.등급; const ok = pred===e.lab; if(ok) hit++; if(e.lab==='길'){nG++; if(ok)hG++;} else {nB++; if(ok)hB++;}
    conf[e.lab+'→'+pred]=(conf[e.lab+'→'+pred]||0)+1;
    rows.push({id:x.id,기둥:ko.join(''),운:e.운,저자:e.lab,엔진:pred,점수:j.점수,용신:r.용신.용신오행,근거:e.after}); } }
console.log(`대운 사건 라벨 ${n}건(길 ${nG}·흉 ${nB}) — 엔진 등급 일치 ${hit}/${n} (${(100*hit/n).toFixed(0)}%) / 길 ${hG}/${nG} · 흉 ${hB}/${nB}`);
console.log('혼동행렬:', JSON.stringify(conf));
// 평(평) 판정을 제외한 방향 일치
const dir=rows.filter(r=>r.엔진!=='평'); console.log(`평 제외 방향 판정 ${dir.filter(r=>r.저자===r.엔진).length}/${dir.length}`);
// 점수 부호만으로
const sg=rows.filter(r=>r.점수!==0); console.log(`점수 부호(±) 일치 ${sg.filter(r=>(r.점수>0)===(r.저자==='길')).length}/${sg.length}`);
fs.writeFileSync(path.join(__dirname,'eval_daeun_vol4ha.json'),JSON.stringify({n,hit,nG,hG,nB,hB,conf,rows},null,1));
if(process.argv.includes('-v')) for(const r of rows) console.log(JSON.stringify(r));
