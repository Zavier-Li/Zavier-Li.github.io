(() => {
  const root = document.documentElement;
  const home = document.querySelector('.page-home');
  const page = document.body.dataset.page;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let theme = root.dataset.theme === 'cyber' ? 'cyber' : 'signal';
  if (theme === 'cyber' && page !== 'home') { location.replace(`index.html?space=${encodeURIComponent(page)}`); return; }
  if (home) fetch('assets/cyber-universe.html').then(response => response.text()).then(markup => {
    document.querySelector('.site-header').insertAdjacentHTML('afterend', markup);
    const language = localStorage.getItem('zavier-lang') || 'en'; root.lang = language === 'zh' ? 'zh-CN' : 'en';
    document.querySelectorAll('.cyber-universe [data-i18n]').forEach(el => { const copy = window.ZAVIER_I18N?.[language]?.[el.dataset.i18n]; if (copy) el.innerHTML = copy; });
    document.querySelectorAll('.cyber-universe [data-lang]').forEach(button => button.addEventListener('click', () => {
      const next = button.dataset.lang; localStorage.setItem('zavier-lang', next); root.lang = next === 'zh' ? 'zh-CN' : 'en';
      document.querySelectorAll('.cyber-universe [data-i18n]').forEach(el => { const copy = window.ZAVIER_I18N?.[next]?.[el.dataset.i18n]; if (copy) el.innerHTML = copy; });
      const selected = document.querySelector('[data-spine-project][aria-pressed="true"]'); selected?.click(); labels();
    }));
    initializeUniverse();
  }); else initializeUniverse();
  function initializeUniverse() {
  const hero = document.querySelector('.cyber-universe');
  const effects = hero?.querySelector('.cyber-effects');
  const ctx = effects?.getContext('2d');
  let soundOn = localStorage.getItem('zavier-sound') !== 'off';
  let audio;
  let frame = 0, visible = true, lastFrame = 0, clock = 0;
  let down = false, activePointer = null, charge = 0, dragDistance = 0, lastArc = 0;
  let width = 0, height = 0, ripples = [], sparks = [], trail = [];
  const spineWorld = document.querySelector('[data-spine-world]'), spineCamera = document.querySelector('[data-spine-camera]');
  const spineSegments = [...document.querySelectorAll('[data-spine-segment]')];
  let cameraY = 0, targetCameraY = 0, worldTurn = 0, targetTurn = 0, impact = 0, lastRoll = 0, lastGlide = 0, lastHold = 0;
  const segmentGap = 820, maxCameraY = segmentGap * (spineSegments.length - 1);
  const point = { x: .66, y: .4, xTo: .66, yTo: .4, speed: 0, inside: false };
  const rain = Array.from({ length: matchMedia('(pointer:fine)').matches ? 140 : 68 }, () => ({ x: Math.random(), y: Math.random(), z: .22 + Math.random() * .78 }));
  const dust = Array.from({ length: 44 }, () => ({ x: Math.random(), y: Math.random(), phase: Math.random() * 6.28, z: Math.random() }));

  class Soundscape {
    constructor() {
      const c = this.context = new AudioContext();
      this.master = c.createGain(); this.master.gain.value = 0; this.master.connect(c.destination);
      this.reverb = c.createConvolver();
      const impulse = c.createBuffer(2, c.sampleRate * 2.7, c.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const data = impulse.getChannelData(ch);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 3 * .48;
      }
      this.reverb.buffer = impulse;
      const wet = c.createGain(); wet.gain.value = .42; this.reverb.connect(wet).connect(this.master);
      this.low = c.createBiquadFilter(); this.low.type = 'lowpass'; this.low.frequency.value = 380;
      this.low.connect(this.master); this.low.connect(this.reverb);
      [55, 82.4, 110.2, 130.8, 164.8].forEach((hz, i) => {
        const oscillator = c.createOscillator(), level = c.createGain();
        oscillator.type = i < 2 ? 'sine' : 'triangle'; oscillator.frequency.value = hz;
        oscillator.detune.value = i % 2 ? -4 : 3; level.gain.value = i < 2 ? .085 : .022;
        oscillator.connect(level).connect(this.low); oscillator.start();
        const lfo = c.createOscillator(), depth = c.createGain();
        lfo.frequency.value = .055 + i * .019; depth.gain.value = .006;
        lfo.connect(depth).connect(level.gain); lfo.start();
      });
      const noise = c.createBuffer(2, c.sampleRate * 4, c.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const data = noise.getChannelData(ch); let previous = 0;
        for (let i = 0; i < data.length; i++) { previous = (previous + .028 * (Math.random() * 2 - 1)) / 1.028; data[i] = previous * 4; }
      }
      this.wind = c.createBufferSource(); this.wind.buffer = noise; this.wind.loop = true;
      const band = c.createBiquadFilter(); band.type = 'bandpass'; band.Q.value = .55; band.frequency.value = 680;
      this.windLevel = c.createGain(); this.windLevel.gain.value = .105;
      this.pan = c.createStereoPanner();
      this.wind.connect(band).connect(this.windLevel).connect(this.pan);
      this.pan.connect(this.master); this.pan.connect(this.reverb); this.wind.start();
    }
    async start() {
      clearTimeout(this.suspendTimer);
      await this.context.resume();
      if (!soundOn || theme !== 'cyber' || document.hidden) { this.stop(); return; }
      this.master.gain.setTargetAtTime(.66, this.context.currentTime, .7);
      labels();
    }
    stop() {
      clearTimeout(this.suspendTimer);
      this.master.gain.cancelScheduledValues(this.context.currentTime);
      this.master.gain.setTargetAtTime(0, this.context.currentTime, .14);
      this.suspendTimer = setTimeout(() => this.context.suspend().then(labels), 500);
    }
    movement(speed, energy, x) {
      const t = this.context.currentTime;
      this.low.frequency.setTargetAtTime(380 + energy * 1150, t, .24);
      this.windLevel.gain.setTargetAtTime(.1 + Math.min(speed, 1) * .14 + energy * .06, t, .19);
      this.pan.pan.setTargetAtTime((x - .5) * 1.4, t, .16);
    }
    note(kind, energy = .2, x = .5) {
      if (!soundOn || theme !== 'cyber' || this.context.state !== 'running') return;
      const c = this.context, t = c.currentTime;
      const oscillator = c.createOscillator(), level = c.createGain(), pan = c.createStereoPanner();
      const enter = kind === 'enter', hover = kind === 'hover', roll = kind === 'roll', glide = kind === 'glide', hold = kind === 'hold';
      const duration = enter ? 2.8 : hover ? .18 : roll ? .24 : glide ? .12 : hold ? 1.15 : .72 + energy * .32;
      const base = enter ? 63 : hover ? 510 : roll ? 220 + energy * 540 : glide ? 780 : hold ? 72 + energy * 85 : kind === 'release' ? 210 + energy * 110 : 330 + energy * 95;
      oscillator.type = hover || glide ? 'triangle' : 'sine';
      oscillator.frequency.setValueAtTime(base, t);
      oscillator.frequency.exponentialRampToValueAtTime(enter ? 107 : roll ? Math.max(65, base * .46) : glide ? base * .72 : kind === 'press' ? base * .44 : base * .69, t + duration);
      level.gain.setValueAtTime(0, t);
      level.gain.linearRampToValueAtTime(hover || glide ? .009 : enter ? .12 : roll ? .018 + energy * .016 : hold ? .035 + energy * .025 : kind === 'press' ? .11 + energy * .035 : .1 + energy * .08, t + (hover || glide ? .012 : .025));
      level.gain.exponentialRampToValueAtTime(.0001, t + duration);
      pan.pan.value = (x - .5) * 1.5;
      oscillator.connect(level).connect(pan); pan.connect(this.master); pan.connect(this.reverb);
      oscillator.start(t); oscillator.stop(t + duration + .06);
      oscillator.onended = () => { oscillator.disconnect(); level.disconnect(); pan.disconnect(); };
      if (!enter && !hover && !glide) {
        const metal = c.createOscillator(), metalGain = c.createGain(), metalFilter = c.createBiquadFilter();
        metal.type = 'sine'; metal.frequency.setValueAtTime(base * (roll ? 2.76 : 3.17), t);
        metal.frequency.exponentialRampToValueAtTime(base * (roll ? 1.31 : 1.72), t + Math.min(.31, duration));
        metalFilter.type = 'bandpass'; metalFilter.frequency.value = roll ? 1450 : 2350; metalFilter.Q.value = 6.5;
        metalGain.gain.setValueAtTime(0, t); metalGain.gain.linearRampToValueAtTime(roll ? .014 : .052 + energy * .025, t + .004); metalGain.gain.exponentialRampToValueAtTime(.0001, t + Math.min(.36, duration));
        metal.connect(metalFilter).connect(metalGain).connect(pan); metal.start(t); metal.stop(t + Math.min(.4, duration + .04));
        metal.onended = () => { metal.disconnect(); metalFilter.disconnect(); metalGain.disconnect(); };
        const noise = c.createBuffer(1, Math.floor(c.sampleRate * .045), c.sampleRate), samples = noise.getChannelData(0);
        for (let i = 0; i < samples.length; i++) samples[i] = (Math.random() * 2 - 1) * (1 - i / samples.length) ** 3;
        const burst = c.createBufferSource(), tint = c.createBiquadFilter(), transient = c.createGain();
        burst.buffer = noise; tint.type = 'bandpass'; tint.frequency.value = roll ? 1100 : 3200; tint.Q.value = 1.2;
        transient.gain.setValueAtTime(roll ? .009 : .04 + energy * .025, t); transient.gain.exponentialRampToValueAtTime(.0001, t + .047);
        burst.connect(tint).connect(transient).connect(pan); burst.start(t); burst.stop(t + .05); burst.onended = () => { burst.disconnect(); tint.disconnect(); transient.disconnect(); };
      }
    }
  }

  function labels() {
    const zh = root.lang.startsWith('zh');
    const themeButton = document.querySelector('[data-theme-toggle]');
    const soundButton = document.querySelector('[data-sound-toggle]');
    if (!themeButton || !soundButton) return;
    document.querySelectorAll('[data-theme-name]').forEach(el => el.textContent = theme === 'cyber' ? 'NIGHT CITY' : 'Z SIGNAL');
    document.querySelectorAll('[data-theme-toggle]').forEach(button => button.setAttribute('aria-label', zh ? `切换到${theme === 'cyber' ? '原始' : '赛博朋克'}主题` : `Switch to ${theme === 'cyber' ? 'Z Signal' : 'Cyberpunk'} theme`));
    const playing = theme === 'cyber' && soundOn && audio?.context.state === 'running' && !document.hidden;
    document.querySelectorAll('[data-sound-toggle]').forEach(button => { button.setAttribute('aria-pressed', String(playing)); button.setAttribute('aria-label', zh ? (playing ? '关闭城市氛围音效' : '开启城市氛围音效') : (playing ? 'Mute ambient sound' : 'Enable ambient sound')); });
    document.querySelectorAll('[data-sound-name]').forEach(el => el.textContent = zh ? (playing ? '声音开启' : '开启声音') : (playing ? 'SOUND ON' : 'SOUND OFF'));
    const state = down ? (dragDistance > 12 ? 'FIELD BENDING' : 'CORE CHARGING') : 'FIELD STABLE';
    const translated = zh ? ({ 'FIELD BENDING': '光场牵引中', 'CORE CHARGING': '核心蓄能中', 'FIELD STABLE': '光场稳定' })[state] : state;
    const status = hero?.querySelector('[data-reactor-state]'); if (status) status.textContent = translated;
  }
  function startSound(entrance = false) {
    if (!soundOn || theme !== 'cyber') return;
    const first = !audio; audio ||= new Soundscape();
    audio.start().then(() => { if (first || entrance) audio.note('enter'); });
  }
  function changeTheme(next) {
    if (theme === next) return;
    if (next === 'cyber' && page !== 'home') { localStorage.setItem('zavier-theme', next); const project = new URLSearchParams(location.search).get('project'); location.href = `index.html?space=${encodeURIComponent(page)}${project ? `&project=${encodeURIComponent(project)}` : ''}`; return; }
    releaseGesture(); theme = next; root.dataset.theme = theme;
    localStorage.setItem('zavier-theme', theme);
    if (theme === 'cyber') { resize(); startSound(true); schedule(); }
    else { cancelAnimationFrame(frame); frame = 0; audio?.stop(); }
    labels(); window.dispatchEvent(new CustomEvent('zavier:themechange', { detail: theme }));
  }
  document.querySelectorAll('[data-theme-toggle]').forEach(button => button.addEventListener('click', () => changeTheme(theme === 'cyber' ? 'signal' : 'cyber')));
  document.querySelectorAll('[data-sound-toggle]').forEach(button => button.addEventListener('click', () => {
    const playing = soundOn && audio?.context.state === 'running';
    soundOn = !playing; localStorage.setItem('zavier-sound', soundOn ? 'on' : 'off');
    if (soundOn) startSound(); else audio?.stop(); labels();
  }));
  new MutationObserver(labels).observe(root, { attributes: true, attributeFilter: ['lang'] });

  function resize() {
    if (!hero || !effects || !ctx) return;
    width = hero.clientWidth; height = hero.clientHeight;
    const dpr = Math.min(devicePixelRatio || 1, 1.6);
    effects.width = Math.round(width * dpr); effects.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (reduced.matches && theme === 'cyber' && visible) draw(performance.now());
    else schedule();
  }
  function schedule() {
    if (theme === 'cyber' && visible && !reduced.matches && !document.hidden && !frame && ctx) {
      lastFrame = performance.now(); frame = requestAnimationFrame(draw);
    }
  }
  function pulse(x, y, power = .25) {
    if (reduced.matches) return;
    ripples.push({ x, y, age: 0, power }); if (ripples.length > 12) ripples.shift();
    for (let i = 0, total = 12 + power * 21; i < total; i++) {
      const angle = Math.random() * Math.PI * 2, velocity = 35 + Math.random() * (115 + power * 230);
      sparks.push({ x, y, vx: Math.cos(angle) * velocity, vy: Math.sin(angle) * velocity, age: 0, life: .32 + Math.random() * .78, pink: i % 3 === 0 });
    }
  }
  function locate(event) {
    const rect = hero.getBoundingClientRect(), x = (event.clientX - rect.left) / width, y = (event.clientY - rect.top) / height;
    const distance = Math.hypot((x - point.xTo) * width, (y - point.yTo) * height);
    point.speed = Math.min(2, point.speed + distance / 135); point.xTo = x; point.yTo = y; point.inside = true;
    return distance;
  }
  function shake(power = .3) {
    impact = Math.min(1, impact + power);
    if (power > .17) pulse(point.x * width, point.y * height, power * .45);
    hero.style.setProperty('--impact-x', `${point.x * 100}%`); hero.style.setProperty('--impact-y', `${point.y * 100}%`);
    hero.style.setProperty('--impact-glow', String(Math.min(.6, power * .45)));
  }
  function paintCamera() {
    if (!spineWorld) return;
    const depth = cameraY / segmentGap, twist = worldTurn + depth * 1.2;
    spineWorld.style.transform = `translate3d(0,${-cameraY}px,0) rotateY(${twist}deg) rotateX(${Math.sin(twist * Math.PI / 180) * 2.6}deg)`;
    spineSegments.forEach((segment, index) => {
      const distance = Math.abs(index * segmentGap - cameraY) / segmentGap;
      segment.style.setProperty('--clarity', Math.max(.12, 1 - distance * .3).toFixed(3));
      segment.style.setProperty('--vertebra-turn', `${Math.sin((index * 51 + twist) * Math.PI / 180) * 17}deg`);
    });
    hero.style.setProperty('--z-presence', Math.max(.12, .68 - depth * .12).toFixed(3));
    hero.style.setProperty('--z-blur', `${Math.min(2.2, depth * .42).toFixed(2)}px`);
    const jolt = Math.min(1, impact);
    if (spineCamera) spineCamera.style.transform = `translate3d(${Math.sin(clock * 71) * jolt * 3}px,${Math.cos(clock * 83) * jolt * 2}px,0)`;
  }
  function setCamera(y, turn = targetTurn) {
    targetCameraY = Math.max(0, Math.min(maxCameraY, y)); targetTurn = turn;
    if (reduced.matches) { cameraY = targetCameraY; worldTurn = targetTurn; paintCamera(); }
    else schedule();
  }
  function seekSpine(index, makeSound = true) {
    const next = Math.max(0, Math.min(spineSegments.length - 1, Number(index)));
    const delta = next * segmentGap - targetCameraY;
    setCamera(next * segmentGap, targetTurn + Math.sign(delta) * Math.min(22, Math.abs(delta) * .012));
    if (makeSound) { startSound(); audio?.note('roll', .34, point.x); shake(.22); }
  }
  document.querySelectorAll('.spine-trigger').forEach(button => button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open));
    document.getElementById(button.getAttribute('aria-controls'))?.classList.toggle('is-open', open);
    startSound(); shake(open ? .36 : .19); audio?.note(open ? 'release' : 'press', open ? .42 : .2, point.x);
  }));
  document.querySelectorAll('[data-spine-filter]').forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.spineFilter;
    document.querySelectorAll('[data-spine-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    document.querySelectorAll('[data-spine-project]').forEach(project => { project.hidden = filter !== 'all' && project.dataset.spineCategory !== filter; });
    startSound(); shake(.18); audio?.note('press', .14, point.x);
  }));
  document.querySelectorAll('[data-spine-project]').forEach(button => button.addEventListener('click', () => {
    const project = window.ZAVIER_PROJECTS?.[button.dataset.spineProject]; if (!project) return;
    const lang = root.lang.startsWith('zh') ? 'zh' : 'en', detail = project[lang];
    document.querySelectorAll('[data-spine-project]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    document.querySelector('[data-detail-type]').textContent = `${project.year} / ${detail.badge}`;
    document.querySelector('[data-detail-title]').textContent = detail.title;
    document.querySelector('[data-detail-summary]').textContent = detail.summary;
    document.querySelector('[data-detail-copy]').textContent = `${detail.copy} ${detail.detail}`;
    const link = document.querySelector('[data-detail-link]'); link.hidden = !project.url; link.href = project.url || '#';
    link.textContent = lang === 'zh' ? '打开项目 ↗' : 'OPEN PROJECT ↗';
    startSound(); shake(.3); audio?.note('release', .34, point.x);
  }));
  document.querySelectorAll('[data-spine-seek]').forEach(button => button.addEventListener('click', () => seekSpine(button.dataset.spineSeek)));
  const routeSpace = new URLSearchParams(location.search).get('space');
  const initialSpace = ({ home: 0, about: 1, work: 2, project: 2, contact: 4 })[routeSpace];
  if (initialSpace !== undefined && theme === 'cyber') {
    cameraY = targetCameraY = initialSpace * segmentGap; worldTurn = targetTurn = initialSpace * 12; paintCamera();
    if (routeSpace === 'about') document.querySelector('.spine-trigger[aria-controls="fiber-about"]')?.click();
    if (routeSpace === 'work' || routeSpace === 'project') document.querySelector('.spine-trigger[aria-controls="fiber-work"]')?.click();
    if (routeSpace === 'contact') document.querySelector('.spine-trigger[aria-controls="fiber-contact"]')?.click();
    const key = new URLSearchParams(location.search).get('project');
    if (key) document.querySelector(`[data-spine-project="${CSS.escape(key)}"]`)?.click();
    history.replaceState(null, '', 'index.html');
  }
  document.addEventListener('wheel', event => {
    if (theme !== 'cyber') return;
    event.preventDefault(); startSound();
    const movement = Math.max(-170, Math.min(170, event.deltaY)) * 1.45;
    setCamera(targetCameraY + movement, targetTurn + movement * .024);
    const now = performance.now(); if (now - lastRoll > 82) { audio?.note('roll', Math.min(1, Math.abs(movement) / 170), event.clientX / innerWidth); lastRoll = now; }
    if (Math.abs(movement) > 35) shake(Math.min(.2, Math.abs(movement) / 850));
  }, { passive: false });
  document.addEventListener('keydown', event => {
    if (theme !== 'cyber' || event.target.matches('input,textarea,select,[contenteditable="true"]')) return;
    if (event.key === 'ArrowDown' || event.key === 'PageDown') { event.preventDefault(); seekSpine(Math.min(spineSegments.length - 1, Math.floor(targetCameraY / segmentGap + 1))); }
    if (event.key === 'ArrowUp' || event.key === 'PageUp') { event.preventDefault(); seekSpine(Math.max(0, Math.ceil(targetCameraY / segmentGap - 1))); }
    if (event.key === 'Home') { event.preventDefault(); seekSpine(0); }
    if (event.key === 'End') { event.preventDefault(); seekSpine(spineSegments.length - 1); }
  });
  const dragOrigin = { x: 0, y: 0 };
  hero?.addEventListener('pointermove', event => {
    if (theme !== 'cyber' || (activePointer !== null && event.pointerId !== activePointer)) return;
    const distance = locate(event);
    const now = performance.now();
    if (distance > 3 && now - lastGlide > 180) { audio?.note(down ? 'roll' : 'glide', Math.min(1, distance / 80), point.x); lastGlide = now; }
    if (reduced.matches) return;
    if (down) {
      const dx = event.clientX - dragOrigin.x, dy = event.clientY - dragOrigin.y;
      setCamera(targetCameraY - dy * .78, targetTurn + dx * .11);
      dragOrigin.x = event.clientX; dragOrigin.y = event.clientY;
      if (now - lastHold > 420) { audio?.note('hold', charge, point.x); lastHold = now; }
      shake(Math.min(.1, distance / 750));
    }
    trail.push({ x: point.xTo * width, y: point.yTo * height, age: 0, active: down });
    if (trail.length > 46) trail.shift();
    if (down) {
      dragDistance += distance; labels();
      if (clock - lastArc > .13 && distance > 2) { pulse(point.xTo * width, point.yTo * height, .07); lastArc = clock; }
    }
  }, { passive: true });
  hero?.addEventListener('pointerleave', () => { point.inside = false; if (!down) { point.xTo = .66; point.yTo = .4; } });
  hero?.addEventListener('pointerdown', event => {
    if (theme !== 'cyber' || event.button !== 0 || activePointer !== null || event.target.closest('a,button')) return;
    startSound(); locate(event); activePointer = event.pointerId; down = true; dragDistance = 0; dragOrigin.x = event.clientX; dragOrigin.y = event.clientY; lastHold = performance.now();
    if (event.pointerType === 'mouse') { event.preventDefault(); hero.setPointerCapture(event.pointerId); }
    document.body.classList.add('is-charging'); pulse(point.xTo * width, point.yTo * height, .13);
    audio?.note('press', .1, point.xTo); shake(.42); labels();
  });
  function releaseGesture() {
    const id = activePointer; const wasDown = down; down = false; activePointer = null; dragDistance = 0;
    if (id !== null && hero?.hasPointerCapture(id)) hero.releasePointerCapture(id);
    document.body.classList.remove('is-charging'); if (wasDown) labels();
  }
  window.addEventListener('pointerup', event => {
    if (!down || event.pointerId !== activePointer) return;
    pulse(point.xTo * width, point.yTo * height, Math.max(.28, charge));
    audio?.note('release', charge, point.xTo); shake(Math.min(.65, .28 + charge * .35)); releaseGesture();
  });
  hero?.addEventListener('pointercancel', releaseGesture);
  hero?.addEventListener('lostpointercapture', () => { if (down) releaseGesture(); });
  window.addEventListener('blur', releaseGesture);

  let lastHover = 0;
  document.addEventListener('pointerover', event => {
    const control = event.target.closest('a,button');
    if (theme !== 'cyber' || !control || control.contains(event.relatedTarget) || performance.now() - lastHover < 120) return;
    audio?.note('hover', .1, event.clientX / innerWidth); lastHover = performance.now();
  });
  document.addEventListener('click', event => {
    if (theme !== 'cyber' || event.target.closest('[data-theme-toggle],[data-sound-toggle]')) return;
    startSound(); if (event.target.closest('a,button') && !event.target.closest('.spine-trigger,[data-spine-project]')) audio?.note('press', .08, event.clientX / innerWidth);
    if (!reduced.matches) {
      const flare = document.createElement('i'); flare.className = 'cyber-click'; flare.setAttribute('aria-hidden', 'true');
      flare.style.left = `${event.clientX}px`; flare.style.top = `${event.clientY}px`;
      document.body.append(flare); flare.addEventListener('animationend', () => flare.remove(), { once: true });
    }
  });

  function draw(now) {
    frame = 0; if (theme !== 'cyber' || !visible || document.hidden || !ctx) return;
    const dt = reduced.matches ? 0 : Math.min((now - lastFrame) / 1000, .04); lastFrame = now; clock += dt;
    const ease = 1 - Math.exp(-dt * 6);
    cameraY += (targetCameraY - cameraY) * (reduced.matches ? 1 : ease);
    worldTurn += (targetTurn - worldTurn) * (reduced.matches ? 1 : ease);
    impact *= Math.exp(-dt * 9); paintCamera();
    point.x += (point.xTo - point.x) * ease; point.y += (point.yTo - point.y) * ease; point.speed *= Math.exp(-dt * 5);
    charge = down ? Math.min(1, charge + dt * .43) : charge * Math.exp(-dt * 3.3);
    if (down && soundOn && performance.now() - lastHold > 580) { audio?.note('hold', charge, point.x); lastHold = performance.now(); }
    const px = point.x - .5, py = point.y - .5;
    if (!reduced.matches) {
      const shock = ripples.reduce((sum, r) => sum + Math.sin(r.age * 17) * Math.exp(-r.age * 4) * r.power, 0);
      hero.style.setProperty('--city-x', `${-px * 20 + shock * 5}px`); hero.style.setProperty('--city-y', `${-py * 13 + shock * 4}px`);
      hero.style.setProperty('--city-zoom', (1.04 + charge * .016).toFixed(4));
      hero.style.setProperty('--fog-x', `${px * 25}px`); hero.style.setProperty('--fog-y', `${py * 19}px`);
      hero.style.setProperty('--z-x', `${px * 32}px`); hero.style.setProperty('--z-y', `${py * 18 + Math.sin(clock * .7) * 8 - charge * 14}px`);
      hero.style.setProperty('--z-rx', `${-5 - py * 9}deg`); hero.style.setProperty('--z-ry', `${-12 + px * 17}deg`);
    }
    hero.style.setProperty('--charge', charge.toFixed(3));
    const energy = String(Math.round(charge * 100)).padStart(3, '0'), energyNode = hero.querySelector('[data-energy]');
    if (energyNode && energyNode.textContent !== energy) energyNode.textContent = energy;
    if (soundOn) audio?.movement(point.speed, charge, point.x);
    ctx.clearRect(0, 0, width, height);
    const mx = point.x * width, my = point.y * height;
    for (const drop of rain) {
      drop.y = (drop.y + dt * (.08 + drop.z * .25)) % 1.04; drop.x = (drop.x + dt * (.007 + px * .012) + 1) % 1;
      let x = drop.x * width, y = drop.y * height;
      const dx = x - mx, dy = y - my, force = point.inside ? Math.max(0, 1 - Math.hypot(dx, dy) / (145 + charge * 100)) : 0;
      x += dx * force * (.17 + charge * .62); y += dy * force * .12;
      ctx.strokeStyle = `rgba(${drop.z > .75 ? '202,158,255' : '92,139,245'},${.08 + drop.z * .2})`;
      ctx.lineWidth = drop.z > .8 ? 1 : .65; ctx.beginPath(); ctx.moveTo(x, y);
      ctx.lineTo(x - 2 - px * 7 - force * dx * .08, y + 7 + drop.z * 19); ctx.stroke();
    }
    for (const mote of dust) {
      ctx.fillStyle = `rgba(208,177,255,${.1 + (Math.sin(clock + mote.phase) + 1) * .13})`;
      ctx.fillRect(mote.x * width + Math.sin(clock * .17 + mote.phase) * 22 + px * mote.z * 34, mote.y * height + Math.sin(clock * .24 + mote.phase) * 14, mote.z + .55, mote.z + .55);
    }
    for (let i = 0; i < 5; i++) {
      const p = (clock * (.025 + i * .005) + i * .213) % 1, x = width * (1.1 - p * 1.3), y = height * (.61 + i * .035);
      ctx.strokeStyle = i % 2 ? '#ff588777' : '#72a6ff88'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 24, y); ctx.stroke();
    }
    for (const ripple of ripples) {
      ripple.age += dt; const life = ripple.age / (1.24 + ripple.power * .6), radius = ripple.age * (185 + ripple.power * 335), opacity = Math.max(0, 1 - life);
      ctx.save(); ctx.translate(ripple.x, ripple.y);
      for (let ring = 0; ring < 3; ring++) {
        ctx.strokeStyle = ring === 0 ? `rgba(134,173,255,${opacity * .6})` : `rgba(${ring === 1 ? '224,76,186' : '163,94,255'},${opacity * .23})`;
        ctx.lineWidth = ring === 0 ? 1.5 : 2; ctx.beginPath(); ctx.ellipse(0, 0, Math.max(1, radius - ring * 10), Math.max(1, radius * .64 - ring * 7), -.18, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.restore();
    }
    ripples = ripples.filter(r => r.age < 1.3 + r.power * .6);
    for (const spark of sparks) {
      spark.age += dt; spark.x += spark.vx * dt; spark.y += spark.vy * dt; spark.vy += 30 * dt;
      ctx.strokeStyle = `rgba(${spark.pink ? '255,83,143' : '162,168,255'},${Math.max(0, 1 - spark.age / spark.life)})`;
      ctx.beginPath(); ctx.moveTo(spark.x, spark.y); ctx.lineTo(spark.x - spark.vx * .023, spark.y - spark.vy * .023); ctx.stroke();
    }
    sparks = sparks.filter(s => s.age < s.life);
    for (let i = 1; i < trail.length; i++) {
      const a = trail[i - 1], b = trail[i]; b.age += dt;
      ctx.strokeStyle = `rgba(${b.active ? '221,106,255' : '112,160,255'},${Math.max(0, 1 - b.age / .42) * (b.active ? .7 : .28)})`;
      ctx.lineWidth = b.active ? 1.7 : .8; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    if (trail.length) trail[0].age += dt; trail = trail.filter(t => t.age < .42);
    if (down) {
      ctx.lineWidth = 1.4; ctx.strokeStyle = '#e0a2ffba'; ctx.beginPath(); ctx.arc(mx, my, 22 + charge * 38, clock * 2, clock * 2 + Math.PI * (1 + charge)); ctx.stroke();
      if (dragDistance > 12) {
        const zx = width * .67, zy = height * .39; ctx.strokeStyle = `rgba(164,128,255,${.16 + charge * .3})`;
        ctx.beginPath(); ctx.moveTo(zx, zy);
        for (let i = 1; i <= 20; i++) { const p = i / 20; ctx.lineTo(zx + (mx - zx) * p + Math.sin(p * 28 + clock * 17) * 8 * Math.sin(p * Math.PI), zy + (my - zy) * p + Math.cos(p * 31 + clock * 21) * 5 * Math.sin(p * Math.PI)); }
        ctx.stroke();
      }
    }
    if (!reduced.matches) frame = requestAnimationFrame(draw);
  }
  if (hero && effects) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible) schedule(); else { cancelAnimationFrame(frame); frame = 0; releaseGesture(); audio?.movement(0, 0, .5); }
    }).observe(hero);
    addEventListener('resize', resize, { passive: true });
    reduced.addEventListener('change', () => { cancelAnimationFrame(frame); frame = 0; resize(); });
    resize();
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; releaseGesture(); audio?.context.suspend(); }
    else { schedule(); if (audio && soundOn && theme === 'cyber') startSound(); }
    labels();
  });
  labels();
  }
})();
