// 4권下 실례 정답표(스캔 48~193, 이번 판독분) → 엔진 배치 대조
// 사용: node docs/eval_vol4ha_scan.js
const fs = require('fs'), path = require('path');
const { analyzeAll } = require('../chapgyeong-master.js');
const H = { 甲:'갑',乙:'을',丙:'병',丁:'정',戊:'무',己:'기',庚:'경',辛:'신',壬:'임',癸:'계',
            子:'자',丑:'축',寅:'인',卯:'묘',辰:'진',巳:'사',午:'오',未:'미',申:'신',酉:'유',戌:'술',亥:'해' };
const hg = p => p.split('').map(c => H[c] || c).join('');
const S = a => ({yStem:a[0][0],yBranch:a[0][1],mStem:a[1][0],mBranch:a[1][1],dStem:a[2][0],dBranch:a[2][1],tStem:a[3][0],tBranch:a[3][1]});

const all = JSON.parse(fs.readFileSync(path.join(__dirname,'vol4ha_silrye_scan_ALL.json'),'utf8')).silrye;
// 스캔 번호 매핑: 파일명 범위·page로 추정 — 기존 정답표(스캔≤47)와 겹치는 원문쪽 ≤103 제외
const old = JSON.parse(fs.readFileSync(path.join(__dirname,'vol4_silrye_scan.json'),'utf8'));
const oldKeys = new Set(old.map(x => (x.기둥||[]).join('')));
const fresh = all.filter(x => x.conf !== 'C').filter(x => !oldKeys.has(x.myeongjo.map(hg).join('')));

// 저자 격명에서 핵심 격 키워드 추출(주격 비교용)
const KEY = ['육음조양','시묘','육갑추건','형합','육임추간','합록','전재','자요사','축요사','비천록마','도충','공록','공귀','협구','협축재','전록','일귀','일덕','괴강','임기룡배','재관쌍미','곡직','염상','가색','종혁','윤하','정란차','현무당권','구진득위','복덕','종재','종살','종아','종강','종기','종왕','상관용인','상관용재','인수용관','인수용재','정관','편재','식신','인수','상관','시상일위'];
const chapKey = c => (c.match(/六陰朝陽|時墓|六甲趨乾|刑合|六壬趨艮|合祿|專財|子遙巳|丑遙巳|飛天祿馬|拱祿拱貴|夾丘拱財|專祿|日貴|日德|魁罡|壬騎龍背|財官雙美|曲直|炎上|稼穡|從革|潤下|井欄叉|玄武當權|句陳得位|福德|棄命從財/)||[''])[0];
const CH2KO = {六陰朝陽:'육음조양',時墓:'시묘',六甲趨乾:'육갑추건',刑合:'형합',六壬趨艮:'육임추간',合祿:'합록',專財:'전재',子遙巳:'자요사',丑遙巳:'축요사',飛天祿馬:'비천록마',拱祿拱貴:'공록',夾丘拱財:'협축재',專祿:'전록',日貴:'일귀',日德:'일덕',魁罡:'괴강',壬騎龍背:'임기룡배',財官雙美:'재관쌍미',曲直:'곡직',炎上:'염상',稼穡:'가색',從革:'종혁',潤下:'윤하',井欄叉:'정란차',玄武當權:'현무당권',句陳得位:'구진득위',福德:'복덕',棄命從財:'종재'};
// 저자가 별격(정격)으로 추심했는지 — 파격/별격/정격 키워드
const isByeolgyeok = g => /파격|別格|별격|정격|正格|추심|불성|不成|失格|破格|從(財|殺|兒|氣|旺)|종(재|살|아|기|왕|강)|傷官用|상관용|印綬用|인수용|用官|用財|用印|용관|용재|용인|一位貴|化格|화격|假傷官|가상관/.test(g);

