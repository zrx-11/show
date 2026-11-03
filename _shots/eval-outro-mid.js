const sleep = ms => new Promise(r=>setTimeout(r,ms));
const q = s => document.querySelector(s);
try {
  const out = {};
  for (let i=0;i<16;i++){ if (q('#bookScene').classList.contains('done')) break; await sleep(1500); }
  await sleep(2000);
  for (let i=0;i<19;i++){ q('#nextBtn').click(); await sleep(3200); }
  const front = q('.book-front');
  const stage = q('.stage');
  const before = Math.round(window.gsap.getProperty(front, 'rotationY'));
  out.before_frontRy = before;           // -164（翻开的封面）
  q('#nextBtn').click();                  // 触发收书
  await sleep(1500);
  const midFront = Math.round(window.gsap.getProperty(front, 'rotationY'));
  const midStageOp = Math.round(window.gsap.getProperty(stage, 'opacity')*100)/100;
  out.mid_frontRy = midFront;             // 应 > -164（正在合拢）
  out.mid_stageOp = midStageOp;           // 应 < 1（内容正在收进）
  await sleep(1000);
  out.later_frontRy = Math.round(window.gsap.getProperty(front, 'rotationY'));
  for (let i=0;i<14;i++){ if (q('.book-end').classList.contains('on')) break; await sleep(1000); }
  out.endOn = q('.book-end').classList.contains('on');
  out.cur = window.__bookDiag.cur();
  return out;
} catch (e) { return { error: String(e), part: 'outro-mid' }; }
