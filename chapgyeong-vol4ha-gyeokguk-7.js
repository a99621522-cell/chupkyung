// ============================================================
// chapgyeong-vol4ha-gyeokguk-7.js — [128차] 4권下 정답표(210건) 기준 조율판
// 원칙(원문 실례 대조 결과):
//  ① 성립(成格)은 "구성표 형식"만으로 판정한다 — 저자는 忌物이 있어도 격 이름을 유지하고
//     「不眞·파격 → 별격 추심」으로 쓴다(합록-라, 일덕 전례, 비천-사 등)
//  ② 忌物·전실·절합·충파는 파격:true 플래그로만 남기고, 주격 선택에서 제외한다
//  ③ 전실(填實)은 지지에 있을 때만 파격, 천간만이면 "無根失時면 무해"(비천-사) → 약전실 표시
// 대상: 합록·전재·비천록마·공록공귀·협축재·전록·일귀·일덕·괴강·임기룡배·재관쌍미·복덕·전왕5·자요사·축요사
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const B = require('./chapgyeong-vol1-basics.js');
const Y = require('./chapgyeong-vol1-yukchin.js');

const OH = s => T.STEM_OHAENG[s] || T.BRANCH_OHAENG[s];
const GWAN = { 목:'금', 화:'수', 토:'목', 금:'화', 수:'토' };  // 일간 오행을 극하는 오행(관살)
const JAE  = { 목:'토', 화:'금', 토:'수', 금:'목', 수:'화' };
const CHUNG = { 자:'오', 오:'자', 축:'미', 미:'축', 인:'신', 신:'인', 묘:'유', 유:'묘', 진:'술', 술:'진', 사:'해', 해:'사' };
const YUKHAP = { 자:'축', 축:'자', 인:'해', 해:'인', 묘:'술', 술:'묘', 진:'유', 유:'진', 사:'신', 신:'사', 오:'미', 미:'오' };
const br4 = s => [s.yBranch, s.mBranch, s.dBranch, s.tBranch];
const st3 = s => [s.yStem, s.mStem, s.tStem];
const mk = (격국명, extra = {}) => ({ 성격: true, 격국명, 파격: !!(extra.파격사유 && extra.파격사유.length), ...extra });
const cnt = (arr, x) => arr.filter(v => v === x).length;
// 전실 강도: 지지에 있으면 '강', 천간만 있으면 '약'(無根失時 무해), 없으면 null
function jeonsil(saju, oh) {
  const inBr = br4(saju).some(b => OH(b) === oh), inSt = st3(saju).some(s => OH(s) === oh);
  return inBr ? '강' : inSt ? '약' : null;
}

// ---------- 第二十二 합록격: 戊日/癸日 + 庚申時 ----------
function checkHaprok(saju) {
  if (!['무', '계'].includes(saju.dStem) || saju.tStem + saju.tBranch !== '경신') return { 성격: false };
  const isMu = saju.dStem === '무', brs = br4(saju), sts = st3(saju), 파격사유 = [];
  const gi = isMu ? { st: ['갑', '병', '을'], br: ['묘', '인'] } : { st: ['무', '기', '병', '경'], br: ['사'] };
  const hitSt = sts.filter(s => gi.st.includes(s)), hitBr = brs.filter(b => gi.br.includes(b));
  if (hitBr.length) 파격사유.push(`忌 지지 ${hitBr.join('')}(전실·합거)`);
  if (hitSt.length) 파격사유.push(`忌 천간 ${hitSt.join('')}(비진)`);
  const summer = ['사', '오', '미'].includes(saju.mBranch);
  return mk('합록격', { 파격사유, 진격: !파격사유.length && !summer, 특기사항: [summer ? '夏月生 — 不眞(秋冬 喜)' : '秋冬 喜', isMu ? '경신시가 묘중 을목(정관) 암합' : '경신시가 사중 무토(정관) 암합'] });
}

