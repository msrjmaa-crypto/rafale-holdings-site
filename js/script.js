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

  let docHeight = 0;
  let winHeight = window.innerHeight;
  let scrollHeightCache = 0;
  let lastMeasureWidth = window.innerWidth;
  let lastScrolled = null;

  const measure = () => {
    winHeight = window.innerHeight;
    if (window.innerWidth !== lastMeasureWidth || scrollHeightCache === 0) {
      lastMeasureWidth = window.innerWidth;
      scrollHeightCache = document.documentElement.scrollHeight;
    }
    docHeight = scrollHeightCache - winHeight;
  };

  const remeasure = () => {
    scrollHeightCache = document.documentElement.scrollHeight;
    lastMeasureWidth = window.innerWidth;
    winHeight = window.innerHeight;
    docHeight = scrollHeightCache - winHeight;
  };

  const onScroll = () => {
    const y = window.scrollY;

    const scrolled = y > 20;
    if (scrolled !== lastScrolled) {
      header.classList.toggle('is-scrolled', scrolled);
      lastScrolled = scrolled;
    }

    if (scrollProgress) {
      const p = docHeight > 0 ? y / docHeight : 0;
      scrollProgress.style.transform = 'scaleX(' + (p < 0 ? 0 : p > 1 ? 1 : p) + ')';
    }

    if (heroBg && !prefersReducedMotion && y < winHeight) {
      heroBg.style.transform = 'translateY(' + y * 0.15 + 'px)';
    }

    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  measure();
  onScroll();
  window.addEventListener('resize', measure, { passive: true });
  window.addEventListener('load', remeasure);

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

  const staggerGroups = document.querySelectorAll('.business-grid, .contact-info, .brand-card');
  staggerGroups.forEach((group) => {
    group.querySelectorAll('.reveal').forEach((el, index) => {
      el.dataset.revealDelay = prefersReducedMotion ? '0' : String(index * 90);
    });
  });

  const revealTargets = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      observer.unobserve(el);
      const delay = Number(el.dataset.revealDelay || 0);
      window.setTimeout(() => {
        if (!prefersReducedMotion) {

          el.style.willChange = 'opacity, transform';
          el.addEventListener('transitionend', () => { el.style.willChange = ''; }, { once: true });
        }
        el.classList.add('is-visible');
      }, delay);
    });
  }, { threshold: 0.15 });

  revealTargets.forEach((el) => observer.observe(el));

  const heroEl = document.querySelector('.hero');
  const heroVideo = document.getElementById('hero-video');

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
      const travel = rand(28, 55) * (fromLeft ? 1 : -1);
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

        el.addEventListener('animationiteration', () => randomizePetal(el, layerName));
        petalContainer.appendChild(el);
      }
    };

    buildPetals();

    let lastPetalWidth = window.innerWidth;
    let resizeTimer;
    window.addEventListener('resize', () => {
      if (window.innerWidth === lastPetalWidth) return;
      lastPetalWidth = window.innerWidth;
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(buildPetals, 300);
    });
  }

  const isDesktopViewport = () => window.matchMedia('(min-width: 769px)').matches;
  const saveDataEnabled = () => Boolean(navigator.connection && navigator.connection.saveData);

  if (heroEl && heroVideo && isDesktopViewport() && !prefersReducedMotion && !saveDataEnabled()) {
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
      heroVideo.play().catch(() => {

      });
    }, { once: true });

    heroVideo.addEventListener('error', () => {

    });

    heroVideo.load();
  }

  const sakuraCanvas = document.getElementById('sakura-canvas');

  if (sakuraCanvas && !prefersReducedMotion) {
    const ctx = sakuraCanvas.getContext('2d');
    let petals = [];
    let rafId = null;
    let running = false;
    let lastSpawn = 0;

    const isMobileViewport = () => window.matchMedia('(max-width: 768px)').matches;

    const SIZE_TIERS    = [[4, 5.5], [6, 8], [8.5, 11]];
    const SPEED_TIERS   = [[0.12, 0.22], [0.24, 0.4], [0.46, 0.7]];
    const OPACITY_TIERS = [0.12, 0.22, 0.34];

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

    const resetPetal = (p, randomY) => {
      const opacityScale = currentProfile().opacity;
      const sizeTier = pickTier(SIZE_TIERS);
      const speedTier = pickTier(SPEED_TIERS);
      const opacityBase = pickTier(OPACITY_TIERS);
      p.x = Math.random() * sakuraCanvas.width;
      p.y = randomY ? Math.random() * sakuraCanvas.height : -12;
      p.size = rand(sizeTier[0], sizeTier[1]);
      p.aspect = rand(0.52, 0.72);
      p.speedY = rand(speedTier[0], speedTier[1]);
      p.vx = rand(0.04, 0.16) * (Math.random() < 0.5 ? -1 : 1);
      p.swayAmp = rand(14, 34);
      p.swaySpeed = rand(0.006, 0.014);
      p.swayOffset = Math.random() * Math.PI * 2;
      p.rotation = Math.random() * Math.PI * 2;
      p.rotationSpeed = (Math.random() - 0.5) * 0.02;
      p.opacity = opacityBase * opacityScale;
      p.color = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
      return p;
    };
    const makePetal = (randomY) => resetPetal({}, randomY);

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

        p.x += p.vx + Math.sin(p.y * p.swaySpeed + p.swayOffset) * (p.swayAmp * 0.02);
        p.rotation += p.rotationSpeed;

        if (p.x < -20) p.x = sakuraCanvas.width + 20;
        if (p.x > sakuraCanvas.width + 20) p.x = -20;

        if (p.y > sakuraCanvas.height + 14) {
          if (petals.length > targetCount) {
            petals.splice(i, 1);
            continue;
          }
          resetPetal(p, false);
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

    let lastCanvasWidth = window.innerWidth;
    resizeCanvas();
    applyTargetCount();
    petals = Array.from({ length: targetCount }, () => makePetal(true));

    let resizeTimer;
    window.addEventListener('resize', () => {
      if (window.innerWidth === lastCanvasWidth) return;
      lastCanvasWidth = window.innerWidth;
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resizeCanvas();
        applyTargetCount();
      }, 200);
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop(); else start();
    });

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

      formNote.style.color = '';
      formNote.textContent = 'お問い合わせありがとうございます。担当者より折り返しご連絡いたします。';
      contactForm.reset();
    });
  }
});
