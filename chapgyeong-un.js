// ============================================================
// chapgyeong-un.js — 첩경 2권 大運定法·세운 계층 (만세력 라이브러리 위에서 동작)
//  대운수: 생일↔절입 날수 ÷ 3 (나머지 2는 올림, 1은 버림) — 양남음녀 순행(다음 절입까지), 음남양녀 역행(지난 절입부터)
//  대운 간지: 월주에서 순/역으로 60갑자 진행 · 세운: 해당 연도 간지(입춘 기준, 만세력 사용)
//  운 판정(원국 기준): 십성(천간·지지 정기) · 용신 오행과의 관계 · 원국 지지와 합충형 · 천간합
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const B = require('./chapgyeong-vol1-basics.js');
const Y = require('./chapgyeong-vol1-yukchin.js');
const { GANJI60, toKo } = require('./chapgyeong-input.js');
const { josa } = require('./chapgyeong-josa.js');
const STEMS = ['갑','을','병','정','무','기','경','신','임','계'];
const YANG = new Set(['갑','병','무','경','임']);
const SAENG = { 목:'화', 화:'토', 토:'금', 금:'수', 수:'목' };
const GEUKBY = { 목:'금', 화:'수', 토:'목', 금:'화', 수:'토' };
const GEUK = { 목:'토', 화:'금', 토:'수', 금:'목', 수:'화' };
const HAP = { 갑기:1, 기갑:1, 을경:1, 경을:1, 병신:1, 신병:1, 정임:1, 임정:1, 무계:1, 계무:1 };
const dayMs = 86400000;

// 절입 경계까지의 날수 — 만세력 라이브러리 기준.
//  · 절기 시각표가 있는 해(2020~2030): 12절(입춘·경칩·청명·입하·망종·소서·입추·백로·한로·입동·대설·소한) 시각과 생시를 직접 비교(시간 단위)
//  · 그 밖의 해: 라이브러리의 월주 판정 경계(일 단위)를 하루씩 스캔 — 라이브러리 자체가 그 해는 일 단위로 판정하므로 그것이 곧 만세력 기준
const JEOL = new Set(['입춘','경칩','청명','입하','망종','소서','입추','백로','한로','입동','대설','소한']);
function jeolipTimes(M, year) { try { const arr = M.getSolarTermsByYear(year); return (arr||[]).filter(t=>JEOL.has(t.name)).map(t=>({ name:t.name, time: new Date(t.date || t.datetime || t.time || `${t.year||year}-${String(t.month).padStart(2,'0')}-${String(t.day).padStart(2,'0')}T${String(t.hour||0).padStart(2,'0')}:${String(t.minute||0).padStart(2,'0')}:00+09:00`) })).filter(t=>!isNaN(t.time)); } catch(e) { return null; } }
function findJeolipDays(M, y, m, d, dir, h = 12, min = 0) {
  const birth = new Date(`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}T${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}:00+09:00`);
  const table = [...(jeolipTimes(M, y-1)||[]), ...(jeolipTimes(M, y)||[]), ...(jeolipTimes(M, y+1)||[])];
  if (table.length) { const cands = table.filter(t => dir>0 ? t.time > birth : t.time < birth).sort((a,b)=>dir>0 ? a.time-b.time : b.time-a.time); if (cands.length) return { days: Math.abs(cands[0].time - birth)/dayMs, 절기: cands[0].name, 해상도:'시각' }; }
  const base = new Date(Date.UTC(y, m-1, d, 12)); const mp = M.calculateSaju(y, m, d, 12, 0, {applyTimeCorrection:false}).monthPillar;
  for (let k=1; k<=40; k++) { const t = new Date(base.getTime() + dir*k*dayMs); const p = M.calculateSaju(t.getUTCFullYear(), t.getUTCMonth()+1, t.getUTCDate(), 12, 0, {applyTimeCorrection:false}).monthPillar; if (p !== mp) return { days: dir>0 ? k : k, 절기:null, 해상도:'일' }; }
  return null;
}
// 대운수 — 만세력 표준: 3일=1년·1일=4개월·1시간=5일 환산 후 반올림(첩경 2권 '2올림 1버림'과 결과 동일)
function daeunSu(days) { return Math.round(days/3); }
function daeunSemil(days) { const yrs = days/3; const y = Math.floor(yrs); const mo = Math.round((yrs - y)*12); return { 년:y, 개월:mo, 소수:+yrs.toFixed(2) }; }

