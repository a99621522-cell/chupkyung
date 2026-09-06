// ============================================================
// chapgyeong-vol4ha.js — 사주첩경 4권下 통합 진입점 (복원 완결판, 32종)
// ============================================================
const S1 = require('./chapgyeong-vol4ha-gyeokguk.js');
const S2 = require('./chapgyeong-vol4ha-gyeokguk-2.js');
const S3 = require('./chapgyeong-vol4ha-gyeokguk-3.js');
const S4 = require('./chapgyeong-vol4ha-jeonwang.js');
const S5 = require('./chapgyeong-vol4ha-gyeokguk-4.js');
const S6 = require('./chapgyeong-vol4ha-gyeokguk-5.js');
const S7 = require('./chapgyeong-vol4ha-gyeokguk-6.js');
const S8 = require('./chapgyeong-vol4ha-gyeokguk-7.js'); // [128차] 정답표 210건 조율판 — 아래 항목은 S8이 S4~S7을 대체

function analyzeVol4ha(saju, sex) {
  const checks = [
    ['귀록격', S1.checkGwirok],
    ['금신격', S1.checkGeumsin],
    ['육을서귀격', S2.checkYugeulSeogwiV2],
    ['육음조양격', S2.checkYugeumJoyang],
    ['시묘격', S3.checkSimyo],
    ['육갑추건격', S3.checkYukgapChugeon],
    ['형합격', S3.checkHyeonghap],
    ['오행전왕격', S8.checkOhaengJeonwang],
    ['육임추간격', S5.checkYugimChugan],
    ['합록격', S8.checkHaprok],
    ['전재격', S8.checkJeonjae],
    ['자요사격', S8.checkJayosa],
    ['축요사격', S8.checkChugyosa],
    ['비천록마격', S8.checkBicheonRokma],
    ['공록격', S8.checkGongrokGonggwi],
    ['협축재격', S8.checkHyeopchukJae],
    ['전록격', S8.checkJeonrok],
    ['일귀격', S8.checkIlgwi],
    ['일덕격', S8.checkIldeok],
    ['괴강격', S8.checkGoegang],
    ['임기룡배격', S8.checkImgiyongbae],
    ['재관쌍미격', S8.checkJaegwanSsangmi],
    ['정란차격', S7.checkJeongnancha],
    ['현무당권격', S7.checkHyeonmuDanggwon],
    ['구진득위격', S7.checkGujinDeukwi],
    ['복덕격', S8.checkBokdeok],
    ['기명종재격', S7.checkGimyeongJongjae],
  ];
  const results = [];
  for (const [name, fn] of checks) {
    const r = fn(saju, sex);
    if (r.성격) results.push({ 격: r.격국명 || name, ...r });
  }
  return results;
}

module.exports = { analyzeVol4ha, S1, S2, S3, S4, S5, S6, S7, S8 };
