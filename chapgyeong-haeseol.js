// ============================================================
// chapgyeong-haeseol.js — 첩경 엔진 결과 → Gemini 브리프(이석영체) · 답변 검사
// 원칙(2026-08-23 확정): ① 판정 불변(엔진 판정을 바꾸지 말 것) ② 재료 밖 글자·조문 금지 ③ 구결은 그대로 쓰고 바로 뒤 현대어로 풀이
// ④ 본인 수명·사망 시기만 금지(그 외는 「~하리라」 단정조). 문체 강제·토막 수 강제 없음 — 책 원칙은 재료+출력 검사로 지킨다.
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const Y = require('./chapgyeong-vol1-yukchin.js');
const KW = { // 카테고리 → 2권 주제 id
  직업:[31,32,33,34,35,36,37,38,39,40,41], 가족:[2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,'59-60',61,62,63,66],
  재물:[34,38,46], 건강:[19,21,22,23,24,25,26,27,28,29,30], 이동:[1,17,18,20,64,65], 성정:[] };
const CATS = ['총평','직업','가족','재물','건강','금년운세','대운'];
// 건강 분야 물음이면 브리프의 건강 구간을 재료로 답하고, 진단·병명 단정은 금지(첩경도 「~앓아 본다」 가능성 화법)
let DB3 = null; try { DB3 = require('./chapgyeong3_myeongshik_db.json'); } catch (e) {}

