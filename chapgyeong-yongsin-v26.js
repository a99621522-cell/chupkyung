// ============================================================
// chapgyeong-yongsin-v26.js — 억부 정련 래퍼
// v25 determineYongsin을 그대로 호출한 뒤, 결과가 "일반 억부" 경로(신강/신약 고정 우선순위)일 때만
// 고전 억부 원칙(무엇이 나를 약/강하게 하는가)으로 용신 방향을 재선정. 종격·특례 결과는 손대지 않음.
//  신약: 재다 → 비겁(분재), 관살다 → 인수(살인상생·통관), 식상다 → 인수(제식상·생신), 그 외 → 인수>비겁
//  신강: 비겁다(군겁) → 관살(제겁)>식상, 인수다 → 재(파인)>식상, 그 외 → 관살>식상>재
// ============================================================
const V25 = require('./chapgyeong-yongsin.js');
const T = require('./chapgyeong-vol1-tables.js');
const Y = require('./chapgyeong-vol1-yukchin.js');
const G1 = require('./chapgyeong-vol4-gyeokguk.js');
const SAENG = { 목:'화', 화:'토', 토:'금', 금:'수', 수:'목' };
const GEUK  = { 목:'토', 화:'금', 토:'수', 금:'목', 수:'화' };
const INSU  = { 목:'수', 화:'목', 토:'화', 금:'토', 수:'금' };
const GWAN  = { 목:'금', 화:'수', 토:'목', 금:'화', 수:'토' };

function countOhAll(saju, oh) {
  const br=[saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch], st=[saju.yStem,saju.mStem,saju.tStem];
  return br.filter(b=>T.BRANCH_OHAENG[b]===oh).length + st.filter(s=>T.STEM_OHAENG[s]===oh).length;
}
function determineYongsinV26(saju, vol4, vol4ha, vol6, opt = {}) {
  const base = V25.determineYongsin(saju, vol4, vol4ha, vol6, opt);
  const g = base.근거 || '';
  if (!/^신강 —|^신약 —/.test(g)) return base; // 종격·특례·부재 폴백은 유지
  const ilOh = Y.ohaengOf(saju.dStem);
  const c = { 인: countOhAll(saju, INSU[ilOh]), 비: countOhAll(saju, ilOh), 식: countOhAll(saju, SAENG[ilOh]), 재: countOhAll(saju, GEUK[ilOh]), 관: countOhAll(saju, GWAN[ilOh]) };
  const has = oh => countOhAll(saju, oh) > 0;
  if (g.startsWith('신약')) {
    const dominant = Object.entries({재:c.재, 관:c.관, 식:c.식}).sort((a,b)=>b[1]-a[1])[0];
    if (dominant[0]==='재' && c.재 >= 3 && has(ilOh)) return { ...base, 용신오행: ilOh, 근거: `신약(재다신약, 재 ${c.재}) — 비겁으로 재를 나눠 일주를 보강`, v26:true };
    if (dominant[0]==='관' && c.관 >= 3 && has(INSU[ilOh])) return { ...base, 용신오행: INSU[ilOh], 근거: `신약(관살다, 관살 ${c.관}) — 인수로 살인상생·통관`, v26:true };
    if (dominant[0]==='식' && c.식 >= 3 && has(INSU[ilOh])) return { ...base, 용신오행: INSU[ilOh], 근거: `신약(식상다, 식상 ${c.식}) — 인수로 식상을 제하고 일주를 생조`, v26:true };
    return base;
  }
  // 신강
  if (c.비 >= 3 && has(GWAN[ilOh])) return { ...base, 용신오행: GWAN[ilOh], 근거: `신강(비겁다 ${c.비}) — 관살로 겁재를 제어`, v26:true };
  if (c.인 >= 3 && has(GEUK[ilOh])) return { ...base, 용신오행: GEUK[ilOh], 근거: `신강(인수다 ${c.인}) — 재로 인수를 파해 일주 설기`, v26:true };
  if (c.비 >= 3 && has(SAENG[ilOh])) return { ...base, 용신오행: SAENG[ilOh], 근거: `신강(비겁다 ${c.비}, 관살 부재) — 식상으로 설기`, v26:true };
  return base;
}
module.exports = { determineYongsinV26 };
