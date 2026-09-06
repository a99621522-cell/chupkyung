// ============================================================
// chapgyeong-vol2-rules-3.js
// 사주첩경 2권 — 육친 통변 66주제 (3차, 三一~四一 직업편)
// 출처: 원문 105~165쪽 (제7~10편)
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const B = require('./chapgyeong-vol1-basics.js');
const Y = require('./chapgyeong-vol1-yukchin.js');
const S = require('./chapgyeong-vol1-sinsal.js');

function toPillars(saju) {
  return {
    branches: [saju.yBranch, saju.mBranch, saju.dBranch, saju.tBranch],
    stems: [saju.yStem, saju.mStem, saju.dStem, saju.tStem],
  };
}
function countOhaeng(chars, oh) {
  return chars.filter(c => (T.STEM_OHAENG[c]||T.BRANCH_OHAENG[c]) === oh).length;
}

// ---------- 三一. 교원 생활 (원문 105~115쪽) ----------
function topic31_gyowon(saju) {
  const p = toPillars(saju);
  const ilgan = saju.dStem;
  const reasons = [];
  const wolji = p.branches[1];
  const jeonggi = T.JIJANGGAN[wolji][T.JIJANGGAN[wolji].length-1];
  if (['정인','편인'].includes(Y.getSipseong(ilgan, jeonggi))) reasons.push('월에 인수(월봉인수)');
  const inCount = p.branches.filter(b => {
    const jg = T.JIJANGGAN[b][T.JIJANGGAN[b].length-1];
    return ['정인','편인'].includes(Y.getSipseong(ilgan, jg));
  }).length + p.stems.filter((s,i) => i!==2 && ['정인','편인'].includes(Y.getSipseong(ilgan, s))).length;
  if (inCount >= 3) reasons.push(`인수 ${inCount}회 이상(추명가135: 대학교수·학총장급)`);
  return { 판정: reasons.length>0, 근거: reasons, 결과: '교원 생활을 하여 본다(또는 언론·문예·연예계)' };
}

// ---------- 三二. 경찰관 (원문 116~118쪽) ----------
function topic32_gyeongchal(saju) {
  const p = toPillars(saju);
  const reasons = [];
  const rel = require('./chapgyeong-vol1-basics.js').checkBranchRelations(p.branches);
  // [원문 116쪽 조건① '생일 기준으로 형을 만난 자' — 일지가 형에 관여해야 함(변설: 인일이 사·신을…)]
  if (rel.형.some(f => f.includes(p.branches[2]))) reasons.push('생일(일지) 기준 형을 만남');
  const yearSamhap = S.getSamhapGroup(p.branches[0]);
  if (yearSamhap && p.branches.includes(T.SUOK[yearSamhap])) reasons.push('주중에 수옥살');
  const jinsulsahae = ['진','술','사','해'];
  if (jinsulsahae.includes(p.branches[2])) {
    const others = p.branches.filter((b,i) => i!==2 && jinsulsahae.includes(b));
    if (others.length > 0) reasons.push('진술사해일생이 진술사해를 거듭 만남');
  }
  return { 판정: reasons.length>0, 근거: reasons, 결과: '경찰관·형무관·수사기관직을 하여 본다(또는 감금·납치를 당함)' };
}

