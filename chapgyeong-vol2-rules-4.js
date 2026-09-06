// ============================================================
// chapgyeong-vol2-rules-4.js
// 사주첩경 2권 — 육친 통변 66주제 (4차, 四二~五四 부부·처첩편)
// 출처: 원문 168~229쪽 (제11~14편)
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const B = require('./chapgyeong-vol1-basics.js');
const Y = require('./chapgyeong-vol1-yukchin.js');

function toPillars(saju) {
  return {
    branches: [saju.yBranch, saju.mBranch, saju.dBranch, saju.tBranch],
    stems: [saju.yStem, saju.mStem, saju.dStem, saju.tStem],
  };
}
function sipseongOfBranch(ilgan, branch) {
  const jg = T.JIJANGGAN[branch][T.JIJANGGAN[branch].length-1];
  return Y.getSipseong(ilgan, jg);
}

// ---------- 四二. 본처와 해로 못한다 (원문 168~172쪽) ----------
function topic42_bonchoe(saju) {
  // [합본 원문 조건] ① 시상상관 · 일시상충 · 시상편재에 인수·비겁 왕 ② 계년임월(임년계월) 무기일 · 간여지동에 비겁 왕 ③ 시 공망 · 일시 양인 중첩 · 일시 형·원진 · 일시 고진
  const p = toPillars(saju);
  const ilgan = saju.dStem;
  const reasons = [];
  const G1 = require('./chapgyeong-vol4-gyeokguk.js');
  const bigyeop = G1.countSipseongAll(saju, ['비견','비겁']).count, insu = G1.countSipseongAll(saju, ['정인','편인']).count;
  const tSip = Y.getSipseong(ilgan, saju.tStem);
  if (tSip === '상관') reasons.push('시상상관');
  const rel = B.checkBranchRelations([p.branches[2],p.branches[3]]);
  if (rel.충.length) reasons.push('일시 상충');
  if (tSip === '편재' && bigyeop + insu >= 4) reasons.push('시상편재에 인수·비겁 왕');
  const ym = saju.yStem + saju.mStem;
  if (['무','기'].includes(ilgan) && (ym==='계임' || ym==='임계')) reasons.push('계년임월/임년계월의 무기일생');
  if (sipseongOfBranch(ilgan, p.branches[2]) === '비견' && bigyeop >= 3) reasons.push('간여지동에 비겁 왕');
  const G60 = require('./chapgyeong-vol1-gapja60.js'); const sun = G60.getSunInfo(saju.dStem+saju.dBranch);
  if (sun && (T.GONGMANG[sun.순+'순']||[]).includes(p.branches[3])) reasons.push('시지 공망');
  if (p.branches[2]===T.YANGIN[ilgan] && p.branches[3]===T.YANGIN[ilgan]) reasons.push('일시에 양인 중첩');
  if (rel.형.length) reasons.push('일시 상형'); if (rel.원진 && rel.원진.length) reasons.push('일시 원진');
  return { 판정: reasons.length>0, 근거: reasons, 결과: '본처와 해로하지 못한다(상처·이별)' };
}

// ---------- 四三. 악처를 만난다 (원문 173~176쪽) ----------
const AKCHOE_SIJI = {
  갑:['진','오'], 을:['묘','사'], 병:['인','진'], 정:['묘','축','해'],
  무:['자','인'], 기:['축','해','유'], 경:['술','신'], 신:['미','유'],
  임:['오','신'], 계:['사','미']
};
function topic43_akchoe(saju) {
  // [합본 원문 175쪽 도표] 신약 전제. 십간별 시주 재살 간지에 연월 재살 글자 두 자 이상. 종살·종재격 예외
  const p = toPillars(saju);
  const ilgan = saju.dStem;
  if (!Y.isSinYak(Y.getWangSangHyuSuSa(ilgan, p.branches[1]))) return { 판정:false, 근거:[], 결과:null };
  const TABLE = { 갑:['무진','경오'], 을:['기묘','신사'], 병:['경인','임진'], 정:['계묘','신축','신해'], 무:['임자','갑인'], 기:['을축','을해','계유'], 경:['병술','갑신'], 신:['을미','정유'], 임:['병오','무신'], 계:['정사','기미'] };
  if (!(TABLE[ilgan]||[]).includes(p.t)) return { 판정:false, 근거:[], 결과:null };
  const isJaesal = g => ['정재','편재','정관','편관'].includes(Y.getSipseong(ilgan,g));
  let ymCount = 0;
  for (const i of [0,1]) { if (isJaesal(p.stems[i])) ymCount++; if (isJaesal(T.JIJANGGAN[p.branches[i]].slice(-1)[0])) ymCount++; }
  if (ymCount < 2) return { 판정:false, 근거:[], 결과:null };
  return { 판정:true, 근거:[`신약에 시주 ${p.t}(재살) + 연월 재살 ${ymCount}자 — 재살 가중`], 결과:'악처를 만난다(처가 강해 다투다 자살하는 경우도 있음)' };
}

