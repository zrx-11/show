/* ============================================================
   观复文明 · 主交互脚本
   进度驱动三维背景 · 导航 scrollspy · 滚动揭示 · 级联演示 · 十条展开
   ============================================================ */
(function () {
  'use strict';
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var space = window.__guanfuSpace || null;

  /* ---- 滚动：进度条 + 三维背景状态 ---- */
  var prog = $('#progress');
  function onScroll() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? Math.min(window.scrollY / h, 1) : 0;
    if (prog) prog.style.width = (p * 100) + '%';
    if (space && space.setProgress) space.setProgress(p);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- 章节滚动揭示 ---- */
  var rvs = $$('.rv');
  if (window.gsap && window.ScrollTrigger && !reduced) {
    rvs.forEach(function (el) {
      window.gsap.fromTo(el, { y: 36, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });
  } else {
    var io = ('IntersectionObserver' in window)
      ? new IntersectionObserver(function (es) {
          es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
        }, { threshold: .08 })
      : null;
    rvs.forEach(function (el) { if (io) io.observe(el); else el.classList.add('in'); });
  }

  /* ---- 导航 scrollspy ---- */
  var ids = ['s01','s02','s03','s04','s05','s06','s07','s08','s09','s10','s11'];
  var secs = ids.map(function (id) { return document.getElementById(id); });
  var navs = $$('.topnav nav a');
  var spy = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) {
        navs.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id); });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  secs.forEach(function (s) { if (s) spy.observe(s); });

  /* ---- 章节03：级联崩溃重演 ---- */
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
})();
