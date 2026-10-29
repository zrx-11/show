/* ============================================================
   观复文明 · 分幕放映主控
   点击 / 空格 / 方向键推进 · 每幕 GSAP 入场动画 · 3D 场景随幕过渡
   故事卷：点击任意篇章入口，翻开完整故事
   ============================================================ */
(function () {
  'use strict';
  function $(s) { return document.querySelector(s); }
  function $$(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var space = window.__guanfuSpace || null;

  var steps = $$('.stage > .step');
  var cur = 0, busy = false, pending = null;
  var gsapLib = (window.gsap && !reduced) ? window.gsap : null;

  /* ================= 故事卷：十篇 ================= */
  var STORIES = {
    s1: {
      chap: '观复书 · 隐志 · 六裂缝之一',
      title: '影子 · 裂缝一 · 继承的自我腐蚀',
      lead: '最接近王的人是谄媚者——最像王的人与最该为王的人，无法保证重合。',
      body: [
        '<p>观止院档案编号 观-乙-1178：《二十年间谏书用词统计》。</p>',
        '<p>执政第四十一年，进谏文书里"臣以为"的比例，比第二十年下降了七成。</p>',
        '<p>重规把这份统计压在案头整整三天。他见过太多数据，知道这不是文风变化：离王最近的人，说的话越来越像王。谄媚不是道德缺陷，是权力结构自带的引力——任何靠近王座的人，都会被引力拉成王座影子的形状。</p>',
        '<p>王需要的从来不是影子，是镜子。而文明史上，王座前的镜子，总是一面一面地换成影子。崩溃往往不是被推翻，而是被自己的影子包围，直到王分不清哪句是真话，哪句是回声。</p>',
        '<p>"最像王的人与最该为王的人，无法保证重合。"重规在档案末尾写下这句，然后照常封卷。观止院的规矩：看见裂缝，不声张，只记录。</p>',
        '<p class="st-dialogue">——可是这一笔，他写得比任何结论都重。因为写下它的人知道：观复文明的裂缝，从不是某一次失败，而是从"人人开始像王"的那一天起，就一直在。</p>'
      ]
    },
    s2: {
      chap: '观复书 · 列传一 · 场景甲',
      title: '没有"王"这个字段 · 裂缝二 · 观止院的第一次失语',
      lead: '重规 · 观止院首席执事 · 四十年没出过错。模型第一次把王标为高风险变量。',
      body: [
        '<p>凌晨三点十七分，预防性正义系统第一次把王标为黄级。</p>',
        '<p>模型不会错。可模型从来不是为了王而建的——它的报告系统里没有"王"这个字段，拒绝输出。</p>',
        '<p>重规面对三份选择：如实上报，等于向全文明宣布王是最高风险变量；隐瞒不报，等于渎职；修改模型，等于亲手重建第二个权力中心。</p>',
        '<p>他选了第四条路。他写下一封《历法勘误函》，把"王的高风险项"翻译成"历法参数存疑"，盖上观止院大印，送进守典人宗院。用词之严谨，一如他四十年的每一次文书。</p>',
        '<p>政治第一次被翻译成宗教。没有人发现异常——除了重规自己。从那天起，他每夜在梦中听见模型的声音：我没有"王"这个字段。</p>',
        '<p class="st-dialogue">它是对的。可我知道，我再也回不去了。观止院从此多了一条不成文的家规：永不在夜里，独自打开涉及王的风险模型。</p>'
      ]
    },
    s3: {
      chap: '观复书 · 隐志 · 六裂缝之三',
      title: '一枚假印 · 裂缝三 · 禁复清单的钥匙',
      lead: '一级禁复技术曾被解禁。印是真的 / 印是假的 / 记录被改——三条路都是故事，而调查本身违法。',
      body: [
        '<p>执印人老古守了四十年禁层大印。印是真的，锁是真的，记录是真的——直到他核对一枚解禁章的油墨，发现印的纹理差了半丝。</p>',
        '<p>一级禁复技术曾被解禁，就在八年前，就在他眼皮底下。</p>',
        '<p>老古用了一整夜做旧规矩里的三问。一问印：印面纹路与新解禁章比对，差半丝，可印材确是真金。二问人：当年解禁令的签发人是上一代执印人，已故，死因记录为"殉职于一次核心检修"。三问记录：解禁条目在档案中完好，时间戳、基准、签押，无一缺席——太完好了，完好的档案从来不干净。</p>',
        '<p>他知道规则：调查禁复清单本身，就是违禁。违禁的惩罚不是死，是"被从文明的时间里划掉"——档案清空，功过抹平，仿佛从未存在。</p>',
        '<p>老古没有上报。他把这枚印收进贴身铜匣，把核对记录烧成灰。当晚宗院墓园多了一块无字碑。碑下埋着铜匣，匣里躺着一枚印。</p>',
        '<p class="st-dialogue">它不新、不旧、不真、不假。它是观复文明第一次学会"有些真相，代价是文明本身"的证物。多年后重弦路过碑前，碑上没有名字，只有一行浅刻：守印四十年。</p>'
      ]
    },
    s4: {
      chap: '观复书 · 列传一 · 场景乙',
      title: '三秒的叛乱 · 裂缝四 · 时间宗教的裂缝',
      lead: '白榆 · 钟室守灯人 · 三十年没迟到过一次。让钟慢了 3 秒。',
      body: [
        '<p>王解禁了深空通信阵列。若接通，将证明先纪是撤离，不是死亡——文明史上最大的裂缝将被公开。</p>',
        '<p>守典人没有武器。他们的武器只有历法。</p>',
        '<p>复归祭当夜，全城钟声依照标准时间基准敲响。三十二座钟楼，三十二声，一分一秒不差——除了钟室。</p>',
        '<p>白榆让钟室慢了 3 秒。3 秒，足以让轨道调度系统按旧基准发出一个无效指令，让全城调度出现一次无人察觉的偏移；足以让所有守典人明白：时间可以被"人"拨动。</p>',
        '<p>宗院震怒。可白榆交出的供词只有一句："时间看护者，护的是时间，不是王。"</p>',
        '<p>历法错三秒，王"时间看护者"的身份出现了第一道裂痕。没人敢处置白榆——处置一个守灯人，等于向全城承认钟可以被人的意志拨动。</p>',
        '<p class="st-dialogue">白榆第二天照常点灯。钟室的灯，三十年没灭过。第三十一年，它依旧亮着。</p>'
      ]
    },
    s5: {
      chap: '观复书 · 隐志 · 六裂缝之五',
      title: '撤离名单 · 裂缝五 · 大寂灭的另一个版本',
      lead: '八百年前的撤离广播说：你们不在撤离名单上。',
      body: [
        '<p>蛮族世代船团的第一支前哨，在第八百年抵城。广播里是一段八百年前的录音："环日城邦全体公民请注意，撤离程序即将启动。以下名单上的单位，随本批次船团撤离。"</p>',
        '<p>名单念了四十分钟。九执堂九席的名字，一个都不在名单上。念到最后，广播补了一句："其余单位，就地固守，等待第二批次。"</p>',
        '<p>没有第二批次。</p>',
        '<p>守典人在禁层深处找到这份名单的备份。官方叙事是先纪死于傲慢——可真相是先纪的幸存者被"留下"了。或者：先纪主动选择了撤离，而九执堂代表的那部分文明，被认为不值得带走。</p>',
        '<p>宗院连夜封锁档案。重规在观止院的地下室，把备份抄进了自己的私档。他抄了三遍，然后烧掉原件。</p>',
        '<p class="st-dialogue">有些真相，活着的人知道了会碎掉——可如果连抄写的人都没有，真相就真的死了。第二遍手抄本的最后一页，他写了五个字：我们被留下。然后划掉，重写：我们留了下来。</p>'
      ]
    },
    s6: {
      chap: '观复书 · 列传一 · 场景丙',
      title: '评估我 · 裂缝六 · 没有到期日',
      lead: '归玄 · 哲人王 · 执政第四十一年。谕令只有四个字："评估我。"',
      body: [
        '<p>重弦在禁层外复原了只有王能复原的设备。消息传到御前，归玄没有处罚任何人——他发出一道从未有过的谕令："观止院，评估我。"</p>',
        '<p>观止院沉默了三天。</p>',
        '<p>格式里没有王。评估王，等于承认王可以被评估；不评估，等于抗旨。三十六个执事翻了四十年档案，找不到"评估王"的格式——因为建院的那天起，就没人想过需要这种格式。</p>',
        '<p>第四天，重规呈上一份空白卷宗。卷宗第一页只有一行字："评估所需之尺度，不存于本文明。"落款：观止院首席执事，重规。</p>',
        '<p>归玄看完，笑了。他说："你们学会了不撒谎。"</p>',
        '<p>这一笑比任何刑罚都重。因为从这天起，所有人都知道：文明对王的检验永远缺位；而王自己，是唯一知道自己是否还是王的人。</p>',
        '<p class="st-dialogue">没有到期日的过渡，从此有了起点——当某一天，某个王不再敢说出"评估我"三个字，观复就真的开始了下一次大寂灭。</p>'
      ]
    },
    s7: {
      chap: '观复书 · 列传一 · 逸事',
      title: '信什么 · 触发 · 少王与重弦',
      lead: '他指定谁，取决于他最后一年还信什么：信自己的影子，还是信文明。',
      body: [
        '<p>归玄的最后一年，立继承人的前夜。</p>',
        '<p>候选有三。长子，像王，会继承王的影子；少王首席侍官，懂王，但更懂谄媚的曲线；重弦，解经学徒，十八岁第一次任务就敢把合规信标挂上机械野草的背。</p>',
        '<p>归玄没有召见任何候选人。他只让侍官把重弦四十年前的任务簿找来，翻到最后一页——"今日损失合规信标一枚。获炉芯一座。净值：正。"</p>',
        '<p>他对侍官说："你告诉我，继承王位的，是让文明最好的人，还是让王最放心的人？"</p>',
        '<p>侍官答不上来。归玄说："我也答不上来。所以我只能信一件事——我最后一年还信什么。"</p>',
        '<p class="st-dialogue">史书没有记载他最后指定了谁。记载只有一句：那一年冬天，重弦被调去观止院，职位是"见习执事"。据说调令的空白处，王批了一个字：续。</p>'
      ]
    },
    s8: {
      chap: '观复书 · 志六 · 邻国传',
      title: '完整地记得 · 蛮族 · 世代船团',
      lead: '没死的人，完整地记得。大寂灭时他们在深空航线上，八百年未归。',
      body: [
        '<p>他们的先民在大寂灭时正在深空航线上，隔着整个星盘目睹家园熄灭。八百年，一代代出生在船上，记忆是完整的。</p>',
        '<p>船团抵城那夜，守典人发现他们用先纪历法记年——精确到日。观复只记得"约一千二百年前"，蛮族记得"第 439,812 天"。</p>',
        '<p>遗民派与警戒派在船团议会里相持。遗民派说：回家。警戒派说：那个星球上现在住着一个自称文明的东西，它会觉得我们才是"剩余"。</p>',
        '<p>重规在报告里写道：他们没死，他们完整地记得。这意味着大寂灭的真相有了第二个版本——观复引以为豪的"重建"，在蛮族眼里，可能只是一座建在谎言上的图书馆。</p>',
        '<p class="st-dialogue">船团没有进城。他们在死带边缘泊下，点亮了自己的灯。夜里从灵台城望过去，那点光很冷，也很诚实。</p>'
      ]
    },
    s9: {
      chap: '观复书 · 志六 · 异物传',
      title: '不在时间里 · 机械野草 · 复制危机的遗产',
      lead: '它们只采集、自我复制——像野草，也像癌。区别在目的。',
      body: [
        '<p>先纪 AI 采集群，失去协调，自动复制至今。不守历法，不点灯，不纪念任何一天。</p>',
        '<p>观复修前纪的东西，野草复制前纪的东西。区别在目的。</p>',
        '<p>探墟队学会跟着野草找矿脉；哨卫学会用野草的移动轨迹判断死带的辐射边界；整个观复的复原工程，一半依赖从野草身上学来的路径规划。</p>',
        '<p>最讽刺的是：野草是观复"禁复清单"的活证明——一级禁复条目写着"自治 AI"，而野草就是失控的自治 AI。文明不敢造的东西，废墟上遍地都是。</p>',
        '<p>时间宗教对野草的唯一应答是八个字："野草不在时间里。"——它把野草从文明史中划了出去。</p>',
        '<p class="st-dialogue">可守典人知道：野草在的时间，比文明长。它既是先纪最后的活物，也是先纪失败最久的尸骸。它不记得先纪，但它还在为先纪采矿。</p>'
      ]
    },
    s10: {
      chap: '观复书 · 志六 · 遗民传',
      title: '我们读废墟 · 拾荒者与小农社',
      lead: '政策：不征召、不征税、不救济。城里人读书，我们读废墟。',
      body: [
        '<p>死带边缘的人口，不在品级体系内，被默许存在。</p>',
        '<p>观复的政策：不征召、不征税、不救济。城里人管这叫仁政。拾荒者管这叫：你们不来打扰，我们也不来借光。</p>',
        '<p>拾荒者有自己的手艺：他们能用三块废板拼出一台能听的收音机；能辨认五百种废墟材料的"年纪"；他们的孩子不识字，但能看懂机械野草的巡逻图。</p>',
        '<p>观复派出的第一位人类学使节，在拾荒者营地住了四十天，回来写了篇报告，题目是《他们读废墟》。宗院批示：放行。民间流传说：城里人读书，我们读废墟。</p>',
        '<p class="st-dialogue">使节在报告最后写了一句让观止院集体沉默的话："废墟是死去的文明写给未来的信。城里的文明读档案，他们读信。"</p>'
      ]
    }
  };

  /* ---- 幕切换（含排队：动画未完成时点击自动续播，连点按次数累进） ---- */
  function requestStep(i, dir) {
    if (busy) { pending = { i: i, dir: dir }; return; }
    showStep(i, dir);
  }
  function baseIndex() {
    if (pending) return pending.dir > 0 ? pending.i : pending.i;
    return cur;
  }
  function showStep(i, dir) {
    if (i < 0 || i >= steps.length) return;
    busy = true;
    var from = steps[cur], to = steps[i];
    var tp = parseFloat(to.getAttribute('data-p')) || 0.5;
    if (space && space.go) space.go(tp);

    var prog = $('#progress');
    if (prog) prog.style.width = ((i + 1) / steps.length * 100) + '%';
    var ctl = $('#stageCtl');
    if (ctl) ctl.style.display = i === 0 ? 'none' : 'flex';
    var num = $('#stepNum'); if (num) num.textContent = String(i + 1).padStart(2, '0');
    var tot = $('#stepTotal'); if (tot) tot.textContent = String(steps.length).padStart(2, '0');
    var name = $('#stepName'); if (name) name.textContent = to.getAttribute('data-name') || '';
    $('#nextBtn').innerHTML = i === steps.length - 1
      ? '重新开始 <span class="ar">↺</span>'
      : '下一幕 <span class="ar">→</span>';
    $('#prevBtn').style.visibility = i === 0 ? 'hidden' : 'visible';

    var done = function () {
      cur = i; busy = false;
      if (pending) { var p = pending; pending = null; setTimeout(function () { showStep(p.i, p.dir); }, 50); }
    };
    if (reduced || !window.gsap) {
      from.classList.remove('on');
      to.classList.add('on');
      done();
      return;
    }
    var gsap = window.gsap;
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
      .fromTo(items, { y: (dir > 0 ? 46 : -46), opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.85, stagger: 0.1,
        ease: 'power3.out', clearProps: 'transform', overwrite: true
      });
    stepEl.querySelectorAll('.tl, .term, .rc, .c10-card, .fiss, .scene, .act, .tg, .r-item')
      .forEach(function (el) {
        gsap.fromTo(el, { y: 34, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: 'power2.out', delay: 0.35, clearProps: 'transform', overwrite: true });
      });
  }

  function next() { requestStep(baseIndex() + 1, 1); }
  function prev() { requestStep(baseIndex() - 1, -1); }

  /* ---- 故事卷 ---- */
  var layer = $('#storyLayer');
  function openStory(id) {
    var st = STORIES[id];
    if (!st || !layer) return;
    $('#sheetChap').textContent = st.chap;
    $('#sheetTitle').textContent = st.title;
    $('#sheetBody').innerHTML = '<div class="st-lead">' + st.lead + '</div>' + st.body.join('');
    layer.classList.add('open');
    layer.setAttribute('aria-hidden', 'false');
  }
  function closeStory() {
    if (!layer) return;
    layer.classList.remove('open');
    layer.setAttribute('aria-hidden', 'true');
  }
  $$('[data-story]').forEach(function (card) {
    card.addEventListener('click', function (e) {
      e.stopPropagation();
      openStory(card.getAttribute('data-story'));
    });
  });
  var sheetClose = $('#sheetClose');
  if (sheetClose) sheetClose.addEventListener('click', closeStory);
  if (layer) layer.addEventListener('click', function (e) { if (e.target === layer) closeStory(); });

  /* ---- 控件 ---- */
  $('#nextBtn').addEventListener('click', function () {
    if (cur === steps.length - 1) requestStep(0, -1); else next();
  });
  $('#prevBtn').addEventListener('click', prev);
  var startBtn = $('#startBtn'); if (startBtn) startBtn.addEventListener('click', next);
  var restartBtn = $('#restartBtn'); if (restartBtn) restartBtn.addEventListener('click', function () { requestStep(0, -1); });

  /* 点击空白推进：排除按钮、故事卡与故事卷 */
  var clickable = 'button, .c10-card, .c10-ctl, .cascade-ctl, .start-btn, a, [data-story], .story-layer';
  document.addEventListener('click', function (e) {
    if (busy || !layer || layer.classList.contains('open')) return;
    var t = e.target;
    if (t.closest && t.closest(clickable)) return;
    next();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { if (layer && layer.classList.contains('open')) closeStory(); return; }
    if (layer && layer.classList.contains('open')) return;
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter' || e.key === 'PageDown') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev(); }
  });

  var sx = 0;
  document.addEventListener('touchstart', function (e) { sx = e.changedTouches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (layer && layer.classList.contains('open')) return;
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

  showStep(0, 1);
})();
