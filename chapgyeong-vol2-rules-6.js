// ============================================================
// chapgyeong-vol2-rules-6.js — 2권 보완 주제 16종 (V2: 합본 원문 조건 대조판)
// V1(스캔 시각판독)은 docs/…v1-scan.js.bak 보존. 합본 2권 "조건" 문장을 기준으로 재작성.
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const { josa } = require('./chapgyeong-josa.js');
const B = require('./chapgyeong-vol1-basics.js');
const Y = require('./chapgyeong-vol1-yukchin.js');
const S = require('./chapgyeong-vol1-sinsal.js');
const D = require('./chapgyeong-vol2-dokchang.js');
const G60 = require('./chapgyeong-vol1-gapja60.js');
const G1 = require('./chapgyeong-vol4-gyeokguk.js');

const GEUK = { 목:'토', 화:'금', 토:'수', 금:'목', 수:'화' };
const STEM_HAP_PAIRS = { 갑기:'토', 기갑:'토', 을경:'금', 경을:'금', 병신:'수', 신병:'수', 정임:'목', 임정:'목', 무계:'화', 계무:'화' };
const stemHap = (a,b) => STEM_HAP_PAIRS[a+b];
const br = s => [s.yBranch, s.mBranch, s.dBranch, s.tBranch];
const st = s => [s.yStem, s.mStem, s.dStem, s.tStem];
const jeonggi = b => (T.JIJANGGAN[b]||[]).slice(-1)[0];
const sip = (s, g) => Y.getSipseong(s.dStem, g);
const rel = s => B.checkBranchRelations(br(s));
const hapWith = (s, a, b) => rel(s).합.some(h => h.includes(a) && h.includes(b));
const sinsalMap = s => S.analyzeSinsal(s).십이신살.배치 || {};
const wrap = fn => (saju, sex) => { const r = fn(saju, sex); return { 판정: r.성립, 근거: r.근거||[], 결과: r.결과||null }; };
function gongmang(s) { const sun = G60.getSunInfo(s.dStem + s.dBranch); return sun ? (T.GONGMANG[sun.순+'순']||[]) : []; }

// 二. 선조 봉사에 무성의 — ① 일이 생년을 극한 자 ② 연과 일이 충형 또는 공망된 자
function checkSeonjoBongsa(s) {
  const 근거 = [];
  const ilOh = Y.ohaengOf(s.dStem), yOh = Y.ohaengOf(s.yStem);
  if (GEUK[ilOh] === yOh) 근거.push('일간이 년간(선조)을 극함');
  const r2 = B.checkBranchRelations([s.yBranch, s.dBranch]);
  if (r2.충.length) 근거.push('연·일 상충'); if (r2.형.length) 근거.push('연·일 상형');
  const gm = gongmang(s); if (gm.includes(s.yBranch)) 근거.push('년지 공망');
  return 근거.length ? { 성립:true, 근거, 결과:'선조 봉사(제사)에 무성의하다' } : { 성립:false };
}

// 七. 모친 재취 — ① 월건에 도화·망신 ② 인수가 자기 관성(=재)과 암합 ③ 인수가 재와, 또 일지와 암합
function checkMochinJaega(s) {
  const 근거 = [];
  const map = sinsalMap(s);
  if (['년살','망신'].includes(map[s.mBranch])) 근거.push(`월건에 ${map[s.mBranch]==='년살'?'도화':'망신'}`);
  const stems = st(s), brs = br(s);
  for (let i=0;i<4;i++) {
    if (i===2 || !['정인','편인'].includes(sip(s, stems[i]))) continue;
    for (let j=0;j<4;j++) if (j!==2 && j!==i && ['정재','편재'].includes(sip(s, stems[j])) && stemHap(stems[i], stems[j]))
      근거.push(`인수(${stems[i]})가 자기 관성인 재(${stems[j]})와 암합`);
  }
  for (let i=0;i<4;i++) if (i!==2 && ['정인','편인'].includes(sip(s, jeonggi(brs[i]))) && hapWith(s, brs[i], s.dBranch))
    근거.push(`인수(${brs[i]})가 일지와 합`);
  return 근거.length ? { 성립:true, 근거:[...new Set(근거)], 결과:'모친이 재취(소실 포함)로 시집왔다' } : { 성립:false };
}