// ---------- 第二十三 전재격: 시지 재 (원문 117쪽 구성표) ----------
const JEONJAE_SI = { 갑: '진술축미사', 을: '진술축미사', 병: '신유', 정: '신유', 무: '해자', 기: '해자', 경: '인묘', 신: '인묘', 임: '사오', 계: '사오' };
function checkJeonjae(saju) {
  const t = JEONJAE_SI[saju.dStem]; if (!t || !t.includes(saju.tBranch)) return { 성격: false };
  const wshss = Y.getWangSangHyuSuSa(saju.dStem, saju.mBranch), sinwang = Y.isSinWang(wshss);
  const jaeOh = JAE[OH(saju.dStem)], jaeN = br4(saju).filter(b => OH(b) === jaeOh).length + st3(saju).filter(s => OH(s) === jaeOh).length;
  const bigyeop = br4(saju).filter(b => OH(b) === OH(saju.dStem)).length + st3(saju).filter(s => OH(s) === OH(saju.dStem)).length;
  const 파격사유 = []; if (!sinwang && jaeN >= 3) 파격사유.push('재다신약(不能任財)');
  return mk('전재격', { 파격사유, 특기사항: [sinwang ? '신왕 — 富格' : '신약 — 비겁·인수운 喜', bigyeop >= 2 && sinwang ? '비겁 多 — 군겁쟁재 주의' : null].filter(Boolean) });
}

// ---------- 第二十六 비천록마/도충록마 ----------
const BICHEON = [ // 忌 목록은 원문 166쪽 희기표 그대로(일주별)
  { ilju: ['임자'], jb: ['자'], target: '오', giBr: ['오', '술', '축'], giSt: ['기'], name: '비천록마격' },
  { ilju: ['경자'], jb: ['자'], target: '오', giBr: ['오', '축'], giSt: ['병', '정'], name: '비천록마격' },
  { ilju: ['신해'], jb: ['해'], target: '사', giBr: ['사', '술'], giSt: ['병', '정'], name: '비천록마격' },
  { ilju: ['계해'], jb: ['해'], target: '사', giBr: ['사', '술'], giSt: ['무', '기'], name: '비천록마격' },
  { ilju: ['병오'], jb: ['오'], target: '자', giBr: ['자', '미'], giSt: [], name: '비천록마격(도충록마격)' },
  { ilju: ['정사', '정미'], jb: ['사'], target: '해', giBr: ['해', '진', '신'], giSt: [], name: '비천록마격(도충록마격)' }, // 丁未日도 巳多면 성립(원문 172쪽 例카)
];
function checkBicheonRokma(saju) {
  const ilju = saju.dStem + saju.dBranch, brs = br4(saju), sts = st3(saju);
  for (const d of BICHEON) {
    if (!d.ilju.includes(ilju)) continue;
    const n = brs.filter(b => d.jb.includes(b)).length; if (n < 2) continue;
    const 파격사유 = [], gwOh = GWAN[OH(saju.dStem)];
    const hb = brs.filter(b => d.giBr.includes(b)); if (hb.length) 파격사유.push(`忌 지지 ${hb.join('')}(${hb.includes(d.target) ? '沖宮 전실' : '절합·지망'})`);
    // 천간 忌(관성) — 지장간에 뿌리 있으면 전실(계축무오병오임진 거관유살), 無根失時면 무해(비천-사 병자정유경자병자)
    const hs = sts.filter(x => d.giSt.includes(x) || OH(x) === gwOh); // 표의 忌 천간 + 일반 관성 천간
    if (hs.length) { const rooted = brs.some(b => (T.JIJANGGAN[b] || []).some(g => OH(g) === gwOh)); if (rooted) 파격사유.push(`천간 官 ${hs.join('')} 有根 — 전실`); }
    const wshss = Y.getWangSangHyuSuSa(saju.dStem, saju.mBranch);
    return mk(d.name, { 파격사유, 특기사항: [`${d.jb[0]} ${n}개 → ${d.target} 沖出`, hs.length && !파격사유.some(x => /천간 官/.test(x)) ? `천간 ${hs.join('')} 있으나 無根失時 — 무해(원문 170쇄)` : null, !Y.isSinWang(wshss) ? '신약 — 재관 감당 주의' : null].filter(Boolean) });
  }
  return { 성격: false };
}

