// ============================================================
// chapgyeong-yongsin-gyeok.js — 4권 격국용신편의 「격별 용신」 규칙 (희기 절 원문 기준)
//  정관: 신왕관약→재(용재) / 관왕신약→인(용인) / 관 태과·혼잡→식상(용상관) / 재다신약→비겁(용겁)
//  편관(칠살): 신강 살왕→식상(식신제살) / 신약 살왕→인(살인상생) / 신왕 살약→재(재자약살) / 식상 태과(제살태과)→관살을 도움
//  인수: 인왕+관살→관살(관인상생) / 인 태왕 관살 무→식상 / 인 극왕 신강→재 / 인 약 재 다→비겁
//  정재·편재: 신왕재왕+관→관(재생관) / 재약+식상→식상 / 재다신약→비겁(용겁) / 신약+관살→인 / 재왕 무관→식상 / 재경신왕→재
//  식신: 칠살 유→식상(식신제살) / 재 유·신왕→재(식신생재) / 신약→인(식신용인)
//  상관: 신강 다인→재 / 신강 비겁다→관살 / 신강 다관 또는 관무근→식상 / 신약 식상다·관살다→인 / 금수상관(경신일 해자축월)→관(화)
//  종기재관: 투출한 것(재·관·인)을 정격에 준해 / 양인: 칠살·관 유→관살(합살위귀), 무→식상 / 건록: 재관(관 유→관, 무→재)
//  시상편관: 살 약→재, 살 왕→식상, 신약→인 / 시상편재: 재(신약이면 인) / 연시상관성: 관(약하면 재)
// 결과: { 용신오행, 근거, 격 } 또는 null(격 없음 → 억부 폴백)
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const Y = require('./chapgyeong-vol1-yukchin.js');
const SAENG = { 목:'화', 화:'토', 토:'금', 금:'수', 수:'목' };
const GEUK = { 목:'토', 화:'금', 토:'수', 금:'목', 수:'화' };
const GEUKBY = { 목:'금', 화:'수', 토:'목', 금:'화', 수:'토' };
const INSU = { 목:'수', 화:'목', 토:'화', 금:'토', 수:'금' };

function ctx(saju) {
  const il = saju.dStem, ilOh = Y.ohaengOf(il);
  const brs = [saju.yBranch, saju.mBranch, saju.dBranch, saju.tBranch].filter(Boolean), stems = [saju.yStem, saju.mStem, saju.tStem].filter(Boolean);
  const c = oh => brs.filter(b=>T.BRANCH_OHAENG[b]===oh).length + stems.filter(s=>T.STEM_OHAENG[s]===oh).length;
  const tu = oh => stems.some(s=>T.STEM_OHAENG[s]===oh);
  const O = { 비:ilOh, 인:INSU[ilOh], 식:SAENG[ilOh], 재:GEUK[ilOh], 관:GEUKBY[ilOh] };
  const n = { 비:c(O.비), 인:c(O.인), 식:c(O.식), 재:c(O.재), 관:c(O.관) };
  // [117차] 신강약을 v27 세력 비교로(비겁+인수+일간 vs 식재관, 동수는 삼합국→월령)
  const B = require('./chapgyeong-vol1-basics.js'); const 몸=n.비+n.인+1, 밖=n.식+n.재+n.관; const guk=[...B.checkSamhap(brs),...B.checkBanghap(brs)].map(g=>g.ohaeng); const 몸국=guk.includes(O.비)||guk.includes(O.인), 밖국=guk.some(g=>[O.식,O.재,O.관].includes(g));
  const sinwang = 몸>밖?true:몸<밖?false:(몸국&&!밖국)?true:(밖국&&!몸국)?false:Y.isSinWang(Y.getWangSangHyuSuSa(il, saju.mBranch));
  const gwanStems = stems.filter(s=>T.STEM_OHAENG[s]===O.관).map(s=>Y.getSipseong(il,s));
  const honjap = gwanStems.includes('정관') && gwanStems.includes('편관');
  const gwanRoot = brs.some(b=>T.BRANCH_OHAENG[b]===O.관);
  return { il, ilOh, O, n, tu, sinwang, honjap, gwanRoot, 금수상관: ['경','신'].includes(il) && ['해','자','축'].includes(saju.mBranch) };
}
const R = (oh, why, gyeok) => ({ 용신오행: oh, 근거: `4권 ${gyeok}: ${why}`, 격: gyeok });

