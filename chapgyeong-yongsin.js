// ============================================================
// chapgyeong-yongsin.js
// 용신 결정 — 억부법 위에 "명명 특수패턴 고유 용신" 계층을 얹은 구조
//
// [발견4 수정, 이번 회차] 실제 사례 역산(부건파처·신불가과·삼기득위)에서
// 경직된 억부 우선순위(신강→관살>식상>재)가 원문의 실제 용신과 자주
// 어긋남을 확인. 종격 판정 다음, 억부법 적용 전에 "명명된 패턴이
// 검출되면 그 패턴 고유의 용신 규칙을 억부법보다 우선 적용"하는 계층을
// 추가함.
//
// 우선순위: 종격 > 명명 패턴 고유 용신 > 일반 억부법
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const Y = require('./chapgyeong-vol1-yukchin.js');
const G1 = require('./chapgyeong-vol4-gyeokguk.js');

const GEUK = { 목:'토', 화:'금', 토:'수', 금:'목', 수:'화' }; // GEUK[X] = X가 극하는 것
const SAENG = { 목:'화', 화:'토', 토:'금', 금:'수', 수:'목' }; // SAENG[X] = X가 생하는 것

/**
 * 사주의 용신 오행을 판정합니다.
 * @param {object} saju
 * @param {Array} vol4Result, vol4haResult - 종격 확인용
 * @param {Array} vol6Result - 명명 패턴 고유 용신 확인용(선택, 없으면 억부법만 적용)
 * @returns {{ 용신오행: string, 근거: string, 종격여부: boolean }}
 */