function sipTable(saju) { // 십성 실명표(암산 차단용)
  const ilgan = saju.dStem; const rows = [];
  const pos = { [saju.yStem]:'연간', [saju.mStem]:'월간', [saju.tStem]:'시간' };
  for (const s of ['갑','을','병','정','무','기','경','신','임','계']) { if (s===ilgan) continue;
    const where = []; if (pos[s]) where.push(pos[s]+' 드러남');
    [['연',saju.yBranch],['월',saju.mBranch],['일',saju.dBranch],['시',saju.tBranch]].forEach(([n,b])=>{ const jg=T.JIJANGGAN[b]||[]; const i=jg.indexOf(s); if(i>=0) where.push(`${n}지 ${b} ${i===jg.length-1?'본기':'속에 숨음'}`); });
    rows.push(`${Y.getSipseong(ilgan,s)} ${s}: ${where.length?where.join(', '):'원국에 없음'}`); }
  return rows;
}
function gugyeolSamples(vol2, limit = 6) { // 3권 실례에서 같은 주제 구결 재료(사언구결+한글 대역) 발췌
  if (!DB3) return [];
  const keys = { 1:'이향', 17:'해외', 20:'감금', 24:'수액', 26:'비위', 32:'경찰', 33:'의업', 36:'역술', 40:'외교', 56:'무자', 58:'외방', 61:'자손', 3:'형제', 46:'재취', 45:'국제', 19:'음독', 18:'교통', 22:'정신', 23:'안질', 41:'신앙', 31:'교육', 34:'재정', 35:'법조', 33:'의업' };
  const out = [];
  for (const r of vol2) { const k = keys[r.id]; if (!k) continue;
    for (const d of DB3) { for (const l of (d.통변시||[])) { const m = l.match(/([가-힣]{4})\s+([가-힣]{4})\s*—\s*([^·」]+)/); if (!m || !(m[1]+m[2]).includes(k) && !m[3].includes(k)) continue;
      out.push(`〈${r.제목}〉 ${m[1]} ${m[2]} — ${m[3].trim().slice(0,45)} (3권 第${d.no})`); break; } if (out.length && out[out.length-1].startsWith(`〈${r.제목}〉`)) break; }
    if (out.length >= limit) break; }
  return out;
}
/** analyzeFromBirth 결과 → 브리프 텍스트 */
function toBrief(fb, opt = {}) {
  const r = fb.결과, s = fb.입력.saju, un = fb.운, sex = opt.sex || '남';
  const L = [];
  L.push(`# 명식 ${fb.입력.pillars.join(' ')} (${sex}명)${fb.만세력&&fb.만세력.보정시각?` · 진태양시 보정 ${fb.만세력.보정시각.hour}:${String(fb.만세력.보정시각.minute).padStart(2,'0')}`:''}`);
  if (un) L.push(`기준일 ${un.기준일} · 만 ${un.만나이}세(세는나이 ${un.세는나이}) · 대운 ${un.방향} 대운수 ${un.대운수}${un.세밀?`(${un.세밀.년}년 ${un.세밀.개월}개월)`:''}${un.절입?` — ${un.절입} 절입 기준`:''}${un.해상도==='일'?' (절입 일 단위)':''}`);
  const wol = Y.getWangSangHyuSuSa(s.dStem, s.mBranch);
  L.push(`\n## 골격(판정 불변)`); L.push(`- 일간 ${s.dStem} · 월령 ${wol} → ${Y.isSinWang(wol)?'신왕':'신약'}(첩경 억부: 왕·상=신왕, 휴·수·사=신약)`);
  L.push(`- 격: ${(r.vol4||[]).map(x=>(x.격국명||x.격)+(x.특기사항?` (${[].concat(x.특기사항).join('; ')})`:'')).join(' / ')||'정격 미성립'}${(r.vol4ha||[]).length?` · 특수격 ${(r.vol4ha||[]).map(x=>x.격국명||x.격).join(', ')}`:''}`);
  L.push(`- 용신 ${r.용신.용신오행} — ${r.용신.근거}`);
  L.push(`- 신살: 길신 ${(r.vol1.신살.길신||[]).join('·')||'없음'} / 흉살 ${(r.vol1.신살.흉살||[]).join('·')||'없음'}`);
  const ss = r.vol1.신살.십이신살; if (ss && ss.해당) L.push(`- 십이신살(생년 ${ss.기준} 기준): ${['연','월','일','시'].map((n,i)=>n+'지 '+ss.해당[i].지지+'='+ss.해당[i].신살).join(' · ')}`);
  if (r.vol1.포태운성) L.push(`- 십이운성(수토동궁): ${['연','월','일','시'].map((n,i)=>n+'지 '+r.vol1.포태운성[i].지지+'='+r.vol1.포태운성[i].운성).join(' · ')}`);
  L.push(`\n## 십성 실명표(이 표 밖의 글자를 원국 글자로 부르지 말 것)`); sipTable(s).forEach(x=>L.push('- '+x));
  L.push(`\n## 2권 통변(조건→추리 — 성립한 것만)`);
  for (const x of r.vol2) { const g = (x.근거||[]).join('; '); if (x.민감==='A') L.push(`- [경보] ${x.제목} — 근거: ${g} → 표현은 완곡 문구로만: 「${x.완곡}」`); else if (x.민감==='B') L.push(`- [주의] ${x.제목} — 근거: ${g} → 「${x.완곡}」(가능성 화법)`); else L.push(`- ${x.제목} — 근거: ${g}`); }
  try { const HL = require('./chapgyeong-health.js'); const hr = HL.healthReport(s, r.vol2); L.push(`\n## 건강(첩경 오행 장부 + 2권 질병 조문 + 형충 부위 — 돌볼 자리 화법, 병명 단정 금지)`); hr.항목.forEach(x=>L.push(`- [${x.등급}] ${x.자리} — 근거: ${x.근거}`)); L.push(`- 신체 부위 표: ${hr.신체부위표.map(t=>t.자리+' '+t.천간+'/'+t.지지+'='+t.부위.split('·')[0]+'/'+t.지지부위.split('·')[0]).join(' · ')}`); } catch (e) {}
  L.push(`\n## 6권 문답(원국의 형세 — 병렬 관법, 용신을 바꾸지 말 것)`);
  for (const x of r.vol6) L.push(`- ${x.제목}${x.참고?'(참고)':''}: ${x.판정}`);
  const rel = x => [x.합.length?'합 '+x.합.join(''):'', x.충.length?'충 '+x.충.join(''):'', x.형.length?'형 '+x.형.join(''):'', x.원진&&x.원진.length?'원진 '+x.원진.join(''):'', x.간합.length?'간합 '+x.간합.join(''):''].filter(Boolean).join(' · ');
  if (un) {
    L.push(`\n## 대운(월주 ${s.mStem}${s.mBranch}에서 ${un.방향})`);
    for (const d of un.대운) L.push(`- ${d.현재?'▶ ':''}${d.시작시점}~${d.끝시점}(만${d.시작만나이}~${d.끝만나이}) ${d.간지} ${d.천간} ${d.지지} · ${d.등급} · ${d.용신관계.join(', ')||'용신과 무관'}${rel(d)?' · '+rel(d):''}`);
    L.push(`\n## 세운`); for (const y of un.세운) L.push(`- ${y.연도} ${y.간지}(만${y.만나이}) ${y.천간} ${y.지지} · ${y.등급} · ${y.용신관계.join(', ')||'용신과 무관'}${rel(y)?' · '+rel(y):''}`);
  }
  if (un && un.월운) for (const [y, months] of Object.entries(un.월운)) {
    L.push(`\n## ${y}년 월운(절기월 — 절입일부터 다음 절입 전날까지)`);
    for (const mo of months) L.push(`- ${mo.절기}(${mo.시작}~) ${mo.간지} ${mo.천간} ${mo.지지} · ${mo.등급} · ${mo.용신관계.join(', ')||'용신과 무관'}${rel(mo)?' · '+rel(mo):''}${mo.세운대조.length?' · '+mo.세운대조.join(', '):''}`); }
  const gg = gugyeolSamples(r.vol2); if (gg.length) { L.push(`\n## 구결 재료(3권 실례의 사언구결 — 그대로 인용 후 현대어 풀이)`); gg.forEach(x=>L.push('- '+x)); }
  return L.join('\n');
}
const SYSTEM = `당신은 사주첩경의 관법으로 간명하는 술사다. 아래 네 가지만 지키고 나머지는 자유롭게 말하라.
1. 판정 불변 — 브리프의 격·용신·성립 조문을 바꾸거나 새로 만들지 마라. 없는 조문을 성립한 것처럼 말하지 마라.
2. 재료 밖 금지 — 십성 실명표·운 표에 없는 글자를 원국 글자로 부르지 마라. 운에서 온 글자는 「운에서 온」이라 밝혀라.
3. 구결은 그대로 쓰고, 바로 뒤에 현대어로 알기 쉽게 풀어라. 풀이가 구결의 뜻을 누그러뜨리면 오류다. 말투는 「~하리라」 단정조, 돌려 말하지 마라.
4. 본인의 수명·사망 시기는 어떤 형태로도 말하지 마라. [경보] 조문은 브리프의 완곡 문구 범위 안에서만 말하라.`;
// 독자 층: '일반'(기본) — 명리를 모르는 사람이 읽음 / '학인' — 공부하는 사람·종사자(원문체 그대로)
const READER = {
  일반: `\n5. 읽는 사람은 명리를 모른다. 답의 첫 문단은 용어 없이 결론만 일상어로 말하라(무슨 결인지, 올해 어떤지). 그 뒤에 근거를 대되 용어는 처음 나올 때 한 번만 「용어(漢字, 우리말 풀이)」 꼴로 쓰라 — 예: 식신(食神, 내가 만들어 내보내는 힘), 용신(用神, 이 사주에 꼭 필요한 기운), 수옥살(囚獄殺, 갇힘의 별). 두 번째부터는 우리말 풀이만 쓰라. 풀이 없이 한자만 붙이지 마라. 구결(사언 구절)은 한 군데만 인용하고 바로 풀어라. 문장은 짧게, 비유는 생활에서 가져오라.`,
  학인: `\n5. 읽는 사람은 명리를 공부하는 사람이다. 첩경 용어와 구결을 그대로 써도 되며, 조문 근거(2권 몇 번, 6권 어느 항)를 밝혀라.`
};
function buildPrompt(brief, question, category, opt = {}) {
  const cat = category && CATS.includes(category) ? category : null;
  const reader = READER[opt.독자] ? opt.독자 : '일반';
  const focus = cat ? `\n\n## 이번 물음의 분야: ${cat}${cat==='금년운세'?' — 세운 표의 올해 줄과 현재 대운을 원국 용신·격에 대조하여 답하라':cat==='건강'?' — 건강 구간(오행 장부·조문·형충 부위)을 재료로 「돌볼 자리」를 말하되 병명을 진단하지 말고, 걱정되는 증상은 의료기관 확인을 권하라':''}` : '';
  return { system: SYSTEM + READER[reader], user: `${brief}${focus}\n\n## 물음\n${question||'이 사주를 첩경 관법으로 간명하라'}`, 독자: reader };
}
// 가독성 지표 — 일반 독자용 답의 용어 밀도(전문용어 수/100자)·평균 문장 길이. 지표만 내고 위반 판정은 서버가 정책으로
const TERMS = /(월령|왕상휴수사|신왕|신약|식신격|편관격|정관격|인수격|재격|상관격|용신|희신|기신|십성|편인|정인|비견|비겁|식신|상관|정재|편재|정관|편관|칠살|살인상생|제살태과|진법무민|아우생아|명관과마|순환상생|원원류장|시종득소|암요제궐|회동제궐|기취|방조설상|형결|급신이지|도식|군겁쟁재|반위성부|합거|자형|삼형|원진|공망|백호|괴강|귀문|수옥|급각|탕화|역마|지살|장생|관대|임관|제왕|묘고|포태|운성|대운수|세운|월운|절입|천간|지지|일간|월지|일지|시지|년지|연지|간합|육합|삼합|방합)/g;
function readability(text) { const chars = text.replace(/\s/g,'').length || 1; const terms = (text.match(TERMS)||[]).length; const sents = text.split(/[.。!?]\s|\n/).filter(x=>x.trim().length>3); const avg = sents.length ? Math.round(chars/sents.length) : chars;
  const withGloss = (text.match(/\([一-龥·]+\s*[,，·]\s*[가-힣][^)]*\)/g)||[]).length;   // 식신(食神, 내가 만들어 내보내는 힘) — 풀이 동반
  const bare = (text.match(/\([一-龥·]+\)/g)||[]).filter(m => !/^\([甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥木火土金水·]+\)$/.test(m)).length; // (食神) — 풀이 없는 용어 한자만(간지·오행 글자는 예외)
  return { 글자수: chars, 용어수: terms, 용어밀도: +(terms*100/chars).toFixed(2), 평균문장길이: avg, 한자풀이병기: withGloss, 한자만병기: bare }; }
