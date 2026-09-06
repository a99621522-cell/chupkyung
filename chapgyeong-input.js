// ============================================================
// chapgyeong-input.js — 만세력 출력 → 첩경 엔진 입력 어댑터
// 원칙: 팔자는 기존 만세력(진태양시 보정된 라이브러리)이 세운다. 이 모듈은 변환·검증·정책만 맡는다.
//  - 기본 정책: 만세력이 세운 그대로(표준식 — 23시부터 다음 날 일주). 첩경 1권 야자시법은 opt.야자시정책='첩경'일 때만.
//  - 검증: 60갑자 유효성, 월두법(년간→월간), 시두법(일간→시간) 정합. 어긋나면 error가 아니라 경고 목록으로 돌려줌.
// 입력 형태 허용: {년주,월주,일주,시주} / {year,month,day,hour} / {yeon,wol,il,si} / 배열 ['신해','정유','기유','을해'] / 한자 간지 '辛亥'
// ============================================================
const HANJA = { 甲:'갑',乙:'을',丙:'병',丁:'정',戊:'무',己:'기',庚:'경',辛:'신',壬:'임',癸:'계', 子:'자',丑:'축',寅:'인',卯:'묘',辰:'진',巳:'사',午:'오',未:'미',申:'신',酉:'유',戌:'술',亥:'해' };
const STEMS = ['갑','을','병','정','무','기','경','신','임','계'];
const BRANCHES = ['자','축','인','묘','진','사','오','미','신','유','술','해'];
const GANJI60 = Array.from({length:60}, (_,i) => STEMS[i%10] + BRANCHES[i%12]);
const toKo = s => String(s||'').split('').map(ch => HANJA[ch] || ch).join('');

function normalizePillar(p) {
  if (!p) return null;
  if (typeof p === 'string') { const k = toKo(p.trim()); return k.length===2 ? k : null; }
  if (Array.isArray(p) && p.length>=2) return toKo(p[0]) + toKo(p[1]);
  if (typeof p === 'object') { const g = p.간 ?? p.천간 ?? p.stem ?? p.gan, j = p.지 ?? p.지지 ?? p.branch ?? p.ji; if (g && j) return toKo(g)+toKo(j); if (p.간지) return toKo(p.간지); }
  return null;
}
function pickPillars(src) {
  if (Array.isArray(src)) return src.slice(0,4).map(normalizePillar);
  const get = (...keys) => { for (const k of keys) if (src[k] !== undefined) return src[k]; return undefined; };
  return [get('년주','연주','yearPillar','year','yeon','y','年柱'), get('월주','monthPillar','month','wol','m','月柱'), get('일주','dayPillar','day','il','d','日柱'), get('시주','hourPillar','hour','si','t','時柱')].map(normalizePillar);
}
// 월두법(년두법): 갑기년 병인두, 을경년 무인두, 병신년 경인두, 정임년 임인두, 무계년 갑인두
const WOLDU = { 갑:'병', 기:'병', 을:'무', 경:'무', 병:'경', 신:'경', 정:'임', 임:'임', 무:'갑', 계:'갑' };
function expectedMonthStem(yStem, mBranch) { const start = STEMS.indexOf(WOLDU[yStem]); const off = (BRANCHES.indexOf(mBranch) - BRANCHES.indexOf('인') + 12) % 12; return STEMS[(start + off) % 10]; }
// 시두법: 갑기일 갑자시, 을경일 병자시, 병신일 무자시, 정임일 경자시, 무계일 임자시
const SIDU = { 갑:'갑', 기:'갑', 을:'병', 경:'병', 병:'무', 신:'무', 정:'경', 임:'경', 무:'임', 계:'임' };
function expectedHourStem(dStem, tBranch) { const start = STEMS.indexOf(SIDU[dStem]); return STEMS[(start + BRANCHES.indexOf(tBranch)) % 10]; }
function prevGanji(g) { const i = GANJI60.indexOf(g); return i < 0 ? g : GANJI60[(i + 59) % 60]; }

/**
 * @param {object|array} src 만세력 출력(팔자)
 * @param {object} opt { 야자시:boolean(보정 후 생시가 23:00~24:00), 야자시정책:'표준'(기본, 만세력 그대로)|'첩경', 만세력정책:'그날'|'표준'(첩경식 변환 시 필요; manseryeok 객체면 자동 '그날'), 성별 }
 * @returns {{ saju, pillars, warnings:string[], policy }} — saju는 analyzeAll 입력 형식
 */