// ---------- 三三. 의약업 (원문 119~129쪽, 7조 중 핵심 3개) ----------
function topic33_uiyak(saju) {
  // [합본 원문 7조] ① 사오미월 신해·신묘·신미·신사·신축일이 시에 임진·무술(안 만나도 확률 높음) ② 오양 인·신일이 형, 오음 사일이 인·신 ③ 경인·경오·경술일 화왕월, 묘월 갑자일, 겨울 임진일
  // ④ 정미일이 경술 만남, 갑술·무술일 ⑤ 갑을·무기일 월·시 술·해(천문), 사오미술해월 임오·계미일 ⑥ 인묘사오미월 갑을일, 해자축월 신축·신미·신해일 ⑦ 묘유·유술·묘술 두 자
  const p = toPillars(saju);
  const ilju = saju.dStem + saju.dBranch, ilgan = saju.dStem, m = p.branches[1];
  const reasons = [];
  const rel = require('./chapgyeong-vol1-basics.js').checkBranchRelations(p.branches);
  const ws = [m, p.branches[3]];
  if (['사','오','미'].includes(m) && ['신해','신묘','신미','신사','신축'].includes(ilju)) reasons.push(`여름 ${ilju}일생${['임진','무술'].includes(p.t)?' + 시 임진/무술':''}(금약화강 소용지장)`);
  if (['갑인','병인','무인','경인','임인','갑신','병신','무신','경신','임신'].includes(ilju) && rel.형.some(f => f.includes(p.branches[2]))) reasons.push('오양 인/신일이 (일지 기준) 형을 만남 — 형=수술');
  if (['을사','정사','기사','신사','계사'].includes(ilju) && p.branches.some((b,i)=>i!==2 && ['인','신'].includes(b))) reasons.push('오음 사일이 인·신을 만남');
  if (['경인','경오','경술'].includes(ilju) && ['인','오','술','사','미'].includes(m)) reasons.push(`${ilju}일 화왕월생`);
  if (ilju==='갑자' && m==='묘') reasons.push('묘월 갑자일(자묘형)');
  if (ilju==='임진' && ['해','자','축'].includes(m)) reasons.push('겨울 임진일');
  if (ilju==='정미' && (p.stems.some((s,i)=>i!==2&&s==='경') && p.branches.includes('술'))) reasons.push('정미일이 경술을 만남');
  if (['갑술','무술'].includes(ilju)) reasons.push(`${ilju}일생`);
  if (['갑','을','무','기'].includes(ilgan) && ws.some(b=>['술','해'].includes(b))) reasons.push('갑을·무기일이 월·시에 술·해(천문=인술)');
  if (['임오','계미'].includes(ilju) && ['사','오','미','술','해'].includes(m)) reasons.push(`${ilju}일 사오미술해월생`);
  if (['갑','을'].includes(ilgan) && ['인','묘','사','오','미'].includes(m)) reasons.push('목왕월 갑을일생(인이 인을 만남)');
  if (['신축','신미','신해'].includes(ilju) && ['해','자','축'].includes(m)) reasons.push(`삼동 ${ilju}일생(금수쌍청)`);
  const cheolswae = p.branches.filter(b => ['묘','유','술'].includes(b));
  if (new Set(cheolswae).size >= 2) reasons.push('묘유·유술·묘술 두 자(철쇄개금)');
  return { 판정: reasons.length>0, 근거: reasons, 결과: '의약업(의사·약사·간호원 등)을 하여 본다' };
}

// ---------- 三四. 재정공무원 (원문 129~133쪽) ----------

// 생년·일지 기준 역마/지살 지지 집합
function yeokmaJisalSet(p) {
  const S_ = require('./chapgyeong-vol1-sinsal.js');
  const JISAL={신자진:'신',해묘미:'해',인오술:'인',사유축:'사'}, YEOKMA={신자진:'인',해묘미:'사',인오술:'신',사유축:'해'};
  const set=new Set(); for (const b of [p.branches[0],p.branches[2]]) { const g=S_.getSamhapGroup(b); if(g){set.add(JISAL[g]); set.add(YEOKMA[g]);} }
  return set;
}

function topic34_jaejeong(saju) {
  // [합본 원문 조건] ① 일진이 재와 연결되어 재왕 ② 관고와 일주 합 ③ 관·재 동림하여 일주와 합 / 관재 삼합 / 일주·재 동림에 관 합 / 종재격
  const p = toPillars(saju);
  const ilgan = saju.dStem, ilOh = Y.ohaengOf(ilgan);
  const reasons = [];
  const G1 = require('./chapgyeong-vol4-gyeokguk.js');
  const rel = B.checkBranchRelations(p.branches);
  const sipB = b => Y.getSipseong(ilgan, T.JIJANGGAN[b].slice(-1)[0]);
  const jaeCount = G1.countSipseongAll(saju, ['정재','편재']).count;
  if (['정재','편재'].includes(sipB(p.branches[2])) && jaeCount >= 3) reasons.push('일지가 재이고 재왕');
  const GWAN={목:'금',화:'수',토:'목',금:'화',수:'토'}, GO={목:'미',화:'술',금:'축',수:'진',토:'진'};
  const gwango = GO[GWAN[ilOh]];
  if (p.branches.includes(gwango) && rel.합.some(h=>h.includes(gwango)&&h.includes(p.branches[2]))) reasons.push(`관고(${gwango})와 일주가 합`);
  for (let i=0;i<4;i++) { if (i===2) continue;
    const st=Y.getSipseong(ilgan,p.stems[i]), br=sipB(p.branches[i]);
    const gwanJae = (['정관','편관'].includes(st)&&['정재','편재'].includes(br)) || (['정재','편재'].includes(st)&&['정관','편관'].includes(br));
    if (gwanJae && rel.합.some(h=>h.includes(p.branches[i])&&h.includes(p.branches[2]))) reasons.push(`관·재 동림 기둥(${p.stems[i]}${p.branches[i]})이 일주와 합`);
  }
  const GEUK={목:'토',화:'금',토:'수',금:'목',수:'화'};
  if (B.checkSamhap(p.branches).some(g=>g.ohaeng===GEUK[ilOh]||g.ohaeng===GWAN[ilOh])) reasons.push('관 또는 재가 삼합국을 이룸');
  return { 판정: reasons.length>0, 근거: [...new Set(reasons)], 결과: '재정공무원(은행·재무부·국세청 등)을 하여 본다' };
}