/** @param birth {y,m,d,h,min} */
function buildDaeun(M, birth, saju, sex, count = 9) {
  const yangYear = YANG.has(saju.yStem);
  const forward = (yangYear && sex === '남') || (!yangYear && sex === '여');
  const j = findJeolipDays(M, birth.y, birth.m, birth.d, forward ? 1 : -1, birth.h ?? 12, birth.min ?? 0);
  const days = j ? j.days : null; const su = days == null ? null : daeunSu(days);
  const start = GANJI60.indexOf(saju.mStem + saju.mBranch);
  const list = [];
  const birthDate = new Date(`${birth.y}-${String(birth.m).padStart(2,'0')}-${String(birth.d).padStart(2,'0')}T12:00:00+09:00`);
  const yrsToDaeun = days == null ? null : days/3; // 세밀정운: 3일=1년 그대로 소수 연수
  const addYears = (dt, yrs) => { const t = new Date(dt); const whole = Math.floor(yrs); t.setFullYear(t.getFullYear()+whole); t.setMonth(t.getMonth() + Math.round((yrs-whole)*12)); return t; };
  for (let i=1; i<=count; i++) { const g = GANJI60[(start + (forward ? i : -i) + 600) % 60];
    const a0 = su == null ? null : su + 10*(i-1);
    const startAt = yrsToDaeun == null ? null : addYears(birthDate, yrsToDaeun + 10*(i-1)), endAt = yrsToDaeun == null ? null : addYears(birthDate, yrsToDaeun + 10*i);
    list.push({ 순번:i, 간지:g, 시작만나이:a0, 끝만나이: a0==null?null:a0+9, 시작세는나이: a0==null?null:a0+1, 끝세는나이: a0==null?null:a0+10,
      시작시점: startAt && `${startAt.getFullYear()}.${String(startAt.getMonth()+1).padStart(2,'0')}`, 끝시점: endAt && `${endAt.getFullYear()}.${String(endAt.getMonth()+1).padStart(2,'0')}`, _start: startAt, _end: endAt }); }
  return { 방향: forward ? '순행' : '역행', 절입: j && j.절기, 해상도: j && j.해상도, 절입날수: days==null?null:+days.toFixed(2), 대운수: su, 세밀: days==null?null:daeunSemil(days), 대운: list };
}
function judgeUn(saju, ganji, yongsin) { // 운 간지 하나를 원국에 대조
  const st = ganji[0], br = ganji[1], ilgan = saju.dStem;
  // 시 미상(tStem/tBranch 없음)이면 삼주만으로 대조
  const brs = [saju.yBranch, saju.mBranch, saju.dBranch, saju.tBranch].filter(Boolean), stems = [saju.yStem, saju.mStem, saju.dStem, saju.tStem].filter(Boolean);
  const jeonggi = (T.JIJANGGAN[br]||[]).slice(-1)[0];
  const sipStem = Y.getSipseong(ilgan, st), sipBr = Y.getSipseong(ilgan, jeonggi);
  const R = B.checkBranchRelations([...brs, br]);
  const pick = arr => arr.filter(x => x.includes(br) && brs.some(b => x.includes(b) && b !== br || (x[0]===br && x[1]===br))).map(x => x.filter(v=>v!==br||x[0]===x[1]).join(''));
  const 합 = R.합.filter(h=>h.includes(br)).map(h=>h[0]===br?h[1]:h[0]).filter(v=>brs.includes(v));
  const 충 = R.충.filter(h=>h.includes(br)).map(h=>h[0]===br?h[1]:h[0]).filter(v=>brs.includes(v));
  const 형 = R.형.filter(h=>h.includes(br)).map(h=>h[2]==='자형'? br : (h[0]===br?h[1]:h[0])).filter(v=>brs.includes(v));
  const 원진 = (R.원진||[]).filter(h=>h.includes(br)).map(h=>h[0]===br?h[1]:h[0]).filter(v=>brs.includes(v));
  const 간합 = stems.filter((x,i)=> HAP[st+x]).map((x,i)=> x + (i===2?'(일간)':''));
  const yOh = yongsin && yongsin.용신오행;
  const stOh = T.STEM_OHAENG[st], brOh = T.BRANCH_OHAENG[br];
  let 용신관계 = [];
  if (yOh) { for (const [o,label] of [[stOh,'천간'],[brOh,'지지']]) { if (o===yOh) 용신관계.push(`${label} 용신(${yOh}) 도래`); else if (o===GEUKBY[yOh]) 용신관계.push(`${label} ${josa(o,'가')} 용신 ${josa(yOh,'을')} 극`); else if (SAENG[o]===yOh) 용신관계.push(`${label} ${josa(o,'가')} 용신을 생`); } }
  // [133차] 점수식 재적합 — 4권下 저자 대운 사건 171건(길 85·흉 86, docs/fit_un_rules.js): 옛 식 17%(길 2/85, 충·형 벌점이 노이즈) → 새 식 52%(길 44·흉 45)
  //   특징별 저자 통계: 운이 용신을 生 → 길 70% / 용신이 극하는 오행(재·기신) 도래 → 흉 87% / 용신 지지 合去 → 흉 100% / 원국 어느 지지와의 충(chungAny) → 길흉 반반(무정보) → 벌점 제거
  //   opt.unScore='old'로 옛 식
  let score = 0; const yBrs = brs.filter(b=>T.BRANCH_OHAENG[b]===yOh);
  if (judgeUn.mode === 'old') { if (stOh===yOh) score+=2; if (brOh===yOh) score+=2; if (stOh===GEUKBY[yOh]) score-=2; if (brOh===GEUKBY[yOh]) score-=2; if (SAENG[stOh]===yOh) score+=1; if (SAENG[brOh]===yOh) score+=1;
    score -= 충.length*1.5 + 형.length*1 + 원진.length*0.5; if (간합.some(g=>g.includes('일간'))) score -= 0.5; }
  else { for (const o of [stOh, brOh]) { if (!o) continue; if (o===yOh) score+=1; else if (SAENG[o]===yOh) score+=1; else if (GEUKBY[yOh]===o) score-=2; else if (GEUK[yOh]===o) score-=1; else if (SAENG[yOh]===o) score-=1; }
    if (br && 합.some(v=>yBrs.includes(v))) score-=2; // 용신 지지가 운 지지와 합거
    if (br && 충.some(v=>yBrs.includes(v))) score-=1; // 용신 지지 충
    // [134차] 병약: 운이 藥이면 +, 病을 강화(=病 오행 도래·病을 생)하면 −. 가중치 judgeUn.w (기본 fit_un_rules 결과)
    const W = judgeUn.w || { 약: 1.5, 병: 1, 생병: 0.5 };
    if (yongsin && yongsin.병) { for (const o of [stOh, brOh]) { if (!o) continue; if (o === yongsin.약) { score += W.약; 용신관계.push(`${o} 藥 도래(病 ${yongsin.병} 제거)`); } else if (o === yongsin.병) { score -= W.병; 용신관계.push(`${o} 病 강화`); } else if (SAENG[o] === yongsin.병) { score -= W.생병; } } } }
  const 등급 = judgeUn.mode === 'old' ? (score >= 2 ? '길' : score <= -2 ? '흉' : '평') : (score >= 0.5 ? '길' : score <= -0.5 ? '흉' : '평');
  return { 간지:ganji, 천간:`${st}(${sipStem})`, 지지:`${br}(${sipBr})`, 용신관계, 합, 충, 형, 원진, 간합, 점수: score, 등급 };
}
function seunGanji(M, year) { return toKo(M.calculateSaju(year, 6, 15, 12, 0).yearPillar); }


