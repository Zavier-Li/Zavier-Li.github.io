(() => {
  const body = document.body;
  if (!body || !body.classList.contains("zl-site")) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const i18n = {
    en: {
      "nav.work": "WORK",
      "nav.method": "METHOD",
      "nav.contact": "CONTACT",
      "header.status": "OPEN TO GOOD QUESTIONS",
      "hero.kicker": "AI SYSTEMS · SOFTWARE TOOLS · CREATIVE TECHNOLOGY",
      "hero.title.one": "MAKE THE",
      "hero.title.two": "INVISIBLE",
      "hero.title.three": "LEGIBLE.",
      "hero.deck": "Z Lab turns complex ideas into systems people can inspect, use and carry forward.",
      "hero.action": "ENTER THE LAB",
      "hero.secondary": "READ THE SIGNAL",
      "hero.note": "Good tools make the next move obvious.",
      "hero.scroll": "SCROLL TO DECODE",
      "manifesto.label": "SIGNAL / POINT OF VIEW",
      "manifesto.title.one": "WE TURN",
      "manifesto.title.two": "COMPLEX",
      "manifesto.title.three": "INTO CLEAR MOVES.",
      "manifesto.copy": "A small studio for the strange middle: where research becomes a product, where code becomes a medium, and where a hard question gets a shape.",
      "manifesto.link": "SEE HOW WE WORK",
      "work.label": "ACTIVE MATTER / SELECTED WORK",
      "work.title": "Things we have<br /><em>made useful.</em>",
      "work.copy": "From a campus knowledge layer to a keyboard-first tool: a few systems that made it out of the lab.",
      "project.zhixing": "Campus services + an evidence-backed AI assistant.",
      "project.vibe": "Code-driven video editing as an editable system.",
      "project.er": "Entity-relation extraction people can actually review.",
      "project.zodel": "Model routing and workflow orchestration for curious machines.",
      "work.footer": "The archive keeps growing.",
      "method.label": "METHOD / HOW WE MOVE",
      "method.title": "Keep the magic.<br /><em>Show the mechanism.</em>",
      "method.copy": "The best interface is a window into the system. We work in public with the important parts: evidence, states, constraints and the next useful action.",
      "method.one.title": "SURFACE THE SIGNAL",
      "method.one.copy": "Find the hidden structure before choosing a surface. A clear model gives the visual somewhere to go.",
      "method.two.title": "MAKE IT INSPECTABLE",
      "method.two.copy": "Keep sources close, expose state and leave room for a human to correct the machine.",
      "method.three.title": "SHIP THE STRANGE",
      "method.three.copy": "A memorable idea only matters when it survives contact with real work, real devices and a real next step.",
      "trace.one": "listen --for=the_real_question",
      "trace.two": "make --structure=visible",
      "trace.three": "ship --with=one_strange_detail",
      "contact.label": "OPEN CHANNEL / NEXT MOVE",
      "contact.title.one": "BRING A",
      "contact.title.two": "STRANGE",
      "contact.title.three": "QUESTION.",
      "contact.copy": "Research collaboration, product engineering or a creative system with a pulse — send the first signal.",
      "contact.location": "BEIJING / CHINA",
      "contact.availability": "AVAILABLE FOR SELECT COLLABORATIONS",
      "footer.time": "LOCAL TIME",
      "footer.credit": "BUILT WITH CURIOSITY"
    },
    zh: {
      "nav.work": "项目",
      "nav.method": "方法",
      "nav.contact": "联系",
      "header.status": "欢迎有趣的问题",
      "hero.kicker": "AI 系统 · 软件工具 · 创意技术",
      "hero.title.one": "让不可见的",
      "hero.title.two": "复杂",
      "hero.title.three": "变得清晰。",
      "hero.deck": "Z Lab 把复杂想法变成可以检查、使用并继续生长的系统。",
      "hero.action": "进入实验室",
      "hero.secondary": "读取信号",
      "hero.note": "好的工具，会让下一步自然出现。",
      "hero.scroll": "向下解码",
      "manifesto.label": "信号 / 我们的方向",
      "manifesto.title.one": "把复杂",
      "manifesto.title.two": "变成",
      "manifesto.title.three": "清晰的行动。",
      "manifesto.copy": "一个处理奇异中间地带的小型工作室：让研究变成产品，让代码成为媒介，让难题拥有形状。",
      "manifesto.link": "看看我们如何工作",
      "work.label": "正在发生 / 精选项目",
      "work.title": "我们把一些东西<br /><em>做得有用了。</em>",
      "work.copy": "从校园知识层到键盘优先工具：一些真正走出实验室的系统。",
      "project.zhixing": "校园服务与带证据链的 AI 助手。",
      "project.vibe": "把代码化视频编辑做成可修改的系统。",
      "project.er": "让人真正可以审阅的实体关系抽取。",
      "project.zodel": "给好奇机器使用的模型路由与工作流编排。",
      "work.footer": "档案仍在生长。",
      "method.label": "方法 / 我们如何移动",
      "method.title": "保留魔法。<br /><em>展示机制。</em>",
      "method.copy": "最好的界面，是进入系统的一扇窗。我们把重要的部分放到台面上：证据、状态、约束，以及下一步有用的动作。",
      "method.one.title": "让信号浮现",
      "method.one.copy": "先找到隐藏的结构，再选择表面。清晰的模型会告诉视觉该往哪里走。",
      "method.two.title": "让结果可审阅",
      "method.two.copy": "保留来源、暴露状态，也为人修正机器留下空间。",
      "method.three.title": "把奇怪的想法交付出去",
      "method.three.copy": "值得记住的想法，必须经得起真实工作、真实设备和下一步行动。",
      "trace.one": "listen --for=the_real_question",
      "trace.two": "make --structure=visible",
      "trace.three": "ship --with=one_strange_detail",
      "contact.label": "开放频道 / 下一步",
      "contact.title.one": "带来一个",
      "contact.title.two": "奇怪的",
      "contact.title.three": "问题。",
      "contact.copy": "研究合作、产品工程，或者一个有脉搏的创意系统——把第一条信号发过来。",
      "contact.location": "中国 / 北京",
      "contact.availability": "接受精选合作",
      "footer.time": "本地时间",
      "footer.credit": "带着好奇心构建"
    }
  };

  let language = localStorage.getItem("zlab-language") || "en";
  const translate = (key) => (i18n[language] && i18n[language][key]) || key;

  function applyLanguage() {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      node.innerHTML = translate(node.dataset.i18n);
    });
    document.querySelectorAll("[data-lang]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.lang === language);
    });
    document.title = language === "zh" ? "Z LAB — 让复杂变得清晰" : "Z LAB — Signal for useful futures";
  }

  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", () => {
      language = button.dataset.lang;
      localStorage.setItem("zlab-language", language);
      applyLanguage();
    });
  });
  applyLanguage();

  function updateClock() {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Shanghai", hour: "2-digit", minute: "2-digit", hour12: false });
    document.querySelectorAll("[data-clock]").forEach((node) => { node.textContent = `GMT+8 ${formatter.format(now)}`; });
  }
  updateClock();
  window.setInterval(updateClock, 30000);

  function initScrollProgress() {
    const bar = document.querySelector(".scroll-progress i");
    if (!bar) return;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.height = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
  }
  initScrollProgress();

  function initCursor() {
    const cursor = document.querySelector(".cursor");
    if (!cursor || !finePointer) return;
    body.classList.add("cursor-ready");
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;
    const move = (event) => { tx = event.clientX; ty = event.clientY; };
    window.addEventListener("pointermove", move, { passive: true });
    const render = () => {
      const follow = document.documentElement.dataset.theme === "cyber" ? 1 : .22;
      x += (tx - x) * follow;
      y += (ty - y) * follow;
      cursor.style.left = `${x}px`;
      cursor.style.top = `${y}px`;
      requestAnimationFrame(render);
    };
    render();
    document.querySelectorAll("[data-cursor]").forEach((target) => {
      target.addEventListener("mouseenter", () => {
        const label = target.dataset.cursor || "MOVE";
        const labelNode = cursor.querySelector(".cursor-label");
        if (labelNode) labelNode.textContent = label;
        cursor.classList.add("is-active");
      });
      target.addEventListener("mouseleave", () => cursor.classList.remove("is-active"));
    });
  }
  initCursor();

  function initMagnetic() {
    if (!finePointer) return;
    document.querySelectorAll(".magnetic").forEach((node) => {
      node.addEventListener("pointermove", (event) => {
        const box = node.getBoundingClientRect();
        const dx = (event.clientX - box.left - box.width / 2) * .12;
        const dy = (event.clientY - box.top - box.height / 2) * .12;
        node.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      });
      node.addEventListener("pointerleave", () => { node.style.transform = ""; });
    });
  }
  initMagnetic();

  function initReveal() {
    const revealNodes = document.querySelectorAll(".manifesto-grid, .work-intro, .project-card, .method-head, .method-item, .process-trace, .contact-layout");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealNodes.forEach((node) => { node.style.opacity = "1"; node.style.transform = "none"; });
      return;
    }
    revealNodes.forEach((node) => {
      node.dataset.reveal = "";
      node.style.transition = "opacity .9s var(--ease), transform .9s var(--ease)";
      node.style.transitionDelay = `${Math.min((Array.from(node.parentElement.children).indexOf(node) || 0) * 70, 280)}ms`;
    });
    const observer = new IntersectionObserver((entries, current) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.style.opacity = "1";
        entry.target.style.transform = "none";
        current.unobserve(entry.target);
      });
    }, { threshold: .12, rootMargin: "0px 0px -8% 0px" });
    revealNodes.forEach((node) => observer.observe(node));
  }
  initReveal();

  function initHeroPointer() {
    const hero = document.querySelector(".hero");
    const z = document.querySelector(".hero-z");
    const xReadout = document.querySelector("[data-pointer-x]");
    const yReadout = document.querySelector("[data-pointer-y]");
    if (!hero) return;
    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      hero.style.setProperty("--pointer-x", `${(px * 100).toFixed(1)}%`);
      hero.style.setProperty("--pointer-y", `${(py * 100).toFixed(1)}%`);
      if (xReadout) xReadout.textContent = String(Math.round(px * 100)).padStart(3, "0");
      if (yReadout) yReadout.textContent = String(Math.round(py * 100)).padStart(3, "0");
      if (z && finePointer) z.style.transform = `translate(calc(-50% + ${(px - .5) * 22}px), calc(-50% + ${(py - .5) * 18}px)) rotate(${(-11 + (px - .5) * 8).toFixed(2)}deg) skewY(-7deg)`;
    }, { passive: true });
    hero.addEventListener("pointerleave", () => {
      if (z) z.style.transform = "";
      if (xReadout) xReadout.textContent = "050";
      if (yReadout) yReadout.textContent = "050";
    });
  }
  initHeroPointer();

  function initProjectSignals() {
    document.querySelectorAll(".project-card").forEach((card) => {
      card.addEventListener("mouseenter", () => { body.dataset.signal = card.dataset.signal || "acid"; });
      card.addEventListener("mouseleave", () => { body.dataset.signal = "acid"; });
    });
  }
  initProjectSignals();

  function initSignalCanvas() {
    const canvas = document.querySelector("#signal-canvas");
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.65);
    let frame = 0;
    let time = 0;
    let isVisible = true;
    let pointerX = .5;
    let pointerY = .5;
    let targetX = .5;
    let targetY = .5;
    let stars = [];
    const palette = {
      acid: { core: "#d8ff3e", soft: "rgba(216,255,62,.65)", line: "rgba(216,255,62,.16)" },
      violet: { core: "#b1a7ff", soft: "rgba(170,158,255,.65)", line: "rgba(170,158,255,.15)" },
      orange: { core: "#ff704d", soft: "rgba(255,112,77,.6)", line: "rgba(255,112,77,.15)" },
      blue: { core: "#8fe7ff", soft: "rgba(143,231,255,.6)", line: "rgba(143,231,255,.15)" }
    };
    const getPalette = () => palette[body.dataset.signal] || palette.acid;
    const seed = () => {
      stars = Array.from({ length: 260 }, (_, index) => ({
        a: Math.random() * Math.PI * 2,
        r: Math.sqrt(Math.random()),
        z: Math.random(),
        s: Math.random() * .8 + .2,
        twinkle: Math.random() * Math.PI * 2,
        index
      }));
    };
    const resize = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      dpr = Math.min(window.devicePixelRatio || 1, 1.65);
      width = canvas.clientWidth || window.innerWidth;
      height = canvas.clientHeight || window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      draw();
    };
    const projectStar = (star, cx, cy, radiusX, radiusY) => {
      const rotation = time * .045 + star.z * .45;
      const depth = .35 + star.z * .9;
      const x = Math.cos(star.a + rotation) * radiusX * star.r;
      const y = Math.sin(star.a + rotation) * radiusY * star.r;
      const wave = Math.sin(time * .8 + star.twinkle + star.z * 5) * 4;
      return { x: cx + x * depth + (targetX - .5) * 38, y: cy + y * depth + (targetY - .5) * 24 + wave, scale: depth, alpha: (.12 + star.z * .75) * (.75 + Math.sin(time * 1.2 + star.twinkle) * .25) };
    };
    const draw = () => {
      frame = 0;
      if (document.documentElement.dataset.theme === "cyber" || document.hidden) return;
      if (!width || !height) return;
      const colors = getPalette();
      pointerX += (targetX - pointerX) * .06;
      pointerY += (targetY - pointerY) * .06;
      context.clearRect(0, 0, width, height);
      const cx = width * (.63 + (pointerX - .5) * .025);
      const cy = height * (.5 + (pointerY - .5) * .02);
      const radiusX = Math.min(width * .34, 510);
      const radiusY = Math.min(height * .44, 440);
      const glow = context.createRadialGradient(cx, cy, 8, cx, cy, Math.max(radiusX, radiusY));
      glow.addColorStop(0, colors.soft);
      glow.addColorStop(.15, colors.line);
      glow.addColorStop(.54, "rgba(10,11,15,.02)");
      glow.addColorStop(1, "rgba(10,11,15,0)");
      context.fillStyle = glow;
      context.beginPath();
      context.ellipse(cx, cy, radiusX, radiusY, -.23, 0, Math.PI * 2);
      context.fill();

      context.save();
      context.translate(cx, cy);
      context.rotate(-.23);
      for (let ring = 0; ring < 14; ring += 1) {
        const ratio = .16 + ring / 15 * .88;
        context.beginPath();
        context.ellipse(0, 0, radiusX * ratio, radiusY * ratio, 0, 0, Math.PI * 2);
        context.strokeStyle = ring % 3 === 0 ? colors.line : "rgba(243,240,233,.05)";
        context.lineWidth = ring % 4 === 0 ? 1.2 : .65;
        context.setLineDash([2 + ring * .4, 10 + ring * 1.9]);
        context.lineDashOffset = -time * (ring % 2 ? 10 : -7) - ring * 7;
        context.stroke();
      }
      context.setLineDash([]);
      context.restore();

      const projected = [];
      stars.forEach((star) => {
        const point = projectStar(star, cx, cy, radiusX * 1.06, radiusY * 1.08);
        projected.push(point);
        const size = Math.max(.45, star.s * point.scale * 1.6);
        context.globalAlpha = point.alpha;
        context.fillStyle = star.index % 7 === 0 ? colors.core : "#f3f0e9";
        context.beginPath();
        context.arc(point.x, point.y, size, 0, Math.PI * 2);
        context.fill();
      });
      context.globalAlpha = 1;
      context.lineWidth = .7;
      for (let index = 0; index < projected.length; index += 7) {
        const from = projected[index];
        const to = projected[(index + 17) % projected.length];
        const dx = from.x - to.x;
        const dy = from.y - to.y;
        if (dx * dx + dy * dy < 19000) {
          context.strokeStyle = colors.line;
          context.beginPath();
          context.moveTo(from.x, from.y);
          context.lineTo(to.x, to.y);
          context.stroke();
        }
      }

      context.save();
      context.translate(cx, cy);
      context.rotate(-.23 + Math.sin(time * .28) * .035);
      const zWidth = radiusX * 1.28;
      const zHeight = radiusY * .92;
      context.strokeStyle = colors.soft;
      context.lineWidth = 1.2;
      context.setLineDash([3, 13]);
      context.beginPath();
      context.moveTo(-zWidth * .46, -zHeight * .3);
      context.lineTo(zWidth * .44, -zHeight * .3);
      context.lineTo(-zWidth * .44, zHeight * .3);
      context.lineTo(zWidth * .46, zHeight * .3);
      context.stroke();
      context.setLineDash([]);
      context.restore();

      if (!reduceMotion && isVisible) {
        time += .008;
        frame = requestAnimationFrame(draw);
      }
    };
    const pointer = (event) => {
      targetX = event.clientX / window.innerWidth;
      targetY = event.clientY / window.innerHeight;
    };
    window.addEventListener("pointermove", pointer, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("zlab:themechange", () => {
      cancelAnimationFrame(frame);
      frame = 0;
      if (document.documentElement.dataset.theme !== "cyber") resize();
    });
    document.addEventListener("visibilitychange", () => {
      cancelAnimationFrame(frame);
      frame = 0;
      if (!document.hidden && isVisible) draw();
    });
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        const entry = entries[0];
        isVisible = entry.isIntersecting;
        if (isVisible && !reduceMotion && !frame) frame = requestAnimationFrame(draw);
        if (!isVisible && frame) { cancelAnimationFrame(frame); frame = 0; }
      }, { threshold: 0 });
      observer.observe(canvas);
    }
    resize();
    if (reduceMotion) draw();
  }
  initSignalCanvas();

  const boot = document.querySelector(".boot-screen");
  if (boot) window.setTimeout(() => boot.classList.add("is-complete"), 1300);
})();