// 八. 다른 어머니 — 인수를 둘 이상 만난 자
function checkYeoreoEomeoni(s) {
  const n = G1.countSipseongAll(s, ['정인','편인']).count;
  return n >= 2 ? { 성립:true, 근거:[`인수 ${n}개`], 결과:'다른 어머니를 모셔 본다' } : { 성립:false };
}

// 九. 다른 아버지 밥 — 일지 재성이 타주 재와 연합(합)
function checkDareunAbeoji(s) {
  const ilJae = (T.JIJANGGAN[s.dBranch]||[]).some(g => ['정재','편재'].includes(sip(s,g)));
  if (!ilJae) return { 성립:false };
  for (const ob of [s.yBranch, s.mBranch, s.tBranch]) {
    if (!(T.JIJANGGAN[ob]||[]).some(g => ['정재','편재'].includes(sip(s,g)))) continue;
    const yh = hapWith(s, s.dBranch, ob), dk = D.checkJeojaDokchangHap(s.dBranch, ob);
    if (yh || dk) return { 성립:true, 근거:[`일지 재성이 타주(${ob}) 재와 ${josa(yh?'육합':dk,'으로')} 연합`], 결과:'다른 아버지의 밥을 먹어 본다' };
  }
  return { 성립:false };
}

// 一一. 외삼촌·처남 고독 — ① 생일에 음착양차살 → 외삼촌 ② 생시에 → 처남
function checkOesukCheonam(s) {
  const 근거 = [];
  if (T.CHAKSAL.includes(s.dStem+s.dBranch)) 근거.push(`일주(${s.dStem}${s.dBranch}) 음양차착살 — 외삼촌 고독·쇠몰`);
  if (T.CHAKSAL.includes(s.tStem+s.tBranch)) 근거.push(`시주(${s.tStem}${s.tBranch}) 음양차착살 — 처남 고독·쇠몰`);
  return 근거.length ? { 성립:true, 근거, 결과:'외삼촌·처남이 고독하다' } : { 성립:false };
}

// 一二. 조모·장모 두 분 — 상관·식신을 많이 만난 자
function checkJomoJangmo(s) {
  const n = G1.countSipseongAll(s, ['식신','상관']).count;
  return n >= 4 ? { 성립:true, 근거:[`상관·식신 다봉(${n})`], 결과:'조모 또는 장모 두 분을 모셔 본다' } : { 성립:false };
}

// 一三. 장모 봉양 — ① 일지 재 + 타주 상식이 일지와 합 ② 일지 상식 + 타주 재가 일지와 합 ③ 일·시에 도화 인수
function checkJangmoBongyang(s) {
  const 근거 = [], brs = br(s), map = sinsalMap(s);
  const ilSip = sip(s, jeonggi(s.dBranch));
  for (const i of [0,1,3]) {
    const oSip = sip(s, jeonggi(brs[i]));
    if (!hapWith(s, brs[i], s.dBranch)) continue;
    if (['정재','편재'].includes(ilSip) && ['식신','상관'].includes(oSip)) 근거.push(`일지 재 + 타주 상식(${brs[i]})이 일지와 합`);
    if (['식신','상관'].includes(ilSip) && ['정재','편재'].includes(oSip)) 근거.push(`일지 상식 + 타주 재(${brs[i]})가 일지와 합`);
  }
  for (const b of [s.dBranch, s.tBranch]) if (map[b]==='년살' && ['정인','편인'].includes(sip(s, jeonggi(b)))) 근거.push(`일·시에 도화 인수(${b})`);
  return 근거.length ? { 성립:true, 근거:[...new Set(근거)], 결과:'장모를 봉양함이 있어 본다' } : { 성립:false };
}

// 一四. 이복형제 — ① 일지 비겁이 타주 비겁과 합 ② 일간 합화의 화기가 비겁
function checkIbokHyeongje(s) {
  const 근거 = [], brs = br(s), stems = st(s), ilOh = Y.ohaengOf(s.dStem);
  const isBg = g => ['비견','비겁','겁재'].includes(sip(s,g));
  if (isBg(jeonggi(s.dBranch))) for (const i of [0,1,3]) if (isBg(jeonggi(brs[i])) && hapWith(s, s.dBranch, brs[i])) 근거.push(`일지 비겁이 타주 비겁(${brs[i]})과 합`);
  for (const i of [0,1,3]) { const hwa = stemHap(s.dStem, stems[i]); if (hwa && hwa===ilOh) 근거.push(`일간이 ${josa(stems[i],'와')} 합화(${hwa}) → 비겁`); }
  return 근거.length ? { 성립:true, 근거, 결과:'이복형제(자매)가 있다' } : { 성립:false };
}