// ---------- 第二十七 공록·공귀 (원문 180쪽 구성표) ----------
const GONGROK = { 계해계축: '자', 계축계해: '자', 정사정미: '오', 기미기사: '오', 무진무오: '사' };
const GONGGWI = { 갑신갑술: '유', 무신무오: '미', 갑인갑자: '축', 을미을유: '신', 신축신묘: '인', 임진임인: '묘' }; // 壬辰壬寅은 저자 논변으로 인정(185쪽)
function checkGongrokGonggwi(saju) {
  const key = saju.dStem + saju.dBranch + saju.tStem + saju.tBranch, brs = br4(saju);
  const rok = GONGROK[key], gwi = GONGGWI[key]; if (!rok && !gwi) return { 성격: false };
  const gong = rok || gwi, 파격사유 = [];
  if (brs.includes(gong)) 파격사유.push(`拱 ${gong} 전실`);
  if (brs.includes(CHUNG[saju.dBranch]) || brs.includes(CHUNG[saju.tBranch])) 파격사유.push('일·시지 沖(拱 파괴)');
  const gwOh = GWAN[OH(saju.dStem)];
  if (rok && jeonsil(saju, gwOh) === '강') 파격사유.push('七殺(官) 지지 노출');
  return mk(rok ? '공록격' : '공귀격', { 협공지지: gong, 파격사유, 특기사항: ['月令 有用이면 정격 우선(원문 181쇄 시결)'] });
}

// ---------- 第二十八 협축재 ----------
const HYEOPCHUK = { 계유계해: ['술', '정'], 갑인갑자: ['축', '기'], 기묘기사: ['진', '계'], 경오갑신: ['미', '을'] };
function checkHyeopchukJae(saju) {
  const key = saju.dStem + saju.dBranch + saju.tStem + saju.tBranch, d = HYEOPCHUK[key]; if (!d) return { 성격: false };
  const brs = br4(saju), 파격사유 = [];
  if (brs.includes(d[0])) 파격사유.push(`拱 ${d[0]} 전실`);
  if (brs.includes(CHUNG[saju.dBranch]) || brs.includes(CHUNG[saju.tBranch])) 파격사유.push('일·시지 沖(협공 파괴)');
  return mk('협축재격', { 협공지지: d[0], 파격사유, 특기사항: [`${d[0]}中 ${d[1]} 재 협공`] });
}

// ---------- 第二十九 전록 (관살은 파격 플래그로) ----------
function checkJeonrok(saju) {
  if (!['갑인', '을묘', '경신', '신유'].includes(saju.dStem + saju.dBranch)) return { 성격: false };
  const gwOh = GWAN[OH(saju.dStem)], js = jeonsil(saju, gwOh), 파격사유 = [];
  if (js) 파격사유.push(`官殺 ${gwOh} 존재(${js}) — 신왕 有根이면 用官 가능(민기식 예)`);
  return mk('전록격', { 파격사유, 특기사항: [js ? '관살 있어 순수 종왕 아님 — 별격(용관·상관용재 등) 추심' : '관살 없음 — 종왕 순수'] });
}