// ---- 월운(절기월 기준) ----
// 해당 연도의 12절 각 달: 만세력 월주 간지(절기 시각표 있으면 절입 일자·시각, 없으면 월 중일 기준)
function monthsOfYear(M, year) {
  // 절기월 12달 = 그 해 입춘 ~ 다음 해 소한. 월주는 절입 다음 날 정오 기준(절입 시각 전후 오판 방지)
  const jt = [...(jeolipTimes(M, year)||[]), ...(jeolipTimes(M, year+1)||[])].sort((a,b)=>a.time-b.time);
  const out = [];
  const lichun = jt.find(t=>t.name==='입춘' && t.time.getFullYear()===year);
  if (lichun) {
    const seq = jt.filter(t=>t.time >= lichun.time).slice(0,12);
    for (const t of seq) { const kst = new Date(t.time.getTime() + 9*3600*1000); const nx = new Date(kst.getTime() + dayMs);
      const mp = toKo(M.calculateSaju(nx.getUTCFullYear(), nx.getUTCMonth()+1, nx.getUTCDate(), 12, 0, {applyTimeCorrection:false}).monthPillar);
      out.push({ 절기: t.name, 시작: `${kst.getUTCFullYear()}-${String(kst.getUTCMonth()+1).padStart(2,'0')}-${String(kst.getUTCDate()).padStart(2,'0')} ${String(kst.getUTCHours()).padStart(2,'0')}:${String(kst.getUTCMinutes()).padStart(2,'0')}`, 간지: mp }); }
    if (out.length === 12) return out;
  }
  // 시각표 없는 해: 매월 15일의 월주(입춘 뒤 2월부터 다음 해 1월까지 12달)
  const names = ['입춘','경칩','청명','입하','망종','소서','입추','백로','한로','입동','대설','소한'];
  for (let k=0;k<12;k++) { const mm = 2+k, y = mm<=12 ? year : year+1, m = mm<=12 ? mm : mm-12;
    const mp = toKo(M.calculateSaju(y, m, 15, 12, 0, {applyTimeCorrection:false}).monthPillar);
    // 경계일 스캔(해당 달 1~15일 중 월주가 바뀌는 날)
    let startDay = null; for (let d=1; d<=15; d++) { if (toKo(M.calculateSaju(y, m, d, 12, 0, {applyTimeCorrection:false}).monthPillar) === mp) { startDay = d; break; } }
    out.push({ 절기: names[k], 시작: `${y}-${String(m).padStart(2,'0')}-${String(startDay||1).padStart(2,'0')}(일 단위)`, 간지: mp }); }
  return out;
}
const HAP_HWA = { 갑기:'토', 기갑:'토', 을경:'금', 경을:'금', 병신:'수', 신병:'수', 정임:'목', 임정:'목', 무계:'화', 계무:'화' };
function wolunReport(M, saju, yongsin, year) {
  const seun = seunGanji(M, year);
  return monthsOfYear(M, year).map(mo => {
    const j = judgeUn(saju, mo.간지, yongsin);
    const R = B.checkBranchRelations([seun[1], mo.간지[1]]);
    const vsSeun = [R.합.length?'세운 지지와 합':'', R.충.length?'세운 지지와 충':'', R.형.length?'세운 지지와 형':'', HAP_HWA[seun[0]+mo.간지[0]]?`세운 천간과 간합(${HAP_HWA[seun[0]+mo.간지[0]]})`:''].filter(Boolean);
    return { ...mo, ...j, 세운대조: vsSeun };
  });
}