// 一五. 고부 불화 — ① 인약재다 / 재약인왕 ② 일월지 충·원진(재·인 쟁투)
function checkGobuBulhwa(s) {
  const 근거 = [];
  const jae = G1.countSipseongAll(s, ['정재','편재']).count, ins = G1.countSipseongAll(s, ['정인','편인']).count;
  if (jae >= 3 && ins === 1) 근거.push(`인수 약(${ins})·재 다(${jae})`);
  if (ins >= 3 && jae === 1) 근거.push(`재 약(${jae})·인수 왕(${ins})`);
  if (jae >= 1 && ins >= 1) { const r2 = B.checkBranchRelations([s.mBranch, s.dBranch]); if (r2.충.length) 근거.push('일월지 상충(재·인 쟁투)'); if (r2.원진 && r2.원진.length) 근거.push('일월지 원진'); }
  return 근거.length ? { 성립:true, 근거, 결과:'고부간에 정이 없다' } : { 성립:false };
}

// 一六. 시모 불화(여명) — ① 비겁 태왕 ② 인수 태왕 ③ 재다신약에 재생관살
function checkSimoBulhwa(s, sex) {
  if (sex !== '여') return { 성립:false };
  const 근거 = [];
  const bg = G1.countSipseongAll(s, ['비견','비겁']).count, ins = G1.countSipseongAll(s, ['정인','편인']).count;
  const jae = G1.countSipseongAll(s, ['정재','편재']).count, gs = G1.countSipseongAll(s, ['정관','편관']).count;
  if (bg >= 4) 근거.push(`비겁 태왕(${bg})`); if (ins >= 4) 근거.push(`인수 태왕(${ins})`);
  const sinyak = Y.isSinYak(Y.getWangSangHyuSuSa(s.dStem, s.mBranch));
  if (jae >= 3 && sinyak && gs >= 1) 근거.push(`재다신약(재 ${jae})에 재가 관살을 생함`);
  return 근거.length ? { 성립:true, 근거, 결과:'시모간에 정이 없다' } : { 성립:false };
}

// 三七. 기생(여명) — ① 을일 병자·병술시 + 동하월 관·상관 불균 ② 임계일 수태왕 관쇠 / 시상상관 관약 ③ 관살태왕 상식부족 or 관약 상식태왕
function checkGisaeng(s, sex) {
  if (sex !== '여') return { 성립:false };
  const 근거 = [];
  const gs = G1.countSipseongAll(s, ['정관','편관']).count, sik = G1.countSipseongAll(s, ['식신','상관']).count;
  const siju = s.tStem + s.tBranch;
  if (s.dStem==='을' && ['병자','병술'].includes(siju) && ['해','자','축','사','오','미'].includes(s.mBranch) && Math.abs(gs - sik) >= 2) 근거.push(`을일 ${siju}시 + 동하월 관·상관 불균`);
  const suCount = br(s).filter(b=>T.BRANCH_OHAENG[b]==='수').length + st(s).filter((x,i)=>i!==2&&T.STEM_OHAENG[x]==='수').length;
  if (['임','계'].includes(s.dStem) && suCount >= 3 && gs <= 1) 근거.push('임계일 수성 태왕에 관 쇠미');
  if (sip(s, s.tStem)==='상관' && gs <= 1) 근거.push('시상상관에 주중 관 약');
  if (gs >= 4 && sik <= 1) 근거.push(`관살 태왕(${gs})에 제어 상식 부족`);
  if (gs <= 1 && sik >= 4) 근거.push(`관 약(${gs})에 상식 태왕(${sik})`);
  return 근거.length ? { 성립:true, 근거, 결과:'기생(접객) 직업을 갖는다' } : { 성립:false };
}

