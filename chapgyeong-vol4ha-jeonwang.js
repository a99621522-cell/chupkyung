// ============================================================
// chapgyeong-vol4ha-jeonwang.js
// 사주첩경 4권下 — 오행전왕격 5종 (곡직·염상·가색·종혁·윤하)
// 출처: 원문 286~356쪽 (第三十四~三十八)
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');

const JEONWANG_DEF = {
  목: { 격명:'곡직인수격', 일간:['갑','을'], 방합:'인묘진', 삼합:'해묘미', 기신오행:'금' },
  화: { 격명:'염상격',     일간:['병','정'], 방합:'사오미', 삼합:'인오술', 기신오행:'수' },
  토: { 격명:'가색격',     일간:['무','기'], 방합:null,     삼합:null, 진술축미필요:true, 기신오행:'목' },
  금: { 격명:'종혁격',     일간:['경','신'], 방합:'신유술', 삼합:'사유축', 기신오행:'화' },
  수: { 격명:'윤하격',     일간:['임','계'], 방합:'해자축', 삼합:'신자진', 기신오행:'토' },
};

function checkOhaengJeonwang(saju) {
  const branches = [saju.yBranch, saju.mBranch, saju.dBranch, saju.tBranch];
  const ilgan = saju.dStem;
  for (const [oh, def] of Object.entries(JEONWANG_DEF)) {
    if (!def.일간.includes(ilgan)) continue;
    let gukSeongnip = false, gukType = null;
    if (def.방합 && def.방합.split('').every(b => branches.includes(b))) { gukSeongnip = true; gukType='방합'; }
    if (!gukSeongnip && def.삼합 && def.삼합.split('').every(b => branches.includes(b))) { gukSeongnip = true; gukType='삼합'; }
    if (def.진술축미필요) {
      const jsc = ['진','술','축','미'].filter(b=>branches.includes(b)).length;
      if (jsc >= 3) { gukSeongnip = true; gukType='진술축미 3자 이상'; }
    }
    if (!gukSeongnip) continue;
    const giSinOhaeng = def.기신오행;
    const hasGiSin = branches.some(b=>T.BRANCH_OHAENG[b]===giSinOhaeng) ||
                     [saju.yStem,saju.mStem,saju.tStem].some(s=>T.STEM_OHAENG[s]===giSinOhaeng);
    // [115차] 전왕격은 왕신을 거스르는 관살 오행이 천간·지지 본기에 없어야 성립(윤하에 토, 가색에 목 있으면 불성)
    { const GB = { 목:'금', 화:'수', 토:'목', 금:'화', 수:'토' }[oh]; const st4=[saju.yStem,saju.mStem,saju.tStem], br4=[saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch]; if (st4.some(x=>T.STEM_OHAENG[x]===GB) || br4.some(b=>T.BRANCH_OHAENG[b]===GB)) return { 성격:false, 주의:`왕신 ${oh}을 거스르는 ${GB} 존재 — 전왕격 불성립` }; }
    return {
      성격: true, 격국명: def.격명, 오행: oh, 국구성: gukType,
      기신오행: giSinOhaeng,
      특기사항: hasGiSin ? `기신오행(${giSinOhaeng}) 존재 — 왕신을 거스름, 크게 흉할 위험` : '기신오행 없음 — 왕신에 순응, 순세로 길함',
      용신: `왕신(${oh})의 기세에 순응 — ${giSinOhaeng}운(관살)을 만나면 대흉, 같은 오행 및 상생 오행 운은 길함`,
    };
  }
  return { 성격: false };
}

module.exports = { JEONWANG_DEF, checkOhaengJeonwang };
