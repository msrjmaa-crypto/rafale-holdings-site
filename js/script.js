document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('site-header');
  const hamburger = document.getElementById('hamburger');
  const mainNav = document.getElementById('main-nav');
  const navLinks = mainNav.querySelectorAll('a');
  const yearEl = document.getElementById('year');
  const contactForm = document.getElementById('contact-form');
  const formNote = document.getElementById('form-note');
  const scrollProgress = document.getElementById('scroll-progress');
  const heroBg = document.querySelector('.hero-bg');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  let ticking = false;

  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 20);

    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
    if (scrollProgress) scrollProgress.style.width = progress + '%';

    if (heroBg && !prefersReducedMotion && window.scrollY < window.innerHeight) {
      heroBg.style.transform = 'translateY(' + window.scrollY * 0.15 + 'px)';
    }

    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  onScroll();

  const closeMenu = () => {
    hamburger.classList.remove('is-open');
    mainNav.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'メニューを開く');
  };

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('is-open');
    mainNav.classList.toggle('is-open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    hamburger.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mainNav.classList.contains('is-open')) {
      closeMenu();
      hamburger.focus();
    }
  });

  // Elements sharing a reveal group (business grid, contact info, each
  // brand card) get a short staggered delay so they animate in sequence
  // rather than at once. Each .brand-card is its own group, so if more
  // brands are added later, every card cascades independently.
  const staggerGroups = document.querySelectorAll('.business-grid, .contact-info, .brand-card');
  staggerGroups.forEach((group) => {
    group.querySelectorAll('.reveal').forEach((el, index) => {
      el.dataset.revealDelay = prefersReducedMotion ? '0' : String(index * 90);
    });
  });

  const revealTargets = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const delay = Number(entry.target.dataset.revealDelay || 0);
        window.setTimeout(() => entry.target.classList.add('is-visible'), delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealTargets.forEach((el) => observer.observe(el));

  // Watches an <img> that may or may not have a real file behind its src
  // (hero poster, representative photo, …). Calls onReady only once the
  // image has actually decoded successfully; a missing/broken file is left
  // alone so the CSS placeholder underneath keeps showing.
  const watchOptionalImage = (img, onReady) => {
    if (!img) return;
    if (img.complete && img.naturalWidth > 0) {
      onReady();
      return;
    }
    img.addEventListener('load', onReady, { once: true });
    img.addEventListener('error', () => {
      // No file at this path yet, or it failed to load — the CSS
      // placeholder (gradient background / icon) simply stays visible.
    }, { once: true });
  };

  // ---------- Hero background video ----------
  // Only attempts to load a video on desktop/tablet, when the user hasn't
  // requested reduced motion, and when Data Saver isn't enabled. On phones
  // (or if any of those checks fail) no video is ever requested — the
  // hero image (if any) or black/gold CSS background stands in instead.
  const heroEl = document.querySelector('.hero');
  const heroVideo = document.getElementById('hero-video');

  // ---------- Coded opening movie ----------
  // The 12s loop itself is pure CSS (opacity/transform keyframes only, so it
  // stays on the GPU-composited fast path). JS here only: (a) pauses it
  // when the tab is hidden or once the visitor has scrolled well past the
  // hero — no point animating off-screen — and (b) generates the sakura
  // petals with fresh randomness on every loop.
  const heroMovie = document.querySelector('.hero-movie');

  if (heroMovie) {
    let tabHidden = false;
    let heroOffscreen = false;
    const syncMoviePause = () => heroMovie.classList.toggle('is-paused', tabHidden || heroOffscreen);

    document.addEventListener('visibilitychange', () => {
      tabHidden = document.hidden;
      syncMoviePause();
    });

    if (heroEl) {
      const movieVisibilityObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          heroOffscreen = !entry.isIntersecting;
          syncMoviePause();
        });
      }, { threshold: 0 });
      movieVisibilityObserver.observe(heroEl);
    }
  }

  // ---------- Coded opening movie: sakura petals ----------
  // Petals enter from the left or right edge (never the full width) and
  // drift diagonally as they fall, on three depth layers (far/mid/near) so
  // the opening feels dimensional rather than flat. Every property is
  // randomised per petal, and re-randomised again each time that petal's
  // own loop restarts, so the motion never repeats identically.
  const petalContainer = document.getElementById('hero-movie-petals');

  if (petalContainer && !prefersReducedMotion) {
    const isMobileViewport = () => window.matchMedia('(max-width: 768px)').matches;
    const PETAL_COLORS = ['#e9c9b6', '#f0d4c2', '#e6c877'];
    const LAYERS = {
      far:  { size: [4, 5],  blur: [1, 1.6], opacity: [0.1, 0.18], duration: [10, 12] },
      mid:  { size: [5, 7],  blur: [0.2, 0.6], opacity: [0.18, 0.3], duration: [8, 10] },
      near: { size: [7, 9],  blur: [0, 0.1],  opacity: [0.28, 0.44], duration: [7, 8.5] },
    };
    const rand = (min, max) => min + Math.random() * (max - min);
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    const randomizePetal = (el, layerName) => {
      const layer = LAYERS[layerName];
      const fromLeft = Math.random() < 0.5;
      const startX = fromLeft ? rand(-8, -2) : rand(102, 108);
      const travel = rand(28, 55) * (fromLeft ? 1 : -1); // vw, crosses toward the opposite side
      el.style.setProperty('--start-x', startX + 'vw');
      el.style.setProperty('--start-y', rand(15, 65) + '%');
      el.style.setProperty('--end-x', travel + 'vw');
      el.style.setProperty('--drop', rand(50, 130) + 'px');
      el.style.setProperty('--spin', rand(80, 220) + 'deg');
      el.style.setProperty('--size', rand(layer.size[0], layer.size[1]).toFixed(1) + 'px');
      el.style.setProperty('--blur', rand(layer.blur[0], layer.blur[1]).toFixed(2) + 'px');
      el.style.setProperty('--peak-opacity', rand(layer.opacity[0], layer.opacity[1]).toFixed(2));
      el.style.setProperty('--duration', rand(layer.duration[0], layer.duration[1]).toFixed(1) + 's');
      el.style.setProperty('--delay', rand(0, 1.6).toFixed(2) + 's');
      el.style.setProperty('--petal-color', pick(PETAL_COLORS));
    };

    const buildPetals = () => {
      petalContainer.innerHTML = '';
      const layerNames = ['far', 'mid', 'near'];
      const count = isMobileViewport() ? 3 : 7;

      for (let i = 0; i < count; i++) {
        const layerName = layerNames[i % layerNames.length];
        const el = document.createElement('span');
        el.className = 'hero-movie-petal hero-movie-petal--' + layerName;
        randomizePetal(el, layerName);
        // Re-randomise each petal on its OWN animationiteration (not a
        // shared timer) so the new values always land exactly on that
        // petal's invisible 0%-opacity seam — never a mid-flight jump.
        el.addEventListener('animationiteration', () => randomizePetal(el, layerName));
        petalContainer.appendChild(el);
      }
    };

    buildPetals();

    let resizeTimer;
    window.addEventListener('resize', () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(buildPetals, 300);
    });
  }

  // ---------- Hero background image ----------
  // Lightweight, so unlike the video it's attempted on every device —
  // including phones and reduced-motion users, where it's the intended
  // fallback. If a video also loads successfully, it sits above this
  // image in the stacking order and takes over visually.
  const heroImageEl = document.getElementById('hero-image');
  watchOptionalImage(heroImageEl, () => {
    heroEl.classList.add('has-image');
    heroImageEl.classList.add('is-ready');
  });

  const isDesktopViewport = () => window.matchMedia('(min-width: 769px)').matches;
  const saveDataEnabled = () => Boolean(navigator.connection && navigator.connection.saveData);

  // Real background video lives at assets/videos/rafale-opening.mp4 (see
  // assets/videos/README.txt). The small on-page notice (#hero-video-status)
  // only ever appears on localhost/dev hosts, so a site that ships without
  // ever adding a real video never shows a "not configured" message to real
  // visitors — the coded opening movie is a complete design on its own.
  const heroVideoStatus = document.getElementById('hero-video-status');
  const isDevHost = ['localhost', '127.0.0.1', ''].includes(window.location.hostname);

  if (heroEl && heroVideo && isDesktopViewport() && !prefersReducedMotion && !saveDataEnabled()) {
    if (heroVideoStatus && isDevHost) heroVideoStatus.classList.add('is-visible');

    const sources = [
      { src: 'assets/videos/rafale-opening.webm', type: 'video/webm' },
      { src: 'assets/videos/rafale-opening.mp4', type: 'video/mp4' },
    ];

    sources.forEach(({ src, type }) => {
      const source = document.createElement('source');
      source.src = src;
      source.type = type;
      heroVideo.appendChild(source);
    });

    heroVideo.addEventListener('canplaythrough', () => {
      heroEl.classList.add('has-video');
      heroVideo.classList.add('is-ready');
      if (heroVideoStatus) heroVideoStatus.classList.remove('is-visible');
      heroVideo.play().catch(() => {
        // Autoplay blocked (e.g. low-power mode): fallback background stays visible.
      });
    }, { once: true });

    heroVideo.addEventListener('error', () => {
      // No video file present yet, or it failed to load — the fallback
      // black/gold background (.hero-bg / .hero-movie) simply remains visible.
    });

    heroVideo.load();
  }

  // ---------- Sakura petals (site-wide, section-aware, lightweight canvas) ----------
  // One canvas overlays the whole page. As the visitor scrolls, the section
  // currently in view determines how many petals drift and how they move —
  // a handful and barely-there in PHILOSOPHY/MESSAGE, a couple of petals
  // "crossing" the screen in BUSINESS, a little livelier in BRANDS (the
  // SAKURA-branded lounge), a single quiet petal in CONTACT, slightly more
  // than before on TOP. Counts are halved on phones. Fully disabled when
  // the visitor prefers reduced motion.
  const sakuraCanvas = document.getElementById('sakura-canvas');

  if (sakuraCanvas && !prefersReducedMotion) {
    const ctx = sakuraCanvas.getContext('2d');
    let petals = [];
    let rafId = null;
    let running = false;
    let lastSpawn = 0;

    const isMobileViewport = () => window.matchMedia('(max-width: 768px)').matches;

    // 花びらは「大・中・小」の3サイズ、「遅・中・速」の3スピード、
    // 「低・中・高」の3透明度から個別に選ばれ、落ちながら左右へゆるやかに揺れます。
    const SIZE_TIERS    = [[4, 5.5], [6, 8], [8.5, 11]];          // 小 / 中 / 大
    const SPEED_TIERS   = [[0.12, 0.22], [0.24, 0.4], [0.46, 0.7]]; // 遅 / 中 / 速
    const OPACITY_TIERS = [0.12, 0.22, 0.34];                     // 低 / 中 / 高（基準値）

    // セクションごとの「枚数」と「濃さ倍率」だけを持たせ、サイト全体でごく控えめに。
    // 読ませたいPHILOSOPHY/MESSAGEでは気配だけ、TOP/BRANDSで少しだけ華やかに。
    const SAKURA_PROFILES = {
      top:        { count: 12, opacity: 1.0 },
      philosophy: { count: 3,  opacity: 0.42 },
      business:   { count: 4,  opacity: 0.8 },
      brands:     { count: 7,  opacity: 0.95 },
      message:    { count: 3,  opacity: 0.42 },
      company:    { count: 4,  opacity: 0.62 },
      contact:    { count: 2,  opacity: 0.7 },
    };
    const DEFAULT_PROFILE = { count: 5, opacity: 0.7 };
    const PETAL_COLORS = ['#e9c9b6', '#f0d4c2', '#e6c877'];

    let activeSection = 'top';
    let targetCount = SAKURA_PROFILES.top.count;

    const currentProfile = () => SAKURA_PROFILES[activeSection] || DEFAULT_PROFILE;

    const applyTargetCount = () => {
      const base = currentProfile().count;
      targetCount = isMobileViewport() ? Math.round(base * 0.5) : base;
    };

    const rand = (min, max) => min + Math.random() * (max - min);
    const pickTier = (tiers) => tiers[Math.floor(Math.random() * tiers.length)];

    const resizeCanvas = () => {
      sakuraCanvas.width = window.innerWidth;
      sakuraCanvas.height = window.innerHeight;
    };

    const makePetal = (randomY) => {
      const opacityScale = currentProfile().opacity;
      const sizeTier = pickTier(SIZE_TIERS);
      const speedTier = pickTier(SPEED_TIERS);
      const opacityBase = pickTier(OPACITY_TIERS);
      return {
        x: Math.random() * sakuraCanvas.width,
        y: randomY ? Math.random() * sakuraCanvas.height : -12,
        size: rand(sizeTier[0], sizeTier[1]),
        aspect: rand(0.52, 0.72),
        speedY: rand(speedTier[0], speedTier[1]),
        vx: rand(0.04, 0.16) * (Math.random() < 0.5 ? -1 : 1), // ごく僅かな横流れ
        swayAmp: rand(14, 34),         // 左右の揺れ幅(px)
        swaySpeed: rand(0.006, 0.014), // 揺れの速さ
        swayOffset: Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        opacity: opacityBase * opacityScale,
        color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
      };
    };

    const drawPetal = (p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * p.aspect, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const tick = (now) => {
      ctx.clearRect(0, 0, sakuraCanvas.width, sakuraCanvas.height);

      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i];
        p.y += p.speedY;
        // ごく僅かな横流れ(vx)に、左右へのゆるやかな揺れ(sway)を重ねる
        p.x += p.vx + Math.sin(p.y * p.swaySpeed + p.swayOffset) * (p.swayAmp * 0.02);
        p.rotation += p.rotationSpeed;

        if (p.x < -20) p.x = sakuraCanvas.width + 20;
        if (p.x > sakuraCanvas.width + 20) p.x = -20;

        if (p.y > sakuraCanvas.height + 14) {
          if (petals.length > targetCount) {
            petals.splice(i, 1);
            continue;
          }
          Object.assign(p, makePetal(false));
        }

        drawPetal(p);
      }

      if (petals.length < targetCount && now - lastSpawn > 240) {
        petals.push(makePetal(true));
        lastSpawn = now;
      }

      rafId = window.requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      rafId = window.requestAnimationFrame(tick);
    };

    const stop = () => {
      running = false;
      if (rafId) window.cancelAnimationFrame(rafId);
    };

    resizeCanvas();
    applyTargetCount();
    petals = Array.from({ length: targetCount }, () => makePetal(true));

    let resizeTimer;
    window.addEventListener('resize', () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resizeCanvas();
        applyTargetCount();
      }, 200);
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop(); else start();
    });

    // Tracks which section currently has the most on-screen presence and
    // switches the active petal profile accordingly. Existing petals keep
    // falling with their own settings — only new spawns (and respawns once
    // the target shrinks) pick up the new profile, so the transition
    // between sections is always gradual, never an abrupt swap.
    const sectionIds = Object.keys(SAKURA_PROFILES);
    const sectionRatios = new Map();
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        sectionRatios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
      });

      let bestId = null;
      let bestRatio = 0;
      sectionRatios.forEach((ratio, id) => {
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestId = id;
        }
      });

      if (bestId && bestId !== activeSection) {
        activeSection = bestId;
        applyTargetCount();
      }
    }, { threshold: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1] });

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) sectionObserver.observe(el);
    });

    start();
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!contactForm.checkValidity()) {
        formNote.textContent = '未入力の必須項目があります。ご確認ください。';
        formNote.style.color = '#e08a8a';
        return;
      }

      // フォーム送信先は未接続です。Studio移植時はStudioのフォーム機能、
      // または外部フォームサービス（Formspreeなど）と接続してください。
      formNote.style.color = '';
      formNote.textContent = 'お問い合わせありがとうございます。担当者より折り返しご連絡いたします。';
      contactForm.reset();
    });
  }
});