// 三八. 음식물업 — 일주 목록 + 국 + 식상생재격
function checkEumsikmulEop(s) {
  const ilju = s.dStem + s.dBranch, ilOh = Y.ohaengOf(s.dStem), 근거 = [];
  const SAENG = { 목:'화', 화:'토', 토:'금', 금:'수', 수:'목' }, GEUKBY = { 목:'금', 화:'수', 토:'목', 금:'화', 수:'토' };
  const guks = [...B.checkSamhap(br(s)), ...B.checkBanghap(br(s))].map(g=>g.ohaeng);
  const jae = G1.countSipseongAll(s, ['정재','편재']).count, sal = G1.countSipseongAll(s, ['정관','편관']).count;
  const others = [s.yStem, s.mStem, s.tStem];
  const sikT = others.some(x => ['식신','상관'].includes(sip(s,x))), jaeT = others.some(x => ['정재','편재'].includes(sip(s,x)));
  if (['임신','임자','임진','경신','경자','경진'].includes(ilju)) 근거.push(`${ilju}일생(①)`);
  if (['무신','무자'].includes(ilju) && ((sikT && jaeT) || guks.includes('수'))) 근거.push(`${ilju}일 상관생재/수재국(②)`);
  if (['기축','기묘'].includes(ilju) && (guks.includes(GEUK[ilOh]) || guks.includes(GEUKBY[ilOh]))) 근거.push(`${ilju}일 재·살국(②)`);
  if (['병신','병자','병진'].includes(ilju) && jae + sal >= 4) 근거.push(`${ilju}일 재살왕(③)`);
  if (['임','계'].includes(s.dStem) && (guks.includes(SAENG[ilOh]) || guks.includes(GEUK[ilOh]))) 근거.push('임계일 식신국·재국(③)');
  if (['식신','상관'].includes(sip(s, jeonggi(s.mBranch))) && jaeT) 근거.push('식상격에 재 투출 — 식상생재격(④)');
  return 근거.length ? { 성립:true, 근거, 결과:'음식물업(여관·요리·다방·양조 등)을 하여 본다' } : { 성립:false };
}

// 五三. 애기 낳고 가출(여명) — 을사·신사·계사·정해·기해일생이 각자의 관이 투출한 자
const GACHUL_GWAN = { 을사:['경','신'], 계사:['무','기'], 신사:['병','정'], 정해:['임','계'], 기해:['갑','을'] };
function checkGachul(s, sex) {
  if (sex !== '여') return { 성립:false };
  const gw = GACHUL_GWAN[s.dStem + s.dBranch]; if (!gw) return { 성립:false };
  const hit = [s.yStem, s.mStem, s.tStem].filter(x => gw.includes(x));
  return hit.length ? { 성립:true, 근거:[`${s.dStem}${s.dBranch}일생, 관(${hit.join(',')}) 투출`], 결과:'애기 낳고 살다가도 가출한다' } : { 성립:false };
}

// 六三. 자손 흉사(여명) — 일·시의 역마·지살이 합한 자 / 연·월의 역마·지살이 일주와 합한 자
function checkJasonHyungsa(s, sex) {
  // [합본 원문 六三 정정] 여명 자녀=상관·식신. 상식 임 백호 / 상식 봉형 / 상식·시에 급각·단교 / 토성다봉수·금수태왕(익사)
  // ※ 33차의 '역마지살 합'은 六四(옥외출생) 조건이 잘못 붙은 것 — 63차에 정정
  if (sex !== '여') return { 성립:false };
  const 근거 = [], R = rel(s), brs = br(s), stems = st(s);
  const BAEKHO = T.BAEKHO;
  for (let i=0;i<4;i++) {
    const b = brs[i], stemIsSik = i!==2 && ['식신','상관'].includes(sip(s, stems[i])), brIsSik = ['식신','상관'].includes(sip(s, jeonggi(b)));
    if (!stemIsSik && !brIsSik) continue;
    if (BAEKHO.includes(stems[i]+b)) 근거.push(`상식 기둥(${stems[i]}${b})이 백호대살`);
    if (brIsSik && R.형.some(f=>f.includes(b))) 근거.push(`상식(${b})이 형을 맞음`);
  }
  const gyejeol = S.getGyejeol(s.mBranch); const geupgak = T.GEUPGAK[gyejeol]||[]; const dangyo = T.DANGYOGWAN && T.DANGYOGWAN[s.mBranch];
  const sikBr = brs.filter(b=>['식신','상관'].includes(sip(s, jeonggi(b))));
  if ([...sikBr, s.tBranch].some(b => geupgak.includes(b) || b===dangyo)) 근거.push('상식 또는 시에 급각·단교관살');
  const cnt = ohs => brs.filter(b=>ohs.includes(T.BRANCH_OHAENG[b])).length + stems.filter((x,i)=>i!==2&&ohs.includes(T.STEM_OHAENG[x])).length;
  if (sikBr.length && cnt(['금','수']) >= 5) 근거.push('금수 태왕 — 익사 유형');
  if (!근거.length) return { 성립:false };
  return { 성립:true, 근거:[...new Set(근거)], 결과:'자손이 흉사하여 본다' };
}