// ---------- 三五. 법조계 (원문 133~141쪽) ----------
function topic35_beopjo(saju) {
  // [합본 원문 조건] ① 병일봉경·경일봉병(병경성) ② 수목일생이 일 또는 시에 술·해 ③ 정·기일생 재관격 ④ 비천록마격(임자일 자 중견, 정사일 사 중견, 신해·계해일 해 중견, 병오일 오 중견)
  const p = toPillars(saju);
  const ilgan = saju.dStem, ilju = p.d;
  const reasons = [];
  const stemsO = p.stems.filter((s,i)=>i!==2);
  const jeonggiStems = p.branches.map(b=>T.JIJANGGAN[b].slice(-1)[0]);
  if (ilgan==='병' && (stemsO.includes('경') || jeonggiStems.includes('경'))) reasons.push('병일봉경(병경성) — 검사 상');
  if (ilgan==='경' && (stemsO.includes('병') || jeonggiStems.includes('병'))) reasons.push('경일봉병(병경성) — 검사 상');
  if (['임','계','갑','을'].includes(ilgan) && [p.branches[2],p.branches[3]].some(b=>['술','해'].includes(b))) reasons.push('수목일생이 일·시에 술·해(천문) — 판사 상');
  if (['정','기'].includes(ilgan)) {
    const wolSip = Y.getSipseong(ilgan, p.branches[1] ? T.JIJANGGAN[p.branches[1]].slice(-1)[0] : '');
    const jaeGwanTuchul = stemsO.some(s=>['정재','편재','정관','편관'].includes(Y.getSipseong(ilgan,s)));
    if (['정재','편재','정관','편관'].includes(wolSip) && jaeGwanTuchul) reasons.push('정·기일생 재관격 — 판검 반반');
  }
  const BI = { 임자:'자', 정사:'사', 신해:'해', 계해:'해', 병오:'오' };
  if (BI[ilju] && p.branches.filter(b=>b===BI[ilju]).length >= 2) reasons.push(`비천록마격(${ilju}일 ${BI[ilju]} 중견) — 검찰청장 상`);
  return { 판정: reasons.length>0, 근거: reasons, 결과: '법조계(판사·검사·변호사)에 진출한다' };
}

// ---------- 三六. 역술계 (원문 142~148쪽) ----------
function topic36_yeoksul(saju) {
  // [합본 원문 조건] ① 三三 의약 해당자 또는 인수신왕 관부족 ② 병진일 살왕·인왕, 정사·정유일 재·인 봉 ③ 오음 해·축일·오양 술일이 월·시에 술해·축인
  // ④ 무신·무자일 금수다, 을묘·을사일 오미술해 월·시 ⑤ 임자·계유일 월·시 인·묘에 수목 多
  const p = toPillars(saju);
  const ilgan = saju.dStem, ilju = p.d;
  const reasons = [];
  const G1 = require('./chapgyeong-vol4-gyeokguk.js');
  const cnt = k => G1.countSipseongAll(saju, k).count;
  const cntOh = ohs => p.branches.filter(b=>ohs.includes(T.BRANCH_OHAENG[b])).length + p.stems.filter((s,i)=>i!==2&&ohs.includes(T.STEM_OHAENG[s])).length;
  const sinwang = Y.isSinWang(Y.getWangSangHyuSuSa(ilgan, p.branches[1]));
  if (typeof topic33_uiyak === 'function' && topic33_uiyak(saju).판정) reasons.push('三三 의약업 해당자');
  if (sinwang && cnt(['정인','편인']) >= 3 && cnt(['정관','편관']) <= 1) reasons.push('인수신왕에 관 부족');
  if (ilju==='병진' && cnt(['정관','편관']) >= 3 && cnt(['정인','편인']) >= 3) reasons.push('병진일 살왕·인왕');
  if (['정사','정유'].includes(ilju) && cnt(['정재','편재']) >= 1 && cnt(['정인','편인']) >= 1) reasons.push(`${ilju}일 봉재·인`);
  const ws = [p.branches[1], p.branches[3]];
  if ((['을해','을축','정해','정축','기해','기축','신해','신축','계해','계축'].includes(ilju) || ['갑술','병술','무술','임술'].includes(ilju)) && ws.some(b=>['술','해','축','인'].includes(b))) reasons.push(`${ilju}일이 월·시에 건·간방(술해·축인)`);
  if (['무신','무자'].includes(ilju) && cntOh(['금','수']) >= 4) reasons.push(`${ilju}일 금수 다`);
  if (['을묘','을사'].includes(ilju) && ws.some(b=>['오','미','술','해'].includes(b))) reasons.push(`${ilju}일 오미술해 월·시`);
  if (['임자','계유'].includes(ilju) && ws.some(b=>['인','묘'].includes(b)) && cntOh(['수','목']) >= 4) reasons.push(`${ilju}일 월·시 인묘에 수목 다`);
  return { 판정: reasons.length>0, 근거: reasons, 결과: '역술계(명리·관상·성명·풍수)에 진출한다' };
}