/** 운 리포트: 대운 표 + 지정 연도 세운 + 현재 대운 + 월운(올해) */
function unReport(M, birth, saju, sex, yongsin, opt = {}) {
  const now = opt.today ? new Date(opt.today) : new Date();
  const hadBirthday = (now.getMonth()+1 > birth.m) || (now.getMonth()+1 === birth.m && now.getDate() >= birth.d);
  const manAge = now.getFullYear() - birth.y - (hadBirthday ? 0 : 1); // 만나이(만세력 대운 나이 기준)
  const seneun = now.getFullYear() - birth.y + 1;
  const D = buildDaeun(M, birth, saju, sex);
  const 대운 = D.대운.map(d => { const { _start, _end, ...rest } = d; return { ...rest, ...judgeUn(saju, d.간지, yongsin), 현재: !!(_start && now >= _start && now < _end) }; });
  const years = opt.years || [now.getFullYear(), now.getFullYear()+1];
  const 세운 = years.map(y => { const g = seunGanji(M, y); return { 연도:y, 세는나이:y - birth.y + 1, 만나이: y - birth.y, ...judgeUn(saju, g, yongsin) }; });
  const monthYears = opt.monthYears || [years[0]];
  const 월운 = {}; for (const y of monthYears) 월운[y] = wolunReport(M, saju, yongsin, y);
  return { 기준일: now.toISOString().slice(0,10), 만나이: manAge, 세는나이: seneun, 방향: D.방향, 절입: D.절입, 해상도: D.해상도, 절입날수: D.절입날수, 대운수: D.대운수, 세밀: D.세밀, 대운, 세운, 월운 };
}
module.exports = { buildDaeun, judgeUn, unReport, daeunSu, daeunSemil, findJeolipDays, seunGanji, monthsOfYear, wolunReport };