// ---------- 第三十 일귀: 丁酉·丁亥·癸卯·癸巳 (원문 224쪽) ----------
function checkIlgwi(saju) {
  if (!['정유', '정해', '계묘', '계사'].includes(saju.dStem + saju.dBranch)) return { 성격: false };
  const brs = br4(saju), 파격사유 = [];
  const chung = brs.includes(CHUNG[saju.dBranch]), hap = brs.includes(YUKHAP[saju.dBranch]) ;
  if (chung && !hap) 파격사유.push('일지 沖(合으로 해소 안 됨)');
  if (brs.some(b => ['진', '술'].includes(b))) 파격사유.push('魁罡(辰戌) 동림');
  return mk('일귀격(일좌천을귀인)', { 파격사유, 특기사항: [chung && hap ? '沖 있으나 合으로 해소' : null, '神殺적 참고격 — 격국용신 판정 뒤 부수(원문 222쪽)'].filter(Boolean) });
}

// ---------- 第三十一 일덕: 甲寅·丙辰·戊辰·庚辰·壬戌 ----------
function checkIldeok(saju, sex) {
  const ilju = saju.dStem + saju.dBranch; if (!['갑인', '병진', '무진', '경진', '임술'].includes(ilju)) return { 성격: false };
  const brs = br4(saju), 파격사유 = [], oh = OH(saju.dStem);
  const jaeGwan = [...st3(saju), ...brs].filter(x => [JAE[oh], GWAN[oh]].includes(OH(x)));
  if (jaeGwan.length) 파격사유.push(`財官 ${jaeGwan.join('')} 加臨 — 不眞(별격 추심)`);
  const rel = B.checkBranchRelations(brs);
  if (rel.형.length || rel.충.some(f => f.includes(saju.dBranch))) 파격사유.push('刑沖');
  return mk('일덕격', { 파격사유, 특기사항: [sex === '여' && ilju === '임술' ? '여명 壬戌 — 괴강 겸, 남편덕 부족' : null, '성정 溫柔慈善·技術工業界 多(원문 233쪽)'].filter(Boolean) });
}

// ---------- 第三十二 괴강: 庚辰·庚戌·壬辰·壬戌 (戊辰·戊戌 제외, 원문 246쪽) ----------
function checkGoegang(saju, sex) {
  const GG = ['경진', '경술', '임진', '임술'], ilju = saju.dStem + saju.dBranch; if (!GG.includes(ilju)) return { 성격: false };
  const gz = [saju.yStem + saju.yBranch, saju.mStem + saju.mBranch, ilju, saju.tStem + saju.tBranch];
  const n = gz.filter(x => GG.includes(x)).length, brs = br4(saju), oh = OH(saju.dStem), 파격사유 = [];
  const jaeGwan = [...st3(saju), ...brs].filter(x => [JAE[oh], GWAN[oh]].includes(OH(x)));
  if (jaeGwan.length >= 2) 파격사유.push(`財官 出現(${jaeGwan.join('')})`);
  if (brs.includes(CHUNG[saju.dBranch])) 파격사유.push('일지 相沖');
  const wshss = Y.getWangSangHyuSuSa(saju.dStem, saju.mBranch), sinwang = Y.isSinWang(wshss);
  if (!sinwang && jaeGwan.length) 파격사유.push('身弱 魁罡 — 奇禍非輕');
  return mk('괴강격', { 파격사유, 중첩: n, 특기사항: [n >= 2 ? `괴강 ${n}중첩 — 疊疊相逢 大權` : '단일 괴강', sex === '여' ? '여명 — 夫婦偕老 難(원문 256쪽 經驗)' : null].filter(Boolean) });
}