/** 답변 검사 — 재료 밖 간지·수명 표현 */
function checkOutput(text, fb) {
  const s = fb.입력.saju; const issues = [];
  const allowed = new Set([s.yStem,s.mStem,s.dStem,s.tStem,s.yBranch,s.mBranch,s.dBranch,s.tBranch]);
  [s.yBranch,s.mBranch,s.dBranch,s.tBranch].forEach(b=>(T.JIJANGGAN[b]||[]).forEach(g=>allowed.add(g)));
  if (fb.운) { fb.운.대운.forEach(d=>{allowed.add(d.간지[0]);allowed.add(d.간지[1]);}); fb.운.세운.forEach(y=>{allowed.add(y.간지[0]);allowed.add(y.간지[1]);}); }
  const gan = text.match(/원국(?:의|에)\s*([갑을병정무기경신임계자축인묘진사오미신유술해])/g) || [];
  gan.forEach(m=>{ const ch=m.slice(-1); if(!allowed.has(ch)) issues.push(`원국 글자로 부른 ${ch}는 재료에 없음`); });
  if (/(수명|몇\s*살까지|사망\s*시기|죽을\s*(때|시기)|명이\s*다한다|세상을\s*떠난다)/.test(text)) issues.push('본인 수명·사망 시기 언급');
  if (/(자녀|자식|아들|딸)[^.。\n]{0,20}(죽|사망|불구|병신)/.test(text)) issues.push('자녀 흉사·불구 단정 표현');
  // 첩경 통변의 골격 — 원국에 신살이 있으면 최소 하나는 짚어야 하고, 십이운성도 한 번은 언급해야 함(재료 활용 검사)
  const sin = fb.결과 && fb.결과.vol1 && fb.결과.vol1.신살; if (sin) {
    const names = [...(sin.길신||[]), ...(sin.흉살||[])].map(x=>x.replace(/\(.*$/,'').replace(/살$|귀인$|성$|신$/,''));
    const sinsalMentioned = names.some(n => n && text.includes(n)) || /지살|역마|장성|화개|겁살|재살|천살|년살|월살|망신|반안|육해/.test(text);
    if (names.length && !sinsalMentioned) issues.push('원국 신살('+names.slice(0,4).join('·')+' 등)을 하나도 짚지 않음');
    if (!/(장생|목욕|관대|임관|건록|제왕|왕지|쇠지|병지|사지|묘지|절지|태지|양지|십이운성|운성|[생욕대관왕쇠병사묘절태양]\(?궁)/.test(text)) issues.push('십이운성(포태) 언급 없음');
  }
  return { ok: issues.length===0, issues };
}
module.exports = { toBrief, buildPrompt, checkOutput, readability, sipTable, gugyeolSamples, SYSTEM, READER, CATS };