function determineYongsinCore(saju, vol4Result, vol4haResult, vol6Result, opt = {}) {
  const ilgan = saju.dStem;
  const ilOh = Y.ohaengOf(ilgan);

  // [정직한 최종 판단] 생화유정 종격 알고리즘을 실전 파이프라인에
  // 연결해봤으나, "음간종세" 조건이 너무 관대해서 정상적인 억부격
  // 사주(정사병오신축갑오, 원래 살인상생으로 정확)까지 종격으로
  // 오판하는 회귀가 재발함(통근 버그를 고쳐도 여전히 발생). 이 알고리즘은
  // 검증된 두 특정 사례(임자을사기해계유·갑술정축을묘임오)에는 완벽하지만
  // 일반화하면 오탐율이 너무 높음 — 안전을 위해 자동 통합은 보류하고
  // chapgyeong-jonggyeok-saenghwa.js에 "검증된 별도 도구"로만 남김.
  // (필요시 수동으로 특정 사주에 한해 개별 확인 용도로 호출할 것)

  // 1. 종격 확인(4권/4권下 격 이름 기반, 기존 방식)
  const allGyeokResults = [...(vol4Result||[]), ...(vol4haResult||[])];
  const jongGyeok = allGyeokResults.find(r => r.격 && r.격.includes('종') &&
    ['종재','종살','종아','종왕','종강','종인'].some(k => r.격.includes(k)));
  if (jongGyeok) {
    const found = ['목','화','토','금','수'].find(o => (jongGyeok.판정||jongGyeok.용신||'').includes(o));
    if (found) {
      return { 용신오행: found, 근거: `4권/4권下 판정(${jongGyeok.격})을 따라 종격 오행 채택`, 종격여부: true };
    }
  }

  // 2''. [131차] v27의 일위(一位) 격 규칙만 이식 — 시상편관·시상일위·연시상관성이 단독/첫 후보면 그 일위 관이, 시상편재면 그 재가 곧 용신(4권 실례 「時上乙木一位貴」「時上偏財癸水用」). opt.ilwi===false로 끔
  if (opt.ilwi !== false) { const names = (vol4Result||[]).filter(r=>r && r.성격!==false).map(r=>String(r.격국명||r.격));
    const first = names[0]||''; const onlyIlwi = names.length && names.every(n=>/시상편관|시상일위|연시상관성|시상편재/.test(n));
    const GWAN_ = { 목:'금', 화:'수', 토:'목', 금:'화', 수:'토' };
    if ((onlyIlwi || /시상편관|시상일위|연시상관성/.test(first)) && names.some(n=>/시상편관|시상일위|연시상관성/.test(n))) return { 용신오행: GWAN_[ilOh], 근거:'일위 관성 격 — 시상·연시의 일위 관이 곧 용신', 종격여부:false };
    if ((onlyIlwi || /시상편재/.test(first)) && names.some(n=>/시상편재/.test(n))) return { 용신오행: GEUK[ilOh], 근거:'일위 재성 격 — 시상 편재가 곧 용신', 종격여부:false }; }
  // 1.7 [123차] 특수격 용신 층 — 4권下 실례로 확인된 격별 용신(격 자체 규칙, 억부와 별도)
  try { const sp = (vol4haResult||[]).filter(r=>r && r.성격!==false).map(r=>String(r.격국명||r.격));
    const ilOh = Y.ohaengOf(saju.dStem); const GEUKBY_ = { 목:'금', 화:'수', 토:'목', 금:'화', 수:'토' }, GEUK_ = { 목:'토', 화:'금', 토:'수', 금:'목', 수:'화' }, SAENG_ = { 목:'화', 화:'토', 토:'금', 금:'수', 수:'목' }, INSU_ = { 목:'수', 화:'목', 토:'화', 금:'토', 수:'금' };
    const stems=[saju.yStem,saju.mStem,saju.tStem], brs=[saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch];
    const hasGwan = stems.some(x=>T.STEM_OHAENG[x]===GEUKBY_[ilOh]) || brs.some(b=>T.BRANCH_OHAENG[b]===GEUKBY_[ilOh]);
    if (sp.some(n=>/육을서귀/.test(n))) return hasGwan ? { 용신오행: SAENG_[ilOh], 근거:'육을서귀격에 관성 있음 — 상관(병화)으로 제관(서귀용상관)', 종격여부:false } : { 용신오행: GEUK_[ilOh], 근거:'육을서귀격 무관 — 재를 용신(서귀용재)', 종격여부:false };
    if (sp.some(n=>/육음조양/.test(n))) return { 용신오행: INSU_[ilOh], 근거:'육음조양격 — 무토 인수로 신금을 자양(신왕·축미·서방 喜)', 종격여부:false };
  } catch (e) {}
  // 1.5 명명된 특수 패턴 고유 용신 — 억부 일반 우선순위보다 먼저 적용.
  // [금번 발견] 쇠왕태극(왕극/태왕/태쇠/쇠극) 특례도 이 계층에 추가.
  // 원문: "쇠극자는 마땅히 설기시켜야 한다(衰極宜洩)" — 일간이 극도로
  // 무근(0개)일 때는 신약이라 인수를 쓸 것 같지만, 실제로는 그 흐름을
  // 거스르지 않고 오히려 설기(식상) 방향을 씀. 쇠극격 실례(기사 무진
  // 을축 병술)에서 발견된 오류를 계기로 추가.
  // 이제 master.js에서 근본 수정됨(제목이 세부구분값으로 정확히 설정됨) —
  // r.제목만 봐도 "쇠왕태극(태왕)" 등 세부구분이 정확히 들어옴.
  const vol6Titles = new Set((vol6Result||[]).map(r => r.제목).filter(Boolean));

  // 우선순위: 좁고 구체적인 패턴을 먼저, 넓은 조건(쇠왕태극)은 나중에.
  // "정확히 하나만 매칭될 때만 적용"이 아니라 "먼저 매칭되는 것을 적용"
  // 방식으로 복귀 — 전자는 대부분의 사례에서 여러 패턴이 동시 매칭돼
  // 폴백되어버려 오히려 더 많은 회귀를 유발함을 실측 확인함.
  // [제외] 살인상생은 6권 규칙 자체가 406건 중 67.2%에서 걸리는 과다검출
  // 상태임을 확인 — 이 상태로 용신 계층에 넣으면 다른 모든 패턴을 삼켜버림.
  // 6권 규칙(chapgyeong-vol6-rules-4.js)을 원문 기준으로 다시 좁히기 전까지
  // 용신 override 후보에서 제외.
  if (vol6Titles.has('재인불애')) {
    return { 용신오행: GEUK[ilOh], 근거: '재인불애 특례 — 인수가 태왕해 오히려 병이 될 때, 재가 그 인수를 억제해 도움이 됨', 종격여부: false };
  }
  if (vol6Titles.has('신불가과')) {
    return { 용신오행: SAENG[ilOh], 근거: '신불가과 특례 — 관살을 강화하면 반격당하므로, 왕한 일주를 식상으로 설기시킴', 종격여부: false };
  }
  if (vol6Titles.has('삼기득위')) {
    const inOh = Object.keys(SAENG).find(k => SAENG[k] === ilOh);
    return { 용신오행: inOh, 근거: '삼기득위 특례 — 재관인이 모두 갖춰진 구조에서 인수를 용신으로 삼음', 종격여부: false };
  }
  if (vol6Titles.has('부건파처')) {
    return { 용신오행: ilOh, 근거: '부건파처 특례 — 재생살 위험을 피하려 일주 자신(비겁)을 지킴', 종격여부: false };
  }
  if (vol6Titles.has('쇠왕태극(태왕)')) {
    return { 용신오행: SAENG[ilOh], 근거: '쇠왕태극(태왕) 특례 — 일간이 월령상 왕하면 설기 방향(식상)을 씀', 종격여부: false };
  }
  if (vol6Titles.has('쇠왕태극(태쇠)')) {
    return { 용신오행: Object.keys(GEUK).find(k => GEUK[k] === ilOh), 근거: '쇠왕태극(태쇠) 특례 — 일간이 월령상 쇠약하면 극제를 더함이 마땅함', 종격여부: false };
  }
  if (vol6Titles.has('쇠왕태극(쇠극)')) {
    return { 용신오행: SAENG[ilOh], 근거: '쇠왕태극(쇠극) 특례 — 일간이 완전 무근이면 설기 방향(식상)을 씀', 종격여부: false };
  }
  if (vol6Titles.has('쇠왕태극(왕극)')) {
    const inOh = Object.keys(SAENG).find(k => SAENG[k] === ilOh);
    return { 용신오행: inOh, 근거: '쇠왕태극(왕극) 특례 — 일간이 극왕하면 인수 방향으로 순응', 종격여부: false };
  }

  // 2'. [111차] 용신 7갈래(v27) — 4권 실례 스캔 정답표 25건 15/25(v25 7/25)이나 v25 정답·강헌셋에서 후퇴 → 기본 끔(opt.yongsinV27=true 로 켬). 첩경 신강약=세력·월령 가중 문제 미해결
  if (opt.yongsinV27 === true) { try { const V27 = require('./chapgyeong-yongsin-v27.js'); const r = V27.determineV27(saju, vol4Result); if (r) return r; } catch (e) {} }
  // 2. 억부법: 신강/신약 판정 후 표준 우선순위로 용신 오행 선정
  // [130차] 신강약 판정을 월령 단독(왕상휴수사)에서 가중 세력법으로 교체 — 4권下 저자 라벨 57건: 월령법 39 → 세력법 46 → 가중세력법 49(86%)
  //   가중치: 월지 ×2, 일지 ×2, 그 외 지지·천간 ×1, 삼합·방합국 +2, 지장간 중기·여기 ×0.5. 일간 자신 +1. 몸(비겁·인수) 양수, 밖(식상·재·관살) 음수. opt.strength='wol'로 옛 방식 유지
  const wshss = Y.getWangSangHyuSuSa(ilgan, saju.mBranch);
  const SW = strengthWeighted(saju);
  const sinwang = opt.strength === 'wol' ? Y.isSinWang(wshss) : SW.신강;
  // [132차] 종격 층(棄命從勢) — 4권下 저자 종격 22건+v25 2건+3권 종언급 9건 양성 / 4권上 42·4권下 非종 69 음성으로 게이트 선택(docs/eval_jonggyeok.js)
  //   게이트 F: 가중점수 ≤-4 · 밖(식재관) 총합 ≥5 · 본기 뿌리(비겁·인수) 음간 ≤1 / 양간 0 · 지장간 통근 ≤1 → 생화유정 사슬(도구)로 집결 방향(종살/종재/종아), 실패 시 세력 최대 오행
  //   결과: 재현 7→13/33, 라벨 음성 오탐 3(신묘신묘무인임자 거관유살·형합-다·마). 옛 극약층(뿌리0·단일세력≥4)은 opt.jongGate='A'
  if (opt.strength !== 'wol') {
    const brs=[saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch], sts=[saju.yStem,saju.mStem,saju.tStem];
    const cnt = oh => brs.filter(b=>T.BRANCH_OHAENG[b]===oh).length + sts.filter(z=>T.STEM_OHAENG[z]===oh).length;
    const INSU_ = { 목:'수', 화:'목', 토:'화', 금:'토', 수:'금' }, GWAN_ = { 목:'금', 화:'수', 토:'목', 금:'화', 수:'토' };
    const root = brs.filter(b=>[ilOh, INSU_[ilOh]].includes(T.BRANCH_OHAENG[b])).length;
    const rootJ = brs.filter(b=>(T.JIJANGGAN[b]||[]).some(g=>T.STEM_OHAENG[g]===ilOh)).length;
    const out = cnt(GWAN_[ilOh]) + cnt(GEUK[ilOh]) + cnt(SAENG[ilOh]);
    const yin = ['을','정','기','신','계'].includes(saju.dStem);
    const cand = [['종살', GWAN_[ilOh], cnt(GWAN_[ilOh])], ['종재', GEUK[ilOh], cnt(GEUK[ilOh])], ['종아', SAENG[ilOh], cnt(SAENG[ilOh])]].sort((a,b)=>b[2]-a[2]);
    let pass;
    if (opt.jongGate === 'A') pass = SW.점수 <= -4 && root <= 0 && cand[0][2] >= 4;
    else pass = SW.점수 <= -4 && out >= 5 && rootJ <= 1 && (yin ? root <= 1 : root <= 0);
    if (pass) {
      let pick = cand[0]; let via = '세력 최대';
      try { const JS = require('./chapgyeong-jonggyeok-saenghwa.js'); const r = JS.checkJonggyeokSaengHwaYujeong(saju, true); const rel = (r && r.성립 && r.관계) || '';
        if (/종살|종관/.test(rel)) { pick = cand.find(c=>c[0]==='종살'); via = '생화유정 사슬 ' + (r.사슬||[]).join('→'); }
        else if (/종재/.test(rel)) { pick = cand.find(c=>c[0]==='종재'); via = '생화유정 사슬 ' + (r.사슬||[]).join('→'); }
        else if (/종아|종식/.test(rel)) { pick = cand.find(c=>c[0]==='종아'); via = '생화유정 사슬 ' + (r.사슬||[]).join('→'); } } catch (e) {}
      return { 용신오행: pick[1], 근거: `${pick[0]}(棄命從勢: 세력점수 ${SW.점수}, 밖 ${out}, 뿌리 ${root}/장간 ${rootJ}, ${via}) — ${pick[0]==='종살'?'관살':pick[0]==='종재'?'재':'식상'}을 따름`, 종격여부: true };
    }
  }

  const p = { branches:[saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch],
              stems:[saju.yStem,saju.mStem,saju.dStem,saju.tStem] };
  const countOh = (oh) => p.branches.filter(b=>T.BRANCH_OHAENG[b]===oh).length +
                            p.stems.filter((s,i)=>i!==2 && T.STEM_OHAENG[s]===oh).length;

  if (sinwang) {
    const gwansalOh = Object.keys(GEUK).find(k => GEUK[k] === ilOh);
    const sikOh = SAENG[ilOh];
    const jaeOh = GEUK[ilOh];
    // [131차] 신강 억부 순서 옵션: 'gwan'(관살>식상>재, 옛 기본) / 'sik'(식상>재>관살 — 저자 「身旺 好洩精」) / 'max'(셋 중 세력 큰 것)
    // [131차] 극왕(極旺)은 순세: 세력점수 ≥ 임계(기본 4) 또는 전왕격 성립이면 식상→재→관살(逆勢 관살 회피, 원문 전왕편 「順其旺勢」); 중강은 관살 억제 우선
    const jw = (vol4haResult||[]).some(r=>r && r.성격!==false && /곡직|염상|가색|종혁|윤하|전록|정란차/.test(String(r.격국명||r.격)));
    // 실측(131차): 식상 우선 55·극왕 순세 58 < 관살 우선 61 — 저자 실례에서도 관살 있으면 관살을 먼저 봄. 순세 규칙은 opt.wangThreshold로만 켬(기본 꺼짐)
    const TH2 = typeof opt.wangThreshold === 'number' ? opt.wangThreshold : Infinity;
    const order = opt.sinwangOrder || ((opt.strength !== 'wol' && (SW.점수 >= TH2 || (opt.jeonwangSunse && jw))) ? 'sik' : 'gwan');
    const seq = order === 'sik' ? [[sikOh,'식상으로 설기'],[jaeOh,'재성으로 설기'],[gwansalOh,'관살로 억제']]
              : order === 'max' ? [[gwansalOh,'관살로 억제'],[sikOh,'식상으로 설기'],[jaeOh,'재성으로 설기']].sort((a,b)=>countOh(b[0])-countOh(a[0]))
              : [[gwansalOh,'관살로 억제'],[sikOh,'식상으로 설기'],[jaeOh,'재성으로 설기']];
    for (const [oh, why] of seq) if (countOh(oh) > 0) return { 용신오행: oh, 근거: `신강 — ${why}`, 종격여부: false };
    return { 용신오행: gwansalOh, 근거: '신강이나 관살·식상·재 모두 부재 — 관살 방향을 이론상 채택', 종격여부: false };
  } else {
    const inOh = Object.keys(SAENG).find(k => SAENG[k] === ilOh);
    // [131차] v27 신약 규칙 이식 — ablation: ①관 유근·투출+비인≥3 → 용관(+2) ③재≥3 → 용겁(+1) 채택, ②식상≥3 → 용겁은 4권下 −2라 기본 꺼짐(opt.yak2=true). 4권上 15→18·4권下 61 유지
    if (opt.yakRules !== false) {
      const gwanOh = Object.keys(GEUK).find(k => GEUK[k] === ilOh);
      const cb = oh => p.branches.filter(b=>T.BRANCH_OHAENG[b]===oh).length, cs = oh => p.stems.filter((z,i)=>i!==2 && T.STEM_OHAENG[z]===oh).length;
      const gwanRootTu = cb(gwanOh) >= 1 && cs(gwanOh) >= 1, biin = countOh(ilOh) + countOh(inOh);
      if (opt.yak1 !== false && gwanRootTu && biin >= 3 && countOh(gwanOh) < 3) return { 용신오행: gwanOh, 근거: '신약이나 관 유근·투출에 비겁·인수 받침 — 용관(약화위강)', 종격여부: false };
      if (opt.yak2 === true && countOh(SAENG[ilOh]) >= 3 && countOh(ilOh) > 0) return { 용신오행: ilOh, 근거: '신약에 식상 과다 — 비겁으로 보강(설기 심)', 종격여부: false };
      if (opt.yak3 !== false && countOh(GEUK[ilOh]) >= 3 && countOh(ilOh) > 0) return { 용신오행: ilOh, 근거: '신약에 재 과다(재다신약) — 비겁으로 재를 나눔', 종격여부: false };
    }
    if (countOh(inOh) > 0) return { 용신오행: inOh, 근거: '신약 — 인수로 생조', 종격여부: false };
    if (countOh(ilOh) > 0) return { 용신오행: ilOh, 근거: '신약 — 비겁으로 보강', 종격여부: false };
    return { 용신오행: inOh, 근거: '신약이나 인수·비겁 모두 부재 — 인수 방향을 이론상 채택', 종격여부: false };
  }
}

