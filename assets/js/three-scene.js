/* ============================================================
   观复文明 · 全屏三维背景（three.js）
   恒星 · 戴森云环 · 崩溃残环 · 重建光柱 —— 随滚动演进
   ============================================================ */
(function () {
  'use strict';
  if (!window.THREE) { document.body.classList.add('no-three'); return; }
  var canvas = document.getElementById('space');
  if (!canvas) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobile = window.innerWidth < 720;

  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x03050A, 0.00035);
  var camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 4000);
  camera.position.set(0, 0, 600);

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: !mobile });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2));
  renderer.setClearColor(0x03050A, 1);

  /* ---- 圆贴图生成器 ---- */
  function radialTex(inner, outer, stops) {
    var c = document.createElement('canvas'); c.width = c.height = 256;
    var g = c.getContext('2d');
    var grad = g.createRadialGradient(128, 128, inner, 128, 128, outer);
    for (var i = 0; i < stops.length; i++) grad.addColorStop(stops[i][0], stops[i][1]);
    g.fillStyle = grad; g.fillRect(0, 0, 256, 256);
    var t = new THREE.CanvasTexture(c); return t;
  }
  var glowTex = radialTex(0, 128, [[0, 'rgba(255,246,222,1)'],[0.25, 'rgba(240,212,138,.55)'],[0.6, 'rgba(217,164,65,.12)'],[1, 'rgba(217,164,65,0)']]);

  /* ---- 背景星尘 ---- */
  var starCount = mobile ? 750 : 1500;
  var starGeo = new THREE.BufferGeometry();
  var starPos = new Float32Array(starCount * 3);
  for (var i = 0; i < starCount; i++) {
    starPos[i*3]   = (Math.random() - .5) * 2000;
    starPos[i*3+1] = (Math.random() - .5) * 1200;
    starPos[i*3+2] = (Math.random() - .5) * 1200 - 300;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  var starMat = new THREE.PointsMaterial({ color: 0x9FB8D8, size: 1.5, transparent: true, opacity: .65, blending: THREE.AdditiveBlending, depthWrite: false });
  var stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  /* ---- 恒星 ---- */
  var sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xD9A441, transparent: true, opacity: .95, blending: THREE.AdditiveBlending, depthWrite: false }));
  sunGlow.scale.set(520, 520, 1);
  var sunCore = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xFFF0C2, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false }));
  sunCore.scale.set(150, 150, 1);
  var sunG = new THREE.Group();
  sunG.add(sunGlow); sunG.add(sunCore);
  sunG.position.set(0, 30, -160);
  scene.add(sunG);

  /* ---- 戴森云环 A（辉煌） ---- */
  function makeRing(count, rMin, rMax, thickness, color, tilt) {
    var g = new THREE.Group();
    var geo = new THREE.BufferGeometry();
    var pos = new Float32Array(count * 3);
    for (var i = 0; i < count; i++) {
      var a = Math.random() * Math.PI * 2;
      var r = rMin + Math.random() * (rMax - rMin);
      var tiltY = (Math.random() - .5) * thickness;
      pos[i*3]   = Math.cos(a) * r;
      pos[i*3+1] = Math.sin(a) * r * 0.28 + tiltY;
      pos[i*3+2] = (Math.random() - .5) * thickness * 0.6;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    var mat = new THREE.PointsMaterial({ color: color, size: mobile ? 2.2 : 2.6, transparent: true, opacity: .85, blending: THREE.AdditiveBlending, depthWrite: false });
    var p = new THREE.Points(geo, mat);
    g.add(p);
    g.rotation.x = tilt;
    return g;
  }
  var ringA = makeRing(mobile ? 900 : 1900, 330, 420, 26, 0xD9A441, 1.05);
  ringA.position.z = -140;
  scene.add(ringA);

  /* ---- 残环 B（崩溃遗留，初始不可见） ---- */
  var ringB = makeRing(mobile ? 700 : 1400, 330, 430, 40, 0xB05A38, 0.9);
  ringB.position.z = -140;
  ringB.rotation.y = 0.7;
  ringB.children[0].material.opacity = 0;
  scene.add(ringB);

  /* ---- 重建光柱（粒子 + 柱体） ---- */
  var pillarGeo = new THREE.CylinderGeometry(30, 40, 430, 28, 1, true);
  var pillarMat = new THREE.MeshBasicMaterial({ color: 0xD9A441, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
  var pillar = new THREE.Mesh(pillarGeo, pillarMat);
  pillar.position.set(0, -60, -170);
  scene.add(pillar);

  var upCount = mobile ? 220 : 420;
  var upGeo = new THREE.BufferGeometry();
  var upPos = new Float32Array(upCount * 3);
  for (var j = 0; j < upCount; j++) {
    upPos[j*3]   = (Math.random() - .5) * 60;
    upPos[j*3+1] = -200 + Math.random() * 420;
    upPos[j*3+2] = (Math.random() - .5) * 40 - 170;
  }
  upGeo.setAttribute('position', new THREE.BufferAttribute(upPos, 3));
  var upMat = new THREE.PointsMaterial({ color: 0xF0D48A, size: 2.4, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  var upPoints = new THREE.Points(upGeo, upMat);
  scene.add(upPoints);

  /* ---- 废墟地平线（底部剪影） ---- */
  var ruinsGeo = new THREE.BufferGeometry();
  var rp = [];
  var x = -700;
  while (x < 700) { rp.push(x, -300, -600); x += 40; if (Math.random() < .4) x += 14; }
  var rArr = new Float32Array(rp.length);
  for (var k = 0; k < rp.length; k++) rArr[k] = rp[k];
  ruinsGeo.setAttribute('position', new THREE.BufferAttribute(rArr, 3));
  var ruinsMat = new THREE.PointsMaterial({ color: 0x27344A, size: 3, transparent: true, opacity: .4 });
  var ruins = new THREE.Points(ruinsGeo, ruinsMat);
  ruins.position.y = 330;
  scene.add(ruins);

  /* ---- 滚动状态 ---- */
  function clamp01(v) { return v < 0 ? 0 : (v > 1 ? 1 : v); }
  function phase(p, a, b, c, d) { var t = a >= b ? 0 : clamp01((p - a) / (b - a)); return c + (d - c) * t; }
  function smooth(t) { return t * t * (3 - 2 * t); }
  function seg(p, a, b, c, d) { return c + (d - c) * smooth(clamp01((p - a) / (b - a))); }

  var cur = { sun: 1, ra: 1, rb: 0, pillar: 0, up: 0, speed: .006, starCol: 1 };
  var progress = 0;
  function setProgress(p) {
    p = clamp01(p);
    progress = p;
    /* 恒星亮度：辉煌 → 暗(崩溃) → 回升(重建) → 微暗(星尘) */
    cur.sun = p < 0.16 ? 1
      : p < 0.32 ? seg(p, 0.16, 0.32, 1, 0.22)
      : p < 0.54 ? seg(p, 0.32, 0.54, 0.22, 0.85)
      : p < 0.72 ? 0.85
      : seg(p, 0.72, 0.9, 0.85, 0.5);
    /* 环 A：亮 → 暗/缓 → 恢复 */
    cur.ra = p < 0.16 ? 1
      : p < 0.32 ? seg(p, 0.16, 0.32, 1, 0.35)
      : p < 0.54 ? seg(p, 0.32, 0.54, 0.35, 0.85)
      : 0.85;
    cur.speed = p < 0.16 ? 0.006
      : p < 0.32 ? 0.0016
      : p < 0.54 ? 0.004
      : p < 0.72 ? 0.0032
      : 0.002;
    /* 残环 B：崩溃段显现，后渐隐 */
    cur.rb = seg(p, 0.18, 0.36, 0, 1) - seg(p, 0.6, 0.85, 0, 0.55);
    cur.rb = Math.max(0, cur.rb);
    /* 光柱：重建段显现 */
    cur.pillar = seg(p, 0.34, 0.52, 0, 1) - seg(p, 0.78, 0.95, 0, 0.6);
    cur.pillar = Math.max(0, cur.pillar);
    cur.up = cur.pillar;
    /* 星尘色调：蓝 → 锈(崩溃) → 回蓝 */
    cur.starCol = p < 0.16 ? 1 : p < 0.32 ? 1 - seg(p, 0.16, 0.32, 0, 0.55) : p < 0.54 ? seg(p, 0.32, 0.54, 0.45, 1) : 1;
  }

  /* ---- 幕驱动：目标进度 + 平滑过渡 ---- */
  var curP = 0, targetP = 0;
  function go(p, dur) {
    targetP = Math.max(0, Math.min(1, p));
    if (reduced) { curP = targetP; setProgress(curP); render(); }
  }

  window.__guanfuSpace = { go: go, setProgress: setProgress, render: render, getP: function () { return curP; } };

  /* ---- 视差 ---- */
  var mx = 0, my = 0, tx = 0, ty = 0;
  if (!mobile && !reduced) {
    window.addEventListener('pointermove', function (e) {
      tx = (e.clientX / window.innerWidth - .5) * 2;
      ty = (e.clientY / window.innerHeight - .5) * 2;
    });
  }

  /* ---- 主循环 ---- */
  var clock = new THREE.Clock();
  var t = 0;
  function render() {
    if (!reduced) {
      var dt = clock.getDelta();
      t += dt;
      /* 恒星脉动 */
      var pulse = 1 + Math.sin(t * 0.7) * 0.03;
      sunGlow.material.opacity = cur.sun * (0.8 + pulse * 0.18);
      /* 环旋转 */
      ringA.rotation.z += cur.speed;
      ringB.rotation.z -= cur.speed * 0.4;
      /* 星尘上升 */
      var upArr = upGeo.attributes.position.array;
      for (var i = 0; i < upCount; i++) {
        upArr[i*3+1] += dt * (18 + (i % 7) * 2.4);
        if (upArr[i*3+1] > 220) upArr[i*3+1] = -200;
      }
      upGeo.attributes.position.needsUpdate = true;
      /* 视差平滑 */
      mx += (tx - mx) * 0.04; my += (ty - my) * 0.04;
      camera.position.x = mx * 46;
      camera.position.y = my * 34;
    }
    sunCore.material.opacity = Math.min(1, cur.sun * 1.1);
    ringA.children[0].material.opacity = cur.ra;
    ringB.children[0].material.opacity = cur.rb;
    pillar.material.opacity = cur.pillar * 0.32;
    upMat.opacity = cur.up * 0.7;
    camera.lookAt(0, 20, -160);
    renderer.render(scene, camera);
  }

  function tick() {
    if (!document.hidden) {
      if (!reduced) {
        curP += (targetP - curP) * 0.055;
        if (Math.abs(targetP - curP) < 0.0008) curP = targetP;
        setProgress(curP);
      }
      render();
    }
    requestAnimationFrame(tick);
  }
  if (reduced) { setProgress(0); render(); }
  else { tick(); }
  /* 初始幕 */
  go(0.05);

  /* ---- 尺寸适配 ---- */
  function onResize() {
    var w = window.innerWidth, h = window.innerHeight;
    camera.aspect = w / h; camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);
})();