// ---------- 四四. 처가 흉사한다 (원문 177~182쪽) ----------
function topic44_choehyungsa(saju) {
  // [합본 원문 조건] ① 재가 형을 만나고 비겁 왕 · 신유술월 정축·병술일 ② 갑진·을미일에 재나 비겁 多, 재성 백호+비겁·재 多 ③ 축일 오시·오일 축시에 천간 재성
  const p = toPillars(saju);
  const ilgan = saju.dStem, ilju = saju.dStem + saju.dBranch;
  const reasons = [];
  const G1 = require('./chapgyeong-vol4-gyeokguk.js');
  const jae = G1.countSipseongAll(saju, ['정재','편재']).count, bg = G1.countSipseongAll(saju, ['비견','비겁']).count;
  const rel = B.checkBranchRelations(p.branches);
  const jaeBranches = p.branches.filter(b => ['정재','편재'].includes(sipseongOfBranch(ilgan,b)));
  if (jaeBranches.length && rel.형.some(f => jaeBranches.some(jb=>f.includes(jb))) && bg >= 3) reasons.push('재가 형을 만나고 비겁 왕');
  if (['신','유','술'].includes(p.branches[1]) && ['정축','병술'].includes(ilju)) reasons.push(`재왕월 ${ilju}일(암장재 백호)`);
  if (['갑진','을미'].includes(ilju) && (jae >= 3 || bg >= 3)) reasons.push(`${ilju}일에 재·비겁 많음`);
  p.branches.forEach((b,i) => { if (['정재','편재'].includes(sipseongOfBranch(ilgan,b)) && T.BAEKHO.includes(p.stems[i]+b) && (jae+bg) >= 4) reasons.push(`재성 기둥(${p.stems[i]}${b}) 백호대살 + 비겁·재 많음`); });
  if (((p.branches[2]==='축' && p.branches[3]==='오') || (p.branches[2]==='오' && p.branches[3]==='축')) && ['정재','편재'].includes(Y.getSipseong(ilgan, saju.tStem))) reasons.push('축일 오시/오일 축시에 시간 재성');
  return { 판정: reasons.length>0, 근거: [...new Set(reasons)], 결과: '처가 흉사한다' };
}

// ---------- 四五. 국제 이성 교정 (원문 183~186쪽) ----------

// 생년·일지 기준 역마/지살 지지 집합
function yeokmaJisalSet(p) {
  const S_ = require('./chapgyeong-vol1-sinsal.js');
  const JISAL={신자진:'신',해묘미:'해',인오술:'인',사유축:'사'}, YEOKMA={신자진:'인',해묘미:'사',인오술:'신',사유축:'해'};
  const set=new Set(); for (const b of [p.branches[0],p.branches[2]]) { const g=S_.getSamhapGroup(b); if(g){set.add(JISAL[g]); set.add(YEOKMA[g]);} }
  return set;
}