function yongsinByGyeok(saju, gyeokName) {
  const g = String(gyeokName||'').replace(/\(.*$/, '');
  const k = ctx(saju); const { O, n, sinwang } = k;
  switch (g) {
    case '정관격':
      if (n.재 >= 3 && !sinwang) return R(O.비, '재다신약 — 정관용겁', g);
      if (k.honjap || n.관 >= 4) return R(O.식, '관이 태과·혼잡 — 정관용상관', g);
      if (!sinwang) return R(O.인, '관왕 신약 — 정관용인', g);
      return R(O.재, '신왕 관약 — 정관용재(재생관)', g);
    case '편관격':
      if (n.식 >= 3 && n.관 <= 1) return R(O.관, '제살태과 — 살을 도움', g);
      if (sinwang && n.관 >= 2) return R(O.식, '신강 살왕 — 식신제살', g);
      if (!sinwang) return R(O.인, '신약 살왕 — 살인상생', g);
      return R(O.재, '신왕 살약 — 재자약살', g);
    case '인수격':
      if (n.인 >= 3 && n.재 === 0 && n.관 === 0) return R(O.식, '인수 태왕 관살 무 — 인수용식상', g);
      if (n.인 <= 1 && n.재 >= 3) return R(O.비, '인수 약 재다 — 인수용비겁', g);
      if (n.인 >= 4 && sinwang) return R(O.재, '인수 극왕 신강 — 인수용재', g);
      if (n.관 >= 1) return R(O.관, '인왕에 관살 — 인수용관살(관인상생)', g);
      return R(O.식, '인수 왕 — 식상 설기', g);
    case '정재격': case '편재격':
      if (n.재 >= 3 && !sinwang) return n.관 >= 2 ? R(O.인, '신약에 관살까지 — 정재용인', g) : R(O.비, '재다신약 — 재다용겁', g);
      if (sinwang && n.관 >= 1) return R(O.관, '신왕재왕 관 유 — 재생관', g);
      if (sinwang && n.관 === 0 && n.재 >= 2) return R(O.식, '재왕 무관 — 식상 유통', g);
      if (n.재 <= 1 && n.식 >= 1) return R(O.식, '재 약 식상 유 — 식상생재', g);
      return R(O.재, '재경신왕 — 재를 도움', g);
    case '식신격':
      if (n.관 >= 1 && (sinwang || n.식 >= 2)) return R(O.식, '칠살 유 — 식신제살', g);
      if (!sinwang) return R(O.인, '신약 — 식신용인', g);
      return R(O.재, '신왕 — 식신생재', g);
    case '상관격':
      if (k.금수상관) return R(O.관, '금수상관요견관 — 조후용관', g);
      if (!sinwang) return R(O.인, '일주약 — 상관용인', g);
      if (n.인 >= 2) return R(O.재, '일주강 다인 — 상관용재', g);
      if (n.비 >= 2 && n.관 >= 1) return R(O.관, '일주강 비겁다 — 상관용살', g);
      if (n.관 >= 3 || (n.관 >= 1 && !k.gwanRoot)) return R(O.식, '다관 또는 관무근 — 상관용상관', g);
      return R(O.재, '일주강 — 상관용재', g);
    case '종기재관격':
      if (k.tu(O.관)) return R(O.관, '창고 관 투출 — 정격 준용(관)', g);
      if (k.tu(O.인)) return sinwang ? R(O.식, '창고 인 투출·신강 — 종기인수용상관', g) : R(O.인, '창고 인 투출 — 종기인수', g);
      return sinwang ? R(O.재, '창고 재 투출·신강 — 종기재관용재', g) : R(O.비, '재다신약 — 비겁', g);
    case '양인격': case '일인':
      if (n.관 >= 1) return R(O.관, '양인에 칠살·관 — 합살위귀', g);
      return R(O.식, '양인 왕 관살 무 — 식상 설기', g);
    case '건록격':
      return n.관 >= 1 ? R(O.관, '건록에 관 — 관록마', g) : R(O.재, '건록에 재 — 재를 용신', g);
    case '시상편관격':
      if (!sinwang) return R(O.인, '신약 — 인수로 살을 화함', g);
      return n.식 >= 2 ? R(O.식, '살 왕 — 식상 제복', g) : R(O.재, '살 약 — 재로 살을 도움', g);
    case '시상편재격':
      return sinwang ? R(O.재, '시상 재 자체가 용신', g) : R(O.인, '신약 — 인수로 몸을 세워 재를 감당', g);
    case '연시상관성격':
      return k.gwanRoot ? R(O.관, '연시 일위 관 — 관 용신', g) : R(O.재, '관 약 — 재로 관을 생조', g);
    default: return null;
  }
}
module.exports = { yongsinByGyeok, ctx };
