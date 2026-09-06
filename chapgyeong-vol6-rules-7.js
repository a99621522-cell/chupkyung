// ============================================================
// chapgyeong-vol6-rules-7.js
// 6권 7차: 第二十八 금침수저 / 第二十九 대목지토 / 第三十 양금지토 /
//          第三十一 미온지토
// 출처: 원문 90~99쪽
// (第三十二 귀물제거는 서술적·상황 의존적 개념이라 보류)
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const Y = require('./chapgyeong-vol1-yukchin.js');
const G1 = require('./chapgyeong-vol4-gyeokguk.js');

function toPillars(saju) {
  return { branches:[saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch],
           stems:[saju.yStem,saju.mStem,saju.dStem,saju.tStem] };
}

// ---------- 第二十八 금침수저(金沈水底) ----------
function checkGeumchimSujeo(saju, sex) {
  const ilgan = saju.dStem;
  const ilOh = Y.ohaengOf(ilgan);
  const p = toPillars(saju);
  const suCount = p.branches.filter(b=>T.BRANCH_OHAENG[b]==='수').length +
                   p.stems.filter((s,i)=>i!==2 && T.STEM_OHAENG[s]==='수').length;
  if (suCount < 3) return { 성격: false };
  const geumExists = ilOh==='금' || p.branches.some(b=>T.BRANCH_OHAENG[b]==='금') ||
                      p.stems.some((s,i)=>i!==2 && T.STEM_OHAENG[s]==='금');
  if (!geumExists) return { 성격: false };
  const toExists = p.branches.some(b=>T.BRANCH_OHAENG[b]==='토') ||
                    p.stems.some((s,i)=>i!==2 && T.STEM_OHAENG[s]==='토');
  let 특기사항 = toExists ? ['토가 있어 물을 제어·금을 생조 — 구출 가능성'] : ['제어할 토 없음 — 금이 완전히 물에 잠김'];
  return {
    성격: true, 항목: '금침수저',
    판정: '금이 약하고 물이 왕하여 금이 물 밑에 잠김 — 금을 용신으로 쓰면 위험(여명은 남편 익수·주독 위험)',
    특기사항,
  };
}

// ---------- 第二十九 대목지토(帶木之土) ----------
function checkDaemokJito(saju) {
  const p = toPillars(saju);
  const hasJinMi = p.branches.some(b=>['진','미'].includes(b));
  if (!hasJinMi) return { 성격: false };
  const mokCount = p.branches.filter(b=>['인','묘'].includes(b)).length +
                    p.stems.filter((s,i)=>i!==2 && T.STEM_OHAENG[s]==='목').length;
  if (mokCount < 2) return { 성격: false };
  return {
    성격: true, 항목: '대목지토',
    판정: '진(또는 미)토가 목의 세력에 흡수되어 제 힘을 잃고 목을 도움 — 토가 병이면 이로움(목 소중), 토가 인수·재면 그 육친에 흠',
  };
}

// ---------- 第三十 양금지토(養金之土) ----------
function checkYanggeumJito(saju) {
  const ilgan = saju.dStem;
  if (!['경','신'].includes(ilgan)) return { 성격: false };
  const p = toPillars(saju);
  const target = ilgan === '경' ? '진' : '축'; // 경=진에서양, 신=축에서양
  if (!p.branches.includes(target)) return { 성격: false };
  const jaeCount = G1.countSipseongAll(saju, ['정재','편재']).count;
  let 특기사항 = jaeCount >= 3 ? ['재(목) 과다 — 탐재괴인으로 자양작용 상실 위험'] : ['자양 작용 온전 — 토다금매라도 재를 만나면 기뻐함'];
  return {
    성격: true, 격국명: '양금지토', 항목: '양금지토',
    판정: `${ilgan}금이 ${target}토(습토)의 자양을 받음 — 관살을 두려워하지 않음`,
    특기사항,
  };
}

// ---------- 第三十一 미온지토(微溫之土) ----------
function checkMionJito(saju) {
  const p = toPillars(saju);
  if (!p.branches.includes('축')) return { 성격: false };
  const hwaExists = p.branches.some(b=>['사','오'].includes(b)) ||
                     p.stems.some((s,i)=>i!==2 && ['병','정'].includes(s));
  if (!hwaExists) {
    return { 성격: true, 항목:'미온지토', 판정: '축토가 병정사오를 못 만남 — 동토(凍土)로 제 작용 못함' };
  }
  return {
    성격: true, 항목: '미온지토',
    판정: '한랭한 축토가 화기(병정사오)를 받아 미약하나마 온기를 얻음 — 겨울철 화토운에 대길',
  };
}

const TOPICS_7 = [
  { id:28, 제목:'금침수저', fn: checkGeumchimSujeo },
  { id:29, 제목:'대목지토', fn: checkDaemokJito },
  { id:30, 제목:'양금지토', fn: checkYanggeumJito },
  { id:31, 제목:'미온지토', fn: checkMionJito },
];

module.exports = { TOPICS_7, checkGeumchimSujeo, checkDaemokJito, checkYanggeumJito, checkMionJito };
