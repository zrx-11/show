/* ============================================================
   观复文明 · 分幕放映主控
   点击 / 空格 / 方向键推进 · 每幕 GSAP 入场动画 · 3D 场景随幕过渡
   ============================================================ */
(function () {
  'use strict';
  function $(s) { return document.querySelector(s); }
  function $$(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var space = window.__guanfuSpace || null;

  var steps = $$('.stage > .step');
  var cur = 0, busy = false;

  /* ---- 幕切换 ---- */
  function showStep(i, dir) {
    if (busy || i < 0 || i >= steps.length) return;
    busy = true;
    var from = steps[cur], to = steps[i];
    var tp = parseFloat(to.getAttribute('data-p')) || 0.5;
    if (space && space.go) space.go(tp, 1.4);

    /* 进度条与顶部信息 */
    var prog = $('#progress');
    if (prog) prog.style.width = ((i + 1) / steps.length * 100) + '%';
    var num = $('#stepNum'); if (num) num.textContent = String(i + 1).padStart(2, '0');
    var tot = $('#stepTotal'); if (tot) tot.textContent = String(steps.length).padStart(2, '0');
    var name = $('#stepName'); if (name) name.textContent = to.getAttribute('data-name') || '';
    $('#nextBtn').innerHTML = i === steps.length - 1
      ? '重新开始 <span class="ar">↺</span>'
      : '下一幕 <span class="ar">→</span>';
    $('#prevBtn').style.visibility = i === 0 ? 'hidden' : 'visible';

    var done = function () {
      cur = i; busy = false;
    };
    if (reduced || !window.gsap) {
      from.classList.remove('on');
      to.classList.add('on');
      done();
      return;
    }
    var gsap = window.gsap;
    /* 出场：当前幕内容上浮淡出 */
    gsap.timeline({ onComplete: function () {
        from.classList.remove('on');
        to.classList.add('on');
        animateIn(to, dir, done);
      } })
      .to(from.querySelectorAll('.step-inner > *'), {
        y: -26, opacity: 0, duration: 0.34, stagger: 0.03,
        ease: 'power1.in', overwrite: true
      });
  }

  function animateIn(stepEl, dir, done) {
    var items = stepEl.querySelectorAll('.step-inner > *');
    gsap.timeline({ onComplete: done })
      .fromTo(items, {
        y: (dir > 0 ? 46 : -46), opacity: 0
      }, {
        y: 0, opacity: 1, duration: 0.85, stagger: 0.1,
        ease: 'power3.out', clearProps: 'transform', overwrite: true
      });
    /* 幕内次级元素紧随其后 */
    stepEl.querySelectorAll('.tl, .term, .rc, .c10-card, .fiss, .scene, .act, .tg, .r-item')
      .forEach(function (el) {
        gsap.fromTo(el, { y: 34, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: 'power2.out', delay: 0.35, clearProps: 'transform', overwrite: true });
      });
  }

  function next() { showStep(cur + 1, 1); }
  function prev() { showStep(cur - 1, -1); }

  /* ---- 控件 ---- */
  $('#nextBtn').addEventListener('click', function () {
    if (cur === steps.length - 1) showStep(0, -1); else next();
  });
  $('#prevBtn').addEventListener('click', prev);
  var startBtn = $('#startBtn'); if (startBtn) startBtn.addEventListener('click', next);
  var restartBtn = $('#restartBtn'); if (restartBtn) restartBtn.addEventListener('click', function () { showStep(0, -1); });

  /* 点击空白推进：排除按钮与可点击卡片 */
  var clickable = 'button, .c10-card, .c10-ctl, .cascade-ctl, .start-btn, a';
  document.addEventListener('click', function (e) {
    if (busy) return;
    var t = e.target;
    if (t.closest && t.closest(clickable)) return;
    next();
  });

  /* 键盘 */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter' || e.key === 'PageDown') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev(); }
  });

  /* 触屏滑动：向左滑前进，向右滑后退 */
  var sx = 0;
  document.addEventListener('touchstart', function (e) { sx = e.changedTouches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 60) { if (dx < 0) next(); else prev(); }
  }, { passive: true });

  /* ---- 章节04：级联崩溃重演 ---- */
  var cNodes = $$('#cascadeNodes .cnode'), cLines = $$('#cascadeNodes .cline');
  var cSteps = $$('.cascade-steps .step'), cBtn = $('#cascadePlay'), cPos = $('#cascadePos');
  var ember = $('.ember-final'), deadLine = $('.dead-line'), nets = $('#cascadeNodes');
  var timeline = [
    { hot: [0, 2], t: '政策分裂 · 守典·甲 vs 守典·乙' },
    { die: [0, 2], t: '时间基准分裂 · 轨道调度错乱' },
    { hot: [3], die: [4], t: '动量配额武器化 · 航道优先权政治化' },
    { die: [6], t: '采掘舰队断供 · 内轨道减产' },
    { die: [1, 5, 7, 8], t: '级联失联 · 千年机器熄灭' }
  ];
  var cTimer = null;
  function resetCascade() {
    clearTimeout(cTimer);
    cNodes.forEach(function (n) { n.classList.remove('die', 'hot'); n.classList.add('live'); });
    cLines.forEach(function (l) { l.classList.remove('die'); });
    if (nets) nets.classList.remove('dying');
    if (ember) ember.setAttribute('opacity', 0);
    if (deadLine) deadLine.setAttribute('opacity', 0);
    cSteps.forEach(function (s, i) { s.classList.toggle('act', i === 0); });
    if (cPos) cPos.textContent = '等待重演 · 九执堂全量在线';
  }
  function playCascade() {
    resetCascade();
    timeline.forEach(function (step, i) {
      cTimer = setTimeout(function () {
        cSteps.forEach(function (s) { s.classList.remove('act'); });
        if (cSteps[i]) cSteps[i].classList.add('act');
        if (cPos) cPos.textContent = '第' + (i + 1) + '步 · ' + step.t;
        (step.hot || []).forEach(function (k) { cNodes[k].classList.remove('live'); cNodes[k].classList.add('hot'); });
        (step.die || []).forEach(function (k) { cNodes[k].classList.remove('live', 'hot'); cNodes[k].classList.add('die'); });
        if (i === timeline.length - 1) {
          setTimeout(function () {
            if (nets) nets.classList.add('dying');
            if (ember) ember.setAttribute('opacity', 1);
            if (deadLine) deadLine.setAttribute('opacity', 1);
            if (cPos) cPos.textContent = '系统失联 · 大寂灭';
          }, 450);
        }
      }, i * 1150);
    });
  }
  if (cBtn) { cBtn.addEventListener('click', playCascade); resetCascade(); }

  /* ---- 章节07：十条展开 ---- */
  var c10 = $$('.c10-card'), c10Btn = $('#c10All');
  c10.forEach(function (c) { c.addEventListener('click', function () { c.classList.toggle('open'); }); });
  if (c10Btn) {
    c10Btn.addEventListener('click', function () {
      var open = c10.some(function (c) { return !c.classList.contains('open'); });
      c10.forEach(function (c) { c.classList.toggle('open', open); });
    });
  }

  /* 初始渲染 */
  showStep(0, 1);
})();
