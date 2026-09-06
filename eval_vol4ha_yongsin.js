// 4권下 정답표 210건에서 저자 용신(오행)을 추출해 엔진 용신과 대조
// node docs/eval_vol4ha_yongsin.js [--v27]
const fs = require('fs'), path = require('path');
const { analyzeAll } = require('../chapgyeong-master.js');
const H = { 甲:'갑',乙:'을',丙:'병',丁:'정',戊:'무',己:'기',庚:'경',辛:'신',壬:'임',癸:'계', 子:'자',丑:'축',寅:'인',卯:'묘',辰:'진',巳:'사',午:'오',未:'미',申:'신',酉:'유',戌:'술',亥:'해' };
const hg = p => p.split('').map(c => H[c] || c).join('');
const S = a => ({yStem:a[0][0],yBranch:a[0][1],mStem:a[1][0],mBranch:a[1][1],dStem:a[2][0],dBranch:a[2][1],tStem:a[3][0],tBranch:a[3][1]});
const OH = { 갑:'목',을:'목',병:'화',정:'화',무:'토',기:'토',경:'금',신:'금',임:'수',계:'수' };
const GEUK = { 목:'토', 화:'금', 토:'수', 금:'목', 수:'화' }, SAENG = { 목:'화', 화:'토', 토:'금', 금:'수', 수:'목' };
const INSU = { 목:'수', 화:'목', 토:'화', 금:'토', 수:'금' }, GWAN = { 목:'금', 화:'수', 토:'목', 금:'화', 수:'토' };
const CH_OH = { 木:'목', 火:'화', 土:'토', 金:'금', 水:'수' };

// 저자 용신 추출: 문장 안의 명시 표현을 우선순위로 해석. 반환 { 오행, 근거 } 또는 null(추출 불가)
function authorYongsin(x, ilOh) {
  const t = (x.gyeok_wonmun || '') + ' | ' + (x.gugyeol || '') + ' | ' + (x.note || '');
  const R = (oh, why) => oh ? { 오행: oh, 근거: why } : null;
  // ① 종격
  if (/종재|從財/.test(t) && !/從財 불가|從財 못|不從財|從 불가/.test(t)) return R(GEUK[ilOh], '종재');
  if (/종살|從殺/.test(t) && !/不從|從 안/.test(t)) return R(GWAN[ilOh], '종살');
  if (/종아|從兒|從 金氣\(從兒\)|從金\(從兒\)/.test(t)) return R(SAENG[ilOh], '종아');
  if (/종강|從强|從旺|종왕/.test(t)) return R(INSU[ilOh], '종강');
  // ② 명시 오행 용신 「用X」「X 用」「X用神」「用神 X」
  const m1 = t.match(/用神[은는이가]?\s*([木火土金水])/) || t.match(/([木火土金水])[가이을를]?\s*用神/) || t.match(/用\s?([木火土金水])(?![局])/) || t.match(/([木火土金水])\s?(?:用|爲用|을 用|로 用|用神)/);
  if (m1) return R(CH_OH[m1[1]], '명시 오행 ' + m1[0]);
  // ③ 십성 용신
  if (/用印|용인|用神.{0,6}印|印綬 用|印 用|印綬\)? 用神|印綬로 용|用 印|印綬 專用|專印/.test(t)) return R(INSU[ilOh], '용인');
  if (/用官|용관|官 用|正官用|以官爲用|官을 用|官 用神|용관격/.test(t)) return R(GWAN[ilOh], '용관');
  if (/用財|용재|財 用|財를 用|財 用神|生財格|생재|用財格|用 財/.test(t)) return R(GEUK[ilOh], '용재');
  if (/用刦|용겁|用比|비겁 용|比刦 용|비겁으로/.test(t)) return R(ilOh, '용겁');
  if (/假傷官|가상관|傷官 用|食神 用|洩精|洩秀|泄精|泄秀|洩氣.{0,4}用|食神制殺|상관 洩|설기 用|洩精 用|好洩/.test(t)) return R(SAENG[ilOh], '설기(식상)');
  // ④ 구결 내 「X火 用」류 한자 단문
  const m2 = t.match(/([丙丁甲乙戊己庚辛壬癸])[火木土金水]?\s?(?:用|爲用神|用神)/);
  if (m2) return R(OH[H[m2[1]]], '천간 명시 ' + m2[0]);
  return null;
}

const all = JSON.parse(fs.readFileSync(path.join(__dirname, 'vol4ha_silrye_scan_ALL.json'), 'utf8')).silrye.filter(x => x.conf !== 'C');
const useV27 = process.argv.includes('--v27');
const rows = [], stat = { n: 0, hit: 0, byRoute: {} }, byChap = {};
for (const x of all) {
  const ko = x.myeongjo.map(hg), ilOh = OH[ko[2][0]];
  const au = authorYongsin(x, ilOh); if (!au) continue;
  const sex = /坤命|여명|婦|夫人|女|妓|婢|尼/.test(x.label + x.gyeok_wonmun) ? '여' : '남';
  let r; try { r = analyzeAll(S(ko), sex, useV27 ? { yongsinV27: true } : {}); } catch (e) { continue; }
  const eng = r.용신 && r.용신.용신오행, route = ((r.용신 && r.용신.근거) || '').split(/[—(:]/)[0].slice(0, 14);
  const hit = eng === au.오행; stat.n++; if (hit) stat.hit++;
  stat.byRoute[route] = stat.byRoute[route] || { n: 0, hit: 0 }; stat.byRoute[route].n++; if (hit) stat.byRoute[route].hit++;
  const ch = x.id.split('-')[0]; byChap[ch] = byChap[ch] || { n: 0, hit: 0 }; byChap[ch].n++; if (hit) byChap[ch].hit++;
  rows.push({ id: x.id, 기둥: ko.join(' '), 저자용신: au.오행, 저자근거: au.근거, 엔진: eng, 엔진근거: route, 주격: r.주격 && r.주격.격, 일치: hit ? 'O' : 'X' });
}
console.log(`${useV27 ? '[v27]' : '[기본]'} 저자 용신 추출 ${stat.n}/${all.length}건 → 엔진 일치 ${stat.hit}/${stat.n} (${(100 * stat.hit / stat.n).toFixed(0)}%)`);
console.log('엔진 경로별:'); for (const [k, v] of Object.entries(stat.byRoute).sort((a, b) => b[1].n - a[1].n)) console.log(`  ${k.padEnd(14)} ${v.hit}/${v.n}`);
console.log('격별:'); for (const [k, v] of Object.entries(byChap)) console.log(`  ${k}: ${v.hit}/${v.n}`);
console.log('\n불일치:'); for (const w of rows.filter(r => r.일치 === 'X')) console.log(JSON.stringify(w));
fs.writeFileSync(path.join(__dirname, `eval_vol4ha_yongsin_${useV27 ? 'v27' : 'base'}.json`), JSON.stringify({ stat, byChap, rows }, null, 1));