const rows = [], stat = { n:0, detect:0, primary:0, byeol:0, byeolOk:0, err:0 };
const byChap = {};
for (const x of fresh) {
  const ko = x.myeongjo.map(hg); const ch = CH2KO[chapKey(x.chapter)] || '';
  const sex = /坤命|여명|婦|夫人|女|妓|婢|비구니|尼/.test(x.label + x.gyeok_wonmun) ? '여' : '남';
  let r; try { r = analyzeAll(S(ko), sex); } catch (e) { stat.err++; rows.push({ id:x.id, err:e.message }); continue; }
  stat.n++;
  const spNames = (r.vol4ha||[]).map(v => (v.격국명||v.격||'') + (v.파격?'(파)':'') + (v.성격===false?'(불성)':''));
  const detected = (r.vol4ha||[]).some(v => v.성격!==false && ((v.격국명||v.격||'').includes(ch) || (ch==='종재' && /종재/.test(v.격국명||v.격||'')) || (ch==='공록' && /공(록|귀)/.test(v.격국명||v.격||'')) || (ch==='비천록마' && /(비천|도충)/.test(v.격국명||v.격||''))));
  const author = x.gyeok_wonmun; const byeol = isByeolgyeok(author) && !/^(六陰朝陽格|시묘|刑合眞格|純粹|순수)/.test(author) && /(별격|別格|파격|破格|不成|불성|→|정격|正格|失格|從|종재|종살|종아|종기|종강|化格|화격|假傷官|가상관|用[財官印刦]|용[재관인겁]|一位貴|時上一位)/.test(author);
  const pri = r.주격 && r.주격.격 || ''; const ref = (r.주격 && r.주격.참고특수격 || []).join(',');
  // 주격 판정: 저자가 특수격 그대로면 엔진 주격에 그 특수격 이름 포함이 정답; 저자가 별격이면 엔진 주격이 특수격 아닌 것(정격/종격/파격표시)이 정답
  let priOk;
  if (!byeol && /재관쌍미|일덕|일귀|전록|괴강/.test(ch) && ref.includes(ch) && !/파격/.test(ref)) priOk = true; // 참고격은 참고란 표기면 일치로 봄
  else if (!byeol) priOk = pri.includes(ch) || (ch==='공록' && /공(록|귀)/.test(pri)) || (ch==='비천록마' && /(비천|도충)/.test(pri)) || (ch==='종재' && /종재/.test(pri));
  else { const mentionsSp = pri.includes(ch) && !/파|불성/.test(pri); priOk = !mentionsSp; }
  if (detected) stat.detect++; if (priOk) stat.primary++; if (byeol) { stat.byeol++; if (priOk) stat.byeolOk++; }
  byChap[ch] = byChap[ch] || { n:0, det:0, pri:0 }; byChap[ch].n++; if (detected) byChap[ch].det++; if (priOk) byChap[ch].pri++;
  rows.push({ id:x.id, 기둥:ko.join(' '), 저자:author.slice(0,60), 별격:byeol?'Y':'', 엔진특수격:spNames.join(','), 엔진주격:pri, 검출:detected?'O':'X', 주격:priOk?'O':'X', 용신:(r.용신&&r.용신.용신오행)||'' });
}
console.log(`대상 ${fresh.length}건(신규·conf A/B) / 분석 ${stat.n} 오류 ${stat.err}`);
console.log(`특수격 검출 ${stat.detect}/${stat.n} (${(100*stat.detect/stat.n).toFixed(0)}%)  주격 일치 ${stat.primary}/${stat.n} (${(100*stat.primary/stat.n).toFixed(0)}%)  저자 별격추심 ${stat.byeol}건 중 엔진도 비특수격 주격 ${stat.byeolOk}`);
console.log('\n격별:'); for (const [k,v] of Object.entries(byChap)) console.log(`  ${k||'?'}: n=${v.n} 검출 ${v.det} 주격 ${v.pri}`);
console.log('\n불일치 목록:');
for (const w of rows.filter(r=>r.err || r.검출==='X' || r.주격==='X')) console.log(JSON.stringify(w, null, 0));
fs.writeFileSync(path.join(__dirname,'eval_vol4ha_scan_result.json'), JSON.stringify({ stat, byChap, rows }, null, 1));
