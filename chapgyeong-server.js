// ============================================================
// chapgyeong-server.js — 첩경 간명 중계 (Node 내장 http/fetch, 외부 패키지: @fullstackfamily/manseryeok 만)
//  POST /첩경   { y,m,d,h,min,longitude,sex,question,category,today,years,yongsinV26, debug }
//     → 만세력 → 어댑터 → 전권 판정 → 대운/세운/월운 → 브리프 → Gemini(4조 지시) → checkOutput → 위반 시 정정 지시 붙여 재생성(최대 RETRY회)
//  POST /첩경/판정  같은 입력 → Gemini 없이 판정·브리프만(앱 표·그래프용)
//  POST /책      { question, 독자:'학인'|'일반', vol:'1권'..'6권'(선택), y,m,d,h,min,longitude,sex(선택: 사주 판정을 재료에 더함) } — 책 범위 내 문답, 출처 명시
//  GET  /점검     환경·모델·키 유무
//  LLM 공급자: LLM_PROVIDER=claude(기본)|gemini
//    Claude: ANTHROPIC_API_KEY, CLAUDE_MODEL(기본 claude-sonnet-5 — 상담 비용·속도 균형; 품질 우선이면 claude-opus-5)
//            Messages API https://api.anthropic.com/v1/messages (x-api-key, anthropic-version 2023-06-01) — 문서 https://platform.claude.com/docs/en/api/overview
//    Gemini: GEMINI_API_KEY, GEMINI_MODEL(기본 gemini-3-flash-preview)
//  공통: ALLOW_ORIGIN, PORT, RETRY(기본 2), RATE_PER_HOUR(기본 20). 키가 없으면 mock 모드(브리프만 반환)
// ============================================================
const http = require('http');
const M = require('@fullstackfamily/manseryeok');
const A = require('./chapgyeong-input.js');
const H = require('./chapgyeong-haeseol.js');
const BK = require('./chapgyeong-book.js');
const GP = require('./chapgyeong-gyeok-profiles.js');
const HL = require('./chapgyeong-health.js');

const ENV = { provider: (process.env.LLM_PROVIDER || 'claude').toLowerCase(), ckey: process.env.ANTHROPIC_API_KEY || '', cmodel: process.env.CLAUDE_MODEL || 'claude-sonnet-5', key: process.env.GEMINI_API_KEY || '', model: process.env.GEMINI_MODEL || 'gemini-3-flash-preview', origin: process.env.ALLOW_ORIGIN || '*', port: +(process.env.PORT || 8787), retry: +(process.env.RETRY || 2), rate: +(process.env.RATE_PER_HOUR || 20) };
const hits = new Map(); // ip → [timestamps]
function rateOk(ip) { const now = Date.now(); const arr = (hits.get(ip)||[]).filter(t => now - t < 3600e3); arr.push(now); hits.set(ip, arr); return arr.length <= ENV.rate; }

async function callGemini(system, user, extra = '') {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${ENV.model}:generateContent`;
  const body = { systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: user + (extra ? `\n\n## 정정 지시(이전 답의 위반)\n${extra}` : '') }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 2048 } };
  for (const auth of [{ 'x-goog-api-key': ENV.key }, { Authorization: 'Bearer ' + ENV.key }]) { // 인증 2방식 폴백(간명 서버 관례)
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...auth }, body: JSON.stringify(body) });
    if (res.ok) { const j = await res.json(); return (j.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join(''); }
    if (res.status !== 401 && res.status !== 403) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0,200)}`);
  }
  throw new Error('Gemini 인증 실패');
}

async function callClaude(system, user, extra = '') {
  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': ENV.ckey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: ENV.cmodel, max_tokens: 2048, system, messages: [{ role: 'user', content: user + (extra ? `\n\n## 정정 지시(이전 답의 위반)\n${extra}` : '') }] }) });
  if (!res.ok) throw new Error(`Claude ${res.status}: ${(await res.text()).slice(0,200)}`);
  const j = await res.json(); return (j.content || []).filter(p => p.type === 'text').map(p => p.text).join('');
}
const hasKey = () => ENV.provider === 'claude' ? !!ENV.ckey : !!ENV.key;
const callLLM = (system, user, extra) => ENV.provider === 'claude' ? callClaude(system, user, extra) : callGemini(system, user, extra);