// ---------- 第三十三 임기룡배: 壬辰日 + 辰多(貴) / 寅多(富) ----------
function checkImgiyongbae(saju) {
  if (saju.dStem + saju.dBranch !== '임진') return { 성격: false };
  const brs = br4(saju), jin = cnt(brs, '진'), in_ = cnt(brs, '인');
  if (jin < 2 && in_ < 2) return { 성격: false };
  const 파격사유 = []; let 특기사항 = [];
  if (brs.includes('술')) 파격사유.push('戌 전실(沖宮)');
  // 戊土 官 투출: 자좌가 土·火면 유근 → 파격(무진경신임진임인 夫戰死), 木·金·水 좌면 洩·剋 무력(무인경신임진임인 부귀)
  const gz = [[saju.yStem, saju.yBranch], [saju.mStem, saju.mBranch], [saju.tStem, saju.tBranch]];
  const muRoot = gz.filter(([st, b]) => st === '무' && ['토', '화'].includes(OH(b)));
  const muWeak = gz.filter(([st, b]) => st === '무' && !['토', '화'].includes(OH(b)));
  if (muRoot.length) 파격사유.push(`戊土 官 透出 有根(${muRoot.map(x=>x.join('')).join('')}) — 「見戊無情」`);
  if (muWeak.length) 특기사항 = [`戊 透出이나 자좌 무근(${muWeak.map(x=>x.join('')).join('')}) — 洩受剋 무력`];
  return mk('임기룡배격', { 파격사유, 진개수: jin, 인개수: in_, 특기사항: [...특기사항, jin >= 2 ? '辰多 — 貴格' : null, in_ >= 2 ? '寅多 — 富格' : null, '여명은 괴강일이라 대체 불미(원문 268쪽)'].filter(Boolean) });
}

// ---------- 第三十四 재관쌍미: 癸巳日·壬午日 ----------
function checkJaegwanSsangmi(saju) {
  const ilju = saju.dStem + saju.dBranch; if (!['계사', '임오'].includes(ilju)) return { 성격: false };
  const 파격사유 = [], sal = ilju === '계사' ? '기' : '무';
  if (st3(saju).includes(sal)) 파격사유.push(`干頭 七殺 ${sal} 帶同`);
  const brs = br4(saju); if (brs.includes(CHUNG[saju.dBranch])) 파격사유.push('일지 沖');
  const spring = ['인', '묘', '사', '오', '미'].includes(saju.mBranch);
  return mk('재관쌍미격', { 파격사유, 특기사항: [spring ? '春夏月 — 不宜(傷官 洩氣·財官 過旺)' : '秋冬月 — 宜(通源)', '용신은 별도(용인·용겁·종살 등 다갈래)'] });
}

// ---------- 第四十三 복덕: 陰日干 + 巳酉丑 全 ----------
function checkBokdeok(saju) {
  if (!['을', '정', '기', '신', '계'].includes(saju.dStem)) return { 성격: false };
  const brs = br4(saju); if (!['사', '유', '축'].every(b => brs.includes(b))) return { 성격: false };
  const 파격사유 = []; if (saju.dStem === '정' && jeonsil(saju, '수') === '강') 파격사유.push('丁日 官殺(水) 旺');
  return mk('복덕격(복덕수기격)', { 파격사유, 특기사항: [saju.dStem === '을' ? '乙日 정례' : `${saju.dStem}日 확대 적용(원문 374~381쪽 실례)`] });
}

