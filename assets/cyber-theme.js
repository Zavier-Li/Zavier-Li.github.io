(() => {
  const root = document.documentElement;
  const hero = document.querySelector('.zl-site .hero');
  if (!hero) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(pointer: fine)').matches;
  const soundButton = document.querySelector('.sound-toggle');
  let theme = root.dataset.theme;
  let soundEnabled = localStorage.getItem('zlab-sound') !== 'off';
  let audio;
  let visible = true;
  let frame = 0;
  let width = 0, height = 0, lastTime = 0, time = 0;
  let down = false, activePointer = null, charge = 0, drag = 0, lastWake = 0;
  const pointer = { x: .65, y: .42, sx: .65, sy: .42, speed: 0, inside: false };
  let ripples = [], sparks = [], trail = [];

  hero.insertAdjacentHTML('afterbegin', `
    <div class="cyber-stage" aria-hidden="true">
      <div class="cyber-city"></div><div class="cyber-atmosphere"></div><div class="cyber-beam"></div>
      <div class="cyber-halo"></div>
      <div class="cyber-monument"><img src="assets/cyber-z.svg" alt="" width="640" height="640" draggable="false"/><span class="cyber-monument-code">Z—02 / GRAVITY OVERRIDE</span></div>
      <canvas class="cyber-effects"></canvas><div class="cyber-scan"></div><div class="cyber-vignette"></div>
    </div>
    <div class="cyber-hud" aria-hidden="true"><span>Z / REACTOR CORE</span><strong data-reactor-state>FIELD STABLE</strong><div class="cyber-charge-track"><i></i></div><span>紫电 / <b data-energy>000</b> %</span></div>
    <div class="cyber-instructions"><span><i>↔</i> <span data-cyber-en="MOVE / DISTURB" data-cyber-zh="移动 / 扰动雨幕">MOVE / DISTURB</span></span><span><i>◎</i> <span data-cyber-en="HOLD / CHARGE" data-cyber-zh="按住 / 核心蓄能">HOLD / CHARGE</span></span><span><i>↗</i> <span data-cyber-en="DRAG / BEND THE FIELD" data-cyber-zh="拖拽 / 牵引光场">DRAG / BEND THE FIELD</span></span></div>`);
  const canvas = hero.querySelector('.cyber-effects');
  const ctx = canvas.getContext('2d');
  const energy = hero.querySelector('[data-energy]');
  const reactor = hero.querySelector('[data-reactor-state]');
  const rain = Array.from({ length: fine ? 135 : 65 }, () => ({ x: Math.random(), y: Math.random(), z: .2 + Math.random() * .8 }));
  const motes = Array.from({ length: 40 }, () => ({ x: Math.random(), y: Math.random(), phase: Math.random() * 6.28, depth: Math.random() }));

  // A quiet, original soundscape: detuned reactor chord, filtered rain, stereo reverb.
  class CityAudio {
    constructor() {
      this.context = new AudioContext();
      const c = this.context;
      this.master = c.createGain();
      this.master.gain.value = 0;
      this.master.connect(c.destination);
      this.reverb = c.createConvolver();
      const impulse = c.createBuffer(2, c.sampleRate * 2.8, c.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const channel = impulse.getChannelData(ch);
        for (let i = 0; i < channel.length; i++) channel[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / channel.length, 3) * .55;
      }
      this.reverb.buffer = impulse;
      const wet = c.createGain(); wet.gain.value = .38;
      this.reverb.connect(wet).connect(this.master);
      this.droneFilter = c.createBiquadFilter();
      this.droneFilter.type = 'lowpass'; this.droneFilter.frequency.value = 440;
      this.droneFilter.Q.value = .6;
      this.droneFilter.connect(this.master); this.droneFilter.connect(this.reverb);
      [55, 82.406, 110.17, 130.813, 164.814].forEach((frequency, index) => {
        const osc = c.createOscillator(), gain = c.createGain();
        osc.type = index < 2 ? 'sine' : 'triangle'; osc.frequency.value = frequency;
        osc.detune.value = index % 2 ? -5 : 4;
        gain.gain.value = index < 2 ? .085 : .025;
        osc.connect(gain).connect(this.droneFilter); osc.start();
        const lfo = c.createOscillator(), depth = c.createGain();
        lfo.frequency.value = .07 + index * .023; depth.gain.value = .008;
        lfo.connect(depth).connect(gain.gain); lfo.start();
      });
      const noise = c.createBuffer(2, c.sampleRate * 4, c.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const channel = noise.getChannelData(ch);
        let previous = 0;
        for (let i = 0; i < channel.length; i++) { previous = (previous + .025 * (Math.random() * 2 - 1)) / 1.025; channel[i] = previous * 4; }
      }
      const wind = c.createBufferSource(); wind.buffer = noise; wind.loop = true;
      this.windFilter = c.createBiquadFilter(); this.windFilter.type = 'bandpass'; this.windFilter.frequency.value = 720; this.windFilter.Q.value = .5;
      this.windGain = c.createGain(); this.windGain.gain.value = .10;
      this.pan = c.createStereoPanner();
      wind.connect(this.windFilter).connect(this.windGain).connect(this.pan);
      this.pan.connect(this.master); this.pan.connect(this.reverb); wind.start();
    }
    async start() {
      clearTimeout(this.suspendTimer);
      await this.context.resume();
      if (theme !== 'cyber' || !soundEnabled || document.hidden) { this.stop(); return; }
      this.master.gain.setTargetAtTime(.65, this.context.currentTime, .6);
      updateLabels();
    }
    stop() {
      clearTimeout(this.suspendTimer);
      this.master.gain.cancelScheduledValues(this.context.currentTime);
      this.master.gain.setTargetAtTime(0, this.context.currentTime, .12);
      this.suspendTimer = setTimeout(() => { this.context.suspend().then(updateLabels); }, 450);
    }
    gesture(speed, power, x) {
      const t = this.context.currentTime;
      this.droneFilter.frequency.setTargetAtTime(440 + power * 1600, t, .2);
      this.windFilter.frequency.setTargetAtTime(550 + Math.min(speed, 1) * 1400 + power * 500, t, .15);
      this.windGain.gain.setTargetAtTime(.1 + Math.min(speed, 1) * .12 + power * .08, t, .18);
      this.pan.pan.setTargetAtTime((x - .5) * 1.4, t, .15);
    }
    note(kind, power = .3, x = .5) {
      if (!soundEnabled || theme !== 'cyber' || this.context.state !== 'running') return;
      const c = this.context, t = c.currentTime;
      const osc = c.createOscillator(), gain = c.createGain(), pan = c.createStereoPanner();
      const hover = kind === 'hover', enter = kind === 'enter';
      const length = hover ? .22 : enter ? 2.8 : 1.1 + power;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(hover ? 440 : enter ? 65 : 180 + power * 100, t);
      osc.frequency.exponentialRampToValueAtTime(hover ? 660 : enter ? 110 : 38, t + length);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(hover ? .022 : enter ? .12 : .16 + power * .1, t + .025);
      gain.gain.exponentialRampToValueAtTime(.0001, t + length);
      pan.pan.value = (x - .5) * 1.4;
      osc.connect(gain).connect(pan); pan.connect(this.master); pan.connect(this.reverb);
      osc.start(t); osc.stop(t + length + .05);
      osc.onended = () => { osc.disconnect(); gain.disconnect(); pan.disconnect(); };
    }
  }

  function updateLabels() {
    const zh = root.lang.startsWith('zh');
    const playing = theme === 'cyber' && soundEnabled && audio?.context.state === 'running' && !document.hidden;
    document.querySelector('[data-theme-label]').textContent = theme === 'cyber' ? 'NIGHT CITY' : 'Z SIGNAL';
    document.querySelector('[data-theme-toggle]').setAttribute('aria-label', zh ? `切换到${theme === 'cyber' ? ' Z SIGNAL' : '赛博朋克'}主题` : `Switch to ${theme === 'cyber' ? 'Z Signal' : 'Night City'} theme`);
    soundButton.setAttribute('aria-pressed', String(playing));
    soundButton.setAttribute('aria-label', zh ? (playing ? '关闭声音' : '开启城市氛围音效') : (playing ? 'Mute sound' : 'Enable city soundscape'));
    document.querySelector('[data-sound-label]').textContent = zh ? (playing ? '声音开启' : '开启声音') : (playing ? 'SOUND ON' : 'SOUND OFF');
    document.querySelectorAll('[data-theme]').forEach(button => {
      if (button === root) return;
      const selected = button.dataset.theme === theme;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-pressed', String(selected));
      button.querySelector('em').textContent = selected ? (zh ? '已启用' : 'ACTIVE') : (zh ? '切换 ↗' : 'ENTER ↗');
    });
    document.querySelectorAll('[data-cyber-en]').forEach(node => { node.textContent = zh ? node.dataset.cyberZh : node.dataset.cyberEn; });
    updateReactor();
  }
  function updateReactor() {
    const state = down ? (drag > 12 ? 'FIELD DISTORTION' : 'CORE CHARGING') : 'FIELD STABLE';
    const zh = root.lang.startsWith('zh');
    reactor.textContent = zh ? ({ 'FIELD DISTORTION': '光场牵引中', 'CORE CHARGING': '核心蓄能中', 'FIELD STABLE': '光场稳定' })[state] : state;
  }
  function enableAudio(entrance = false) {
    if (!soundEnabled || theme !== 'cyber') return;
    const first = !audio;
    audio ||= new CityAudio();
    audio.start().then(() => { if (first || entrance) audio.note('enter'); });
  }
  function setTheme(next, interaction = false) {
    resetGesture();
    theme = next;
    root.dataset.theme = next;
    localStorage.setItem('zlab-theme', next);
    document.querySelector('meta[name="theme-color"]').content = next === 'cyber' ? '#100725' : '#0b0c10';
    ripples = []; sparks = []; trail = []; charge = 0;
    hero.style.setProperty('--charge', 0);
    if (next === 'cyber') {
      resize();
      if (interaction) enableAudio(true);
    } else {
      cancelAnimationFrame(frame); frame = 0;
      audio?.stop();
    }
    updateLabels();
    window.dispatchEvent(new CustomEvent('zlab:themechange', { detail: next }));
  }
  document.querySelectorAll('button[data-theme]').forEach(button => button.addEventListener('click', () => setTheme(button.dataset.theme, true)));
  document.querySelector('[data-theme-toggle]').addEventListener('click', () => setTheme(theme === 'cyber' ? 'signal' : 'cyber', true));
  soundButton.addEventListener('click', () => {
    const playing = soundEnabled && audio?.context.state === 'running';
    soundEnabled = !playing;
    localStorage.setItem('zlab-sound', soundEnabled ? 'on' : 'off');
    if (soundEnabled) enableAudio(); else audio?.stop();
    updateLabels();
  });
  new MutationObserver(updateLabels).observe(root, { attributes: true, attributeFilter: ['lang'] });

  function resize() {
    width = hero.clientWidth; height = hero.clientHeight;
    const dpr = Math.min(devicePixelRatio, 1.6);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (theme === 'cyber') { if (reduced.matches) draw(performance.now()); else schedule(); }
  }
  function schedule() {
    if (!frame && theme === 'cyber' && visible && !document.hidden && !reduced.matches) {
      lastTime = performance.now(); frame = requestAnimationFrame(draw);
    }
  }
  function wave(x, y, power = .3) {
    if (reduced.matches) return;
    ripples.push({ x, y, age: 0, power });
    if (ripples.length > 12) ripples.shift();
    const count = Math.round(10 + power * 24);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2, velocity = 30 + Math.random() * (100 + power * 240);
      sparks.push({ x, y, vx: Math.cos(angle) * velocity, vy: Math.sin(angle) * velocity, age: 0, life: .3 + Math.random() * .8, red: i % 3 === 0 });
    }
  }
  function locate(event) {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / width, y = (event.clientY - rect.top) / height;
    const distance = Math.hypot((x - pointer.x) * width, (y - pointer.y) * height);
    pointer.speed = Math.min(2, pointer.speed + distance / 130);
    pointer.x = x; pointer.y = y; pointer.inside = true;
    return distance;
  }
  hero.addEventListener('pointermove', event => {
    if (theme !== 'cyber' || (activePointer !== null && event.pointerId !== activePointer)) return;
    const distance = locate(event);
    if (reduced.matches) return;
    trail.push({ x: pointer.x * width, y: pointer.y * height, age: 0, down });
    if (trail.length > 44) trail.shift();
    if (down) {
      drag += distance;
      updateReactor();
      if (time - lastWake > .12 && distance > 2) { wave(pointer.x * width, pointer.y * height, .06); lastWake = time; }
    }
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { pointer.inside = false; if (!down) { pointer.x = .65; pointer.y = .42; } });
  hero.addEventListener('pointerdown', event => {
    if (theme !== 'cyber' || event.button !== 0 || activePointer !== null) return;
    enableAudio();
    if (event.target.closest('a, button, .hero-copy, .style-index')) return;
    locate(event); activePointer = event.pointerId; down = true; drag = 0;
    if (event.pointerType === 'mouse') { event.preventDefault(); hero.setPointerCapture(event.pointerId); }
    document.body.classList.add('is-charging');
    wave(pointer.x * width, pointer.y * height, .12);
    audio?.note('press', .08, pointer.x); updateReactor();
  });
  function resetGesture() {
    const releasedPointer = activePointer;
    down = false; activePointer = null; drag = 0;
    if (releasedPointer !== null && hero.hasPointerCapture(releasedPointer)) hero.releasePointerCapture(releasedPointer);
    document.body.classList.remove('is-charging'); updateReactor();
  }
  window.addEventListener('pointerup', event => {
    if (!down || event.pointerId !== activePointer) return;
    wave(pointer.x * width, pointer.y * height, Math.max(.25, charge));
    audio?.note('release', charge, pointer.x);
    resetGesture();
  });
  hero.addEventListener('pointercancel', resetGesture);
  hero.addEventListener('lostpointercapture', () => { if (down) resetGesture(); });
  window.addEventListener('blur', resetGesture);
  let lastHover = 0;
  document.addEventListener('pointerover', event => {
    if (theme !== 'cyber' || !event.target.closest('a, button') || event.target.closest('a, button')?.contains(event.relatedTarget)) return;
    if (performance.now() - lastHover > 100) { audio?.note('hover', .1, event.clientX / innerWidth); lastHover = performance.now(); }
  });
  document.addEventListener('click', event => {
    if (theme !== 'cyber' || event.target.closest('.sound-toggle, [data-theme-toggle], button[data-theme]')) return;
    enableAudio();
    if (event.target.closest('a, button')) audio?.note('press', .08, event.clientX / innerWidth);
    if (!reduced.matches && event.clientY >= 0) {
      const pulse = document.createElement('i');
      pulse.className = 'cyber-click'; pulse.setAttribute('aria-hidden', 'true');
      pulse.style.left = `${event.clientX}px`; pulse.style.top = `${event.clientY}px`;
      document.body.append(pulse); pulse.addEventListener('animationend', () => pulse.remove(), { once: true });
    }
  });

  function draw(now) {
    frame = 0;
    if (theme !== 'cyber' || document.hidden || !visible) return;
    const dt = reduced.matches ? 0 : Math.min((now - lastTime) / 1000, .04);
    lastTime = now; time += dt;
    const smooth = 1 - Math.exp(-dt * 6);
    pointer.sx += (pointer.x - pointer.sx) * smooth;
    pointer.sy += (pointer.y - pointer.sy) * smooth;
    pointer.speed *= Math.exp(-dt * 5);
    charge = down ? Math.min(1, charge + dt * .42) : charge * Math.exp(-dt * 3.2);
    const px = pointer.sx - .5, py = pointer.sy - .5;
    if (!reduced.matches) {
      const shock = ripples.reduce((sum, r) => sum + Math.sin(r.age * 17) * Math.exp(-r.age * 4) * r.power, 0);
      hero.style.setProperty('--city-x', `${-px * 19 + shock * 5}px`); hero.style.setProperty('--city-y', `${-py * 12 + shock * 3}px`);
      hero.style.setProperty('--city-zoom', (1.03 + charge * .014).toFixed(4));
      hero.style.setProperty('--fog-x', `${px * 26}px`); hero.style.setProperty('--fog-y', `${py * 19}px`);
      hero.style.setProperty('--z-x', `${px * 30}px`); hero.style.setProperty('--z-y', `${py * 17 + Math.sin(time * .65) * 7 - charge * 13}px`);
      hero.style.setProperty('--z-rx', `${-5 - py * 10}deg`); hero.style.setProperty('--z-ry', `${-13 + px * 17}deg`);
    }
    hero.style.setProperty('--charge', charge.toFixed(3));
    const percentage = String(Math.round(charge * 100)).padStart(3, '0');
    if (energy.textContent !== percentage) energy.textContent = percentage;
    if (soundEnabled) audio?.gesture(pointer.speed, charge, pointer.sx);
    ctx.clearRect(0, 0, width, height);
    const mx = pointer.x * width, my = pointer.y * height;
    // Small deviations in the rain reveal the pointer's local force field.
    for (const drop of rain) {
      drop.y = (drop.y + dt * (.07 + drop.z * .25)) % 1.05;
      drop.x = (drop.x + dt * (.008 + px * .013) + 1) % 1;
      let x = drop.x * width, y = drop.y * height;
      const dx = x - mx, dy = y - my, distance = Math.hypot(dx, dy);
      const force = pointer.inside ? Math.max(0, 1 - distance / (130 + charge * 100)) : 0;
      x += dx * force * (.18 + charge * .65); y += dy * force * .12;
      ctx.strokeStyle = `rgba(${drop.z > .75 ? '199,157,255' : '94,136,245'},${.08 + drop.z * .2})`;
      ctx.lineWidth = drop.z > .8 ? 1 : .6;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 2 - px * 7 - force * dx * .08, y + 7 + drop.z * 19); ctx.stroke();
    }
    for (const mote of motes) {
      const x = (mote.x * width + Math.sin(time * .16 + mote.phase) * 23 + px * mote.depth * 40);
      const y = mote.y * height + Math.sin(time * .23 + mote.phase) * 17;
      ctx.fillStyle = `rgba(195,156,255,${.13 + (Math.sin(time + mote.phase) + 1) * .12})`;
      ctx.fillRect(x, y, mote.depth * 1.5 + .5, mote.depth * 1.5 + .5);
    }
    // Flight lanes recede toward the skyline without moving the reading layer.
    for (let i = 0; i < 5; i++) {
      const progress = (time * (.025 + i * .005) + i * .213) % 1;
      const x = width * (1.12 - progress * 1.3), y = height * (.62 + i * .037);
      const gradient = ctx.createLinearGradient(x, y, x + 24, y);
      gradient.addColorStop(0, i % 2 ? '#ff4b8470' : '#719eff90'); gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient; ctx.fillRect(x, y, 24, 1);
    }
    for (const ripple of ripples) {
      ripple.age += dt;
      const life = ripple.age / (1.25 + ripple.power * .6), radius = ripple.age * (190 + ripple.power * 340);
      const alpha = Math.max(0, 1 - life);
      ctx.save(); ctx.translate(ripple.x, ripple.y);
      for (let ring = 0; ring < 3; ring++) {
        const r = Math.max(1, radius - ring * (8 + ripple.power * 10));
        ctx.strokeStyle = ring === 0 ? `rgba(133,170,255,${alpha * .52})` : `rgba(${ring === 1 ? '214,72,170' : '152,86,255'},${alpha * .22})`;
        ctx.lineWidth = ring === 0 ? 1.4 : 2;
        ctx.beginPath(); ctx.ellipse(0, 0, r, r * .64, -.2, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.restore();
    }
    ripples = ripples.filter(r => r.age < 1.25 + r.power * .6);
    for (const spark of sparks) {
      spark.age += dt; spark.x += spark.vx * dt; spark.y += spark.vy * dt; spark.vy += 30 * dt;
      const alpha = Math.max(0, 1 - spark.age / spark.life);
      ctx.strokeStyle = `rgba(${spark.red ? '255,80,139' : '157,165,255'},${alpha})`;
      ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(spark.x, spark.y); ctx.lineTo(spark.x - spark.vx * .024, spark.y - spark.vy * .024); ctx.stroke();
    }
    sparks = sparks.filter(s => s.age < s.life);
    for (let i = 1; i < trail.length; i++) {
      const a = trail[i - 1], b = trail[i]; b.age += dt;
      ctx.strokeStyle = `rgba(${b.down ? '221,103,255' : '105,155,255'},${Math.max(0, 1 - b.age / .45) * (b.down ? .75 : .32)})`;
      ctx.lineWidth = b.down ? 1.7 : .8; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    if (trail.length) trail[0].age += dt;
    trail = trail.filter(t => t.age < .45);
    if (down) {
      const radius = 24 + charge * 37;
      ctx.strokeStyle = '#df99ffb0'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(mx, my, radius, time * 2, time * 2 + Math.PI * (1 + charge)); ctx.stroke();
      ctx.strokeStyle = '#ff527e90'; ctx.beginPath(); ctx.arc(mx, my, radius + 7, -time * 3, -time * 3 + Math.PI * .7); ctx.stroke();
      if (drag > 12) {
        const zx = width * (width <= 680 ? .48 : .67), zy = height * (width <= 680 ? .31 : .39);
        ctx.strokeStyle = `rgba(159,123,255,${.15 + charge * .3})`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(zx, zy);
        for (let i = 1; i <= 20; i++) { const p = i / 20; ctx.lineTo(zx + (mx - zx) * p + Math.sin(p * 28 + time * 17) * 8 * Math.sin(p * Math.PI), zy + (my - zy) * p + Math.cos(p * 31 + time * 23) * 5 * Math.sin(p * Math.PI)); }
        ctx.stroke();
      }
    }
    if (!reduced.matches) frame = requestAnimationFrame(draw);
  }
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) { if (reduced.matches && theme === 'cyber') draw(performance.now()); else schedule(); }
    else { cancelAnimationFrame(frame); frame = 0; resetGesture(); audio?.gesture(0, 0, .5); }
  }).observe(hero);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      resetGesture(); cancelAnimationFrame(frame); frame = 0;
      audio?.context.suspend(); updateLabels();
    } else {
      schedule();
      if (audio && soundEnabled && theme === 'cyber') audio.start();
    }
  });
  window.addEventListener('pagehide', () => { cancelAnimationFrame(frame); frame = 0; audio?.context.suspend(); });
  window.addEventListener('pageshow', event => { if (event.persisted) { schedule(); if (audio && soundEnabled && theme === 'cyber') audio.start(); } });
  window.addEventListener('resize', resize, { passive: true });
  reduced.addEventListener('change', () => { cancelAnimationFrame(frame); frame = 0; resize(); });
  setTheme(theme);
})();
