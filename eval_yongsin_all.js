// 용신 옵션 조합을 네 정답세트에서 한 번에 채점: 4권下(저자 명시 108) / 4권上 스캔(용신 필드) / 강헌 / v25
const fs=require('fs'),path=require('path'); const {analyzeAll}=require('../chapgyeong-master.js');
const S=a=>({yStem:a[0][0],yBranch:a[0][1],mStem:a[1][0],mBranch:a[1][1],dStem:a[2][0],dBranch:a[2][1],tStem:a[3][0],tBranch:a[3][1]});
const OHK={갑:'목',을:'목',병:'화',정:'화',무:'토',기:'토',경:'금',신:'금',임:'수',계:'수'};
const scan=JSON.parse(fs.readFileSync(path.join(__dirname,'vol4_silrye_scan.json'))).filter(r=>r.권!=='4권下'&&r.기둥&&!r.기둥.some(p=>!p||p.includes('?'))&&r.용신);
const ohOf=t=>{const m=String(t).match(/^(목|화|토|금|수)/);return m?m[1]:null;};
const up=scan.map(r=>({기둥:r.기둥,정답:ohOf(r.용신)})).filter(r=>r.정답);
const kang=(()=>{try{return require('../kanghun_myeongshik_db.json').filter(d=>d.용신&&ohOf(d.용신)).map(d=>({기둥:d.기둥,정답:ohOf(d.용신),성별:d.성별}));}catch(e){return [];}})();
const v25=[[['정사','병오','신축','갑오'],'토'],[['임자','을사','기해','계유'],'목'],[['갑술','정축','을묘','임오'],'토']].map(([k,e])=>({기둥:k,정답:e}));
// 4권下 저자 용신은 eval_vol4ha_yongsin.js의 추출기를 재사용
const ha=(()=>{const src=fs.readFileSync(path.join(__dirname,'eval_vol4ha_yongsin.js'),'utf8'); const body=src.slice(src.indexOf('function authorYongsin'),src.indexOf('const all ='));
 const H={甲:'갑',乙:'을',丙:'병',丁:'정',戊:'무',己:'기',庚:'경',辛:'신',壬:'임',癸:'계',子:'자',丑:'축',寅:'인',卯:'묘',辰:'진',巳:'사',午:'오',未:'미',申:'신',酉:'유',戌:'술',亥:'해'};
 const GEUK={목:'토',화:'금',토:'수',금:'목',수:'화'},SAENG={목:'화',화:'토',토:'금',금:'수',수:'목'},INSU={목:'수',화:'목',토:'화',금:'토',수:'금'},GWAN={목:'금',화:'수',토:'목',금:'화',수:'토'},CH_OH={木:'목',火:'화',土:'토',金:'금',水:'수'},OH=OHK;
 const fn=new Function('H','GEUK','SAENG','INSU','GWAN','CH_OH','OH',body+'; return authorYongsin;')(H,GEUK,SAENG,INSU,GWAN,CH_OH,OH);
 const all=JSON.parse(fs.readFileSync(path.join(__dirname,'vol4ha_silrye_scan_ALL.json'))).silrye.filter(x=>x.conf!=='C');
 return all.map(x=>{const ko=x.myeongjo.map(p=>p.split('').map(c=>H[c]||c).join('')); const au=fn(x,OHK[ko[2][0]]); return au?{기둥:ko,정답:au.오행,성별:/坤命|여명|婦|夫人|女|妓|婢|尼/.test(x.label+x.gyeok_wonmun)?'여':'남'}:null;}).filter(Boolean);})();
const sets={ '4권下':ha, '4권上':up, '강헌':kang, 'v25':v25 };
const configs=process.argv.slice(2).length? [JSON.parse(process.argv[2])] : [ {}, {sinwangOrder:'sik'}, {sinwangOrder:'max'}, {yongsinV27:true}, {strength:'wol'}, {strength:'wol',sinwangOrder:'sik'} ];
for (const cfg of configs) { const out=[]; for (const [name,arr] of Object.entries(sets)) { let h=0,n=0; for (const c of arr) { try{ const r=analyzeAll(S(c.기둥),c.성별||'남',cfg); n++; if(r.용신&&r.용신.용신오행===c.정답) h++; }catch(e){} } out.push(`${name} ${h}/${n}`); } console.log(JSON.stringify(cfg).padEnd(42), out.join('  ')); }