function topic45_gukje(saju, sex) {
  // [합본 원문 조건] 역마·지살(생년·일지 기준)에 재(남명)/관(여명)이 임하여 일주와 합한 자
  const p = toPillars(saju);
  const ilgan = saju.dStem;
  const reasons = [];
  const yj = yeokmaJisalSet(p);
  const rel = B.checkBranchRelations(p.branches);
  const target = sex === '여' ? ['정관','편관'] : ['정재','편재'];
  for (let i=0;i<4;i++) { if (i===2) continue; const b=p.branches[i]; if (!yj.has(b)) continue;
    const imham = target.includes(sipseongOfBranch(ilgan,b)) || target.includes(Y.getSipseong(ilgan,p.stems[i]));
    if (!imham) continue;
    // 3권 실례("재성역마 국제연애", "지살마관 국제결혼")는 임함만으로 판정 — 합은 강조 표기
    const hap = rel.합.some(h=>h.includes(b)&&h.includes(p.branches[2]));
    reasons.push(`역마/지살(${b})에 ${sex==='여'?'관':'재'}이 임함${hap?' — 일주와 합(원문 정격)':''}`);
  }
  return { 판정: reasons.length>0, 근거: [...new Set(reasons)], 결과: '국제 이성과 애정을 맺는다(해외결혼·유학 등)' };
}

// ---------- 四六. 재취 또는 작첩 (원문 186~192쪽) ----------
function topic46_jaechwi(saju) {
  // [합본 원문 조건] ① 일지 암장재가 타주 재와 합한 자 · 무기일생 인오술사미 2자 이상 ② 해자축월 갑을·임계일 · 일·시 도화
  const p = toPillars(saju);
  const ilgan = saju.dStem;
  const reasons = [];
  const rel = B.checkBranchRelations(p.branches);
  const isJae = g => ['정재','편재'].includes(Y.getSipseong(ilgan,g));
  if ((T.JIJANGGAN[p.branches[2]]||[]).some(isJae)) {
    for (const i of [0,1,3]) {
      const ob = p.branches[i];
      if ((T.JIJANGGAN[ob]||[]).some(isJae) && rel.합.some(h=>h.includes(ob)&&h.includes(p.branches[2]))) { reasons.push(`일지 암장재가 타주(${ob}) 재와 합`); break; }
    }
  }
  if (['무','기'].includes(ilgan) && p.branches.filter(b => ['인','오','술','사','미'].includes(b)).length >= 2) reasons.push('무기일생 인오술사미 중 두 자 이상');
  if (['해','자','축'].includes(p.branches[1]) && ['갑','을','임','계'].includes(ilgan)) reasons.push('해자축월 갑을/임계일생');
  const yearSamhap = require('./chapgyeong-vol1-sinsal.js').getSamhapGroup(p.branches[0]);
  if (yearSamhap && [p.branches[2],p.branches[3]].includes(T.DOHWA[yearSamhap])) reasons.push('일시에 도화살');
  return { 판정: reasons.length>0, 근거: reasons, 결과: '재취 또는 작첩을 하여 본다' };
}

// ---------- 四七. 본부와 해로 못한다 — 여명 (원문 193~205쪽) ----------
function topic47_bonbu(saju, sex) {
  // [합본 원문 조건] ① 상관 태왕 관 부족 · 관살 태왕 제 부족 ② 금청수랭(추동월 경신임계일) 화 없음 · 토조염(하월 무기일) 물 없음 · 고란살·과숙살
  if (sex !== '여') return { 판정:false, 근거:[], 결과:null };
  const p = toPillars(saju);
  const ilgan = saju.dStem, ilju = saju.dStem+saju.dBranch, m = p.branches[1];
  const reasons = [];
  const G1 = require('./chapgyeong-vol4-gyeokguk.js');
  const gs = G1.countSipseongAll(saju, ['정관','편관']).count, sang = G1.countSipseongAll(saju, ['상관']).count, sik = G1.countSipseongAll(saju, ['식신','상관']).count;
  const cntOh = ohs => p.branches.filter(b=>ohs.includes(T.BRANCH_OHAENG[b])).length + p.stems.filter((s,i)=>i!==2&&ohs.includes(T.STEM_OHAENG[s])).length;
  if (sang >= 3 && gs <= 1) reasons.push('상관 태왕에 관 부족');
  if (gs >= 4 && sik === 0) reasons.push('관살 태왕에 제(식상) 부족');
  if (['신','유','술','해','자','축'].includes(m) && ['경','신','임','계'].includes(ilgan) && cntOh(['화']) === 0) reasons.push('금청수랭에 화를 얻지 못함');
  if (['사','오','미'].includes(m) && ['무','기'].includes(ilgan) && cntOh(['수']) === 0) reasons.push('토조염에 물을 얻지 못함');
  if (T.GORAN.includes(ilju)) reasons.push('고란살');
  const S_ = require('./chapgyeong-vol1-sinsal.js'); const sin = S_.analyzeSinsal(saju);
  if ((sin.흉살||[]).some(x=>/과숙/.test(x))) reasons.push('과숙살');
  return { 판정: reasons.length>0, 근거: reasons, 결과: '본부와 해로하지 못한다(사별·재가 등)' };
}

