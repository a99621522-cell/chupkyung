// ============================================================
// chapgyeong-book.js — 사주첩경(쉬운 한글 풀이 합본) 책 문답: 색인 → 검색 → 근거 묶음 → 4조 지시
//  색인 단위: 권 헤더·편(제N편)·항목(2권 一~六六, 4권 第N 격, 6권 第N 문답, 3권 第N 실례) → 청크(≤1,800자)
//  검색: 한글 2-gram + 한자·숫자 토큰 BM25. 질문의 명리 용어는 그대로 토큰이 됨.
//  원칙: 책 범위 안에서만 답, 출처(권·항목·원문 쪽) 명시, 책에 없으면 없다고 말함. 사주를 함께 주면 엔진 판정을 재료에 더함.
// ============================================================
const fs = require('fs'); const path = require('path');
const TEXT = path.join(__dirname, 'docs', '사주첩경_합본_텍스트.txt');
let INDEX = null;

function loadChunks() {
  const t = fs.readFileSync(TEXT, 'utf8'); const pages = t.split('\f');
  const volOf = i => i < 5 ? '서문' : i < 50 ? '1권' : i < 104 ? '2권' : i < 173 ? '3권' : i < 254 ? '4권' : '6권';
  const chunks = [];
  const headRe = /^\s*(第[一二三四五六七八九十百〇]+\s*[^\n]{2,40}|[一二三四五六七八九〇十]{1,3}\.\s*[^\n]{2,50}\(원문[^\n]*|제\d+장[^\n]{0,60}|\d{1,2}\.\s*[가-힣]{2,12}\([^\n]{2,30}\)[^\n]{0,40}|제\d+편[^\n]{0,80})/;
  for (let pi = 0; pi < pages.length; pi++) {
    const vol = volOf(pi); const lines = pages[pi].split('\n'); let cur = { vol, page: pi+1, head: null, body: [] };
    const flush = () => { const body = cur.body.join('\n').replace(/\n{3,}/g,'\n\n').trim(); if (body.length > 40) { for (let k = 0; k < body.length; k += 1800) chunks.push({ id: chunks.length, vol: cur.vol, page: cur.page, head: cur.head, text: body.slice(k, k+1800) }); } cur = { vol, page: pi+1, head: cur.head, body: [] }; };
    for (const ln of lines) { const m = ln.match(headRe); if (m && cur.body.join('').length > 200) { flush(); cur.head = m[1].trim().slice(0, 60); cur.body.push(ln); } else { if (m && !cur.head) cur.head = m[1].trim().slice(0,60); cur.body.push(ln); } }
    flush();
  }
  return chunks;
}
const tokenize = s => { const toks = []; const clean = String(s).replace(/[^\uAC00-\uD7A3一-龥0-9a-zA-Z]/g, ' '); for (const w of clean.split(/\s+/).filter(Boolean)) { if (/^[一-龥]+$/.test(w)) { toks.push(w); for (const ch of w) toks.push(ch); } else if (/^[\uAC00-\uD7A3]+$/.test(w)) { if (w.length <= 2) toks.push(w); for (let i = 0; i + 1 < w.length; i++) toks.push(w.slice(i, i+2)); if (w.length >= 3) toks.push(w); } else toks.push(w.toLowerCase()); } return toks; };
function build() {
  const chunks = loadChunks(); const df = new Map(); const docs = chunks.map(c => { const tf = new Map(); for (const t of tokenize(c.head ? c.head + ' ' + c.head + ' ' + c.text : c.text)) tf.set(t, (tf.get(t)||0)+1); for (const t of tf.keys()) df.set(t, (df.get(t)||0)+1); return tf; });
  const avg = docs.reduce((a,d)=>a+[...d.values()].reduce((x,y)=>x+y,0),0)/docs.length;
  INDEX = { chunks, docs, df, avg, N: chunks.length }; return INDEX;
}
// 입에 붙는 줄임말·별칭 → 책 표기 (검색어 확장)
const ALIAS = { 귀문살:'귀문관살', 백호살:'백호대살', 역마살:'역마', 도화살:'도화 년살', 공망살:'공망', 괴강:'괴강살', 양인:'양인살', 원진살:'원진', 천을:'천을귀인', 문창:'문창귀인', 학당:'학당귀인', 탕화:'탕화살', 급각:'급각살', 수옥:'수옥살 재살', 고란:'고란살', 과숙:'과숙살', 고신:'고신살', 형살:'형 삼형', 재다신약:'재다신약 재성 신약', 신약:'신약 왕상휴수사', 신강:'신강 왕상휴수사', 용신:'용신 억부', 종격:'종격 종재 종살 기명종재', 십성:'십성 육친', 육친:'육친 정편', 대운:'대운 정법 절입', 야자시:'야자시 정자시', 지장간:'지장간 장간 월률분야' };
function expandQuery(q) { let out = q; for (const [a,b] of Object.entries(ALIAS)) if (q.includes(a)) out += ' ' + b; return out; }
function search(q, k = 6, opt = {}) {
  q = expandQuery(q);
  if (!INDEX) build(); const { chunks, docs, df, avg, N } = INDEX; const qt = [...new Set(tokenize(q))];
  const scores = docs.map((tf, i) => { if (opt.vol && chunks[i].vol !== opt.vol) return 0; const len = [...tf.values()].reduce((x,y)=>x+y,0); let s = 0; for (const t of qt) { const f = tf.get(t); if (!f) continue; const idf = Math.log(1 + (N - (df.get(t)||0) + 0.5) / ((df.get(t)||0) + 0.5)); s += idf * (f * 2.2) / (f + 1.2 * (0.25 + 0.75 * len / avg)); } return s; });
  return scores.map((s, i) => ({ s, i })).filter(x => x.s > 0).sort((a,b)=>b.s-a.s).slice(0, k).map(x => ({ score: +x.s.toFixed(2), ...chunks[x.i] }));
}
const SYSTEM_BOOK = `당신은 『사주첩경』(이석영)을 함께 읽어 주는 조교다. 아래 네 가지만 지켜라.
1. 답은 함께 주는 「책 근거」 안에서만 하라. 근거에 없는 내용은 일반 명리 상식으로 채우지 말고 「이 책에는 그 대목이 없다」고 말하라. 근거가 여러 권에 걸치면 권마다 무엇을 말하는지 나눠 답하라.
2. 문장마다가 아니라 단락 끝에 출처를 붙여라 — (2권 三二 경찰관, 원문 116쪽)처럼 권·항목·원문 쪽. 책의 문장을 그대로 길게 옮기지 말고 뜻을 풀어 말하되, 구결(사언 구절)과 조건 문장은 그대로 인용해도 좋다.
3. 용어는 처음 나올 때 「용어(漢字, 우리말 풀이)」 꼴로 한 번 쓰고 그 뒤는 우리말로. 기본 독자는 명리를 모르는 사람이다 — 첫 두세 문장으로 「그게 뭔지·있으면 어떻게 되는지」를 일상어로 먼저 답하고, 그다음에 책이 어떻게 적었는지(짝·조건·예)를 짧게, 마지막에 출처. 전체는 짧게. 공부하는 사람이라고 밝히면 조문 번호·원문 쪽까지 자세히.
4. 사주(명식)가 함께 오면 엔진 판정을 재료로 삼되 판정을 바꾸지 말고, 본인 수명·사망 시기는 말하지 마라.`;
function buildBookPrompt(question, opt = {}) {
  const hits = search(question, opt.k || 6, { vol: opt.vol });
  const ctx = hits.map((h, i) => `[근거 ${i+1}] ${h.vol} · ${h.head || '(편 본문)'} · 합본 ${h.page}쪽\n${h.text}`).join('\n\n');
  let extra = '';
  if (opt.saju) { try { const H = require('./chapgyeong-haeseol.js'); extra = `\n\n## 이 사주의 엔진 판정(참고)\n${H.toBrief(opt.saju, { sex: opt.sex || '남' }).split('\n## 십성 실명표')[0]}`; } catch (e) {} }
  return { system: SYSTEM_BOOK, user: `## 책 근거(검색 상위 ${hits.length})\n${ctx}${extra}\n\n## 물음\n${question}`, hits };
}
module.exports = { build, search, buildBookPrompt, expandQuery, ALIAS, SYSTEM_BOOK, tokenize };
