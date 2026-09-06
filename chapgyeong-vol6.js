// ============================================================
// chapgyeong-vol6.js — 사주첩경 6권 통합 진입점 (복원 진행분)
// ============================================================
const R1 = require('./chapgyeong-vol6-rules.js');
const R2 = require('./chapgyeong-vol6-rules-2.js');
const R3 = require('./chapgyeong-vol6-rules-3.js');
const R4 = require('./chapgyeong-vol6-rules-4.js');
const R5 = require('./chapgyeong-vol6-rules-5.js');
const R6 = require('./chapgyeong-vol6-rules-6.js');
const R7 = require('./chapgyeong-vol6-rules-7.js');
const R8 = require('./chapgyeong-vol6-rules-8.js');
const R9 = require('./chapgyeong-vol6-rules-9.js');
const R10 = require('./chapgyeong-vol6-rules-10.js');
const R11 = require('./chapgyeong-vol6-rules-11.js');
const R12 = require('./chapgyeong-vol6-rules-12.js');
const R13 = require('./chapgyeong-vol6-rules-13.js');
const R14 = require('./chapgyeong-vol6-rules-14.js');
const TK = require('./chapgyeong-vol6-teukrye.js');
const R15 = require('./chapgyeong-vol6-rules-15.js');
const R16 = require('./chapgyeong-vol6-rules-16.js');
const R17 = require('./chapgyeong-vol6-rules-17.js');
const R18 = require('./chapgyeong-vol6-rules-18.js');
const R19 = require('./chapgyeong-vol6-rules-19.js');
const R20 = require('./chapgyeong-vol6-rules-20.js');
const R21 = require('./chapgyeong-vol6-rules-21.js');

const ALL_TOPICS = [...R1.TOPICS, ...R2.TOPICS_2, ...R3.TOPICS_3, ...R4.TOPICS_4, ...R5.TOPICS_5, ...R6.TOPICS_6, ...R7.TOPICS_7, ...R8.TOPICS_8, ...R9.TOPICS_9, ...R10.TOPICS_10,
  { id:38, 제목:'전인후종', fn: R11.checkJeoninHujongTopic }, ...R12.TOPICS_12, ...R13.TOPICS_13, ...R14.TOPICS_14, ...R15.TOPICS_15, ...R16.TOPICS_16, ...R17.TOPICS_17, ...R18.TOPICS_18, ...R19.TOPICS_19, ...R20.TOPICS_20, ...R21.TOPICS_21];

function analyzeVol6(saju, sex) {
  const results = [];
  for (const t of ALL_TOPICS) {
    const r = t.fn(saju, sex);
    if (r && r.성격) results.push({ id: t.id, 제목: r.항목 || t.제목, ...r });
  }
  return results;
}

module.exports = { analyzeVol6, ALL_TOPICS, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14, TK };