// ---------- 오행전왕 5종: 국 성립 + 관살은 파격 플래그 ----------
const JW = {
  목: { 격명: '곡직인수격', 일간: '갑을', 지지: '인묘진해미', 방합: '인묘진', 삼합: '해묘미' },
  화: { 격명: '염상격', 일간: '병정', 지지: '사오미인술', 방합: '사오미', 삼합: '인오술' },
  토: { 격명: '가색격', 일간: '무기', 지지: '진술축미', 방합: null, 삼합: null },
  금: { 격명: '종혁격', 일간: '경신', 지지: '신유술사축', 방합: '신유술', 삼합: '사유축' },
  수: { 격명: '윤하격', 일간: '임계', 지지: '해자축신진', 방합: '해자축', 삼합: '신자진' },
};
function checkOhaengJeonwang(saju) {
  const brs = br4(saju), ilOh = OH(saju.dStem), d = JW[ilOh]; if (!d || !d.일간.includes(saju.dStem)) return { 성격: false };
  const full = x => x && x.split('').every(b => brs.includes(b));
  const nSame = brs.filter(b => OH(b) === ilOh).length;
  let type = full(d.방합) ? '방합' : full(d.삼합) ? '삼합' : (ilOh === '토' ? (brs.filter(b => '진술축미'.includes(b)).length >= 3 ? '진술축미 3자' : null) : (nSame >= 3 ? `${ilOh}지지 3자 이상` : null));
  if (!type) return { 성격: false };
  const gwOh = GWAN[ilOh], js = jeonsil(saju, gwOh), 파격사유 = [];
  if (js === '강') 파격사유.push(`官殺 ${gwOh} 지지 존재 — 순수 아님(별격: 용관·용재·가상관 등)`);
  // 천간 관살은 자좌(自坐)에 뿌리 있으면 파격(신축을미무술경신 乙坐未 제부태과), 자좌 絶이면 무해(유진오 癸坐巳)
  const seated = [[saju.yStem, saju.yBranch], [saju.mStem, saju.mBranch], [saju.tStem, saju.tBranch]].filter(([st, b]) => OH(st) === gwOh && (T.JIJANGGAN[b] || []).some(g => OH(g) === gwOh));
  if (js === '약' && seated.length) 파격사유.push(`官殺 ${seated.map(x=>x.join('')).join('')} 自坐 有根 — 순수 아님`);
  return mk(d.격명, { 오행: ilOh, 국구성: type, 파격사유, 특기사항: [js === '약' ? `官殺 ${gwOh} 천간만 — 忌星 絶이면 무해(유진오 癸)` : null, '전왕은 순수 종왕 아니라 格勢 따라 用財·用傷官으로 變遷 多(원문 288쪽)'].filter(Boolean) });
}

// ---------- 자요사·축요사 파격 플래그 보강 ----------
function checkJayosa(saju) {
  if (saju.dStem + saju.dBranch !== '갑자' || saju.tStem + saju.tBranch !== '갑자') return { 성격: false };
  const brs = br4(saju), 파격사유 = [];
  const js = brs.filter(b => ['신', '유'].includes(b)); if (js.length) 파격사유.push(`官 ${js.join('')} 전실`);
  if (brs.includes('축')) 파격사유.push('丑 絆合'); if (brs.includes('오')) 파격사유.push('午 沖');
  const gs = st3(saju).filter(s => ['경', '신'].includes(s));
  return mk('자요사격', { 파격사유, 특기사항: [gs.length ? `干頭 ${gs.join('')} — 嫩木 官殺損(病, 격은 유지: 자요사-가·나)` : null, '月建 正格 있으면 정격 우선(원문 128쪽)'].filter(Boolean) });
}
function checkChugyosa(saju) {
  if (!['신', '계'].includes(saju.dStem) || saju.dBranch !== '축') return { 성격: false };
  const brs = br4(saju); if (cnt(brs, '축') < 2) return { 성격: false };
  const 파격사유 = []; if (brs.includes('사')) 파격사유.push('巳 전실'); if (brs.includes('자')) 파격사유.push('子 絆合');
  const gi = saju.dStem === '신' ? ['병', '정'] : ['무', '기'], gs = st3(saju).filter(s => gi.includes(s));
  if (gs.length && brs.includes('자')) 파격사유.push(`干頭 官 ${gs.join('')} + 子 절합 겹침`); // 축요사-나: 丁+子 → 破格 / 축요사-가: 丁 only → 성격
  return mk('축요사격', { 파격사유, 축개수: cnt(brs, '축'), 특기사항: gs.length ? [`干頭 官 ${gs.join('')} — 忌物이나 단독이면 격 유지`] : null });
}

module.exports = { checkHaprok, checkJeonjae, checkBicheonRokma, checkGongrokGonggwi, checkHyeopchukJae, checkJeonrok, checkIlgwi, checkIldeok, checkGoegang, checkImgiyongbae, checkJaegwanSsangmi, checkBokdeok, checkOhaengJeonwang, checkJayosa, checkChugyosa };
