// ============================================================
// chapgyeong-health.js — 건강 층: 첩경 2권 질병 조문 + 오행 장부(첩경) + 간지별 신체 부위(강헌 의명학 표)
//  화법: 「돌볼 자리」까지. 병명 단정·수명 언급 없음. 근거를 항목마다 붙임.
//  첩경: 목=간담·신경(二二 목화심약), 화=심장·눈(二三 안목), 토=비위(二六, 무기토는 어느 기둥이든 비위), 금=폐·대장(二五 치질·경시대장, 二七 해수천식), 수=신장·방광(二九 금수냉한 야뇨, 二四 수액), 형=수술(三三)
//  강헌(현대편 「의명학의 오행과 신체」 표): 갑인 쓸개·머리·손등·발등 / 을묘 간·정수리·눈·손가락·근육 / 병사 소장·어깨·치아·얼굴 / 정오 심장·복부·혀·맥·정신 / 무진술 위장·옆구리·입·발 / 기축미 비장·무릎·허리·흉부·팔 / 경신 대장·배꼽·털·허벅지 / 신유 폐·다리·피부·유방·기관지·코 / 임해 방광·종아리·머리카락 / 계자 신장·생식기·뼈·귀
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const B = require('./chapgyeong-vol1-basics.js');
const Y = require('./chapgyeong-vol1-yukchin.js');
const ORGAN = { 목:'간·담(쓸개)과 신경', 화:'심장·소장과 눈', 토:'비위(소화기)', 금:'폐·기관지와 대장', 수:'신장·방광과 생식기' };
const BODY = { 갑:'쓸개·머리·손등·발등', 인:'쓸개·머리·손등·발등', 을:'간·정수리·눈·손가락·근육', 묘:'간·정수리·눈·손가락·근육', 병:'소장·어깨·치아·얼굴', 사:'소장·어깨·치아·얼굴', 정:'심장·복부·혀·맥·정신', 오:'심장·복부·혀·맥·정신',
  무:'위장·옆구리·입·발', 진:'위장·옆구리·입·발', 술:'위장·옆구리·입·발', 기:'비장·무릎·허리·흉부·팔', 축:'비장·무릎·허리·흉부·팔', 미:'비장·무릎·허리·흉부·팔', 경:'대장·배꼽·털·허벅지', 신:'대장·배꼽·털·허벅지', 신_:'폐·다리·피부·유방·기관지·코', 유:'폐·다리·피부·유방·기관지·코', 임:'방광·종아리·머리카락', 해:'방광·종아리·머리카락', 계:'신장·생식기·뼈·귀', 자:'신장·생식기·뼈·귀' };
const bodyOf = (ch, isStem) => (isStem && ch==='신') ? BODY['신_'] : BODY[ch];
const HEALTH_TOPICS = new Set([19,21,22,23,24,25,26,27,28,29,30]);
const OH = ['목','화','토','금','수'];

function healthReport(saju, vol2Results, opt = {}) {
  const stems = [saju.yStem, saju.mStem, saju.dStem, saju.tStem], brs = [saju.yBranch, saju.mBranch, saju.dBranch, saju.tBranch], names = ['연','월','일','시'];
  const cnt = {}; for (const o of OH) cnt[o] = brs.filter(b=>T.BRANCH_OHAENG[b]===o).length + stems.filter(s=>T.STEM_OHAENG[s]===o).length;
  const ilOh = Y.ohaengOf(saju.dStem);
  const items = [];
  // 1) 2권 질병 조문(성립한 것) — 완곡 문구 우선
  for (const r of (vol2Results||[])) { const id = String(r.id).split('-')[0]; if (!HEALTH_TOPICS.has(+id)) continue; items.push({ 구분:'첩경 2권 조문', 자리: r.완곡 || r.결과 || r.제목, 근거: `2권 ${r.제목} — ${(r.근거||[]).join('; ')}`, 등급: r.민감 || 'B' }); }
  // 2) 오행 과다·부족 → 장부(첩경) + 신체 부위(강헌)
  for (const o of OH) {
    if (cnt[o] >= 4) items.push({ 구분:'오행 과다', 자리: `${ORGAN[o]} — ${o}(${cnt[o]})이 지나쳐 그 장부가 부담을 받는 자리`, 근거: `오행 ${o} ${cnt[o]}점(첩경 장부 배속 · 강헌 의명학)`, 등급:'C' });
    if (cnt[o] === 0 && o !== ilOh) items.push({ 구분:'오행 부족', 자리: `${ORGAN[o]} — ${o} 기운이 없어 그쪽이 허한 자리`, 근거: `오행 ${o} 0점`, 등급:'C' });
  }
  // 3) 일간 오행 약(월령 휴수사 + 비겁·인수 적음) → 일간 장부
  const wol = Y.getWangSangHyuSuSa(saju.dStem, saju.mBranch); const INSU = { 목:'수', 화:'목', 토:'화', 금:'토', 수:'금' };
  if (!Y.isSinWang(wol) && cnt[ilOh] + cnt[INSU[ilOh]] <= 2) items.push({ 구분:'일주 허약', 자리: `${ORGAN[ilOh]} — 내 몸(일간 ${saju.dStem})이 약하고 받쳐 주는 기운이 적어 먼저 지치는 자리`, 근거: `월령 ${wol}, 비겁+인수 ${cnt[ilOh]+cnt[INSU[ilOh]]}점`, 등급:'B' });
  // 4) 형·충을 맞은 글자의 신체 부위(강헌 표) — 첩경 「형=수술」
  const R = B.checkBranchRelations(brs);
  const hit = new Map();
  const add = (b,k) => { if (!brs.includes(b)) return; const cur = hit.get(b) || new Set(); cur.add(k); hit.set(b, cur); };
  for (const f of R.형) for (const b of f.slice(0,2)) add(b,'형');
  for (const c of R.충) for (const b of c) add(b,'충');
  for (const [b, ks] of hit) { const kind = [...ks].join('·'); items.push({ 구분:'형충 부위', 자리: `${bodyOf(b,false)} — 지지 ${b}가 ${kind}을 맞아 다치기 쉬운 자리${ks.has('형')?'(첩경: 형은 수술로도 통함)':''}`, 근거: `${b} ${kind} (강헌 의명학 표 · 첩경 三三)`, 등급:'C' }); }
  // 5) 간지별 신체 부위 표(참고)
  const 표 = stems.map((s,i)=>({ 자리: names[i]+'주', 천간: s, 부위: bodyOf(s,true), 지지: brs[i], 지지부위: bodyOf(brs[i],false) }));
  // 등급별 정리·중복 제거
  const seen = new Set(); const out = items.filter(x => !seen.has(x.자리) && seen.add(x.자리));
  const 요약 = out.length ? out.slice(0,4).map(x=>x.자리.split(' — ')[0]).join(' · ') : '두드러진 취약 자리 없음';
  return { 요약, 항목: out, 오행점수: cnt, 신체부위표: 표, 안내: '체질의 결을 말하는 것이며 진단이 아닙니다. 걱정되는 증상은 의료기관에서 확인하세요.' };
}
module.exports = { healthReport, ORGAN, BODY };