// ---------- 三九. 항공계 (원문 157~159쪽) ----------
function topic39_hanggong(saju) {
  // [원문 157쪽] 인 또는 사가 역마·지살에 해당한 자 — 생년 기준뿐 아니라 일지 기준도 됨
  const p = toPillars(saju);
  const reasons = [];
  const JISAL = { 신자진:'신', 해묘미:'해', 인오술:'인', 사유축:'사' };
  const YEOKMA = { 신자진:'인', 해묘미:'사', 인오술:'신', 사유축:'해' };
  for (const [base, label] of [[p.branches[0],'생년'],[p.branches[2],'일지']]) {
    const g = S.getSamhapGroup(base); if (!g) continue;
    for (const [name, tbl] of [['지살',JISAL],['역마',YEOKMA]]) {
      const target = tbl[g];
      if (['인','사'].includes(target) && p.branches.includes(target)) reasons.push(`${label} 기준 ${name}(${target}=화역마)`);
    }
  }
  return { 판정: reasons.length>0, 근거: [...new Set(reasons)], 결과: '항공계(공군·비행사·승무원 등)에 진출한다' };
}

// ---------- 四〇. 외교관 (원문 160~161쪽) ----------
function topic40_oegyogwan(saju) {
  // [원문 160쪽] 역마나 지살(생년·일지 기준)에 관 또는 인이 임한 자 — 그 글자 자체(정기) 또는 그 위 천간이 관·인
  const p = toPillars(saju);
  const ilgan = saju.dStem;
  const reasons = [];
  const JISAL = { 신자진:'신', 해묘미:'해', 인오술:'인', 사유축:'사' };
  const YEOKMA = { 신자진:'인', 해묘미:'사', 인오술:'신', 사유축:'해' };
  const targets = new Set();
  for (const base of [p.branches[0]]) { // 외교관 조문은 생년 기준만 명시(항공계와 달리 일지 확장 언급 없음)
    const g = S.getSamhapGroup(base); if (!g) continue;
    targets.add(JISAL[g]); targets.add(YEOKMA[g]);
  }
  for (let i=0;i<4;i++) {
    const b = p.branches[i]; if (!targets.has(b)) continue;
    const jg = T.JIJANGGAN[b][T.JIJANGGAN[b].length-1];
    const brOk = ['정관','편관','정인','편인'].includes(Y.getSipseong(ilgan, jg));
    const stOk = i!==2 && ['정관','편관','정인','편인'].includes(Y.getSipseong(ilgan, p.stems[i]));
    if (brOk || stOk) reasons.push(`역마·지살(${b})에 관 또는 인이 임함`);
  }
  return { 판정: reasons.length>0, 근거: [...new Set(reasons)], 결과: '외교관·통역관 등으로 나가 본다' };
}

// ---------- 四一. 종교신앙 (원문 162~168쪽, 핵심 조건) ----------
function topic41_jonggyo(saju) {
  const p = toPillars(saju);
  const ilgan = saju.dStem;
  const reasons = [];
  if (['무','기'].includes(ilgan)) {
    const hwaCount = countOhaeng(p.branches, '화');
    if (hwaCount >= 2) reasons.push('무기일생 화왕월(신信이 화왕에 강해짐)');
  }
  if (p.branches.includes('술') && p.branches.includes('해')) reasons.push('술해(천문) 겸비');
  return { 판정: reasons.length>0, 근거: reasons, 결과: '종교 신앙을 독실히 갖게 된다' };
}

const TOPICS_3 = [
  { id:31, 제목:'교원 생활', fn: topic31_gyowon },
  { id:32, 제목:'경찰관', fn: topic32_gyeongchal },
  { id:33, 제목:'의약업', fn: topic33_uiyak },
  { id:34, 제목:'재정공무원', fn: topic34_jaejeong },
  { id:35, 제목:'법조계', fn: topic35_beopjo },
  { id:36, 제목:'역술계', fn: topic36_yeoksul },
  { id:39, 제목:'항공계', fn: topic39_hanggong },
  { id:40, 제목:'외교관', fn: topic40_oegyogwan },
  { id:41, 제목:'종교신앙', fn: topic41_jonggyo },
];

module.exports = { TOPICS_3,
  topic31_gyowon, topic32_gyeongchal, topic33_uiyak, topic34_jaejeong,
  topic35_beopjo, topic36_yeoksul, topic39_hanggong, topic40_oegyogwan, topic41_jonggyo };
