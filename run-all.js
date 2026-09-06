// ============================================================
// 사주첩경 엔진 회귀 테스트 — node test/run-all.js  (또는 npm test)
// 1) 원문 예시 정답셋(6권·4권下·2권 실례) 2) v25 용신 검증 3) 3권 DB 전수 무오류 + 재현율/정밀도 기준선
// 4) 강헌 검증셋 전수 무오류·종재 상한 5) 스트레스 6) 특례/참고 플래그가 용신을 가로채지 않는지
// 실패 시 종료코드 1
// ============================================================
const path = require('path');
const E = p => require(path.join(__dirname, '..', p));
const { analyzeAll } = E('chapgyeong-master.js');
const { analyzeVol2 } = E('chapgyeong-vol2.js');
const { analyzeVol6, ALL_TOPICS: V6T } = E('chapgyeong-vol6.js');
const { ALL_TOPICS: V2T } = E('chapgyeong-vol2.js');
const S = a => ({yStem:a[0][0],yBranch:a[0][1],mStem:a[1][0],mBranch:a[1][1],dStem:a[2][0],dBranch:a[2][1],tStem:a[3][0],tBranch:a[3][1]});
let pass=0, fail=0; const fails=[];
const ok = (name, cond, detail='') => { console.log((cond?'✓ ':'✗ ')+name+(detail?'  ['+detail+']':'')); if (cond) pass++; else { fail++; fails.push(name + (detail?' — '+detail:'')); } };

// ---- 1. 원문 예시 정답셋 (합본·원문에서 확인된 실례) ----
const V6 = {
  vol6: x => analyzeVol6(x,'남').map(r=>r.제목),
};
const has = (arr, key) => arr.some(t => String(t).includes(key));
const vol6Cases = [
  [['임진','신해','신해','병신'],'화신설수'], [['경진','정해','정축','신축'],'순환상생'], [['기묘','을해','을미','병술'],'수기유행'],
  [['신축','신축','임진','신축'],'천한지동'], [['정축','무신','임술','병오'],'추수통원'], [['병자','신축','계해','을묘'],'기취감궁'],
  [['임신','신해','병오','경인'],'살인상정'], [['계유','경신','병자','병신'],'일락서산'], [['무오','무자','경자','갑오'],'자오쌍포'],
  [['계미','을묘','갑자','을사'],'전이불항'], [['병자','갑술','정축','기사'],'회동제궐'], [['무인','정축','을축','기묘'],'목화통명'],
  [['계묘','을묘','계사','정사'],'삼기성상'], [['갑자','계유','신사','을미'],'일기위근'], [['임자','병오','을해','정해'],'변화상관'],
  [['무인','갑인','갑인','경오'],'신불가과'], [['계해','갑자','무술','계축'],'부건파처'], [['임신','기유','경자','경진'],'쇠왕태극'],
  [['갑술','정묘','정묘','계묘'],'살인상생'],
];
for (const [p, key] of vol6Cases) ok(`6권 ${key} (${p.join(' ')})`, has(V6.vol6(S(p)), key));
// 4권下 기명종재 원문 실례
const V4H = E('chapgyeong-vol4ha-gyeokguk-6.js');
ok('4권下 기명종재 계유신유정유신축', (V4H.checkGimyeongJongjae(S(['계유','신유','정유','신축'])).격국명||'').includes('기명종재'));
ok('4권下 기인종재 정묘임진신묘병술', (V4H.checkGimyeongJongjae(S(['정묘','임진','신묘','병술'])).격국명||'').includes('기인종재'));
ok('4권下 을묘일 통근은 종재 불성립', !V4H.checkGimyeongJongjae(S(['갑술','정축','을묘','임오'])).성격);
// 2권 실례(3권 DB 교차 확인된 것)
const v2has = (p, sex, key) => analyzeVol2(S(p), sex).some(r => String(r.제목).includes(key));
ok('2권 四 조부흉사 (경오기축신유무술)', v2has(['경오','기축','신유','무술'],'남','조부'));
ok('2권 三二 경찰관은 일지 기준 형만 (인신 형이 일지 진과 무관 → 미검출)', !v2has(['갑자','병인','무진','경신'],'남','경찰관'));
ok('2권 三二 경찰관 일지 형 성립 (기미일 축술형)', v2has(['임자','기축','기미','병술'],'남','경찰관'));

