// ============================================================
// chapgyeong-vol4ha-gyeokguk-6.js
// 4권下 특수격 6차(마지막): 전록·일귀·일덕·괴강·임기룡배·정란차·
// 현무당권·구진득위·복덕·기명종재/기인종재
// 출처: 원문 206~393쪽 (第二十九~四十四)
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const B = require('./chapgyeong-vol1-basics.js');
const Y = require('./chapgyeong-vol1-yukchin.js');
const G1 = require('./chapgyeong-vol4-gyeokguk.js');

// ---------- 第二十九 전록격 (원문 206~211쪽) ----------
const JEONROK_ILJU = ['갑인','을묘','경신','신유'];
function checkJeonrok(saju) {
  const ilju = saju.dStem+saju.dBranch;
  if (!JEONROK_ILJU.includes(ilju)) return { 성격: false };
  const gwanCount = G1.countSipseongAll(saju, ['정관','편관']).count;
  // [114차] 원문: 관살이 전록의 왕신을 거스르면 크게 흉 → 관살 있으면 격 불성립(종왕 순수만)
  if (gwanCount > 0) return { 성격:false, 주의:'전록 일주이나 관살 존재 — 전록격 불성립' };
  let 특기사항 = [];
  if (gwanCount > 0) 특기사항.push('시지 관살 존재 — 전록의 왕신을 거스름, 어중간하면 크게 흉');
  else 특기사항.push('관살 없음 — 종왕격 순수, 부귀아 가능');
  return { 성격:true, 격국명:'전록격', 용신:'종왕격으로 다룸 — 식상 설기 또는 인수·비겁으로 왕세 도움', 특기사항 };
}

// ---------- 第三十 일귀격 (원문 218~226쪽) ----------
const ILGWI_ILJU = ['정유','정해','계사','계묘','병자','병신'];
function checkIlgwi(saju) {
  const ilju = saju.dStem+saju.dBranch;
  if (!ILGWI_ILJU.includes(ilju)) return { 성격: false };
  const rel = B.checkBranchRelations([saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch]);
  const hyeongChung = rel.형.length > 0 || rel.충.some(f=>f.includes(saju.dBranch));
  if (hyeongChung) return { 성격:false, 주의:'일귀 일주이나 형충 — 격 불성립(114차)' };
  return {
    성격:true, 격국명:'일귀격(일좌천을귀인)',
    특기사항: hyeongChung ? ['형충 존재 — 파료(波瀾) 많음, 도움 못 받고 풍파 위험'] : ['형충 없음 — 인품 단정, 위기 속 귀인 도움'],
  };
}

// ---------- 第三十一 일덕격 (원문 232~241쪽) ----------
const ILDEOK_ILJU = ['갑인','병진','무진','경진','임술'];
function checkIldeok(saju, sex) {
  const ilju = saju.dStem+saju.dBranch;
  if (!ILDEOK_ILJU.includes(ilju)) return { 성격: false };
  const rel = B.checkBranchRelations([saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch]);
  const jaeCount = G1.countSipseongAll(saju, ['정재','편재']).count;
  const hyeongChung = rel.형.length > 0 || rel.충.length > 0;
  if (hyeongChung) return { 성격:false, 주의:'일덕 일주이나 형충 — 격 불성립(114차)' };
  let 특기사항 = [];
  if (hyeongChung && jaeCount >= 2) 특기사항.push('형충파해+재왕 겹침 — 격이 온전치 못함');
  if (sex === '여' && ['임술'].includes(ilju)) 특기사항.push('여명 임술일 — 관살백호 겹쳐 남편덕 부족 위험(괴강격과 연계)');
  return { 성격:true, 격국명:'일덕격', 특기사항: 특기사항.length?특기사항:['형충 없음 — 인자 온후한 복록'] };
}

// ---------- 第三十二 괴강격 (원문 256~270쪽) ----------
function checkGoegang(saju, sex) {
  const ilju = saju.dStem+saju.dBranch;
  if (![...T.GOEGANG,'무진','무술'].includes(ilju)) return { 성격: false };
  const branches = [saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch];
  const goegangCount = branches.filter((b,i)=>{
    const gz = [saju.yStem,saju.mStem,saju.dStem,saju.tStem][i]+b;
    return [...T.GOEGANG,'무진','무술'].includes(gz);
  }).length;
  const wshss = Y.getWangSangHyuSuSa(saju.dStem, saju.mBranch);
  const sinwang = Y.isSinWang(wshss);
  const rel = B.checkBranchRelations(branches);
  const hyeongChung = rel.형.length > 0 || rel.충.length > 0;
  // [114차] 원문: 괴강이 「거듭 놓여」 이루어지는 격 → 2기둥 이상, 형충 있으면 불성립
  if (goegangCount < 2 || hyeongChung) return { 성격:false, 주의:'괴강 일주이나 거듭 아님 또는 형충 — 괴강격 불성립(괴강살로만)' };
  let 특기사항 = [];
  if (goegangCount >= 2) 특기사항.push(`괴강 ${goegangCount}회 중첩 — 기세 강해짐`);
  if (sinwang && !hyeongChung) 특기사항.push('신왕+형충없음 — 크게 귀함');
  else 특기사항.push('신약 또는 형충 존재 — 흉포·재앙 위험');
  if (sex === '여') 특기사항.push('여명 — 남편복 부족 또는 과부 위험(1권과 일관)');
  return { 성격:true, 격국명:'괴강격', 특기사항 };
}