/** 책 문답 — 합본 색인 검색 → 근거 묶음 → LLM(4조) */
async function bookQA(input) {
  let sajuBrief = null;
  if (input.y && input.m && input.d) { const fb = A.analyzeFromBirth(M, { y:+input.y, m:+input.m, d:+input.d, h: input.h==null?12:+input.h, min:+(input.min||0), longitude: input.longitude==null?127.5:+input.longitude, sex: input.sex||'남' }); if (fb.결과) sajuBrief = fb; }
  const { system, user, hits } = BK.buildBookPrompt(input.question || '', { k: input.k || 6, vol: input.vol, saju: sajuBrief, sex: input.sex || '남' });
  const 독자 = input.독자 === '학인' ? '학인' : '일반'; // 기본 일반
  const sys = system + (독자 === '일반' ? '\n(묻는 이는 일반인이다 — 결론을 먼저, 용어는 처음 한 번만 「용어(漢字, 풀이)」 꼴로.)' : '\n(묻는 이는 공부하는 사람이다 — 조문 번호·원문 쪽까지 밝혀라.)');
  const 출처 = hits.map(h => ({ 권: h.vol, 항목: h.head, 합본쪽: h.page, 점수: h.score }));
  if (!hasKey()) return { ok: true, mode: 'mock', provider: ENV.provider, 출처, 근거: hits.map(h => h.text.slice(0, 300)), 답변: null };
  const text = await callLLM(sys, user, '');
  return { ok: true, provider: ENV.provider, model: ENV.provider==='claude'?ENV.cmodel:ENV.model, 답변: text, 출처, ...(input.debug ? { 근거: hits.map(h=>h.text) } : {}) };
}