function fromManse(src, opt = {}) {
  const policy = opt.야자시정책 || '표준';
  let [y, m, d, t] = pickPillars(src);
  const warnings = [];
  for (const [label, p] of [['년주',y],['월주',m],['일주',d],['시주',t]]) if (!p || !GANJI60.includes(p)) warnings.push(`${label} 간지 무효: ${p}`);
  if (warnings.length) return { saju:null, pillars:[y,m,d,t], warnings, policy };
  if (opt.야자시 && policy === '첩경' && t[1] === '자') {
    // 만세력의 야자시 정책은 팔자만으로 구분 불가(둘 다 자기 일주에 맞는 시간을 냄) → opt.만세력정책으로 받음
    //  '그날'  : 일주·시간 모두 그날 기준(manseryeok 계열, 객체에 yearPillar 키가 있으면 자동)
    //  '표준'  : 23시부터 일주를 다음 날로 넘김(간명 manse.js 계열)
    // 첩경 1권 야자시법 = 일주 그날 + 시간만 다음 날 일간 기준
    const lib = opt.만세력정책 || ((src && typeof src === 'object' && !Array.isArray(src) && src.yearPillar) ? '그날' : '표준');
    const nextD = GANJI60[(GANJI60.indexOf(d) + 1) % 60];
    if (lib === '그날') { t = expectedHourStem(nextD[0], '자') + '자'; warnings.push(`첩경 야자시법(만세력 그날식) — 일주 ${d} 유지, 시간을 다음 날 일간(${nextD[0]}) 기준 ${t}로`); }
    else { d = prevGanji(d); warnings.push(`첩경 야자시법(만세력 표준식) — 일주를 그날(${d})로 되돌림, 시주 ${t}는 다음 날 기준이라 유지`); }
  }
  const yS=y[0], yB=y[1], mS=m[0], mB=m[1], dS=d[0], dB=d[1], tS=t[0], tB=t[1];
  const em = expectedMonthStem(yS, mB); if (em !== mS) warnings.push(`월두법 불일치: ${yS}년 ${mB}월이면 월간 ${em} 기대, 입력 ${mS}`);
  const et = expectedHourStem(dS, tB); if (et !== tS) warnings.push(`시두법 불일치: ${dS}일 ${tB}시면 시간 ${et} 기대, 입력 ${tS}${opt.야자시&&policy==='첩경'?' (첩경 야자시는 다음 날 일간 기준이므로 정상)':''}`);
  return { saju:{ yStem:yS, yBranch:yB, mStem:mS, mBranch:mB, dStem:dS, dBranch:dB, tStem:tS, tBranch:tB }, pillars:[y,m,d,t], warnings, policy };
}
/** 만세력 출력을 바로 첩경 전권 분석까지 — analyzeFromManse(만세력출력, {성별, 야자시, 야자시정책, yongsinV26}) */
function analyzeFromManse(src, opt = {}) {
  const inp = fromManse(src, opt);
  if (!inp.saju) return { 입력: inp, 결과: null };
  const { analyzeAll } = require('./chapgyeong-master.js');
  return { 입력: inp, 결과: analyzeAll(inp.saju, opt.성별 || opt.sex || '남', { yongsinV26: !!opt.yongsinV26 }) };
}
/** 생년월일시에서 원스톱: analyzeFromBirth(manseryeokModule, {y,m,d,h,min,longitude,sex,today,years}) → 팔자·전권 분석·대운/세운 */
function analyzeFromBirth(M, b) {
  const m = M.calculateSaju(b.y, b.m, b.d, b.h ?? 12, b.min ?? 0, { longitude: b.longitude ?? 127.5, applyTimeCorrection: b.applyTimeCorrection !== false });
  const corrected = m.correctedTime ? (m.correctedTime.hour + m.correctedTime.minute/60) : (b.h ?? 12);
  const 야자시 = corrected >= 23;
  const out = analyzeFromManse(m, { ...b, 성별: b.sex || b.성별 || '남', 야자시 });
  if (!out.결과) return out;
  const U = require('./chapgyeong-un.js');
  out.운 = U.unReport(M, { y:b.y, m:b.m, d:b.d, h:b.h ?? 12, min:b.min ?? 0 }, out.입력.saju, b.sex || b.성별 || '남', out.결과.용신, { today: b.today, years: b.years });
  out.만세력 = { 보정시각: m.correctedTime, 팔자: [m.yearPillar, m.monthPillar, m.dayPillar, m.hourPillar] };
  return out;
}
module.exports = { fromManse, analyzeFromManse, analyzeFromBirth, expectedMonthStem, expectedHourStem, GANJI60, toKo };
