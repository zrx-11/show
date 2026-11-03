const sleep = ms => new Promise(r=>setTimeout(r,ms));
const q = s => document.querySelector(s);
try {
  const out = {};
  const book = window.__bookApi.book;
  const baseW = 340; // 书 CSS 基准宽
  const scaleOf = () => Math.round(book.getBoundingClientRect().width / baseW * 100) / 100;
  const t0 = Date.now();
  // t≈3.2s：拿起途中（scale 应 >0.06 且 <1）
  await sleep(3200);
  out.t3_scale = scaleOf();
  out.t3_visible = book.style.visibility !== 'hidden';
  // t≈6.8s：途中长大
  await sleep(3600);
  out.t7_scale = scaleOf();
  // 翻书阶段：t≈11.4s
  await sleep(4600);
  const front = q('.book-front');
  let fRy = null;
  try { fRy = Math.round(window.gsap.getProperty(front, 'rotationY')); } catch(e){ fRy = 'n/a'; }
  out.t11_frontRy = fRy;   // 应在 -180~0 之间（翻起中）
  const pg1 = q('.book-page.page-1');
  let p1Ry = null;
  try { p1Ry = Math.round(window.gsap.getProperty(pg1, 'rotationY')); } catch(e){ p1Ry = 'n/a'; }
  out.t11_page1Ry = p1Ry;  // 应在 -9~0（摊开中）
  // 幕 0 出现（openBook 结束 → beginStage）
  for (let i=0;i<20;i++){ if (q('.step.on')) break; await sleep(1000); }
  out.step0 = q('.step.on') ? q('.step.on').getAttribute('data-name') : null;
  out.bootHidden = q('#boot') ? q('#boot').style.display === 'none' : true;
  return out;
} catch (e) { return { error: String(e), part: 'anim' }; }
