// ============================================================
// chapgyeong-vol4.js — 사주첩경 4권 통합 진입점 (완결판, 13격 전체)
// ============================================================
const G1 = require('./chapgyeong-vol4-gyeokguk.js');
const G2 = require('./chapgyeong-vol4-gyeokguk-2.js');
const G3 = require('./chapgyeong-vol4-gyeokguk-3.js');

function analyzeVol4(saju) {
  const checks = [
    ['정관격', G1.checkJeonggwan],
    ['편관격', G1.checkPyeongwan],
    ['인수격', G1.checkInsu],
    ['정재격', G1.checkJeongjae],
    ['편재격', G2.checkPyeonjae],
    ['식신격', G2.checkSiksin],
    ['상관격', G2.checkSanggwan],
    ['종기재관격', G2.checkJonggiJaegwan],
    ['양인격', G2.checkYangin],
    ['건록격', G2.checkGeonrok],
    ['시상편관격', G3.checkSisangPyeongwan],
    ['연시상관성격', G3.checkYeonsiSanggwanseong],
    ['시상편재격', G3.checkSisangPyeonjae],
  ];
  const results = [];
  for (const [name, fn] of checks) {
    const r = fn(saju);
    if (r.성격) results.push({ 격: name, ...r });
  }
  return results;
}

module.exports = { analyzeVol4, G1, G2, G3 };
