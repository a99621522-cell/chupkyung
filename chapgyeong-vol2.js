// ============================================================
// chapgyeong-vol2.js — 사주첩경 2권 통합 진입점
// 66주제 중 50개 구현 (미구현 16개는 후반 보강판 chapgyeong2-tongbyeon.js 참고)
// ============================================================
const R1 = require('./chapgyeong-vol2-rules.js');
const R2 = require('./chapgyeong-vol2-rules-2.js');
const R3 = require('./chapgyeong-vol2-rules-3.js');
const R4 = require('./chapgyeong-vol2-rules-4.js');
const R5 = require('./chapgyeong-vol2-rules-5.js');
const R6 = require('./chapgyeong-vol2-rules-6.js');

const ALL_TOPICS = [
  ...R1.TOPICS.map(t => ({...t, needSex:false})),
  ...R2.TOPICS_2.map(t => ({...t, needSex: t.id===30})),
  ...R3.TOPICS_3.map(t => ({...t, needSex:false})),
  ...R4.TOPICS_4.map(t => ({...t, needSex:true})),
  ...R5.TOPICS_5.map(t => ({...t, needSex:true})),
  ...R6.TOPICS_6.map(t => ({needSex:false, ...t})),
];


// ---- 민감 주제 메타(앱 출력 정책) ----
// 등급 A: 사망·흉사·불구 등 — 결과 문장 대신 完曲 문구를 쓰고 "경보(주의 자리)"로만 표시, 단정 금지
// 등급 B: 질병·사고 — 결과 문장 유지하되 "가능성·주의" 화법
const SENSITIVE = {
  4:{등급:'A',완곡:'조부 자리(편인)가 형충·백호를 맞아 조상 대의 풍파가 비침'}, 5:{등급:'A',완곡:'부친 자리(편재)가 상해 부친과의 인연이 순탄치 않음'},
  6:{등급:'A',완곡:'모친 자리(인수)가 흔들려 모친과의 인연에 굴곡'}, 10:{등급:'A',완곡:'형제 자리(비겁)가 형충·백호를 맞아 형제간 풍파'},
  18:{등급:'B',완곡:'길 위의 사고·이동 중 위험을 조심할 자리'}, 19:{등급:'B',완곡:'불·약물과 관련한 위험을 조심할 자리'}, 20:{등급:'B',완곡:'구속·유폐되는 처지를 겪어 볼 수 있는 자리(수사·형무직이면 해소)'},
  21:{등급:'B',완곡:'수족·관절을 조심할 자리'}, 22:{등급:'B',완곡:'신경·정신 건강을 돌볼 자리'}, 23:{등급:'B',완곡:'눈을 조심할 자리'}, 24:{등급:'B',완곡:'물과 관련한 위험을 조심할 자리'},
  44:{등급:'A',완곡:'처 자리(재성)가 형충·백호를 맞아 처와의 인연에 큰 굴곡'}, 51:{등급:'A',완곡:'남편 자리(관성)가 형충·백호를 맞아 남편과의 인연에 큰 굴곡'}, 52:{등급:'A',완곡:'남편 자리가 물기에 잠겨 남편의 물 관련 위험을 조심할 자리'},
  56:{등급:'A',완곡:'자녀 자리가 눌려 자녀 인연이 늦거나 귀할 수 있음'}, 57:{등급:'A',완곡:'자녀 자리가 눌려 자녀 인연이 늦거나 귀할 수 있음'},
  '59-60':{등급:'A',완곡:'자녀 자리에 형충·급각 등이 임해 자녀 건강을 각별히 돌볼 자리'}, 61:{등급:'A',완곡:'자녀 자리(관살)가 형을 맞고 식상이 많아 자녀 인연에 굴곡'}, 62:{등급:'A',완곡:'자녀의 물 관련 위험을 조심할 자리'}, 63:{등급:'A',완곡:'자녀 자리(식상)가 백호·형을 맞아 자녀 인연에 굴곡'},
};
function tagSensitive(results) {
  return results.map(r => { const m = SENSITIVE[r.id]; if (!m) return r;
    return { ...r, 민감:m.등급, 완곡:m.완곡, 출력지침: m.등급==='A' ? '결과 문장 대신 완곡 문구를 쓰고 경보로만 표시, 사망·불구 단정 금지' : '가능성·주의 화법으로' }; });
}

function analyzeVol2(saju, sex) {
  const results = [];
  for (const topic of ALL_TOPICS) {
    const r = topic.fn(saju, sex);
    if (r && r.판정) results.push({ id: topic.id, 제목: topic.제목, 근거: r.근거, 결과: r.결과 });
  }
  return tagSensitive(results);
}

module.exports = { analyzeVol2, SENSITIVE, tagSensitive, ALL_TOPICS, R1, R2, R3, R4, R5, R6 };