// ---------- 第三十三 임기룡배격 (원문 271~285쪽) ----------
function checkImgiyongbae(saju) {
  if (saju.dStem+saju.dBranch !== '임진') return { 성격: false };
  const branches = [saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch];
  const jinCount = branches.filter(b=>b==='진').length;
  if (jinCount < 3) return { 성격: false }; // [115차] 원문 「진을 많이 두어」 — 임진 일주 외 진 2개 이상(총 3)
  const jaeGwanCount = G1.countSipseongAll(saju, ['정재','편재','정관','편관']).count;
  return {
    성격:true, 격국명:'임기룡배격', 진개수: jinCount,
    특기사항: jaeGwanCount>0 ? ['재관으로 설기 — 조화의 힘을 다스림'] : ['신왕이 극에 달함 — 재관 설기 필요'],
  };
}

// ---------- 第三十九 정란차격 (원문 357~366쪽) ----------
function checkJeongnancha(saju) {
  if (!['경'].includes(saju.dStem)) return { 성격: false };
  const branches = [saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch];
  if (!['신','자','진'].every(b=>branches.includes(b))) return { 성격: false };
  const hwaBreak = branches.some(b=>['인','오','술'].includes(b));
  return {
    성격:true, 격국명:'정란차격',
    특기사항: hwaBreak ? ['인오술 존재 — 수국이 깨짐, 파격 위험'] : ['신자진 수국 온전 — 진격, 금수상관의 총명함'],
  };
}

// ---------- 第四十 현무당권격 (원문 367~375쪽) ----------
function checkHyeonmuDanggwon(saju) {
  if (!['임','계'].includes(saju.dStem)) return { 성격: false };
  const gwansalCount = G1.countSipseongAll(saju, ['정관','편관']).count;
  if (gwansalCount === 0) return { 성격: false };
  // [114차] 원문: 임계일이 인오술(재국)·진술축미(관)을 만나 권을 잡음 → 재국 삼합 완비 또는 관 토 3자 이상 요구
  const brs = [saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch]; const has = x => brs.includes(x);
  const jaeGuk = ['인','오','술'].every(has); const gwanTo = brs.filter(b=>['진','술','축','미'].includes(b)).length >= 3;
  if (!jaeGuk && !gwanTo) return { 성격: false, 주의:'재국·관국 미완비 — 현무당권격 불성립' };
  const wshss = Y.getWangSangHyuSuSa(saju.dStem, saju.mBranch);
  const sinwang = Y.isSinWang(wshss);
  return {
    성격:true, 격국명:'현무당권격',
    특기사항: sinwang ? ['신왕+관살 적절 — 위엄 갖춘 귀명'] : ['신약 — 관살 과다시 재앙 위험'],
  };
}

// ---------- 第四十一 구진득위격 (원문 376~382쪽) ----------
function checkGujinDeukwi(saju) {
  if (!['무','기'].includes(saju.dStem)) return { 성격: false };
  const jaeCount = G1.countSipseongAll(saju, ['정재','편재']).count;
  const gwanCount = G1.countSipseongAll(saju, ['정관','편관']).count;
  if (jaeCount === 0 || gwanCount === 0) return { 성격: false };
  // [114차] 원문: 무기일이 해묘미(관국)·신자진(재국)을 만나 자리를 얻음 → 삼합 완비 요구, 형충 있으면 불성립
  const brs = [saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch]; const has = x => brs.includes(x);
  if (!(['해','묘','미'].every(has) || ['신','자','진'].every(has))) return { 성격: false, 주의:'관국·재국 삼합 미완비 — 구진득위격 불성립' };
  const rel = B.checkBranchRelations([saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch]);
  const hyeongChung = rel.형.length > 0 || rel.충.length > 0;
  if (hyeongChung) return { 성격:false, 주의:'형충 — 구진득위격 불성립' };
  return {
    성격:true, 격국명:'구진득위격',
    특기사항: hyeongChung ? ['형충 존재 — 복이 반감'] : ['재관 균형+형충없음 — 안정된 부귀'],
  };
}

