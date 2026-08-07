/* ============================================================
   Rafale Holdings ― interactions
   ------------------------------------------------------------
   方針: 動かすのは transform と opacity だけ。
   ・スクロールは rAF に集約した1本のリスナー（passive）
   ・マウス追従はポインタが「精密」なPCのみ。スマホでは登録すらしない
   ・prefers-reduced-motion では演出を止める
   お問い合わせフォームの送信処理は従来のまま（変更していません）。
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('site-header');
  const hamburger = document.getElementById('hamburger');
  const mainNav = document.getElementById('main-nav');
  const navLinks = mainNav ? mainNav.querySelectorAll('a') : [];
  const yearEl = document.getElementById('year');
  const contactForm = document.getElementById('contact-form');
  const formNote = document.getElementById('form-note');
  const scrollProgress = document.getElementById('scroll-progress');
  const heroEl = document.querySelector('.hero');
  const root = document.documentElement;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- scroll: ヘッダー状態 / 進捗バー / ヒーローの奥行き ---------- */
  let ticking = false;
  let docHeight = 0;
  let winHeight = window.innerHeight;
  let heroHeight = heroEl ? heroEl.offsetHeight : 0;
  let scrollHeightCache = 0;
  let lastMeasureWidth = window.innerWidth;
  let lastScrolled = null;
  let lastDepth = -1;
  let lastProg = -1;

  /* セクションごとのスクロール連動。
     位置は先に控えておき、スクロール中は引き算だけで済ませる
     （毎フレーム要素の位置を測り直さないので、レイアウトは発生しない）。 */
  const motionSections = document.querySelectorAll('#philosophy, #business, #message, #company, #contact');

  /* ページ全体の地（.page-tone）の区切り位置。
     セクションの実際の位置から割り出して1回だけ書き込む。
     これで文章量やビューポートが変わっても継ぎ目が出ない。 */
  const toneIds = ['#philosophy', '#business', '#brands', '#message', '#company', '#contact'];
  const toneVars = ['--b1', '--b2', '--b3', '--b4', '--b5', '--b6'];
  const toneEls = toneIds.map((s) => document.querySelector(s));
  const measureTone = () => {
    const H = document.documentElement.scrollHeight;
    if (!H) return;
    const at = toneEls.map((el) => (el ? Math.round((el.offsetTop / H) * 1000) / 10 : null));
    at.forEach((v, i) => { if (v !== null) root.style.setProperty(toneVars[i], v + '%'); });
    // BUSINESS の後半でシルバーが混ざり始める位置
    if (at[1] !== null && at[2] !== null) {
      root.style.setProperty('--b2b', (at[1] + (at[2] - at[1]) * 0.55).toFixed(1) + '%');
    }
  };
  let secGeom = [];
  const measureSections = () => {
    secGeom = Array.prototype.map.call(motionSections, (el) => ({
      // 値は光の層そのものへ書く。セクションへ書くと中身すべての
      // スタイルを計算し直すことになり、スクロールが重くなる。
      el: el.querySelector('.sec-light') || el, top: el.offsetTop, h: el.offsetHeight, p: -1, e: -1,
    }));
    measureTone();
  };

  const measure = () => {
    winHeight = window.innerHeight;
    // 幅が変わらない高さだけの変化（スマホのアドレスバー伸縮）では測り直さない
    if (window.innerWidth !== lastMeasureWidth || scrollHeightCache === 0) {
      lastMeasureWidth = window.innerWidth;
      scrollHeightCache = document.documentElement.scrollHeight;
      if (heroEl) heroHeight = heroEl.offsetHeight;
      measureSections();
    }
    docHeight = scrollHeightCache - winHeight;
  };

  const remeasure = () => {
    scrollHeightCache = document.documentElement.scrollHeight;
    lastMeasureWidth = window.innerWidth;
    winHeight = window.innerHeight;
    if (heroEl) heroHeight = heroEl.offsetHeight;
    measureSections();
    docHeight = scrollHeightCache - winHeight;
  };

  const onScroll = () => {
    const y = window.scrollY;

    const scrolled = y > 20;
    if (scrolled !== lastScrolled && header) {
      header.classList.toggle('is-scrolled', scrolled);
      lastScrolled = scrolled;
    }

    const p = docHeight > 0 ? y / docHeight : 0;
    const prog = p < 0 ? 0 : p > 1 ? 1 : p;

    if (scrollProgress) {
      scrollProgress.style.transform = 'scaleX(' + prog + ')';
    }

    /* --sp: ページ全体の進捗。照明の位置を最大16pxずらすためだけに使う。
       小数2桁に丸めてから比較するので、書き込みは1%進むごとに1回だけ。 */
    if (!prefersReducedMotion) {
      const sp = Math.round(prog * 100) / 100;
      if (sp !== lastProg) {
        root.style.setProperty('--sp', String(sp));
        lastProg = sp;
      }
    }

    /* 各セクションへ、そのセクションが画面を通過した割合を渡す。
         --p … 下から入り上へ抜けるまで 0 → 1（向きのある動き用）
         --e … 画面に写っている度合い 0 → 1 → 0（濃さ用）
       小数2桁で比較するので、書き込みは1%進むごとに1回だけ。 */
    if (!prefersReducedMotion) {
      for (let i = 0; i < secGeom.length; i++) {
        const s = secGeom[i];
        const raw = (y + winHeight - s.top) / (s.h + winHeight);
        const p = Math.round((raw < 0 ? 0 : raw > 1 ? 1 : raw) * 100) / 100;
        if (p !== s.p) { s.el.style.setProperty('--p', String(p)); s.p = p; }
        const e = Math.round((1 - Math.abs(p * 2 - 1)) * 100) / 100;
        if (e !== s.e) { s.el.style.setProperty('--e', String(e)); s.e = e; }
      }
    }

    // ヒーロー内にいる間だけ、背景空間をごくわずかに沈ませる（--sy: 0→1）
    if (!prefersReducedMotion && heroHeight > 0) {
      const raw = y / heroHeight;
      const depth = Math.round((raw < 0 ? 0 : raw > 1 ? 1 : raw) * 100) / 100;
      if (depth !== lastDepth) {
        root.style.setProperty('--sy', String(depth));
        lastDepth = depth;
      }
    }

    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });

  measure();
  onScroll();
  window.addEventListener('resize', measure, { passive: true });
  window.addEventListener('load', remeasure);

  /* ---------- mobile navigation ---------- */
  if (hamburger && mainNav) {
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

    navLinks.forEach((link) => link.addEventListener('click', closeMenu));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mainNav.classList.contains('is-open')) {
        closeMenu();
        hamburger.focus();
      }
    });
  }

  /* ---------- reveal on scroll ----------
     文字の出現は全セクション共通の階層で動かす。
       1) 大見出し        … いちばん先（マスク＋blur は CSS 側）
       2) 本文            … 少し遅れて fade + translate
       3) 小さなラベル/番号 … さらに遅れて
     グループ（事業一覧など）の中は、上から順に少しずつずらす。 */
  const TIER_HEADING = '.section-title, .philo-title .mask, .message-quote, .brand-logo';
  const TIER_LABEL   = '.section-tag, .brand-origin, .contact-label, .biz-num';
  const tierDelay = (el) => {
    if (el.matches(TIER_HEADING)) return 0;
    if (el.matches(TIER_LABEL)) return 240;
    return 120;                                   // 本文
  };

  document.querySelectorAll('.biz-list, .info-list, .contact-info, .brand')
    .forEach((group) => {
      group.querySelectorAll('.reveal').forEach((el, i) => {
        if (!el.dataset.revealDelay) {
          el.dataset.revealDelay = prefersReducedMotion ? '0' : String(Math.min(i, 8) * 70);
        }
      });
    });

  document.querySelectorAll('.reveal').forEach((el) => {
    if (!el.dataset.revealDelay) {
      el.dataset.revealDelay = prefersReducedMotion ? '0' : String(tierDelay(el));
    }
  });

  /* ---------- Light Sweep ----------
     見出しが出そろってから、反射光が1回だけ文字を通過する。
     動かすのはCSS側の background-position だけで、要素は複製しない。
     observer は一度きり（unobserve）なので、戻ってきても再発動しない。 */
  const canClipText = window.CSS && CSS.supports &&
    (CSS.supports('background-clip', 'text') || CSS.supports('-webkit-background-clip', 'text'));
  const sweepEnabled = canClipText && !prefersReducedMotion;

  // 反射をかける見出し。SAKURAロゴとカード内の英字は対象外。
  const SWEEP_MATCH = '.section-tag, .section-title';
  const sweepTargetOf = (el) => {
    if (el.classList.contains('mask')) return el.closest('.philo-title') ? el.querySelector('.mask-in') : null;
    return el.matches(SWEEP_MATCH) ? el : null;
  };

  const revealTargets = document.querySelectorAll('.reveal');
  if (revealTargets.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        observer.unobserve(el);
        const delay = Number(el.dataset.revealDelay || 0);
        window.setTimeout(() => el.classList.add('is-visible'), delay);

        const sweep = sweepEnabled ? sweepTargetOf(el) : null;
        if (sweep) {
          window.setTimeout(() => {
            sweep.classList.add('is-swept');
            // 走り終えたら元の描画へ戻す（HEROだけは戻さない ― CSS側の注記参照）
            sweep.addEventListener('animationend', () => sweep.classList.remove('is-swept'), { once: true });
          }, delay + 620);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    revealTargets.forEach((el) => observer.observe(el));
  }

  /* ---------- 見えている範囲だけ動かす ----------
     常時まわるアニメーションが20件以上あり、画面の外でも回り続けていた。
     ここで「今そのあたりを見ているか」を .is-live で知らせ、
     CSS 側（スマホのみ）で見えていない間だけ止める。
     少し手前から on にするので、入ってくる時に止まって見えることはない。 */
  const liveTargets = document.querySelectorAll('.hero, .section');
  if (liveTargets.length && 'IntersectionObserver' in window) {
    const liveObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('is-live', entry.isIntersecting);
      });
    }, { rootMargin: '25% 0px 25% 0px' });
    liveTargets.forEach((el) => liveObserver.observe(el));
  }

  /* HERO の3行は、既存の表示アニメーション(lineRise)が終わってから
     上の行→下の行の順に、ごく短い間隔で反射を流す。 */
  const heroLines = document.querySelectorAll('.hero-line-in');
  if (sweepEnabled && heroLines.length) {
    let started = false;
    const startHeroSweep = () => {
      if (started) return;
      started = true;
      heroLines.forEach((line, i) => {
        window.setTimeout(() => line.classList.add('is-swept'), i * 200);
      });
    };
    // 通常は最後の行が出終わった瞬間。届かなかった場合の保険としてタイマーも置く。
    heroLines[heroLines.length - 1]
      .addEventListener('animationend', startHeroSweep, { once: true });
    window.setTimeout(startHeroSweep, 5200);
  }

  /* ---------- マウスに対するごく弱い反応（PCのみ） ----------
     ポインタが精密なデバイスに限り、-1〜1 の値を2つ渡すだけ。
     実際に動かすのはCSS側（背景の transform）で、数十pxが上限。 */
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  if (finePointer && !prefersReducedMotion) {
    let mx = 0, my = 0, queued = false;

    const apply = () => {
      root.style.setProperty('--mx', mx.toFixed(3));
      root.style.setProperty('--my', my.toFixed(3));
      queued = false;
    };

    window.addEventListener('mousemove', (e) => {
      mx = (e.clientX / window.innerWidth) * 2 - 1;
      my = (e.clientY / window.innerHeight) * 2 - 1;
      if (!queued) { queued = true; window.requestAnimationFrame(apply); }
    }, { passive: true });
  }

  /* ---------- ヒーロー背景動画（未配置なら何も起きない） ----------
     assets/videos/rafale-opening.mp4（任意で .webm）を置くと、
     PCかつ省データ・モーション低減でない場合だけ再生されます。 */
  const heroVideo = document.getElementById('hero-video');
  const isDesktopViewport = () => window.matchMedia('(min-width: 769px)').matches;
  const saveDataEnabled = () => Boolean(navigator.connection && navigator.connection.saveData);

  if (heroEl && heroVideo && isDesktopViewport() && !prefersReducedMotion && !saveDataEnabled()) {
    [
      { src: 'assets/videos/rafale-opening.webm', type: 'video/webm' },
      { src: 'assets/videos/rafale-opening.mp4', type: 'video/mp4' },
    ].forEach(({ src, type }) => {
      const source = document.createElement('source');
      source.src = src;
      source.type = type;
      heroVideo.appendChild(source);
    });

    heroVideo.addEventListener('canplaythrough', () => {
      heroEl.classList.add('has-video');
      heroVideo.classList.add('is-ready');
      heroVideo.play().catch(() => {});
    }, { once: true });

    heroVideo.addEventListener('error', () => {}, { once: true });
    heroVideo.load();
  }

  /* ---------- contact form（従来の送信処理をそのまま維持） ---------- */
  if (contactForm) {
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const submitLabel = submitBtn ? submitBtn.textContent : '';

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!contactForm.checkValidity()) {
        formNote.textContent = '未入力の必須項目があります。ご確認ください。';
        formNote.style.color = '#e08a8a';
        return;
      }

      const payload = {
        name: document.getElementById('name').value,
        company: document.getElementById('company-name').value,
        email: document.getElementById('email').value,
        message: document.getElementById('inquiry').value,
        hp_url: (contactForm.querySelector('[name="hp_url"]') || {}).value || ''
      };

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '送信中…';
      }
      formNote.style.color = '';
      formNote.textContent = '送信中…';

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await res.json().catch(() => null);

        if (res.ok && result && result.ok === true) {
          formNote.style.color = '';
          formNote.textContent = 'お問い合わせありがとうございます。担当者より折り返しご連絡いたします。';
          contactForm.reset();
        } else {
          throw new Error('send_failed');
        }
      } catch (err) {
        formNote.style.color = '#e08a8a';
        formNote.textContent = '送信に失敗しました。時間をおいて再度お試しいただくか、info@rafale-hd.jpまでご連絡ください。';
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitLabel;
        }
      }
    });
  }

  /* ---------- BRANDS: カード全体をクリックしてもブランドサイトへ ----------
     本来のリンクはカード内の「ブランドサイトを見る」ボタン（<a>）で、これはその補助。
     カード内のリンク上や、テキストを選択しただけのときは何もしない。 */
  document.querySelectorAll('.brand[data-brand-href]').forEach((card) => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('a, button')) return;
      const selection = window.getSelection();
      if (selection && selection.toString()) return;
      window.open(card.dataset.brandHref, '_blank', 'noopener,noreferrer');
    });
  });
});