/** 핵심 파이프라인 — 서버 없이도 호출 가능(기존 gemini.js에 이식 시 이 함수만 가져가면 됨) */
async function ganmyeong(input, opt = {}) {
  const b = { y:+input.y, m:+input.m, d:+input.d, h: input.h == null ? 12 : +input.h, min: +(input.min || 0), longitude: input.longitude == null ? 127.5 : +input.longitude, sex: input.sex || input.성별 || '남', today: input.today, years: input.years, yongsinV26: !!input.yongsinV26, 야자시정책: input.야자시정책 };
  const fb = A.analyzeFromBirth(M, b);
  if (!fb.결과) return { ok: false, error: '팔자 산출 실패', 입력: fb.입력 };
  const brief = H.toBrief(fb, { sex: b.sex });
  const 프로필 = GP.profiles(fb.결과.vol4, fb.결과.vol4ha); if (fb.결과.주격 && fb.결과.주격.격) { const k = String(fb.결과.주격.격).replace(/\(.*$/,''); 프로필.sort((a,b)=> (b.격===k||b.표기===fb.결과.주격.격) - (a.격===k||a.표기===fb.결과.주격.격)); }
  const summary = { 주격: fb.결과.주격, 격프로필: 프로필, 건강: HL.healthReport(fb.입력.saju, fb.결과.vol2), 팔자: fb.입력.pillars, 보정시각: fb.만세력?.보정시각, 경고: fb.입력.warnings, 격: (fb.결과.vol4||[]).map(x=>x.격국명||x.격), 특수격: (fb.결과.vol4ha||[]).map(x=>x.격국명||x.격), 용신: fb.결과.용신, 신살: fb.결과.vol1.신살, 운성: fb.결과.vol1.포태운성, 통변: fb.결과.vol2.map(x=>({ id:x.id, 제목:x.제목, 민감:x.민감||null, 완곡:x.완곡||null })), 문답: fb.결과.vol6.map(x=>x.제목), 운: fb.운 && { 대운수: fb.운.대운수, 세밀: fb.운.세밀, 방향: fb.운.방향, 현재대운: (fb.운.대운.find(d=>d.현재)||{}).간지, 대운: fb.운.대운.map(d=>({간지:d.간지, 시작시점:d.시작시점, 끝시점:d.끝시점, 등급:d.등급, 현재:d.현재})), 세운: fb.운.세운.map(y=>({연도:y.연도, 간지:y.간지, 등급:y.등급})), 월운: fb.운.월운 } };
  if (opt.판정만) return { ok: true, 요약: summary, 브리프: brief };
  const { system, user, 독자 } = H.buildPrompt(brief, input.question, input.category, { 독자: input.독자 || input.reader || '일반' });
  if (!hasKey()) return { ok: true, mode: 'mock', provider: ENV.provider, 요약: summary, 브리프: brief, 답변: null, 안내: (ENV.provider==='claude'?'ANTHROPIC_API_KEY':'GEMINI_API_KEY')+' 없음 — 브리프만 반환' };
  let extra = '', last = null, checks = [];
  for (let i = 0; i <= ENV.retry; i++) {
    const text = await callLLM(system, user, extra);
    const chk = H.checkOutput(text, fb); const rd = H.readability(text); chk.가독성 = rd;
    if (독자 === '일반' && (rd.용어밀도 > 3.5 || rd.한자만병기 > 2)) { chk.ok = false; chk.issues.push(`일반 독자용인데 용어가 너무 많음(밀도 ${rd.용어밀도}/100자, 풀이 없는 한자 병기 ${rd.한자만병기}) — 용어는 「용어(漢字, 우리말 풀이)」 꼴로 처음 한 번만, 그 뒤는 우리말로`); }
    checks.push(chk); last = text;
    if (chk.ok) return { ok: true, provider: ENV.provider, model: ENV.provider==='claude'?ENV.cmodel:ENV.model, 답변: text, 검사: checks, 시도: i+1, 요약: summary, ...(input.debug ? { 브리프: brief } : {}) };
    extra = chk.issues.map(x => '- ' + x).join('\n') + '\n위 사항을 고쳐 다시 써라. 재료에 없는 글자는 쓰지 말고, 신살과 십이운성을 반드시 짚어라.';
  }
  return { ok: true, 답변: last, 검사: checks, 시도: ENV.retry+1, 미통과: true, 요약: summary };
}

function send(res, code, obj) { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': ENV.origin, 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS' }); res.end(JSON.stringify(obj)); }
function serve() {
  return http.createServer(async (req, res) => {
    let url = req.url; try { url = decodeURIComponent(req.url); } catch (e) {}
    if (req.method === 'OPTIONS') return send(res, 204, {});
    if (req.method === 'GET' && (url === '/점검' || url === '/health')) return send(res, 200, { ok: true, provider: ENV.provider, model: ENV.provider==='claude'?ENV.cmodel:ENV.model, key: hasKey(), retry: ENV.retry, 엔진: '사주첩경 1·2·4·4下·6권 + 대운/세운/월운 + 책 문답(합본 색인)' });
    if (req.method === 'POST' && (url.startsWith('/책') || url.startsWith('/book'))) {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress; if (!rateOk(ip)) return send(res, 429, { ok:false, error:'시간당 요청 한도 초과' });
      let body = ''; req.on('data', c => body += c); req.on('end', async () => { try { const r = await bookQA(JSON.parse(body || '{}')); send(res, 200, r); } catch (e) { send(res, 500, { ok:false, error: e.message }); } });
      return;
    }
    if (req.method === 'POST' && (url.startsWith('/첩경') || url.startsWith('/chapgyeong'))) {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress; if (!rateOk(ip)) return send(res, 429, { ok:false, error:'시간당 요청 한도 초과' });
      let body = ''; req.on('data', c => body += c); req.on('end', async () => { try { const input = JSON.parse(body || '{}'); const r = await ganmyeong(input, { 판정만: /판정|judge/.test(url) }); send(res, 200, r); } catch (e) { send(res, 500, { ok:false, error: e.message }); } });
      return;
    }
    if (req.method === 'GET') { // 정적: app/index.html
      const fs = require('fs'), path = require('path'); const f = path.join(__dirname, 'app', url === '/' ? 'index.html' : url.replace(/^\//,'').split('?')[0]);
      if (f.startsWith(path.join(__dirname,'app')) && fs.existsSync(f) && fs.statSync(f).isFile()) { const ext = path.extname(f); res.writeHead(200, { 'Content-Type': ({'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml'})[ext]||'application/octet-stream' }); return fs.createReadStream(f).pipe(res); }
    }
    send(res, 404, { ok:false, error:'not found' });
  });
}
if (require.main === module) serve().listen(ENV.port, () => console.log(`첩경 서버 :${ENV.port} (${ENV.provider} ${ENV.provider==='claude'?ENV.cmodel:ENV.model}, key ${hasKey()?'있음':'없음(mock)'})`));
module.exports = { ganmyeong, bookQA, callGemini, callClaude, serve };