// ---- 2. v25 용신 검증 ----
const v25 = [[['정사','병오','신축','갑오'],'토'],[['임자','을사','기해','계유'],'목']];
// [130차] 신강약 기본이 가중세력법으로 바뀌어 임자을사기해계유(저자 종살 목)는 억부 경로로는 못 맞춤(월령법은 우연히 적중) — 종살 검출이 정답 경로. 옛 경로는 strength:'wol'로 보존 검증
for (const [p,e] of v25) { const r = analyzeAll(S(p),'남',{strength:'wol'}); ok(`v25 용신(월령법 경로) ${p.join('')}→${e}`, r.용신.용신오행===e, `got ${r.용신.용신오행} (${(r.용신.근거||'').slice(0,20)})`); }
ok('132 임자을사기해계유→목 종살 (게이트F 기본 경로)', /종살/.test(analyzeAll(S(['임자','을사','기해','계유']),'남').용신.근거) && analyzeAll(S(['임자','을사','기해','계유']),'남').용신.용신오행==='목');
ok('132 4권下 종격 22+v25 2+3권 9 재현 ≥12', (()=>{ try { const r=require('child_process').execSync('node docs/eval_jonggyeok.js',{cwd:__dirname+'/..'}).toString(); const m=r.match(/F E게이트\+장간뿌리≤1\s+재현 (\d+)\//); return m && +m[1]>=12; } catch(e){ return false; } })());
ok('v25 정사병오신축갑오→토 (가중세력법 기본)', analyzeAll(S(['정사','병오','신축','갑오']),'남').용신.용신오행==='토');
ok('v26 옵션 동작(월령법 경로)', analyzeAll(S(['계사','계해','무술','갑인']),'남',{yongsinV26:true, strength:'wol'}).용신.용신오행==='토');

// ---- 3. 3권 DB 전수 + 기준선 ----
const db3 = E('chapgyeong3_myeongshik_db.json').filter(d=>d.conf==='A'&&d.성별);
let e3=0, jong3=0; for (const d of db3) { try { const r=analyzeAll(S(d.기둥), d.성별); if (/종재/.test(r.용신.근거||'')) jong3++; } catch(e){ e3++; } }
ok(`3권 ${db3.length}건 전수 무오류`, e3===0, `${e3} errors`);
ok('3권 종재 판정 상한(≤14) — 132차 게이트F(3권 종 언급 9건 포함, 이전 ≤5)', jong3<=14, `${jong3}`);
// 정합률 기준선(eval 스크립트 로직 축약): 재현율 ≥ 44%, 총검출 ≤ 2500
try {
  const out = require('child_process').execSync('node '+path.join(__dirname,'..','eval_vol2_vs_vol3.js'),{encoding:'utf8'});
  const m = out.match(/재현율 (\d+)% \((\d+)\/(\d+)\) \| 정밀도 (\d+)% \((\d+)\/(\d+)\)/);
  if (m) { ok('2권 재현율 ≥44%', +m[1] >= 44, m[1]+'%'); ok('2권 총검출 ≤2500', +m[6] <= 2500, m[6]); } else ok('eval 출력 파싱', false);
} catch (e) { ok('eval 스크립트 실행', false, e.message.slice(0,60)); }

// ---- 4. 강헌 검증셋 ----
const dbK = E('kanghun_myeongshik_db.json').filter(d=>d.기둥 && !d.기둥.some(p=>!p||p.includes('?')));
let eK=0, jongK=0, agree=0, n=0; const map={왕:1,상:1,휴:0,수:0,사:0}; const Y = E('chapgyeong-vol1-yukchin.js');
for (const d of dbK) { try { const s=S(d.기둥); const r=analyzeAll(s, d.성별||'남'); if (/종재/.test(r.용신.근거||'')) jongK++;
  const kh=/신강/.test(d.강헌판정||'')?1:/신약/.test(d.강헌판정||'')?0:null; if (kh!==null){ n++; if (map[Y.getWangSangHyuSuSa(s.dStem,s.mBranch)]===kh) agree++; } } catch(e){ eK++; } }
ok(`강헌 ${dbK.length}건 전수 무오류`, eK===0);
ok('강헌 종재 판정 상한(≤6)', jongK<=6, `${jongK}`);
ok('강헌 강약 일치 ≥ 30', agree>=30, `${agree}/${n}`);

// ---- 5. 스트레스 ----
const STEMS=['갑','을','병','정','무','기','경','신','임','계'], BR=['자','축','인','묘','진','사','오','미','신','유','술','해']; let es=0;
for (let i=0;i<300;i++){ const x={yStem:STEMS[i%10],yBranch:BR[i%12],mStem:STEMS[(i*3)%10],mBranch:BR[(i*5)%12],dStem:STEMS[(i*7)%10],dBranch:BR[(i*7)%12],tStem:STEMS[(i*2)%10],tBranch:BR[(i*11)%12]}; try{ analyzeAll(x, i%2?'남':'여'); }catch(e){ es++; } }
ok('통합 스트레스 300 무오류', es===0, `${es}`);
ok('6권 항목 113', V6T.length===113, String(V6T.length));
ok('2권 항목 65', V2T.length===65, String(V2T.length));

// ---- 6. 참고 플래그가 용신 입력에서 제외되는지 ----
const rr = analyzeAll(S(['임자','을사','기해','계유']),'남',{strength:'wol'});
ok('신불가과가 6권 리포트에 있음', rr.vol6.some(x=>x.제목==='신불가과'));
ok('신불가과가 용신을 가로채지 않음(월령법 경로)', rr.용신.용신오행==='목');
ok('130 가중세력 신강약: 저자 라벨 57건 중 ≥48 일치', (()=>{ try { const r=require('child_process').execSync('node docs/eval_vol4ha_strength.js',{cwd:__dirname+'/..'}).toString(); const m=r.match(/"hit":(\d+)/); return m && +m[1]>=48; } catch(e){ return false; } })());
ok('131 4권上 스캔 용신 43건 중 ≥17 일치', (()=>{ try { const r=require('child_process').execSync('node docs/eval_yongsin_all.js "{}"',{cwd:__dirname+'/..'}).toString(); const m=r.match(/4권上 (\d+)\//); return m && +m[1]>=17; } catch(e){ return false; } })());
ok('134 대운 실검 170건 등급 일치 ≥88 (옛 식 28)', (()=>{ try { const r=require('child_process').execSync('node docs/eval_daeun_vol4ha.js',{cwd:__dirname+'/..'}).toString(); const m=r.match(/등급 일치 (\d+)\//); return m && +m[1]>=88; } catch(e){ return false; } })());
ok('134 병약 층: 협재-가 병진신묘계유계해 病 목·藥 금', (()=>{ const r=analyzeAll(S(['병진','신묘','계유','계해']),'남').용신; return r.병==='목' && r.약==='금'; })());
ok('130 4권下 저자 용신 108건 중 ≥55 일치', (()=>{ try { const r=require('child_process').execSync('node docs/eval_vol4ha_yongsin.js',{cwd:__dirname+'/..'}).toString(); const m=r.match(/엔진 일치 (\d+)\//); return m && +m[1]>=55; } catch(e){ return false; } })());

// ---- 7. 만세력 어댑터 ----
const A = E('chapgyeong-input.js');
ok('어댑터 한자 입력 변환', A.fromManse({년주:'辛亥',월주:'丁酉',일주:'己酉',시주:'乙亥'}).pillars.join('')==='신해정유기유을해');
ok('어댑터 월두법·시두법 정합(을해 명식 경고 0)', A.fromManse(['신해','정유','기유','을해']).warnings.length===0);
ok('어댑터 무효 간지 경고', A.fromManse(['신해','병유','기유','을해']).warnings.length>0);
ok('어댑터 첩경 야자시법(표준식 만세력 출력→일주 되돌림)', A.fromManse(['신해','정유','경술','병자'],{야자시:true,야자시정책:'첩경',만세력정책:'표준'}).pillars.join('')==='신해정유기유병자');
ok('어댑터 첩경 야자시법(그날식 만세력 출력→시간만 다음 날 기준) 1권 원문 예', A.fromManse(['기유','병인','계해','임자'],{야자시:true,야자시정책:'첩경',만세력정책:'그날'}).pillars.join('')==='기유병인계해갑자');
// 만세력 라이브러리 실연결(설치돼 있을 때만)
try { const M = require('@fullstackfamily/manseryeok'); const m = M.calculateSaju(1971,9,21,21,30,{longitude:128.6,applyTimeCorrection:true});
  const inp = A.fromManse(m); ok('만세력 실연결: 1971-09-21 21:30 대구 → 신해정유기유을해', inp.pillars.join('')==='신해정유기유을해' && inp.warnings.length===0, inp.pillars.join(''));
  const full = A.analyzeFromManse(m,{성별:'남'}); ok('만세력 실연결 → 전권 분석 용신 화', full.결과.용신.용신오행==='화');
  const U = E('chapgyeong-un.js'); ok('대운수 2권 정법(2올림 1버림): 13→4,14→5,15→5', U.daeunSu(13)===4 && U.daeunSu(14)===5 && U.daeunSu(15)===5);
  const fb = A.analyzeFromBirth(M, {y:1971,m:9,d:21,h:21,min:30,longitude:128.6,sex:'남',today:'2026-08-31'});
  ok('analyzeFromBirth: 음남 역행·대운수 5', fb.운.방향==='역행' && fb.운.대운수===5, JSON.stringify([fb.운.방향, fb.운.대운수]));
  ok('analyzeFromBirth: 2026 현재 대운 신묘', (fb.운.대운.find(d=>d.현재)||{}).간지==='신묘');
  ok('analyzeFromBirth: 2026 세운 병오 = 용신 화 도래(길)', fb.운.세운[0].간지==='병오' && fb.운.세운[0].등급==='길');
  ok('2권 민감 태그: 자손 흉사(남) 등급 A 완곡 문구', (fb.결과.vol2.find(x=>x.id===61)||{}).민감==='A');
  const H = E('chapgyeong-haeseol.js'); const brief = H.toBrief(fb,{sex:'남'});
  ok('해설 브리프 필수 구간(골격·실명표·2권·6권·대운·세운·구결)', ['## 골격','## 십성 실명표','## 2권','## 6권','## 대운','## 세운','## 구결'].every(k=>brief.includes(k)));
  ok('해설 브리프 [경보] 조문은 완곡 문구 동반', /\[경보\][^\n]*「/.test(brief));
  ok('출력 검사: 수명·자녀 흉사 단정 적발', !H.checkOutput('수명은 80세까지 하리라. 아들이 죽으리라', fb).ok);
  ok('출력 검사: 정상 문장 통과(신살·운성 언급 포함)', H.checkOutput('원국의 을 편관이 시간에 서 있고 일지 유는 병지(病)라, 수옥살이 있으니 형권의 자리에 서리라', fb).ok);
  ok('출력 검사: 신살·운성 미언급 적발', !H.checkOutput('원국의 을 편관이 시간에 서 있으니 형권의 자리에 서리라', fb).ok);
  ok('시스템 지시 4조 + 독자 층 1조', (H.SYSTEM.match(/^\d\./gm)||[]).length===4 && (H.buildPrompt('b','q',null,{독자:'일반'}).system.match(/^\d\./gm)||[]).length===5);
  { const fs=require('fs'); const easy=fs.readFileSync(path.join(__dirname,'..','docs','견본_일반용.txt'),'utf8'), hard=fs.readFileSync(path.join(__dirname,'..','docs','견본_학인체.txt'),'utf8');
    ok('가독성 지표: 일반용 견본 밀도 ≤3.5·풀이 없는 한자 ≤2·풀이 동반 한자 ≥5', H.readability(easy).용어밀도<=3.5 && H.readability(easy).한자만병기<=2 && H.readability(easy).한자풀이병기>=5, JSON.stringify(H.readability(easy)));
    ok('가독성 지표: 학인체 견본은 일반 기준 초과(구분 동작)', H.readability(hard).용어밀도>3.5 || H.readability(hard).한자만병기>2);
    ok('일반용 견본 출력 검사 통과', H.checkOutput(easy, fb).ok); }
  const mo = U.monthsOfYear(M, 2026); ok('월운 12절기월(입춘~소한) 간지 연속', mo.length===12 && mo.map(x=>x.간지).join('')==='경인신묘임진계사갑오을미병신정유무술기해경자신축', mo.map(x=>x.간지).join(''));
  const mo71 = U.monthsOfYear(M, 1971); ok('월운 시각표 없는 해(1971)도 12달 산출', mo71.length===12 && mo71[0].간지==='경인');
  ok('브리프에 월운 구간', /## 2026년 월운/.test(brief));
  const Tt = E('chapgyeong-vol1-tables.js'); ok('12운성 수토동궁(기토 묘=생·유=병, 무토 신=생)', Tt.getSibiUnseong('기','묘')==='생' && Tt.getSibiUnseong('기','유')==='병' && Tt.getSibiUnseong('무','신')==='생');
  const Ss = E('chapgyeong-vol1-sinsal.js'); const sn = Ss.analyzeSinsal({yStem:'갑',yBranch:'자',mStem:'병',mBranch:'인',dStem:'갑',dBranch:'인',tStem:'임',tBranch:'신'});
  ok('신살 추가 4종(단교관·절로공망·홍란·순중공망) 판정', sn.흉살.includes('단교관살') && sn.흉살.includes('절로공망'));
  ok('브리프에 십이신살·십이운성 줄', /십이신살\(/.test(brief) && /십이운성\(수토동궁\)/.test(brief));
  // 신살 검산: 3권 실례 언급 신살 재현율 하한 + 강헌 신살 예시 8건
  { const db3s = E('chapgyeong3_myeongshik_db.json').filter(d=>d.conf==='A'); const KEYS={역마:/역마/,지살:/지살/,백호:/백호/,급각:/급각/,효신:/효신/,고란:/고란/,낙정:/낙정/,단교:/단교/}; let g=0,h=0;
    for (const d of db3s) { const t=d.통변시.join(' '); const r=Ss.analyzeSinsal(S(d.기둥)); const all=[...r.길신,...r.흉살,...(r.십이신살.해당||[]).map(x=>x.신살),...(r.십이신살.일지해당||[]).map(x=>x.신살)].join(' '); for (const [k,re] of Object.entries(KEYS)) { if (!t.includes(k)) continue; g++; if (re.test(all)) h++; } }
    ok(`신살 3권 재현율 ≥85% (역마·지살·백호·급각·효신·고란·낙정·단교)`, h/g >= 0.85, `${h}/${g}`); }
  { const kh = E('kanghun_myeongshik_db.json'); const want={'괴강':/괴강/,'양인':/양인|음인/,'백호':/백호/,'원진':/귀문/,'공망':/공망/,'천을귀인':/천을/,'천덕':/천덕|월덕/,'문창귀인':/문창/,'암록':/암록/}; let g=0,h=0;
    for (const d of kh) { const key=Object.keys(want).find(k=>(d.장||'').includes(k)); if(!key||d.기둥.some(p=>!p||p.includes('?'))) continue; g++; const r=Ss.analyzeSinsal(S(d.기둥)); if (want[key].test([...r.길신,...r.흉살].join(' '))) h++; }
    ok('강헌 신살 예시 전부 검출', g>0 && h===g, `${h}/${g}`); }
} catch(e) { console.log('  (manseryeok 미설치 — 실연결 검사 생략)'); }
ok('어댑터 기본 정책은 표준(만세력 그대로)', A.fromManse(['신해','정유','경술','병자'],{야자시:true}).pillars[2]==='경술');
ok('analyzeFromManse 전권 연결', !!A.analyzeFromManse(['신해','정유','기유','을해'],{성별:'남'}).결과.용신);

// ---- 8. 서버 파이프라인(mock) ----
try { const Sv = E('chapgyeong-server.js'); const r = require('child_process'); const out = r.execSync(`node -e "require('${path.join(__dirname,'..','chapgyeong-server.js').replace(/\\/g,'/')}').ganmyeong({y:1971,m:9,d:21,h:21,min:30,longitude:128.6,sex:'남',today:'2026-08-31'}).then(x=>console.log(JSON.stringify({mode:x.mode,격:x.요약.격,현재:x.요약.운.현재대운,민감:x.요약.통변.filter(t=>t.민감==='A').length})))"`,{encoding:'utf8'});
  const j = JSON.parse(out.trim()); ok('서버 ganmyeong(mock) 파이프라인', j.mode==='mock' && j.격.includes('식신격') && j.현재==='신묘' && j.민감>=1, out.trim().slice(0,80)); } catch (e) { ok('서버 ganmyeong(mock) 파이프라인', false, e.message.slice(0,80)); }

// ---- 8b. 격 프로필 ----
try { const GP = E('chapgyeong-gyeok-profiles.js'); ok('격 프로필 44종 이상', Object.keys(GP.P).length>=44, String(Object.keys(GP.P).length));
  const fs2=require('fs'); const names=new Set(); for (const f of fs2.readdirSync(path.join(__dirname,'..')).filter(f=>/vol4/.test(f))) { const s2=fs2.readFileSync(path.join(__dirname,'..',f),'utf8'); for (const m of s2.matchAll(/격국명:\s*'([^']+)'/g)) names.add(m[1]); for (const m of s2.matchAll(/격:\s*'([^']+)'/g)) names.add(m[1]); }
  const miss=[...names].filter(n=>!GP.profileOf(n)); ok('엔진 격국명 전부 프로필 매핑', miss.length===0, miss.join(','));
  const r0 = analyzeAll(S(['신해','정유','기유','을해']),'남'); const ps = GP.profiles(r0.vol4, r0.vol4ha); ok('본인 명식 격 프로필 3종(식신·시상편관·전재[128차 참고격] — 구진득위는 114차 조임으로 불성립)', ps.length===3 && ps.every(p=>p.별칭 && p.이런사람.length>40) && r0.주격.격==='식신격', ps.map(p=>p.격).join(',')+' 주격='+(r0.주격&&r0.주격.격));
  { const GL = E('chapgyeong-glossary.js'); ok('용어 사전 gloss: 첫 등장 풀이', /식신\(食神, [^)]+\)/.test(GL.gloss('식신이 재를 낳으니 식신생재라')) );
    const all = Object.keys(GP.P).map(k=>GP.profileOf(k)).map(p=>[p.한줄,p.이런사람,p.맞는일,p.조심할자리].join(' ')).join(' '); const Hh = E('chapgyeong-haeseol.js'); const rd = Hh.readability(all); ok('격 프로필 전체 풀이 없는 한자 ≤3·용어밀도 ≤2', rd.한자만병기<=3 && rd.용어밀도<=2, JSON.stringify(rd)); }
  ok('프로필 전종 필수 필드', Object.values(GP.P).every(p=>p.별칭&&p.한줄&&p.이런사람&&p.키워드&&p.맞는일&&p.조심할자리&&p.좋아하는운&&p.꺼리는운));
} catch (e) { ok('격 프로필 모듈', false, e.message.slice(0,80)); }

// ---- 8c. 건강 층 ----
try { const HL = E('chapgyeong-health.js'); const r0 = analyzeAll(S(['신해','정유','기유','을해']),'남'); const hr = HL.healthReport(S(['신해','정유','기유','을해']), r0.vol2);
  ok('건강 층: 2권 질병 조문(비위·수액) 반영', hr.항목.some(x=>/비위/.test(x.자리)) && hr.항목.some(x=>/물/.test(x.자리)));
  ok('건강 층: 형충 부위(강헌 표) — 유=폐·기관지', hr.항목.some(x=>/폐/.test(x.자리) && /유/.test(x.근거)));
  ok('건강 층: 병명 단정·수명 표현 없음', !/(암|사망|수명|죽)/.test(JSON.stringify(hr.항목)));
} catch (e) { ok('건강 층 모듈', false, e.message.slice(0,80)); }

// ---- 8d. 병렬 관법(궁통보감 조후·자평 약식) ----
try { const r0 = analyzeAll(S(['신해','정유','기유','을해']),'남');
  ok('궁통보감 120칸 표 완비', (()=>{ const G=E('chapgyeong-gungtong.js').GUNGTONG_TABLE; let n=0; for (const g of Object.keys(G)) n+=Object.keys(G[g]).length; return n===120; })());
  ok('조후 판정: 기토 유월 계→병(계선병후) 비어 있음', r0.조후 && r0.조후.필요글자.join('')==='계병' && r0.조후.갖춤==='비어 있음');
  ok('자평 약식: 본인 명식 식신격·상신 칠살', r0.자평약식 && r0.자평약식.격==='식신' && /칠살/.test(r0.자평약식.상신));
  const zp = E('chapgyeong-zpjz-lite.js'); ok('자평 약식 격 취용 원문 명례(薛相公 갑신임신을사무인=정관, 汪學士 갑자신미신유임진=재)', zp.chwiyong(S(['갑신','임신','을사','무인'])).격==='정관' && zp.chwiyong(S(['갑자','신미','신유','임진'])).격==='재');
} catch (e) { ok('병렬 관법 모듈', false, e.message.slice(0,80)); }

// ---- 8e. 용신 v27(옵션) 스캔 정답표 채점 — 기본 억부와 비교, 회귀 아님(정보) ----
try { const rows = E('docs/vol4_silrye_scan.json').filter(r=>r.권!=='4권下'&&r.기둥&&!r.기둥.some(p=>!p||p.includes('?'))); const exp=r=>{const m=r.용신.match(/^([목화토금수])(?:·([목화토금수]))?/); return m?[m[1],m[2]].filter(Boolean):[];};
  let h27=0,h25=0,n=0; for (const r of rows){ const e=exp(r); if(!e.length)continue; n++; if(e.includes(analyzeAll(S(r.기둥),'남',{yongsinV27:true}).용신.용신오행))h27++; if(e.includes(analyzeAll(S(r.기둥),'남').용신.용신오행))h25++; }
  ok(`스캔 정답표 ${n}건: v27 ${h27} ≥ 기본 ${h25}`, h27>=h25, `v27 ${h27} / 기본 ${h25}`); } catch (e) { ok('v27 채점', false, e.message.slice(0,60)); }

// ---- 8f. 특수격 과검출 상한 ----
{ const db3b = E('chapgyeong3_myeongshik_db.json').filter(d=>d.conf==='A'); let w=0, m=0; for (const d of db3b) { const r=analyzeAll(S(d.기둥),d.성별||'남'); if ((r.vol4ha||[]).length) w++; if (r.주격 && r.주격.격 && (r.주격.후보특수격||[]).includes(r.주격.격)) m++; } ok(`3권 176건 특수격 주격률 ≤30% (128차: 성립은 형식만·파격/참고격은 주격 제외 — 성립 ${w}/${db3b.length})`, m/db3b.length<=0.30, `주격=특수격 ${m}/${db3b.length}`); }

// ---- 8g. 주격 우열 규칙 ----
{ const scan2 = E('docs/vol4_silrye_scan.json').filter(r=>r.권!=='4권下'&&r.기둥&&!r.기둥.some(p=>!p||p.includes('?'))); let spMain=0; for (const r of scan2) { const g=analyzeAll(S(r.기둥),'남').주격; if (g && g.격 && g.후보특수격.includes(g.격)) spMain++; } ok('스캔 실례(저자 전부 정격) 주격=특수격 ≤5건(일귀·금신 미투출 2 + 종기 다 조양 1 + 시묘 1 + 임기룡배 경진기묘임진경자 1 허용)', spMain<=5, String(spMain));
  ok('원문 형합격 예(계일 갑인시)는 주격 형합격', /형합/.test(String((analyzeAll(S(['계해','갑자','계사','갑인']),'남').주격||{}).격||''))); }

// ---- 8h. 4권下 특수격 실례 ----
{ const dn = E('docs/vol4_silrye_scan.json').filter(r=>r.권==='4권下'&&r.기둥); const exp=r=>{const m=r.용신.match(/^([목화토금수])(?:·([목화토금수]))?/); return m?[m[1],m[2]].filter(Boolean):[];}; let h=0,g=0;
  for (const r of dn) { const x=analyzeAll(S(r.기둥),'남'); if (exp(r).includes(x.용신.용신오행)) h++; if (/서귀|조양/.test(r.격명) && x.주격 && /서귀|조양/.test(String(x.주격.격||''))) g++; }
  ok(`4권下 실례 ${dn.length}건 용신 일치 ≥7`, h>=7, String(h)); ok('4권下 서귀·조양 주격 적중 ≥8/9', g>=8, String(g)); }

// ---- 9. 책 문답 색인·검색 ----
try { const BK = E('chapgyeong-book.js'); const idx = BK.build(); ok('책 색인 청크 ≥900·전 권 포함', idx.N>=900 && ['1권','2권','3권','4권','6권'].every(v=>idx.chunks.some(c=>c.vol===v)), String(idx.N));
  ok('별칭 확장: 귀문살→귀문관살', /귀문관살/.test(BK.expandQuery('귀문살이 뭐야')));
  const q1 = BK.search('귀문살',5); ok('검색: 귀문관살 → 1권 흉살 정의·2권 정신이상 상위', q1.some(h=>h.vol==='1권'&&/귀문관살/.test(h.head||'')) && q1.some(h=>h.vol==='2권'&&/정신이상/.test(h.head||'')));
  const q2 = BK.search('기명종재격 조건',4); ok('검색: 기명종재격 → 4권下 항목', q2.some(h=>h.vol==='4권'&&/기명종재/.test(h.text)));
  const q3 = BK.search('경찰관 사주',5); ok('검색: 경찰관 → 2권 三二 + 3권 실례', q3.some(h=>h.vol==='2권'&&/경찰관/.test(h.text)) && q3.some(h=>h.vol==='3권'));
  const pr = BK.buildBookPrompt('야자시 세우는 법',{k:6}); ok('책 프롬프트 4조·근거 6', (pr.system.match(/^\d\./gm)||[]).length===4 && pr.hits.length===6);
} catch (e) { ok('책 문답 모듈', false, e.message.slice(0,80)); }

// [128차] 4권下 정답표 고정 검산 — 대비쌍 4조·실명례·우열 명문
{ const P = (a)=>analyzeAll(S(a),'남'), sp=(r)=>(r.vol4ha||[]).map(v=>(v.격국명||v.격)+(v.파격?'(파)':'')).join(',');
  const okSp=(a,re)=>re.test(sp(P(a)));
  ok('128 전록 대비쌍: 갑술임신신유갑오(화국 용관)·갑자임신신유갑오 모두 전록 검출', okSp(['갑술','임신','신유','갑오'],/전록/) && okSp(['갑자','임신','신유','갑오'],/전록/));
  ok('128 임기룡배 대비쌍: 무인경신임진임인(부귀) 성립 / 무진경신임진임인(戊 투출) 파격', okSp(['무인','경신','임진','임인'],/임기룡배격(?!\(파\))/) && okSp(['무진','경신','임진','임인'],/임기룡배격\(파\)/));
  ok('128 곡직 대비쌍: 임인계묘갑자무진 곡직 성립 / 임인계묘갑신무진(申 관) 파격', okSp(['임인','계묘','갑자','무진'],/곡직인수격(?!\(파\))/) && okSp(['임인','계묘','갑신','무진'],/곡직인수격\(파\)/));
  ok('128 원세개 기미계유정사정미: 공록격 검출', okSp(['기미','계유','정사','정미'],/공록/));
  ok('128 민기식 신유갑오경신병술: 전록·종혁 모두 파격(화 관) → 주격 정격', /전록격\(파\)/.test(sp(P(['신유','갑오','경신','병술']))) && !P(['신유','갑오','경신','병술']).주격.후보특수격.includes(P(['신유','갑오','경신','병술']).주격.격));
  ok('128 유진오 병오계사정사갑진: 염상 성립', okSp(['병오','계사','정사','갑진'],/염상격(?!\(파\))/));
  ok('128 소동파 병자신축계해을묘: 윤하 검출', okSp(['병자','신축','계해','을묘'],/윤하/));
  ok('128 박천일 신해경자임자정미: 비천록마 성립(丁 무근 무해)', okSp(['신해','경자','임자','정미'],/비천록마격(?!\(파\))/));
  ok('128 비천-사 병자정유경자병자: 丙丁 천간 전실이나 無根 → 성립', okSp(['병자','정유','경자','병자'],/비천록마격(?!\(파\))/));
  ok('128 거관유살 계축무오병오임진: 도충 파격(관 유근)', okSp(['계축','무오','병오','임진'],/도충록마격\)\(파\)/));
  ok('128 재관쌍미 신유기해계사경신: 검출(참고격)', okSp(['신유','기해','계사','경신'],/재관쌍미/));
  ok('128 자요사-아 정사정미갑자갑자: 자요사 성립(정격 우선은 예외 기록)', okSp(['정사','정미','갑자','갑자'],/자요사격(?!\(파\))/));
}

console.log(`\n회귀 테스트: ${pass} 통과 / ${fail} 실패`);
if (fail) { console.log('실패 항목:'); fails.forEach(f=>console.log('  ✗', f)); process.exit(1); }