// 五二. 부군 익사액(여명) — ① 무기일 목관 약·물 많음 / 갑을일 금관 약·물 많음 ② 임계일 토관 약·물 왕 ③ 경신일 화관 약·수살 거듭
function checkBugunIksa(s, sex) {
  if (sex !== '여') return { 성립:false };
  const GWAN = { 목:'금', 화:'수', 토:'목', 금:'화', 수:'토' };
  const ilOh = Y.ohaengOf(s.dStem), gwanOh = GWAN[ilOh];
  const cnt = oh => br(s).filter(b=>T.BRANCH_OHAENG[b]===oh).length + st(s).filter((x,i)=>i!==2&&T.STEM_OHAENG[x]===oh).length;
  const gwanCnt = G1.countSipseongAll(s, ['정관','편관']).count, su = cnt('수');
  if (gwanCnt === 0 || gwanCnt > 2) return { 성립:false };
  if (['무','기','갑','을'].includes(s.dStem) && su >= 3) return { 성립:true, 근거:[`${ilOh}일생 ${gwanOh}관 약(${gwanCnt})에 물 많음(${su})`], 결과:'부군에게 익사액이 있다' };
  if (['임','계'].includes(s.dStem) && su >= 4) return { 성립:true, 근거:[`임계일 토관 약에 물 왕(${su})`], 결과:'부군에게 익사액이 있다' };
  if (['경','신'].includes(s.dStem) && su >= 3) return { 성립:true, 근거:[`경신일 화관 약에 수살 거듭(${su})`], 결과:'부군에게 익사액이 있다' };
  return { 성립:false };
}

const TOPICS_6 = [
  { id:52, 제목:'부군 익사(여명)', fn: wrap(checkBugunIksa), needSex:true },
  { id:2, 제목:'선조봉사 무성의', fn: wrap(checkSeonjoBongsa) },
  { id:7, 제목:'모친 재취', fn: wrap(checkMochinJaega) },
  { id:8, 제목:'다른 어머니(다봉인수)', fn: wrap(checkYeoreoEomeoni) },
  { id:9, 제목:'다른 아버지 밥(저자독창합)', fn: wrap(checkDareunAbeoji) },
  { id:11, 제목:'외숙·처남 고독(음차양착)', fn: wrap(checkOesukCheonam) },
  { id:12, 제목:'조모·장모 두 분', fn: wrap(checkJomoJangmo) },
  { id:13, 제목:'장모 봉양', fn: wrap(checkJangmoBongyang) },
  { id:14, 제목:'이복형제', fn: wrap(checkIbokHyeongje) },
  { id:15, 제목:'고부 불화', fn: wrap(checkGobuBulhwa) },
  { id:16, 제목:'시모 불화(여명)', fn: wrap(checkSimoBulhwa), needSex:true },
  { id:37, 제목:'기생 직업(여명)', fn: wrap(checkGisaeng), needSex:true },
  { id:38, 제목:'음식물업', fn: wrap(checkEumsikmulEop) },
  { id:53, 제목:'가출(여명)', fn: wrap(checkGachul), needSex:true },
  { id:63, 제목:'자손 흉사(여명)', fn: wrap(checkJasonHyungsa), needSex:true },
];
module.exports = { TOPICS_6, checkBugunIksa, checkSeonjoBongsa, checkMochinJaega, checkYeoreoEomeoni, checkDareunAbeoji, checkOesukCheonam,
  checkJomoJangmo, checkJangmoBongyang, checkIbokHyeongje, checkGobuBulhwa, checkSimoBulhwa, checkGisaeng, checkEumsikmulEop, checkGachul, checkJasonHyungsa };