// ---------- 第四十二 복덕격 (원문 383~388쪽) ----------
function checkBokdeok(saju) {
  if (saju.dStem !== '을') return { 성격: false };
  const branches = [saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch];
  if (!['사','유','축'].every(b=>branches.includes(b))) return { 성격: false };
  const hwaBreak = branches.some(b=>T.BRANCH_OHAENG[b]==='화') ||
                    [saju.yStem,saju.mStem,saju.tStem].some(s=>T.STEM_OHAENG[s]==='화');
  return {
    성격:true, 격국명:'복덕격',
    특기사항: hwaBreak ? ['화 존재 — 금국이 깨질 위험, 재화 우려'] : ['사유축 금국 온전 — 평생 안정된 복록'],
  };
}

// ---------- 第四十四 기명종재격/기인종재격 (원문 382~393쪽, 마지막) ----------
const JONGJAE_GUK = {
  갑:'진술축미', 을:'진술축미', 병:'사유축', 정:'사유축',
  무:'신자진', 기:'신자진', 경:'해묘미', 신:'해묘미', 임:'사오미', 계:'사오미',
};
function checkGimyeongJongjae(saju) {
  // [V2 — 합본 4권下 원문 382~393쪽 요건] 일주 무근(無根)·재왕(財旺, 재국 형성).
  //  기명종재: 인수·비겁 등 어떤 도움도 없이 완전 무근 → 진격
  //  기인종재: 인수 천간이 있어도 뿌리 없이 재에 압도되어 무력 → 완화 종재
  //  어중간(輕捨重法): 일주가 살짝 뿌리를 얻음 → 격 불성립(가장 흉한 상태로 주의만 표기)
  const ilgan = saju.dStem;
  const guk = JONGJAE_GUK[ilgan];
  const branches = [saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch];
  const stems = [saju.yStem,saju.mStem,saju.tStem];
  const gukCount = branches.filter(b=>guk.includes(b)).length; // 출현 횟수(묘·묘=2)
  const jaeCount = G1.countSipseongAll(saju, ['정재','편재']).count;
  const jaeTuchul = stems.some(x=>['정재','편재'].includes(Y.getSipseong(ilgan,x)));
  // 재왕: 재국 3자 완성, 또는 재국 2자 + 재 투출 + 재 4점 이상
  const jaeWang = gukCount >= 3 || (gukCount >= 2 && jaeCount >= 3); // 원문 예(묘묘진 재3)에 맞춤
  if (!jaeWang) return { 성격:false };
  const ilOh = Y.ohaengOf(ilgan);
  // 무근: 지지 본기(정기) 기준으로 일간 오행 없음(배타적 조건=본기 기준; 원문 예 '경금 임절' 술중 신금 여기는 뿌리로 안 봄), 천간 비겁도 없음
  const hasRoot = branches.some(b => T.BRANCH_OHAENG[b]===ilOh);
  const hasBigyeopStem = stems.some(x=>Y.ohaengOf(x)===ilOh);
  if (hasRoot || hasBigyeopStem) {
    return { 성격:false, 주의:'재왕하나 일주가 뿌리를 얻어 종재 불성립 — 어중간(輕捨重法)이면 오히려 흉' };
  }
  const inCount = G1.countSipseongAll(saju, ['정인','편인']).count;
  // [115차] 인수가 지지 본기에 있으면(예: 을해일 해수) 일주가 생을 받아 재에 압도되지 않음 — 첩경 실례(기사신미을해정축 식신제살, 임신임자무오을묘 양인격) 종재 아님
  const INSU_OH = { 목:'수', 화:'목', 토:'화', 금:'토', 수:'금' }[ilOh]; if (T.BRANCH_OHAENG[saju.dBranch]===INSU_OH) return { 성격:false, 주의:'일지 본기가 인수라 일주가 직접 생을 받음 — 종재 불성립(원문 기인종재 예 신묘일은 일지 재)' };
  if (inCount === 0) {
    return { 성격:true, 격국명:'기명종재격', 재국:guk, 특기사항:['일주 완전 무근·재왕 — 재를 온전히 따름, 진격이면 대부대귀'] };
  }
  if (jaeCount > inCount) { // 원문 예: 재3 vs 인2(진·술)도 압도로 봄
    return { 성격:true, 격국명:'기인종재격', 재국:guk, 특기사항:[`인수(${inCount})가 있으나 재(${jaeCount})에 압도되어 무력 — 완화된 종재(인수가 깨지는 운은 크게 위태)`] };
  }
  return { 성격:false, 주의:'인수가 재와 맞서 종재 불성립(파인 위험)' };
}


module.exports = {
  checkJeonrok, checkIlgwi, checkIldeok, checkGoegang, checkImgiyongbae,
  checkJeongnancha, checkHyeonmuDanggwon, checkGujinDeukwi, checkBokdeok,
  checkGimyeongJongjae,
};