/** [130차] 가중 세력 신강약 — 점수>0 신강 */
function strengthWeighted(saju, W=2, D=2, G=2, J=0.5) {
  const B = require('./chapgyeong-vol1-basics.js');
  const o = T.STEM_OHAENG[saju.dStem]; const INSU_ = { 목:'수', 화:'목', 토:'화', 금:'토', 수:'금' }, GEUKBY_ = { 목:'금', 화:'수', 토:'목', 금:'화', 수:'토' };
  const side = x => x===o||x===INSU_[o] ? 1 : [SAENG[o],GEUK[o],GEUKBY_[o]].includes(x) ? -1 : 0;
  const brs=[saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch], st=[saju.yStem,saju.mStem,saju.tStem];
  let sc = 1; const detail=[];
  brs.forEach((b,i)=>{ if(!b) return; const w = i===1?W:i===2?D:1; sc += side(T.BRANCH_OHAENG[b])*w; (T.JIJANGGAN[b]||[]).slice(0,-1).forEach(g=>{ sc += side(T.STEM_OHAENG[g])*J; }); });
  st.forEach(z=>{ if(z) sc += side(T.STEM_OHAENG[z]); });
  try { [...B.checkSamhap(brs),...B.checkBanghap(brs)].map(g=>g.ohaeng).forEach(g=>{ sc += side(g)*G; }); } catch(e){}
  return { 점수: Math.round(sc*10)/10, 신강: sc > 0 };
}

