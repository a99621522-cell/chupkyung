// ============================================================
// chapgyeong-vol1.js — 사주첩경 1권 통합 진입점
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const B = require('./chapgyeong-vol1-basics.js');
const Y = require('./chapgyeong-vol1-yukchin.js');
const S = require('./chapgyeong-vol1-sinsal.js');

function analyzeVol1(saju, sex) {
  const { yStem,yBranch,mStem,mBranch,dStem,dBranch,tStem,tBranch } = saju;
  const ilgan = dStem;
  const allBranches = [yBranch,mBranch,dBranch,tBranch];

  const wshss = Y.getWangSangHyuSuSa(ilgan, mBranch);

  const sipseongMap = {};
  [['년간',yStem],['년지',yBranch],['월간',mStem],['월지',mBranch],
   ['일지',dBranch],['시간',tStem],['시지',tBranch]].forEach(([label,ch]) => {
    sipseongMap[label] = Y.getSipseong(ilgan, ch);
  });

  const branchRel = B.checkBranchRelations(allBranches);
  const samhap = B.checkSamhap(allBranches);
  const banghap = B.checkBanghap(allBranches);
  const sinsal = S.analyzeSinsal(saju);
  const potae = S.analyzePoTae(ilgan, allBranches);

  return {
    사주: `${yStem}${yBranch} ${mStem}${mBranch} ${dStem}${dBranch} ${tStem}${tBranch}`,
    일간: ilgan,
    왕상휴수사: wshss,
    신강신약: Y.isSinWang(wshss) ? '신강' : (Y.isSinYak(wshss) ? '신약' : '중간'),
    십성배치: sipseongMap,
    지지관계: branchRel,
    삼합: samhap,
    방합: banghap,
    신살: sinsal,
    포태운성: potae,
  };
}

module.exports = { analyzeVol1, T, B, Y, S };
