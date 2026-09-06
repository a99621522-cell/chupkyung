// ============================================================
// chapgyeong-yongsin-v27.js — 첩경 용신 7갈래 (4권 실례 스캔 정답표 25건에서 확인된 규칙)
//  ①세력 비교 신강약: 비겁+인수+일간 vs 식·재·관 글자 수, 동수는 삼합·방합국 → 그다음 월령
//  ②신강 → 식상 설기 우선(관살·재는 다음)  ③신강·인수≥4·재 有(지장간 포함) → 재인불애(재)
//  ④양인격(월지 양인 또는 일인)에 관살 有 → 관살 用(합살위귀), 무관이면 관 방향  ⑤신약: 관 유근·투출 + 비겁·인수≥3 → 용관(약화위강)
//  ⑥신약: 관살≥2 → 인수(살인상생) / 식상≥3 또는 재≥3 → 용겁 / 인수 有 → 인수 / 비겁  ⑦병약: 식신·상관을 극하는 편인이 병이면 재, (경신금 병·합국 변화는 후속)
// 종격·신불가과 등 특례는 상위 계층(chapgyeong-yongsin.js)이 먼저 처리
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const B = require('./chapgyeong-vol1-basics.js');
const Y = require('./chapgyeong-vol1-yukchin.js');
const SAENG={목:'화',화:'토',토:'금',금:'수',수:'목'},GEUK={목:'토',화:'금',토:'수',금:'목',수:'화'},GEUKBY={목:'금',화:'수',토:'목',금:'화',수:'토'},INSU={목:'수',화:'목',토:'화',금:'토',수:'금'};
const YANGIN={갑:'묘',병:'오',무:'오',경:'유',임:'자'};
function determineV27(saju, vol4Result) {
  const il=saju.dStem, o=Y.ohaengOf(il);
  // ⑧ [121차] 일위(一位) 격 — 시상편관·시상편재·연시상관성격이 성립하면 그 일위 글자가 곧 용신(4권 실례: 「時上乙木一位貴」「時上虛官眞可用」「時上偏財癸水用」 — 스캔 정답표 9건 중 8건)
  const names = (vol4Result||[]).filter(r=>r && r.성격!==false).map(r=>String(r.격국명||r.격));
  // 일위 격이 월령 정격 없이 단독으로 서거나 첫 후보일 때만(엔진 연시상관성·시상편관 검출이 넓어 후보 병존 시 오판)
  const first = names[0]||''; const onlyIlwi = names.length && names.every(n=>/시상편관|시상일위|연시상관성|시상편재/.test(n));
  if ((onlyIlwi || /시상편관|시상일위|연시상관성/.test(first)) && (names.some(n=>/시상편관|시상일위/.test(n)) || names.some(n=>/연시상관성/.test(n)))) return { 용신오행: GEUKBY[o], 근거:'v27 일위 관성 격 — 시상·연시의 일위 관이 곧 용신', 종격여부:false };
  if ((onlyIlwi || /시상편재/.test(first)) && names.some(n=>/시상편재/.test(n))) return { 용신오행: GEUK[o], 근거:'v27 일위 재성 격 — 시상 편재가 곧 용신', 종격여부:false };
  const brs=[saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch].filter(Boolean), st=[saju.yStem,saju.mStem,saju.tStem].filter(Boolean);
  const cb=x=>brs.filter(b=>T.BRANCH_OHAENG[b]===x).length, cs=x=>st.filter(z=>T.STEM_OHAENG[z]===x).length, c=x=>cb(x)+cs(x);
  const cj=x=>brs.filter(b=>(T.JIJANGGAN[b]||[]).some(g=>T.STEM_OHAENG[g]===x)).length;
  const 몸=c(o)+c(INSU[o])+1, 밖=c(SAENG[o])+c(GEUK[o])+c(GEUKBY[o]);
  const guk=[...B.checkSamhap(brs),...B.checkBanghap(brs)].map(g=>g.ohaeng); const 몸국=guk.includes(o)||guk.includes(INSU[o]), 밖국=guk.some(g=>[SAENG[o],GEUK[o],GEUKBY[o]].includes(g));
  const wol=Y.getWangSangHyuSuSa(il,saju.mBranch);
  const wang = 몸>밖?true:몸<밖?false:(몸국&&!밖국)?true:(밖국&&!몸국)?false:Y.isSinWang(wol);
  const R=(oh,why)=>({ 용신오행:oh, 근거:`v27 ${wang?'신강':'신약'}(세력 ${몸}:${밖}) — ${why}`, 종격여부:false, 신강약: wang?'신강':'신약', 세력:{몸,밖} });
  const yangin = YANGIN[il] && (saju.mBranch===YANGIN[il] || saju.dBranch===YANGIN[il]);
  const gwan=c(GEUKBY[o]);
  // ④ 양인격
  if (yangin && !( !wang && gwan>=2 && 몸<=2)) { if (gwan>=1) return R(GEUKBY[o],'양인격에 관살 — 양인용살(합살위귀)'); if (wang) return R(GEUKBY[o],'양인격 신왕 무관 — 관살 방향(없으면 흉)'); }
  if (wang) {
    if (c(INSU[o])>=4 && (c(GEUK[o])>=1 || cj(GEUK[o])>=1)) return R(GEUK[o],'인수 태왕 — 재인불애(재)');
    if (c(SAENG[o])>=1) return R(SAENG[o],'신강 — 식상 설기 우선');
    if (gwan>=1) return R(GEUKBY[o],'신강 — 관살 억제');
    if (c(GEUK[o])>=1) return R(GEUK[o],'신강 — 재');
    return R(SAENG[o],'신강 — 설기 방향');
  }
  const gwanRootTu = cb(GEUKBY[o])>=1 && cs(GEUKBY[o])>=1;
  if (gwan>=2 && !(gwanRootTu && c(o)+c(INSU[o])>=3)) return R(INSU[o],'신약에 관살 왕 — 인수(살인상생)');
  if (gwanRootTu && c(o)+c(INSU[o])>=3) return R(GEUKBY[o],'관 유근·투출에 비인 받침 — 용관(약화위강)');
  if (c(SAENG[o])>=3) return R(o,'설기 심 — 용겁');
  if (c(GEUK[o])>=3) return R(o,'재다신약 — 용겁');
  if (c(INSU[o])>=1) return R(INSU[o],'신약 — 인수 생조');
  return R(o,'신약 — 비겁 보강');
}
module.exports = { determineV27 };