// ---------- 四八. 편방살이 (원문 206~209쪽) ----------
const PYEONBANG_ILJU = ['을사','신사','계사','계미','정해','기해','갑신','병자','무인','기묘','경오','임오','경술','임술'];
function topic48_pyeonbang(saju, sex) {
  if (sex !== '여') return { 판정:false, 근거:[], 결과:null };
  const ilju = saju.dStem+saju.dBranch;
  const reasons = [];
  if (PYEONBANG_ILJU.includes(ilju)) reasons.push(`${ilju}일생(일지 관 암합 또는 일좌관)`);
  return { 판정: reasons.length>0, 근거: reasons, 결과: '편방(소실)살이를 하여 본다' };
}

// ---------- 四九. 재취 또는 노랑에게 출가 (원문 210~211쪽) ----------
function topic49_norang(saju, sex) {
  if (sex !== '여') return { 판정:false, 근거:[], 결과:null };
  const p = toPillars(saju);
  const ilgan = saju.dStem;
  const ilju = saju.dStem+saju.dBranch;
  const reasons = [];
  if (['임','계'].includes(ilgan) && p.stems.some(s=>['무','기'].includes(s))) reasons.push('임계일생이 무기(관성) 있음');
  if (['무자','병신','경술'].includes(ilju)) reasons.push(`${ilju}일생(경험칙)`);
  return { 판정: reasons.length>0, 근거: [...new Set(reasons)], 결과: '재취 또는 나이 많은 남편(노랑)에게 출가한다' };
}

// ---------- 五〇. 부군이 납치되거나 무책임 — 괴강 (원문 212~215쪽) ----------
function topic50_bugun(saju, sex) {
  if (sex !== '여') return { 판정:false, 근거:[], 결과:null };
  const ilju = saju.dStem+saju.dBranch;
  const reasons = [];
  if ([...T.GOEGANG,'무술'].includes(ilju)) reasons.push(`괴강(${ilju})`);
  return { 판정: reasons.length>0, 근거: reasons, 결과: '부군이 납치·무책임·가출하거나 흉사한다' };
}

