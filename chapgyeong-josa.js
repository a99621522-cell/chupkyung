// 한국어 조사 자동 선택 — 판정문 템플릿용. josa('화','이') → '화가', josa('금','을') → '금을', josa('유·유','이') → '유·유가'
const CODA = (word) => { const ch = String(word).replace(/[^가-힣]/g,'').slice(-1); if (!ch) return false; return (ch.charCodeAt(0) - 0xAC00) % 28 !== 0; };
const PAIRS = { 이:['이','가'], 가:['이','가'], 을:['을','를'], 를:['을','를'], 은:['은','는'], 는:['은','는'], 과:['과','와'], 와:['과','와'], 으로:['으로','로'], 로:['으로','로'] };
function josa(word, j) { const p = PAIRS[j]; if (!p) return word + j; const coda = CODA(word); if (j === '로' || j === '으로') { const ch = String(word).replace(/[^가-힣]/g,'').slice(-1); const isRieul = ch && (ch.charCodeAt(0)-0xAC00)%28===8; return word + (coda && !isRieul ? '으로' : '로'); } return word + (coda ? p[0] : p[1]); }
module.exports = { josa };
