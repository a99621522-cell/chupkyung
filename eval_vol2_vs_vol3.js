// 3권 실례 통변시를 정답셋으로 2권 주제 검출 정합률 측정
const db = require('./chapgyeong3_myeongshik_db.json');
const { analyzeVol2 } = require('./chapgyeong-vol2.js');
const KW = {
  1:['이향','고향 떠','타향','고향을 떠'], 17:['해외','해운만리','유학','외국'],
  8:['중배자당','두 어머님','전모생모','어머님이 여럿','어머니가 여럿','계모','서모'],
  4:['조부'], 5:['부친'], 10:['형제'], 18:['교통사고','노상','횡액'], 19:['음독','화상','탕화'],
  21:['다리','수족','건각','골상','절뚝'], 23:['눈','안질','안목','시력'], 24:['수액','물에','익사','수난'],
  25:['치질','맹장'], 26:['비위','위산','위장'], 22:['정신이상','정신병','광증','신경쇠'],
  31:['교육','스승','교단','교편','교수'], 32:['경찰'], 33:['의업','의사','의약','의대','의사'],
  35:['법조','판검','법관','변호'], 36:['역술','명리','철학관'], 41:['신앙','종교','천문'],
  42:['본처','파경'], 43:['악처','처승어오','처가 나를'], 44:['기처산망','처가 죽','처 사별','상처'],
  45:['국제','이국','외국인'], 46:['재취','작첩','두 처','양처','소실'], 56:['무자','자식이 없','자녀 없'],
  58:['외방','양방득자','바깥 방','바깥방'], 61:['자손 흉','아들이 죽','자식이 죽','자손이 죽'],
  64:['옥외','노상 출생','길에서 출생'], 65:['혼혈'], 66:['총각'], 7:['재가'], 20:['감금','옥문','옥살','형무','구속'],
  28:['성병','화류병','임질'], 27:['해수','천식','기침'], 14:['이복'], 15:['고부','시모와','시어머'],
  12:['장모','조모'], 38:['음식','요식','식당','주점'], 53:['가출','집을 나'], 34:['재정','은행','세무','경리'],
  39:['항공','비행'], 40:['외교'], 51:['남편이 죽','부군이 죽','남편 흉','부군 흉','남편이 피살','부군 피살'],
  55:['처녀','배태'], 9:['다른 아버지','계부','두 아버'], 3:['부모형제간','불화'], 30:['나팔관'], 29:['야뇨'],
};
const idOf = (title) => title; // 검출 결과는 id 보유
const perTopic = {};
let N=0;
for (const d of db) {
  if (d.conf!=='A' || !d.성별) continue;
  N++;
  const [yy,mm,dd,tt]=d.기둥;
  const s={yStem:yy[0],yBranch:yy[1],mStem:mm[0],mBranch:mm[1],dStem:dd[0],dBranch:dd[1],tStem:tt[0],tBranch:tt[1]};
  const text = (d.사건+' '+(d.추명가||[]).join(' ')+' '+d.통변시.join(' '));
  const det = new Set(analyzeVol2(s, d.성별).map(r=>String(r.id).split('-')[0]));
  for (const [id, kws] of Object.entries(KW)) {
    const gt = kws.some(k=>text.includes(k));
    const dt = det.has(String(id));
    const p = perTopic[id] ||= { gt:0, hit:0, det:0, tp:0 };
    if (gt) { p.gt++; if (dt) p.hit++; }
    if (dt) { p.det++; if (gt) p.tp++; }
  }
}
const { ALL_TOPICS } = require('./chapgyeong-vol2.js');
const title = Object.fromEntries(ALL_TOPICS.map(t=>[String(t.id).split('-')[0], t.제목]));
let rows=[], sumGt=0,sumHit=0,sumDet=0,sumTp=0;
for (const [id,p] of Object.entries(perTopic)) {
  if (p.gt===0 && p.det===0) continue;
  sumGt+=p.gt; sumHit+=p.hit; sumDet+=p.det; sumTp+=p.tp;
  rows.push([id, (title[id]||'').slice(0,14), p.gt, p.hit, p.gt?Math.round(100*p.hit/p.gt):'-', p.det, p.det?Math.round(100*p.tp/p.det):'-']);
}
rows.sort((a,b)=>b[2]-a[2]);
console.log('평가 명조:', N, '건');
console.log('id | 주제 | 정답수 | 검출성공 | 재현율% | 총검출 | 정밀도%');
for (const r of rows) console.log(r.join(' | '));
console.log('--- 합계: 재현율', Math.round(100*sumHit/sumGt)+'%', `(${sumHit}/${sumGt})`, '| 정밀도', Math.round(100*sumTp/sumDet)+'%', `(${sumTp}/${sumDet})`);