// ============================================================
// [134차] 병약(病藥) 층 — 4권下 저자 「○○이 病」 명시 30여 건에서 귀납한 세 유형
//  ①용신을 극하는 오행이 원국에 있으면 病(협재-가 卯木 vs 用戊土, 임기룡배-가 甲木 制土, 공귀-자 寅木, 일덕-바 戊己土 vs 亥水)
//  ②종격은 왕신(따르는 오행)을 거스르는 오행이 病(육임추간-가 寅木 vs 火土 從氣, 복덕-라·바 木火 vs 從金, 기명종재-라 金 vs 從木)
//  ③태과한 몸(일간·비겁·인수)이 病(재관쌍미-나 「財官 甚弱 水가 病」, 육임추간-바 「水旺이 病」, 전재-다 「比刦·印 왕이 病」, 가색-마 「土多 病」) — 세력점수 ≥3이면
//  藥 = 病을 극하는 오행(협재-가 辛金, 전록-아 戊土, 일덕-나 北運) / 저자 「病重할수록 藥 만나면 大貴, 病輕이면 그침」(축요사-라)
// ============================================================
function byeongyak(saju, y) {
  const o = T.STEM_OHAENG[saju.dStem], yOh = y.용신오행; if (!yOh) return null;
  const brs=[saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch].filter(Boolean), sts=[saju.yStem,saju.mStem,saju.tStem].filter(Boolean);
  const cnt = oh => brs.filter(b=>T.BRANCH_OHAENG[b]===oh).length + sts.filter(z=>T.STEM_OHAENG[z]===oh).length;
  const GEUKBY_ = { 목:'금', 화:'수', 토:'목', 금:'화', 수:'토' }, INSU_ = { 목:'수', 화:'목', 토:'화', 금:'토', 수:'금' };
  const out = [];
  const g1 = GEUKBY_[yOh]; if (cnt(g1) >= 1) out.push({ 병: g1, 유형: y.종격여부 ? '왕신 거스름' : '용신 극', 세: cnt(g1), 약: GEUKBY_[g1] });
  if (!y.종격여부) { const sw = strengthWeighted(saju); if (sw.점수 >= 3) { const body = [o, INSU_[o]].sort((a,b)=>cnt(b)-cnt(a))[0]; if (body !== yOh && cnt(body) >= 3) out.push({ 병: body, 유형: '태과(몸 과다)', 세: cnt(body), 약: GEUKBY_[body] }); } }
  if (!out.length) return null;
  out.sort((a,b)=>b.세-a.세);
  return { 병: out[0].병, 약: out[0].약, 유형: out[0].유형, 병세: out[0].세, 전부: out, 설명: out.map(x=>`${x.병}(${x.유형}, ${x.세}자) — 藥 ${x.약}`).join(' / ') };
}
function determineYongsin(saju, vol4Result, vol4haResult, vol6Result, opt = {}) {
  const r = determineYongsinCore(saju, vol4Result, vol4haResult, vol6Result, opt);
  try { if (opt.byeongyak !== false && r && r.용신오행) { const by = byeongyak(saju, r); if (by) { r.병 = by.병; r.약 = by.약; r.병약 = by; } } } catch (e) {}
  return r;
}
module.exports = { determineYongsin, determineYongsinCore, byeongyak, strengthWeighted, GEUK, SAENG };
