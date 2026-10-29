/* ============================================================
   观复文明 · 三维场景引擎（增强版）
   太阳与光晕 · 旋转星环 · 行星轨道 · 崩坏粒子 · 重建塔影
   由分幕控制器通过 go(p) 驱动状态过渡
   ============================================================ */
(function () {
  'use strict';
  var canvas = document.getElementById('space');
  if (!canvas || !window.THREE) {
    document.body.classList.add('no-three');
    return;
  }
  var mobile = window.innerWidth < 720;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  try {
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: !mobile, alpha: true });
  } catch (err) {
    document.body.classList.add('no-three');
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 1, 3000);
  camera.position.set(0, 42, 175);
  camera.lookAt(0, 18, -80);

  function seg(p, a, b, v0, v1) {
    if (p <= a) return v0;
    if (p >= b) return v1;
    return v0 + (v1 - v0) * (p - a) / (b - a);
  }

  /* ---- 背景星尘（2000 点，整体缓慢自转） ---- */
  var starGeo = new THREE.BufferGeometry();
  var starN = mobile ? 900 : 2000, starPos = new Float32Array(starN * 3), starCol = new Float32Array(starN * 3);
  for (var i = 0; i < starN; i++) {
    var r = 120 + Math.random() * 320;
    var th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
    starPos[i*3] = r * Math.sin(ph) * Math.cos(th);
    starPos[i*3+1] = r * Math.cos(ph) * 0.6;
    starPos[i*3+2] = r * Math.sin(ph) * Math.sin(th) - 80;
    var bri = 0.45 + Math.random() * 0.55;
    starCol[i*3] = bri; starCol[i*3+1] = bri; starCol[i*3+2] = bri;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  var starMat = new THREE.PointsMaterial({ size: 2.1, vertexColors: true, transparent: true, opacity: 1, depthWrite: false });
  var stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  /* ---- 银河旋臂星云（双旋臂，黑金基调） ---- */
  var NEB_N = mobile ? 1800 : 5600;
  var nebGeo = new THREE.BufferGeometry();
  var nebPos = new Float32Array(NEB_N * 3), nebCol = new Float32Array(NEB_N * 3);
  for (var i = 0; i < NEB_N; i++) {
    var arm = i % 2;
    var pr = Math.random();
    var rad = 42 + Math.pow(pr, 1.28) * 300;
    var th = arm * Math.PI + rad * 0.03 + (Math.random() * 0.6 - 0.3);
    var y = (Math.random() - 0.5) * 7 * (1 - pr * 0.55);
    nebPos[i*3] = Math.cos(th) * rad;
    nebPos[i*3+1] = y - 8;
    nebPos[i*3+2] = Math.sin(th) * rad - 185;
    var b = 0.25 + pr * 0.5;
    if (Math.random() < 0.8) { nebCol[i*3] = 0.5+b*0.5; nebCol[i*3+1] = 0.36+b*0.42; nebCol[i*3+2] = 0.18+b*0.24; }
    else { nebCol[i*3] = 0.42+b*0.4; nebCol[i*3+1] = 0.3+b*0.3; nebCol[i*3+2] = 0.5+b*0.34; }
  }
  nebGeo.setAttribute('position', new THREE.BufferAttribute(nebPos, 3));
  nebGeo.setAttribute('color', new THREE.BufferAttribute(nebCol, 3));
  var nebMat = new THREE.PointsMaterial({ size: mobile ? 2.4 : 3.6, vertexColors: true, transparent: true, opacity: 0.42, depthWrite: false, blending: THREE.AdditiveBlending });
  var nebula = new THREE.Points(nebGeo, nebMat);
  nebula.position.y = 14;
  scene.add(nebula);

  /* ---- 流星带（周期性掠过的金色流光） ---- */
  var METEOR_N = mobile ? 4 : 10;
  var meteors = [];
  (function () {
    var baseMat = new THREE.LineBasicMaterial({ color: 0xE8D9A8, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
    for (var i = 0; i < METEOR_N; i++) {
      var g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
      var line = new THREE.Line(g, baseMat.clone());
      scene.add(line);
      meteors.push({ line: line, y: 34 + Math.random() * 46, len: 20 + Math.random() * 44, active: false, wait: Math.random() * 14, xx: 0, tt: 0, dur: 1.5 + Math.random() * 1.3 });
    }
  })();

  /* ---- 深空之眼（远处金环，缓慢旋转） ---- */
  var eyeGroup = new THREE.Group();
  eyeGroup.position.set(88, 44, -238);
  scene.add(eyeGroup);
  var eyeDark = new THREE.Mesh(new THREE.CircleGeometry(15, 48), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.94, side: THREE.DoubleSide, depthWrite: false }));
  eyeGroup.add(eyeDark);
  var eyeRing1 = new THREE.Mesh(new THREE.RingGeometry(14.5, 16.6, 64), new THREE.MeshBasicMaterial({ color: 0xD9A441, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false }));
  eyeGroup.add(eyeRing1);
  var eyeRing2 = new THREE.Mesh(new THREE.RingGeometry(18.2, 19.4, 64), new THREE.MeshBasicMaterial({ color: 0x9a7b33, transparent: true, opacity: 0.26, side: THREE.DoubleSide, depthWrite: false }));
  eyeGroup.add(eyeRing2);
  var eyeGlow = new THREE.Mesh(new THREE.RingGeometry(19.8, 26, 64), new THREE.MeshBasicMaterial({ color: 0xE8D9A8, transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
  eyeGroup.add(eyeGlow);

  /* ---- 超远尘埃环（第三层，极淡的金色宽环） ---- */
  var dustRing = new THREE.Mesh(new THREE.RingGeometry(138, 152, 128), new THREE.MeshBasicMaterial({ color: 0xC9A04B, transparent: true, opacity: 0.055, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
  dustRing.position.set(0, 26, -150);
  dustRing.rotation.x = 0.35;
  scene.add(dustRing);

  /* ---- 太阳组 ---- */
  var sunGroup = new THREE.Group();
  scene.add(sunGroup);
  var sunCore = new THREE.Mesh(
    new THREE.SphereGeometry(13, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0xF5D48A, transparent: true })
  );
  sunGroup.add(sunCore);
  var glowTex = (function () {
    var c = document.createElement('canvas'); c.width = c.height = 256;
    var g = c.getContext('2d');
    var gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, 'rgba(240,212,138,1)');
    gr.addColorStop(0.25, 'rgba(217,164,65,.55)');
    gr.addColorStop(0.6, 'rgba(217,164,65,.12)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  })();
  var sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
  sunGlow.scale.set(160, 160, 1); sunGroup.add(sunGlow);
  var sunHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false }));
  sunHalo.scale.set(400, 400, 1); sunGroup.add(sunHalo);
  /* 辐射射线 */
  var rayN = 14, rayPos = new Float32Array(rayN * 6);
  for (var ri = 0; ri < rayN; ri++) {
    var a = ri / rayN * Math.PI * 2 + 0.2;
    var r1 = 16.5, r2 = 19 + (ri % 3) * 2.4;
    rayPos[ri*6] = Math.cos(a) * r1; rayPos[ri*6+1] = Math.sin(a) * r1; rayPos[ri*6+2] = 0;
    rayPos[ri*6+3] = Math.cos(a) * r2; rayPos[ri*6+4] = Math.sin(a) * r2; rayPos[ri*6+5] = 0;
  }
  var raysGeo = new THREE.BufferGeometry();
  raysGeo.setAttribute('position', new THREE.BufferAttribute(rayPos, 3));
  var rays = new THREE.LineSegments(raysGeo, new THREE.LineBasicMaterial({ color: 0xF0D48A, transparent: true, opacity: 0.8 }));
  sunGroup.add(rays);

  /* ---- 星环 A（金色，倾角）与细环 ---- */
  function makeRing(rIn, rOut, n, hue) {
    var g = new THREE.BufferGeometry(), p = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2;
      var r = rIn + Math.random() * (rOut - rIn);
      p[i*3] = Math.cos(a) * r; p[i*3+1] = Math.sin(a) * r; p[i*3+2] = 0;
    }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    return new THREE.Points(g, new THREE.PointsMaterial({ color: hue, size: 1.5, transparent: true, opacity: 1, depthWrite: false }));
  }
  var ringGroup = new THREE.Group();
  ringGroup.rotation.x = 1.12; ringGroup.position.y = 6;
  scene.add(ringGroup);
  var ringA = new THREE.Group();
  var ringA1 = makeRing(44, 62, 1500, 0xD9A441);
  var ringA2 = makeRing(64, 66, 240, 0xF0D48A);
  ringA.add(ringA1); ringA.add(ringA2);
  ringGroup.add(ringA);
  /* 残环 B（锈色，崩溃段） */
  var ringB = makeRing(34, 46, 700, 0xA34A2C);
  ringB.material.opacity = 0;
  ringGroup.add(ringB);

  /* ---- 轨道与行星 ---- */
  var orbitGroup = new THREE.Group();
  scene.add(orbitGroup);
  function makeOrbit(r, tilt) {
    var pts = [];
    for (var i = 0; i <= 128; i++) {
      var a = i / 128 * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
    }
    var g = new THREE.BufferGeometry().setFromPoints(pts);
    var l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0x8FB6E8, transparent: true, opacity: 0.28, depthWrite: false }));
    l.rotation.x = tilt; l.rotation.z = 0.35;
    return l;
  }
  var orbit1 = makeOrbit(82, 0.16); orbitGroup.add(orbit1);
  var orbit2 = makeOrbit(104, 0.3); orbit2.material.color.setHex(0xD9A441); orbit2.material.opacity = 0.16; orbitGroup.add(orbit2);
  var planets = [];
  var pdefs = [
    { r: 82, ph: 0.6, size: 3.2, color: 0xE0B45A, tilt: 0.16 },
    { r: 104, ph: 2.4, size: 2.6, color: 0x8FB6E8, tilt: 0.3 },
    { r: 82, ph: 4.1, size: 1.8, color: 0xE0603A, tilt: 0.16 }
  ];
  pdefs.forEach(function (pd) {
    var m = new THREE.Mesh(
      new THREE.SphereGeometry(pd.size, 16, 16),
      new THREE.MeshBasicMaterial({ color: pd.color, transparent: true })
    );
    m.userData = pd;
    orbitGroup.add(m);
    planets.push(m);
  });

  /* ---- 崩坏粒子（红锈，大寂灭段） ---- */
  var bitsGeo = new THREE.BufferGeometry();
  var bitsN = 320, bitsPos = new Float32Array(bitsN * 3), bitsSpd = new Float32Array(bitsN);
  for (var bi = 0; bi < bitsN; bi++) {
    var a = Math.random() * Math.PI * 2, r = 28 + Math.random() * 44;
    bitsPos[bi*3] = Math.cos(a) * r; bitsPos[bi*3+1] = Math.sin(a) * r * 0.5; bitsPos[bi*3+2] = 0;
    bitsSpd[bi] = 4 + Math.random() * 10;
  }
  bitsGeo.setAttribute('position', new THREE.BufferAttribute(bitsPos, 3));
  var bitsMat = new THREE.PointsMaterial({ color: 0xE0603A, size: 1.4, transparent: true, opacity: 0, depthWrite: false });
  var bits = new THREE.Points(bitsGeo, bitsMat);
  ringGroup.add(bits);

  /* ---- 废墟点阵（地面） ---- */
  var ruinGeo = new THREE.BufferGeometry();
  var ruinN = mobile ? 200 : 420, ruinPos = new Float32Array(ruinN * 3);
  for (var rui = 0; rui < ruinN; rui++) {
    var x = (Math.random() - 0.5) * 220, z = (Math.random() - 0.5) * 220;
    ruinPos[rui*3] = x; ruinPos[rui*3+1] = -34 + Math.random() * 5; ruinPos[rui*3+2] = z - 60;
  }
  ruinGeo.setAttribute('position', new THREE.BufferAttribute(ruinPos, 3));
  var ruinMat = new THREE.PointsMaterial({ color: 0x8A6A2A, size: 1.1, transparent: true, opacity: 0.12, depthWrite: false });
  var ruins = new THREE.Points(ruinGeo, ruinMat);
  scene.add(ruins);

  /* ---- 重建：光柱 + 上升粒子 + 大图书馆塔影 ---- */
  var pillarMat = new THREE.MeshBasicMaterial({ color: 0xF0D48A, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
  var pillar = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 8, 130, 24, 1, true), pillarMat);
  pillar.position.set(0, 35, -60);
  scene.add(pillar);
  var pillarGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  pillarGlow.scale.set(160, 260, 1);
  pillarGlow.position.set(0, 38, -60);
  scene.add(pillarGlow);
  var upGeo = new THREE.BufferGeometry();
  var upN = 550, upPos = new Float32Array(upN * 3);
  for (var ui = 0; ui < upN; ui++) {
    upPos[ui*3] = (Math.random() - 0.5) * 16;
    upPos[ui*3+1] = -60 + Math.random() * 140;
    upPos[ui*3+2] = -60 + (Math.random() - 0.5) * 10;
  }
  upGeo.setAttribute('position', new THREE.BufferAttribute(upPos, 3));
  var upMat = new THREE.PointsMaterial({ color: 0xF0D48A, size: 1.3, transparent: true, opacity: 0, depthWrite: false });
  var ups = new THREE.Points(upGeo, upMat);
  scene.add(ups);
  /* 大图书馆塔影：7 座线框塔 */
  var towers = [];
  for (var ti = 0; ti < 7; ti++) {
    var tw = 4 + Math.random() * 5, th = 26 + Math.random() * 42, td = 4 + Math.random() * 5;
    var box = new THREE.Mesh(new THREE.BoxGeometry(tw, th, td), new THREE.MeshBasicMaterial({ color: 0xD9A441, transparent: true, opacity: 0, wireframe: true }));
    var x = (ti - 3) * 16 + (Math.random() - 0.5) * 8;
    box.position.set(x, -10 + th / 2, -58 + (Math.random() - 0.5) * 16);
    box.userData.base = box.position.y;
    scene.add(box);
    towers.push(box);
  }

  /* ---- 状态 ---- */
  var cur = { sun: 1, ra: 1, speed: 0.55, rb: 0, pillar: 0, up: 0, starCol: 1, collapse: 0, ruin: 0, towers: 0 };
  function setProgress(p) {
    p = Math.max(0, Math.min(1, p));
    var c = cur;
    var sun = p < 0.07 ? 1 : p < 0.13 ? 1 - seg(p, 0.07, 0.13, 0, 0.88) : 0.12;
    /* 大寂灭幕（p 0.16–0.34）：恒星进一步熄灭至 0.03，重建后回到暗淡微光 */
    c.sun = (p >= 0.16 && p < 0.34) ? Math.max(0.03, sun - seg(p, 0.16, 0.34, 0, 0.09)) : sun;
    c.ra = p < 0.2 ? 1 : p < 0.34 ? Math.max(0.06, 1 - seg(p, 0.2, 0.34, 0, 1)) : p < 0.6 ? 0.08 : seg(p, 0.6, 0.75, 0.08, 0.92);
    c.speed = p < 0.2 ? 1.6 : p < 0.34 ? 1.6 * (1 - seg(p, 0.2, 0.34, 0, 0.92)) : p < 0.6 ? 0.12 : seg(p, 0.6, 0.75, 0.12, 1.05);
    c.rb = Math.max(0, seg(p, 0.2, 0.36, 0, 1) - seg(p, 0.62, 0.85, 0, 0.5));
    c.collapse = Math.max(0, seg(p, 0.24, 0.38, 0, 1) - seg(p, 0.5, 0.66, 0, 0.75));
    c.ruin = Math.max(0, seg(p, 0.3, 0.46, 0, 1) - seg(p, 0.7, 0.9, 0, 0.6));
    c.pillar = Math.max(0, seg(p, 0.34, 0.52, 0, 1) - seg(p, 0.8, 0.97, 0, 0.45));
    c.up = c.pillar;
    c.towers = Math.max(0, seg(p, 0.38, 0.58, 0, 1) - seg(p, 0.82, 0.97, 0, 0.4));
    c.starCol = p < 0.2 ? 1 : p < 0.34 ? 1 - seg(p, 0.2, 0.34, 0, 0.55) : p < 0.6 ? seg(p, 0.34, 0.6, 0.45, 1) : 1;
  }

  /* ---- 幕驱动：目标进度 + 平滑过渡 ---- */
  var curP = 0, targetP = 0;
  function go(p) {
    targetP = Math.max(0, Math.min(1, p));
  }
  window.__guanfuSpace = { go: go, setProgress: setProgress, getP: function () { return curP; } };
  window.__guanfuDiag = { ringA: ringA, ringB: ringB, rays: rays, planets: planets, orbit1: orbit1, orbit2: orbit2, stars: stars };

  /* ---- 漂浮残页（废土史书碎片） ---- */
  var PAGES_N = mobile ? 3 : 6;
  var pages = [];
  (function () {
    var c = document.createElement('canvas'); c.width = 64; c.height = 88;
    var g = c.getContext('2d');
    g.strokeStyle = 'rgba(217,164,65,.9)'; g.lineWidth = 1.3;
    g.strokeRect(6, 6, 52, 76);
    g.beginPath(); g.moveTo(6, 6); g.lineTo(38, 38); g.stroke();
    g.fillStyle = 'rgba(217,164,65,.4)';
    g.fillRect(15, 26, 30, 2); g.fillRect(15, 37, 22, 2); g.fillRect(15, 48, 34, 2); g.fillRect(15, 59, 18, 2);
    var tex = new THREE.CanvasTexture(c);
    for (var i = 0; i < PAGES_N; i++) {
      var mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.1 + Math.random() * 0.07, side: THREE.DoubleSide, depthWrite: false });
      var mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.6 + Math.random() * 2.4, 3.6 + Math.random() * 3.2), mat);
      var ang = Math.random() * Math.PI * 2, r = 68 + Math.random() * 46;
      mesh.name = 'page';
      mesh.position.set(Math.cos(ang) * r, -8 + Math.random() * 34, Math.sin(ang) * r - 30);
      scene.add(mesh);
      pages.push({ mesh: mesh, ang: ang, r: r, spd: (Math.random() * 0.5 + 0.25) * (Math.random() < .5 ? 1 : -1), yb: mesh.position.y, ph: Math.random() * Math.PI * 2 });
    }
  })();
  if (window.__guanfuDiag) { window.__guanfuDiag.pages = PAGES_N; window.__guanfuDiag.nebula = NEB_N; window.__guanfuDiag.meteors = METEOR_N; }

  /* ---- 视差 ---- */
  var mx = 0, my = 0, tx = 0, ty = 0;
  if (!mobile) {
    window.addEventListener('pointermove', function (e) {
      tx = (e.clientX / window.innerWidth - .5) * 2;
      ty = (e.clientY / window.innerHeight - .5) * 2;
    });
  }

  /* ---- 主循环 ---- */
  var clock = new THREE.Clock();
  var t = 0, planetT = 0;
  var starColArr = [1, 1, 1];
  function render() {
    {
      var dt = clock.getDelta() * slowK;
      t += dt;
      /* 太阳脉动与光晕 */
      var pulse = 1 + Math.sin(t * 0.8) * 0.035;
      sunCore.material.opacity = Math.min(1, cur.sun * 1.15);
      sunGlow.material.opacity = cur.sun * (0.9 + pulse * 0.1);
      sunHalo.material.opacity = cur.sun * (0.35 + pulse * 0.12);
      rays.rotation.z += dt * 0.55 * (0.3 + cur.sun);
      rays.material.opacity = 0.8 * cur.sun;
      /* 星环旋转 */
      /* 银河旋臂缓慢旋转 */
      nebula.rotation.y += dt * 0.018;
      nebula.material.opacity = 0.32 + cur.speed * 0.3;
      /* 流星带 */
      meteors.forEach(function (m) {
        if (!m.active) {
          m.wait -= dt;
          if (m.wait <= 0) { m.active = true; m.xx = -95 - Math.random() * 30; m.tt = 0; m.dur = 1.5 + Math.random() * 1.3; }
        } else {
          m.tt += dt;
          var k = m.tt / m.dur;
          if (k >= 1) { m.active = false; m.wait = 7 + Math.random() * 9; m.line.material.opacity = 0; return; }
          var x0 = m.xx + k * 250, y0 = m.y - k * 74;
          var fade = Math.sin(Math.min(1, k * 3) * Math.PI / 2) * (1 - Math.max(0, (k - 0.72) / 0.28));
          var arr = m.line.geometry.attributes.position.array;
          arr[0] = x0 - m.len; arr[1] = y0 + m.len * 0.28; arr[2] = -150;
          arr[3] = x0; arr[4] = y0; arr[5] = -150;
          m.line.geometry.attributes.position.needsUpdate = true;
          m.line.material.opacity = fade * 0.9;
        }
      });
      /* 超远尘埃环缓慢反向旋转 */
      dustRing.rotation.z -= dt * 0.03;
      dustRing.material.opacity = 0.045 + Math.sin(t * 0.4) * 0.018 + cur.speed * 0.02;
      /* 深空之眼 */
      eyeGroup.rotation.z += dt * 0.06;
      eyeRing1.material.opacity = 0.4 + Math.sin(t * 0.7) * 0.12;
      eyeGlow.material.opacity = 0.08 + Math.sin(t * 0.55) * 0.06;
      /* 残页漂浮 */
      pages.forEach(function (pg, pi) {
        pg.ang += dt * pg.spd * (0.35 + cur.speed * 0.85);
        pg.mesh.position.x = Math.cos(pg.ang) * pg.r;
        pg.mesh.position.z = Math.sin(pg.ang) * pg.r - 30;
        pg.mesh.position.y = pg.yb + Math.sin(t * 0.5 + pg.ph) * 5;
        pg.mesh.rotation.y = pg.ang * 0.6;
        pg.mesh.rotation.z = Math.sin(t * 0.4 + pg.ph) * 0.35;
        pg.mesh.material.opacity = 0.12 * (0.5 + cur.speed) + cur.collapse * 0.08;
      });
      ringA.rotation.z += dt * cur.speed;
      ringB.rotation.z -= dt * cur.speed * 0.35;
      ringB.material.opacity = cur.rb * 0.55;
      /* 行星轨道（崩溃段坠落） */
      var fall = Math.max(0, cur.collapse);
      planetT += dt * 0.35 * (0.2 + cur.speed * 1.1);
      planets.forEach(function (pl) {
        var pd = pl.userData;
        pl.material.opacity = 1 - fall * 0.85;
        var yBase = Math.sin(planetT + pd.ph) * 6 + 8;
        var y = yBase - fall * 46;
        pl.position.set(Math.cos(planetT + pd.ph) * pd.r, Math.max(-40, y), Math.sin(planetT + pd.ph) * pd.r);
      });
      orbit1.rotation.z += dt * 0.07; orbit2.rotation.z -= dt * 0.05;
      /* 崩坏粒子下落 */
      if (cur.collapse > 0) {
        var bArr = bitsGeo.attributes.position.array;
        for (var bi2 = 0; bi2 < bitsN; bi2++) {
          bArr[bi2*3+1] -= dt * bitsSpd[bi2];
          if (bArr[bi2*3+1] < -70) { bArr[bi2*3+1] = 30; }
        }
        bitsGeo.attributes.position.needsUpdate = true;
      }
      bits.material.opacity = cur.collapse * 0.8;
      ruins.material.opacity = 0.1 + cur.ruin * 0.55;
      /* 上升粒子 */
      if (cur.up > 0) {
        var upArr = upGeo.attributes.position.array;
        for (var ui2 = 0; ui2 < upN; ui2++) {
          upArr[ui2*3+1] += dt * (22 + (ui2 % 7) * 3.2);
          if (upArr[ui2*3+1] > 105) upArr[ui2*3+1] = -58;
        }
        upGeo.attributes.position.needsUpdate = true;
      }
      upMat.opacity = cur.up * 0.8;
      pillar.material.opacity = cur.pillar * 0.3;
      pillarGlow.material.opacity = cur.pillar * (0.5 + pulse * 0.15);
      /* 塔影升起 */
      towers.forEach(function (tw, i) {
        var k = Math.max(0, cur.towers - i * 0.04);
        tw.material.opacity = k * 0.55;
        tw.position.y = tw.userData.base - 46 + k * 46;
      });
      /* 星尘颜色过渡 + 自转 */
      var mix = 1 - cur.starCol;
      starColArr[0] = 1 - mix * 0.5; starColArr[1] = 1 - mix * 0.62; starColArr[2] = 1 - mix * 0.85;
      starMat.color.setRGB(starColArr[0], starColArr[1], starColArr[2]);
      stars.rotation.y += dt * 0.025;
      /* 视差 + 镜头呼吸叠加 */
      mx += (tx - mx) * 0.04; my += (ty - my) * 0.04;
      camera.position.x = mx * 40 + Math.sin(t * 0.3) * 9;
      camera.position.y = 42 + my * 30 + Math.cos(t * 0.22) * 5;
    }
    camera.lookAt(0, 18, -80);
    renderer.render(scene, camera);
  }

  var slowK = reduced ? 0.45 : 1;
  function tick() {
    if (!document.hidden) {
      curP += (targetP - curP) * 0.055 * slowK;
      if (Math.abs(targetP - curP) < 0.0008) curP = targetP;
      setProgress(curP);
      render();
    }
    requestAnimationFrame(tick);
  }
  tick();
  go(0.02);

  /* ---- 尺寸适配 ---- */
  function onResize() {
    var w = window.innerWidth, h = window.innerHeight;
    camera.aspect = w / h; camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);
})();
