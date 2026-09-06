// 4권下 정답표에서 저자 신강약 라벨을 뽑아 판정법을 비교한다 (월령법 / 세력법 / 가중세력법)
const fs = require('fs'), path = require('path');
const T = require('../chapgyeong-vol1-tables.js'), B = require('../chapgyeong-vol1-basics.js'), Y = require('../chapgyeong-vol1-yukchin.js');
const H = { 甲:'갑',乙:'을',丙:'병',丁:'정',戊:'무',己:'기',庚:'경',辛:'신',壬:'임',癸:'계', 子:'자',丑:'축',寅:'인',卯:'묘',辰:'진',巳:'사',午:'오',未:'미',申:'신',酉:'유',戌:'술',亥:'해' };
const hg = p => p.split('').map(c => H[c] || c).join('');
const S = a => ({yStem:a[0][0],yBranch:a[0][1],mStem:a[1][0],mBranch:a[1][1],dStem:a[2][0],dBranch:a[2][1],tStem:a[3][0],tBranch:a[3][1]});
const SAENG={목:'화',화:'토',토:'금',금:'수',수:'목'},GEUK={목:'토',화:'금',토:'수',금:'목',수:'화'},GEUKBY={목:'금',화:'수',토:'목',금:'화',수:'토'},INSU={목:'수',화:'목',토:'화',금:'토',수:'금'};

function authorStrength(x) {
  const t = (x.gyeok_wonmun||'') + ' ' + (x.gugyeol||'') + ' ' + (x.note||'');
  const strong = /身旺|身强|신왕|신강|變弱爲强|변약위강|身自旺|旺格|身主 高强|身元强|身勝|得勢|身 得勢|身旺格|身旺財旺/.test(t);
  const weak = /身弱|신약|身主 甚弱|身柱弱|衰弱|羸弱|身主 弱|身弱格|재다신약|財多身弱|無依/.test(t);
  if (strong && !weak) return '강'; if (weak && !strong) return '약';
  if (strong && weak) { // 「신약이나 …변약위강」 → 강, 「신왕이나 …신약」 순서로 마지막 언급 우선
    const iS = Math.max(t.search(/身旺|신왕|신강|變弱爲强|변약위강|得勢/), 0), iW = Math.max(t.search(/身弱|신약|衰弱|羸弱|財多身弱/), 0);
    return /變弱爲强|변약위강/.test(t) ? '강' : (iS > iW ? '강' : '약');
  }
  return null;
}
// 판정법들
function byWol(s) { return Y.isSinWang(Y.getWangSangHyuSuSa(s.dStem, s.mBranch)) ? '강' : '약'; }
function counts(s) {
  const o = T.STEM_OHAENG[s.dStem], brs=[s.yBranch,s.mBranch,s.dBranch,s.tBranch], st=[s.yStem,s.mStem,s.tStem];
  const cb=x=>brs.filter(b=>T.BRANCH_OHAENG[b]===x).length, cs=x=>st.filter(z=>T.STEM_OHAENG[z]===x).length;
  return { o, brs, st, cb, cs, c: x => cb(x)+cs(x) };
}
function bySeryeok(s) { const {o,c}=counts(s); const 몸=c(o)+c(INSU[o])+1, 밖=c(SAENG[o])+c(GEUK[o])+c(GEUKBY[o]); return 몸>밖?'강':몸<밖?'약':byWol(s); }
// 가중 세력법: 월지 ×W, 일지 ×D, 천간 ×1, 나머지 지지 ×1, 삼합·방합국 보너스 +G, 지장간(중기) 0.5
function byWeighted(s, W=2, D=1.5, G=1, J=0.5) {
  const {o,brs,st}=counts(s); const side = x => x===o||x===INSU[o] ? 1 : [SAENG[o],GEUK[o],GEUKBY[o]].includes(x) ? -1 : 0;
  let sc = 1; // 일간 자신
  brs.forEach((b,i)=>{ const w = i===1?W:i===2?D:1; sc += side(T.BRANCH_OHAENG[b])*w; (T.JIJANGGAN[b]||[]).slice(0,-1).forEach(g=>{ sc += side(T.STEM_OHAENG[g])*J; }); });
  st.forEach(z=> sc += side(T.STEM_OHAENG[z]));
  const guk=[...B.checkSamhap(brs),...B.checkBanghap(brs)].map(g=>g.ohaeng); guk.forEach(g=> sc += side(g)*G);
  return sc > 0 ? '강' : '약';
}
const all = JSON.parse(fs.readFileSync(path.join(__dirname,'vol4ha_silrye_scan_ALL.json'),'utf8')).silrye.filter(x=>x.conf!=='C');
const labeled = all.map(x=>({x, lab: authorStrength(x), s: S(x.myeongjo.map(hg))})).filter(v=>v.lab);
console.log(`저자 신강약 라벨 ${labeled.length}건 (강 ${labeled.filter(v=>v.lab==='강').length} / 약 ${labeled.filter(v=>v.lab==='약').length})`);
const score = fn => labeled.filter(v=>fn(v.s)===v.lab).length;
console.log(`월령법(왕상=강): ${score(byWol)}/${labeled.length}`);
console.log(`세력법(v27 글자수): ${score(bySeryeok)}/${labeled.length}`);
const grid=[]; for (const W of [1,1.5,2,2.5,3]) for (const D of [1,1.5,2]) for (const G of [0,1,2]) for (const J of [0,0.5]) grid.push({W,D,G,J,hit:score(s=>byWeighted(s,W,D,G,J))});
grid.sort((a,b)=>b.hit-a.hit); console.log('가중세력법 상위:'); grid.slice(0,8).forEach(g=>console.log('  ',JSON.stringify(g)));
const best=grid[0];
console.log('\n최적 가중치 불일치:'); for (const v of labeled) { const p=byWeighted(v.s,best.W,best.D,best.G,best.J); if (p!==v.lab) console.log(v.x.id, v.x.myeongjo.join(''), '저자',v.lab,'엔진',p, '|', (v.x.gyeok_wonmun||'').slice(0,50)); }
fs.writeFileSync(path.join(__dirname,'eval_vol4ha_strength.json'), JSON.stringify({ n: labeled.length, wol: score(byWol), seryeok: score(bySeryeok), grid: grid.slice(0,20), labels: labeled.map(v=>({id:v.x.id, 기둥:v.x.myeongjo.map(hg).join(' '), 저자:v.lab})) }, null, 1));