// ---------- 五一. 부군이 흉사한다 (원문 215~218쪽) ----------
function topic51_bugunHyungsa(saju, sex) {
  // [합본 원문 조건] ① 임술·계축일 형충 · 관성 미약에 형충·다극 ② 관성 백호대살에 중견·동합·태왕 또는 상쟁 심약 (기명종살격 제외)
  if (sex !== '여') return { 판정:false, 근거:[], 결과:null };
  const p = toPillars(saju);
  const ilgan = saju.dStem, ilju = saju.dStem+saju.dBranch;
  const reasons = [];
  const G1 = require('./chapgyeong-vol4-gyeokguk.js');
  const gs = G1.countSipseongAll(saju, ['정관','편관']).count, sik = G1.countSipseongAll(saju, ['식신','상관']).count;
  const rel = B.checkBranchRelations(p.branches);
  if (['임술','계축'].includes(ilju) && (rel.형.some(f=>f.includes(p.branches[2])) || rel.충.some(c=>c.includes(p.branches[2])))) reasons.push(`${ilju}일(백호+관성)이 형충을 만남`);
  const gwanBr = p.branches.filter(b => ['정관','편관'].includes(sipseongOfBranch(ilgan,b)));
  if (gs <= 1 && gwanBr.length && (rel.형.some(f=>gwanBr.some(g=>f.includes(g))) || rel.충.some(c=>gwanBr.some(g=>c.includes(g))))) reasons.push('관성 미약에 형충');
  if (gs <= 1 && sik >= 3) reasons.push('관성 미약에 식상 다극');
  p.branches.forEach((b,i) => {
    if (!['정관','편관'].includes(sipseongOfBranch(ilgan,b)) || !T.BAEKHO.includes(p.stems[i]+b)) return;
    const dongHap = p.branches.filter(x=>x===b).length >= 2;
    if (dongHap || gs >= 4 || (gs <= 1 && sik >= 2)) reasons.push(`관성 기둥(${p.stems[i]}${b}) 백호대살 + ${dongHap?'중견·동합':gs>=4?'태왕':'상쟁 심약'}`);
  });
  return { 판정: reasons.length>0, 근거: [...new Set(reasons)], 결과: '부군이 흉사한다' };
}

// ---------- 五四. 소실을 겪어 본다 (원문 226~229쪽) ----------
function topic54_sosil(saju, sex) {
  // [합본 원문 조건] ① 인수월·비겁월생 여명이 관성 심약 · 생일 음착양차 ② 간여지동일에 견겁 태왕 · 관쇠에 상식 왕
  if (sex !== '여') return { 판정:false, 근거:[], 결과:null };
  const p = toPillars(saju);
  const ilgan = saju.dStem, ilju = saju.dStem+saju.dBranch;
  const reasons = [];
  const G1 = require('./chapgyeong-vol4-gyeokguk.js');
  const gs = G1.countSipseongAll(saju, ['정관','편관']).count, bg = G1.countSipseongAll(saju, ['비견','비겁']).count, sik = G1.countSipseongAll(saju, ['식신','상관']).count;
  const wolSip = sipseongOfBranch(ilgan, p.branches[1]);
  if (['정인','편인','비견','비겁'].includes(wolSip) && gs <= 1) reasons.push(`${wolSip}월생에 관성 심약`);
  if (T.CHAKSAL.includes(ilju)) reasons.push(`생일이 음착/양차살(${ilju})`);
  if (sipseongOfBranch(ilgan, p.branches[2]) === '비견' && bg >= 3) reasons.push('간여지동일에 견겁 태왕');
  if (gs <= 1 && sik >= 3) reasons.push('관쇠에 상식 왕');
  return { 판정: reasons.length>0, 근거: reasons, 결과: '소실(첩) 문제를 겪어 본다' };
}

const TOPICS_4 = [
  { id:42, 제목:'본처와 해로 못함', fn: topic42_bonchoe },
  { id:43, 제목:'악처를 만난다', fn: topic43_akchoe },
  { id:44, 제목:'처가 흉사한다', fn: topic44_choehyungsa },
  { id:45, 제목:'국제 이성 교정', fn: topic45_gukje },
  { id:46, 제목:'재취 또는 작첩', fn: topic46_jaechwi },
  { id:47, 제목:'본부와 해로 못함(여)', fn: topic47_bonbu },
  { id:48, 제목:'편방살이(여)', fn: topic48_pyeonbang },
  { id:49, 제목:'재취/노랑출가(여)', fn: topic49_norang },
  { id:50, 제목:'부군 납치/무책임(여,괴강)', fn: topic50_bugun },
  { id:51, 제목:'부군 흉사(여)', fn: topic51_bugunHyungsa },
  { id:54, 제목:'소실을 겪음(여)', fn: topic54_sosil },
];

module.exports = { TOPICS_4,
  topic42_bonchoe, topic43_akchoe, topic44_choehyungsa, topic45_gukje, topic46_jaechwi,
  topic47_bonbu, topic48_pyeonbang, topic49_norang, topic50_bugun, topic51_bugunHyungsa, topic54_sosil };
