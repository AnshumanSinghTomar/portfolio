/* honey.js — Honey-inspired motion and portfolio interactions */
(function () {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = reduceQuery.matches;
  const finePointer = pointerQuery.matches;
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

  root.classList.add(reduced ? 'reduced-motion' : 'motion-ok');

  /* Short page intro: visual only and never a long blocking loader. */
  const pageIntro = document.getElementById('page-intro');
  function enterPage() {
    if (body.classList.contains('page-entered')) return;
    body.classList.add('page-entered');
    window.setTimeout(() => pageIntro?.setAttribute('aria-hidden', 'true'), reduced ? 0 : 600);
  }
  if (reduced) enterPage();
  else window.setTimeout(enterPage, 650);

  /* Gradient Waves background: canvas keeps the effect lightweight on a static page. */
  const wavesCanvas = document.querySelector('.gradient-waves');
  if (wavesCanvas && !reduced) {
    const waveContext = wavesCanvas.getContext('2d');
    const waveHost = wavesCanvas.closest('.launch-hero');
    let waveFrame = 0;
    let waveVisible = true;
    let waveWidth = 0;
    let waveHeight = 0;
    let waveScale = 1;

    function resizeWaves() {
      const bounds = waveHost.getBoundingClientRect();
      waveScale = Math.min(window.devicePixelRatio || 1, 1.5);
      waveWidth = Math.max(1, Math.round(bounds.width));
      waveHeight = Math.max(1, Math.round(bounds.height));
      wavesCanvas.width = Math.round(waveWidth * waveScale);
      wavesCanvas.height = Math.round(waveHeight * waveScale);
      waveContext.setTransform(waveScale, 0, 0, waveScale, 0, 0);
    }

    function drawWaves(time) {
      waveFrame = 0;
      if (!waveVisible) return;
      waveContext.clearRect(0, 0, waveWidth, waveHeight);
      const horizon = waveHeight * .53;
      const spacing = Math.max(22, waveHeight / 18);
      const cycle = time * .00032;

      for (let index = 0; index < 15; index += 1) {
        const progress = index / 14;
        const yBase = horizon + (index - 7) * spacing;
        const amplitude = 14 + progress * 35;
        const gradient = waveContext.createLinearGradient(0, yBase, waveWidth, yBase);
        gradient.addColorStop(0, 'rgba(255, 76, 36, 0)');
        gradient.addColorStop(.2, `rgba(255, 76, 36, ${.04 + progress * .06})`);
        gradient.addColorStop(.5, `rgba(255, 205, 170, ${.11 + progress * .09})`);
        gradient.addColorStop(.8, `rgba(255, 76, 36, ${.04 + progress * .06})`);
        gradient.addColorStop(1, 'rgba(255, 76, 36, 0)');
        waveContext.beginPath();
        for (let x = 0; x <= waveWidth; x += 10) {
          const y = yBase
            + Math.sin((x / waveWidth) * Math.PI * 2.2 + cycle + index * .42) * amplitude
            + Math.sin((x / waveWidth) * Math.PI * 5.4 - cycle * 1.35 + index * .23) * amplitude * .26;
          if (x === 0) waveContext.moveTo(x, y);
          else waveContext.lineTo(x, y);
        }
        waveContext.strokeStyle = gradient;
        waveContext.lineWidth = 1;
        waveContext.stroke();
      }
      waveFrame = window.requestAnimationFrame(drawWaves);
    }

    resizeWaves();
    window.addEventListener('resize', resizeWaves, { passive: true });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        waveVisible = entry.isIntersecting;
        if (waveVisible && !waveFrame) waveFrame = window.requestAnimationFrame(drawWaves);
      }).observe(waveHost);
    }
    waveFrame = window.requestAnimationFrame(drawWaves);
  }

  /* ProfileCard-inspired portrait: a fine-pointer tilt, sheen and cursor-following glow. */
  const profilePortrait = document.querySelector('.profile-card');
  if (profilePortrait && !reduced) {
    let portraitFrame = 0;
    let portraitX = 50;
    let portraitY = 50;

    function drawPortraitTilt() {
      portraitFrame = 0;
      profilePortrait.style.setProperty('--profile-x', `${portraitX}%`);
      profilePortrait.style.setProperty('--profile-y', `${portraitY}%`);
      profilePortrait.style.setProperty('--profile-rotate-x', `${(portraitX - 50) / 7}deg`);
      profilePortrait.style.setProperty('--profile-rotate-y', `${(50 - portraitY) / 8}deg`);
    }

    function updatePortraitTilt(event) {
      const bounds = profilePortrait.getBoundingClientRect();
      portraitX = Math.max(0, Math.min(100, ((event.clientX - bounds.left) / bounds.width) * 100));
      portraitY = Math.max(0, Math.min(100, ((event.clientY - bounds.top) / bounds.height) * 100));
      if (!portraitFrame) portraitFrame = window.requestAnimationFrame(drawPortraitTilt);
    }

    function resetPortraitTilt() {
      portraitX = 50;
      portraitY = 50;
      profilePortrait.classList.remove('is-active');
      if (!portraitFrame) portraitFrame = window.requestAnimationFrame(drawPortraitTilt);
    }

    if (finePointer) {
      profilePortrait.addEventListener('pointerenter', (event) => {
        profilePortrait.classList.add('is-active');
        updatePortraitTilt(event);
      });
      profilePortrait.addEventListener('pointermove', updatePortraitTilt);
      profilePortrait.addEventListener('pointerleave', resetPortraitTilt);
    } else {
      profilePortrait.addEventListener('click', () => profilePortrait.classList.toggle('is-active'));
    }
    profilePortrait.addEventListener('focus', () => profilePortrait.classList.add('is-active'));
    profilePortrait.addEventListener('blur', resetPortraitTilt);
  }

  /* Add reusable motion hooks while preserving no-JS visibility. */
  document.querySelectorAll('.section-label').forEach((element) => element.classList.add('reveal'));
  document.querySelectorAll('#about .col-left, #experience .col-left, #skills .col-left, #awards .col-left')
    .forEach((element) => element.classList.add('reveal-l'));
  document.querySelectorAll('.projects-head, .contact-heading, .contact-cols, .contact-form')
    .forEach((element) => element.classList.add('reveal'));
  document.querySelectorAll('.stat-row, .skill-cols, .cred-list, .rules-list, .contact-card-list')
    .forEach((element) => element.classList.add('stagger'));
  document.querySelectorAll('.exp-item, .project-block')
    .forEach((element) => element.classList.add('card-reveal'));

  /* Static-site contact handoff: validate locally, then open a prefilled email. */
  const contactForm = document.getElementById('contact-form');
  const contactStatus = document.getElementById('contact-form-status');
  contactForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;
    const formData = new FormData(contactForm);
    const senderName = String(formData.get('name') || '').trim();
    const senderEmail = String(formData.get('email') || '').trim();
    const message = String(formData.get('message') || '').trim();
    const subject = encodeURIComponent(`Portfolio enquiry from ${senderName}`);
    const bodyText = encodeURIComponent(`Name: ${senderName}\nEmail: ${senderEmail}\n\n${message}`);
    if (contactStatus) contactStatus.textContent = 'OPENING YOUR EMAIL APP…';
    window.location.href = `mailto:anshuman.s.tomar@gmail.com?subject=${subject}&body=${bodyText}`;
  });

  /* Enrich only existing content: no fabricated projects, skills or stages. */
  const projectBlocks = Array.from(document.querySelectorAll('.project-block'));
  projectBlocks.forEach((block) => {
    const title = block.querySelector('.pb-title')?.textContent.trim() || 'PROJECT';
    const mediaTitle = block.querySelector('.pb-media-title');
    if (mediaTitle) mediaTitle.textContent = title;
  });

  const experienceSection = document.getElementById('experience');
  const journeyList = experienceSection?.querySelector('.col-right');
  const journeyItems = Array.from(experienceSection?.querySelectorAll('.exp-item') || []);
  journeyList?.classList.add('journey-list');
  journeyItems.forEach((item, index) => {
    item.dataset.step = String(index + 1).padStart(2, '0');
  });

  document.querySelectorAll('.skill-group-h').forEach((item, index) => {
    item.dataset.skillIndex = String(index + 1).padStart(2, '0');
  });
  document.querySelectorAll('.cred-item').forEach((item, index) => {
    item.dataset.achievementIndex = String(index + 1).padStart(2, '0');
  });
  document.querySelectorAll('.rule-row').forEach((row) => {
    const number = row.querySelector('.rr-num')?.textContent.replace('.', '') || '000';
    const words = row.querySelector('.rr-text')?.textContent.trim().split(/\s+/).slice(0, 3) || [];
    row.dataset.preview = `${number} / ${words.join(' ')}`;
  });

  /* Masked hero lines. */
  document.querySelectorAll('.h1-line').forEach((line) => {
    if (line.querySelector('.h1-line-inner')) return;
    const inner = document.createElement('span');
    inner.className = 'h1-line-inner';
    while (line.firstChild) inner.appendChild(line.firstChild);
    line.appendChild(inner);
  });

  /* The original editorial hero follows the new opening screen, so start it on arrival. */
  const editorialHero = document.querySelector('.hero-sec');
  if (editorialHero) {
    if (reduced || !('IntersectionObserver' in window)) {
      editorialHero.classList.add('hero-active');
    } else {
      const heroObserver = new IntersectionObserver((entries, observer) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        editorialHero.classList.add('hero-active');
        observer.disconnect();
      }, { threshold: 0.18 });
      heroObserver.observe(editorialHero);
    }
  }

  /* Scroll-progressive words, applied to a few hierarchy-setting paragraphs. */
  const wordGroups = [];
  if (!reduced) {
    document.querySelectorAll('#about .col-right .h-body:first-child, .projects-head .h-body, .cc-left .h-body')
      .forEach((element) => {
        const text = element.textContent.trim();
        if (!text) return;
        element.classList.add('word-reveal');
        element.setAttribute('aria-label', text);
        element.textContent = '';
        text.split(/\s+/).forEach((word, index, words) => {
          const span = document.createElement('span');
          span.className = 'scroll-word';
          span.setAttribute('aria-hidden', 'true');
          span.textContent = word;
          element.appendChild(span);
          if (index < words.length - 1) element.appendChild(document.createTextNode(' '));
        });
        wordGroups.push({
          element,
          words: Array.from(element.querySelectorAll('.scroll-word')),
          lastStep: -1
        });
      });
  }

  /* Accessible mobile navigation dropdown with focus containment. */
  const menuToggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  let menuOpen = false;

  function setMenu(open, returnFocus = false) {
    if (!menuToggle || !mobileMenu) return;
    menuOpen = open;
    body.classList.toggle('menu-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    mobileMenu.setAttribute('aria-hidden', String(!open));
    if (open) {
      window.setTimeout(() => mobileMenu.querySelector('a')?.focus(), reduced ? 0 : 180);
    } else if (returnFocus) {
      menuToggle.focus();
    }
  }

  menuToggle?.addEventListener('click', () => setMenu(!menuOpen));
  mobileMenu?.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', (event) => {
    if (!menuOpen || !menuToggle || !mobileMenu) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setMenu(false, true);
      return;
    }
    if (event.key !== 'Tab') return;
    const links = Array.from(mobileMenu.querySelectorAll('a'));
    const last = links[links.length - 1];
    if (event.shiftKey && document.activeElement === menuToggle) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      menuToggle.focus();
    }
  });
  /* Entrance observers. */
  const motionTargets = Array.from(document.querySelectorAll('.reveal, .reveal-l, .stagger, .card-reveal'));
  if (reduced || !('IntersectionObserver' in window)) {
    motionTargets.forEach((element) => {
      element.classList.add('in');
      element.closest('.h-section')?.classList.add('is-seen');
    });
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        entry.target.closest('.h-section')?.classList.add('is-seen');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });
    motionTargets.forEach((element) => revealObserver.observe(element));
  }

  /* Counters finish immediately for reduced motion. */
  const counters = Array.from(document.querySelectorAll('[data-count]'));
  function counterValue(element) {
    const target = Number.parseFloat(element.dataset.count || '0');
    const decimals = Number.parseInt(element.dataset.decimals || '0', 10);
    return `${target.toFixed(decimals)}${element.dataset.suffix || ''}`;
  }

  function animateCounter(element) {
    if (element.dataset.counted === 'true') return;
    element.dataset.counted = 'true';
    const target = Number.parseFloat(element.dataset.count || '0');
    const decimals = Number.parseInt(element.dataset.decimals || '0', 10);
    const suffix = element.dataset.suffix || '';
    const start = performance.now();

    function frame(now) {
      const progress = clamp((now - start) / 1400);
      const eased = 1 - Math.pow(1 - progress, 4);
      element.textContent = `${(target * eased).toFixed(decimals)}${suffix}`;
      if (progress < 1) requestAnimationFrame(frame);
      else element.textContent = counterValue(element);
    }
    requestAnimationFrame(frame);
  }

  if (reduced || !('IntersectionObserver' in window)) {
    counters.forEach((counter) => {
      counter.textContent = counterValue(counter);
      counter.dataset.counted = 'true';
    });
  } else {
    const statRow = document.querySelector('.stat-row');
    if (statRow) {
      const counterObserver = new IntersectionObserver((entries, observer) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        counters.forEach(animateCounter);
        observer.disconnect();
      }, { threshold: 0.35 });
      counterObserver.observe(statRow);
    }
  }

  /* Anchor navigation avoids invalid querySelector('#') and honors the header. */
  const nav = document.getElementById('site-nav');
  document.addEventListener('click', (event) => {
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor) return;
    const hash = anchor.getAttribute('href');
    event.preventDefault();

    if (hash === '#') {
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
      return;
    }

    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!target) return;
    const offset = (nav?.offsetHeight || 60) + 12;
    window.scrollTo({
      top: Math.max(0, target.offsetTop - offset),
      behavior: reduced ? 'auto' : 'smooth'
    });
    if (window.location.hash !== hash) history.pushState(null, '', hash);
  });
  window.addEventListener('resize', () => {
    if (menuOpen && window.innerWidth > 900) setMenu(false);
  }, { passive: true });

  /* Project spotlight/tilt and magnetic controls compose via CSS variables. */
  if (!reduced && finePointer) {
    projectBlocks.forEach((block) => {
      block.addEventListener('pointermove', (event) => {
        const rect = block.getBoundingClientRect();
        const x = clamp((event.clientX - rect.left) / rect.width);
        const y = clamp((event.clientY - rect.top) / rect.height);
        block.style.setProperty('--spot-x', `${(x * 100).toFixed(1)}%`);
        block.style.setProperty('--spot-y', `${(y * 100).toFixed(1)}%`);
        block.style.setProperty('--tilt-x', `${((0.5 - y) * 1.5).toFixed(2)}deg`);
        block.style.setProperty('--tilt-y', `${((x - 0.5) * 1.8).toFixed(2)}deg`);
      }, { passive: true });
      block.addEventListener('pointerleave', () => {
        block.style.setProperty('--tilt-x', '0deg');
        block.style.setProperty('--tilt-y', '0deg');
      });
    });

    document.querySelectorAll('.h-btn, .nav-cta, .h-link').forEach((control) => {
      control.addEventListener('pointermove', (event) => {
        const rect = control.getBoundingClientRect();
        control.style.setProperty('--mag-x', `${((event.clientX - rect.left - rect.width / 2) * 0.12).toFixed(1)}px`);
        control.style.setProperty('--mag-y', `${((event.clientY - rect.top - rect.height / 2) * 0.18).toFixed(1)}px`);
      }, { passive: true });
      control.addEventListener('pointerleave', () => {
        control.style.setProperty('--mag-x', '0px');
        control.style.setProperty('--mag-y', '0px');
      });
    });
  }

  /* One cancellable credential scramble per item. */
  const scrambleTimers = new Map();
  const scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·/';
  function stopScramble(name) {
    const timer = scrambleTimers.get(name);
    if (timer) window.clearInterval(timer);
    scrambleTimers.delete(name);
    if (name.dataset.original) name.textContent = name.dataset.original;
  }

  if (!reduced && finePointer) {
    document.querySelectorAll('.cred-name').forEach((name) => {
      name.dataset.original = name.textContent;
      const row = name.closest('.cred-item');
      if (!row) return;
      row.addEventListener('pointerenter', () => {
        stopScramble(name);
        const original = name.dataset.original;
        let progress = 0;
        const timer = window.setInterval(() => {
          name.textContent = original.split('').map((character, index) => {
            if (index < progress || /[\s&]/.test(character)) return character;
            return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
          }).join('');
          progress += 0.8;
          if (progress >= original.length) stopScramble(name);
        }, 28);
        scrambleTimers.set(name, timer);
      });
      row.addEventListener('pointerleave', () => stopScramble(name));
    });
  }

  /* One RAF-backed scroll pipeline owns all scroll-reactive work. */
  const progressBar = document.getElementById('scroll-bar');
  const sectionCounter = document.getElementById('sc-current');
  const indexedSections = Array.from(document.querySelectorAll('[data-index]'));
  const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  const navTargets = navLinks.map((link) => ({
    link,
    section: document.getElementById(link.getAttribute('href').slice(1))
  })).filter((item) => item.section);
  const hero = document.querySelector('.hero-sec');
  const launchHero = document.querySelector('.launch-hero');
  let currentIndex = sectionCounter?.textContent || '01';
  let counterTimer = 0;
  let scrollFrame = 0;

  function updateWords(viewportHeight) {
    wordGroups.forEach((group) => {
      const rect = group.element.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > viewportHeight) return;
      const progress = clamp((viewportHeight * 0.86 - rect.top) / (viewportHeight * 0.54));
      const step = Math.round(progress * 100);
      if (step === group.lastStep) return;
      group.lastStep = step;
      group.words.forEach((word, index) => {
        const local = clamp(progress * (group.words.length + 7) - index);
        word.style.setProperty('--word-opacity', (0.14 + local * 0.86).toFixed(3));
        word.style.setProperty('--word-blur', `${((1 - local) * 7).toFixed(2)}px`);
      });
    });
  }

  function updateProjects(viewportHeight) {
    if (!finePointer || window.innerWidth <= 900) return;
    projectBlocks.forEach((block) => {
      const rect = block.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > viewportHeight) return;
      const centerOffset = (rect.top + rect.height / 2 - viewportHeight / 2) / viewportHeight;
      block.style.setProperty('--media-y', `${clamp(centerOffset * -24, -18, 18).toFixed(1)}px`);
    });
  }

  function updateJourney(viewportHeight) {
    if (!journeyList || !experienceSection) return;
    const sectionRect = experienceSection.getBoundingClientRect();
    const range = Math.max(1, sectionRect.height - viewportHeight * 0.25);
    const progress = reduced ? 1 : clamp((viewportHeight * 0.68 - sectionRect.top) / range);
    journeyList.style.setProperty('--journey-progress', progress.toFixed(3));
    let active = journeyItems[0];
    journeyItems.forEach((item) => {
      if (item.getBoundingClientRect().top <= viewportHeight * 0.62) active = item;
    });
    journeyItems.forEach((item) => item.classList.toggle('is-active', item === active));
  }

  function updateFrame() {
    scrollFrame = 0;
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const maxScroll = Math.max(1, root.scrollHeight - viewportHeight);
    if (launchHero) {
      const launchRect = launchHero.getBoundingClientRect();
      body.classList.toggle('past-launch', launchRect.bottom <= viewportHeight * 0.25);
    }
    progressBar?.style.setProperty('transform', `scaleX(${clamp(scrollY / maxScroll)})`);

    if (nav) {
      nav.style.borderBottomColor = scrollY > 30 ? 'rgba(245,245,240,.25)' : 'rgba(245,245,240,.14)';
    }

    const navMarker = scrollY + viewportHeight * 0.42;
    let activeNav = null;
    navTargets.forEach((item) => {
      if (item.section.offsetTop <= navMarker) activeNav = item;
    });
    navTargets.forEach((item) => item.link.classList.toggle('active', item === activeNav));

    let activeSection = indexedSections[0];
    indexedSections.forEach((section) => {
      if (section.offsetTop <= scrollY + viewportHeight * 0.5) activeSection = section;
    });
    const nextIndex = activeSection?.dataset.index || '01';
    if (sectionCounter && nextIndex !== currentIndex) {
      currentIndex = nextIndex;
      sectionCounter.style.opacity = '0';
      sectionCounter.style.transform = 'translateY(-8px)';
      window.clearTimeout(counterTimer);
      counterTimer = window.setTimeout(() => {
        sectionCounter.textContent = currentIndex;
        sectionCounter.style.opacity = '1';
        sectionCounter.style.transform = 'translateY(0)';
      }, reduced ? 0 : 140);
    }

    if (!reduced && hero) {
      hero.style.setProperty('--hero-glow-y', `${Math.min(scrollY * 0.09, 80).toFixed(1)}px`);
      updateWords(viewportHeight);
      updateProjects(viewportHeight);
    }
    updateJourney(viewportHeight);
  }

  function requestFrame() {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateFrame);
  }
  window.addEventListener('scroll', requestFrame, { passive: true });
  window.addEventListener('resize', requestFrame, { passive: true });
  requestFrame();

  /* Accessible coding-profile tabs and live GitHub public data. */
  const profileTabs = Array.from(document.querySelectorAll('[data-profile-tab]'));
  const profilePanels = Array.from(document.querySelectorAll('[data-profile-panel]'));

  function activateProfile(name, moveFocus = false) {
    profileTabs.forEach((tab) => {
      const active = tab.dataset.profileTab === name;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && moveFocus) tab.focus();
    });
    profilePanels.forEach((panel) => {
      const active = panel.dataset.profilePanel === name;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });
    requestFrame();
  }

  profileTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateProfile(tab.dataset.profileTab));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % profileTabs.length;
      if (event.key === 'ArrowLeft') nextIndex = (index - 1 + profileTabs.length) % profileTabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = profileTabs.length - 1;
      activateProfile(profileTabs[nextIndex].dataset.profileTab, true);
    });
  });

  const githubDashboard = document.getElementById('panel-github');
  let githubLoaded = false;

  function setGithubField(field, value) {
    const element = githubDashboard?.querySelector(`[data-github-field="${field}"]`);
    if (element) element.textContent = String(value);
  }

  function renderGithubRepos(repositories) {
    const container = githubDashboard?.querySelector('[data-github-repos]');
    if (!container) return;
    container.textContent = '';
    repositories.slice(0, 4).forEach((repository) => {
      const link = document.createElement('a');
      link.className = 'repo-signal-row';
      link.href = repository.html_url;
      link.target = '_blank';
      link.rel = 'noopener';

      const name = document.createElement('strong');
      name.textContent = repository.name;
      const language = document.createElement('small');
      language.textContent = repository.language || 'CODE';
      const arrow = document.createElement('span');
      arrow.className = 'repo-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '↗';
      link.append(name, language, arrow);
      container.appendChild(link);
    });
  }

  function renderGithubLanguages(repositories) {
    const container = githubDashboard?.querySelector('[data-github-languages]');
    if (!container) return;
    const counts = new Map();
    repositories.forEach((repository) => {
      if (repository.language) counts.set(repository.language, (counts.get(repository.language) || 0) + 1);
    });
    const languages = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const maxCount = Math.max(1, ...languages.map(([, count]) => count));
    container.textContent = '';
    languages.forEach(([language, count]) => {
      const row = document.createElement('div');
      row.className = 'language-row';
      const head = document.createElement('div');
      head.className = 'language-row-head';
      const label = document.createElement('span');
      label.textContent = language;
      const amount = document.createElement('span');
      amount.textContent = `${count} ${count === 1 ? 'repo' : 'repos'}`;
      head.append(label, amount);
      const track = document.createElement('div');
      track.className = 'language-track';
      const bar = document.createElement('span');
      bar.style.setProperty('--language-width', `${(count / maxCount) * 100}%`);
      track.appendChild(bar);
      row.append(head, track);
      container.appendChild(row);
    });
  }

  async function loadGithubData() {
    if (githubLoaded || !githubDashboard) return;
    githubLoaded = true;
    const status = githubDashboard.querySelector('[data-github-status]');
    try {
      const [userResponse, reposResponse] = await Promise.all([
        fetch('https://api.github.com/users/AnshumanSinghTomar', { headers: { Accept: 'application/vnd.github+json' } }),
        fetch('https://api.github.com/users/AnshumanSinghTomar/repos?per_page=100&sort=updated', { headers: { Accept: 'application/vnd.github+json' } })
      ]);
      if (!userResponse.ok || !reposResponse.ok) throw new Error('GitHub request failed');
      const [user, repositories] = await Promise.all([userResponse.json(), reposResponse.json()]);
      const originalRepos = repositories.filter((repository) => !repository.fork);
      setGithubField('public_repos', user.public_repos);
      setGithubField('followers', user.followers);
      setGithubField('following', user.following);
      setGithubField('total_stars', repositories.reduce((total, repository) => total + repository.stargazers_count, 0));
      renderGithubRepos(originalRepos);
      renderGithubLanguages(originalRepos);
      if (status) status.textContent = 'LIVE GITHUB STATS · SYNCED';
    } catch (error) {
      if (status) status.textContent = 'GITHUB PROFILE · CACHED SNAPSHOT';
      const repos = githubDashboard.querySelector('[data-github-repos]');
      const languages = githubDashboard.querySelector('[data-github-languages]');
      if (repos) repos.innerHTML = '<a class="repo-signal-row" href="https://github.com/AnshumanSinghTomar?tab=repositories" target="_blank" rel="noopener"><strong>Browse public repositories</strong><span class="repo-arrow" aria-hidden="true">↗</span></a>';
      if (languages) languages.innerHTML = '<div class="repo-loading">OPEN GITHUB FOR THE CURRENT LANGUAGE MIX</div>';
    }
  }

  const profilesSection = document.getElementById('profiles');
  if (profilesSection && 'IntersectionObserver' in window) {
    const githubObserver = new IntersectionObserver((entries, observer) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      loadGithubData();
      observer.disconnect();
    }, { rootMargin: '240px 0px' });
    githubObserver.observe(profilesSection);
  } else {
    loadGithubData();
  }

  /* Pause decorative work and clear timers when hidden. */
  document.addEventListener('visibilitychange', () => {
    body.classList.toggle('is-paused', document.hidden);
    if (document.hidden) {
      Array.from(scrambleTimers.keys()).forEach(stopScramble);
    } else {
      requestFrame();
    }
  });
})();


/* Live GitHub, LeetCode and CodeChef daily streak dashboards. */
(function () {
  'use strict';

  const profiles = document.getElementById('profiles');
  if (!profiles) return;

  const PLATFORM_CONFIG = {
    github: {
      label: 'GITHUB CONTRIBUTIONS',
      profile: 'https://github.com/AnshumanSinghTomar',
      endpoints: ['https://github-contributions-api.jogruber.de/v4/AnshumanSinghTomar?y=last']
    },
    leetcode: {
      label: 'LEETCODE SUBMISSIONS',
      profile: 'https://leetcode.com/u/GfkKVhfJeM/',
      endpoints: [
        'https://alfa-leetcode-api.onrender.com/GfkKVhfJeM/calendar',
        'https://alfa-leetcode-api.onrender.com/GfkKVhfJeM/solved',
        'https://alfa-leetcode-api.onrender.com/GfkKVhfJeM'
      ]
    },
    codechef: {
      label: 'CODECHEF SUBMISSIONS',
      profile: 'https://www.codechef.com/users/hardy_temple',
      endpoints: [
        'https://codechef-stats.tashif.codes/hardy_temple/heatmap?view=all',
        'https://codechef-stats.tashif.codes/hardy_temple'
      ]
    }
  };
  const cachePrefix = 'ast-live-activity-v1:';
  const loaded = new Set();
  const numberFormat = new Intl.NumberFormat('en-IN');

  const headingCopy = profiles.querySelector('.coding-head .h-body');
  if (headingCopy) {
    headingCopy.textContent = 'Live daily activity, current streaks, and rolling 365-day contribution calendars from GitHub, LeetCode, and CodeChef.';
  }

  function createActivityCard(platform) {
    const panel = document.querySelector(`[data-profile-panel="${platform}"]`);
    if (!panel || panel.querySelector('[data-activity-card]')) return null;

    const card = document.createElement('section');
    card.className = 'activity-card is-loading';
    card.dataset.activityCard = '';
    card.dataset.platform = platform;
    card.setAttribute('aria-label', `${PLATFORM_CONFIG[platform].label} daily streak`);
    card.innerHTML = `
      <div class="activity-card-head">
        <div class="activity-card-title"><span>⌁</span> ${PLATFORM_CONFIG[platform].label} (365 DAYS)</div>
        <div class="activity-sync" data-activity-status role="status" aria-live="polite">SYNCING LIVE ACTIVITY</div>
      </div>
      <div class="activity-summary">
        <div class="activity-stat"><strong data-activity-field="current">—</strong><span>CURRENT STREAK</span></div>
        <div class="activity-stat"><strong data-activity-field="longest">—</strong><span>LONGEST STREAK</span></div>
        <div class="activity-stat"><strong data-activity-field="active">—</strong><span>ACTIVE DAYS</span></div>
        <div class="activity-stat"><strong data-activity-field="total">—</strong><span>YEARLY ACTIVITY</span></div>
      </div>
      <div class="activity-calendar-wrap">
        <div class="activity-week-labels" aria-hidden="true"><span>MON</span><span>WED</span><span>FRI</span></div>
        <div class="activity-calendar-scroll" tabindex="0" aria-label="Scrollable 365-day activity calendar">
          <div class="activity-calendar-inner">
            <div class="activity-months" data-activity-months aria-hidden="true"></div>
            <div class="activity-grid" data-activity-grid aria-live="polite"></div>
          </div>
        </div>
      </div>
      <div class="activity-footer">
        <span data-activity-updated>WAITING FOR PLATFORM</span>
        <span class="activity-legend" aria-label="Activity intensity from less to more">LESS <i></i><i></i><i></i><i></i><i></i> MORE</span>
      </div>`;

    const metrics = panel.querySelector('.profile-metrics');
    if (platform === 'github') {
      const dataGrid = panel.querySelector('.profile-data-grid');
      const repositoryCard = dataGrid?.querySelector('.profile-data-card');
      if (repositoryCard) repositoryCard.replaceWith(card);
      else metrics?.insertAdjacentElement('afterend', card);
    } else {
      metrics?.insertAdjacentElement('afterend', card);
    }
    return card;
  }

  Object.keys(PLATFORM_CONFIG).forEach(createActivityCard);

  function utcDateKey(date) {
    return date.toISOString().slice(0, 10);
  }

  function levelForCount(count, suppliedLevel) {
    if (Number.isFinite(suppliedLevel)) return Math.max(0, Math.min(4, suppliedLevel));
    if (count <= 0) return 0;
    if (count === 1) return 1;
    if (count === 2) return 2;
    if (count <= 4) return 3;
    return 4;
  }

  function makeRollingYear(records) {
    const recordMap = new Map(records.map((record) => [record.date, record]));
    const now = new Date();
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - 364);
    const days = [];

    for (let index = 0; index < 365; index += 1) {
      const date = new Date(start);
      date.setUTCDate(start.getUTCDate() + index);
      const key = utcDateKey(date);
      const source = recordMap.get(key);
      const count = Math.max(0, Number(source?.count || 0));
      days.push({ date: key, count, level: levelForCount(count, Number(source?.level)) });
    }
    return days;
  }

  function calculateStreaks(days) {
    let longest = 0;
    let run = 0;
    days.forEach((day) => {
      run = day.count > 0 ? run + 1 : 0;
      longest = Math.max(longest, run);
    });

    let current = 0;
    let index = days.length - 1;
    if (days[index]?.count === 0) index -= 1;
    while (index >= 0 && days[index].count > 0) {
      current += 1;
      index -= 1;
    }
    return { current, longest };
  }

  function monthLabels(days) {
    const labels = [];
    const start = new Date(`${days[0].date}T00:00:00Z`);
    for (let index = 0; index < 12; index += 1) {
      const date = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + index, 1));
      labels.push(date.toLocaleString('en', { month: 'short', timeZone: 'UTC' }));
    }
    return labels;
  }

  function setPanelLiveLabel(platform, message) {
    const panel = document.querySelector(`[data-profile-panel="${platform}"]`);
    const live = panel?.querySelector('.profile-live');
    if (!live) return;
    const pulse = live.querySelector('.signal-pulse');
    live.replaceChildren();
    if (pulse) live.appendChild(pulse);
    live.appendChild(document.createTextNode(message));
  }

  function renderActivity(platform, payload, sourceLabel) {
    const panel = document.querySelector(`[data-profile-panel="${platform}"]`);
    const card = panel?.querySelector('[data-activity-card]');
    if (!panel || !card) return;

    const days = makeRollingYear(payload.records || []);
    const calculated = calculateStreaks(days);
    const current = Number.isFinite(payload.currentStreak) ? payload.currentStreak : calculated.current;
    const longest = Number.isFinite(payload.longestStreak) ? payload.longestStreak : calculated.longest;
    const active = days.filter((day) => day.count > 0).length;
    const total = days.reduce((sum, day) => sum + day.count, 0);
    const values = { current, longest, active, total };

    Object.entries(values).forEach(([field, value]) => {
      const element = card.querySelector(`[data-activity-field="${field}"]`);
      if (element) element.textContent = numberFormat.format(value);
    });

    const months = card.querySelector('[data-activity-months]');
    if (months) {
      months.textContent = '';
      monthLabels(days).forEach((month) => {
        const label = document.createElement('span');
        label.textContent = month;
        months.appendChild(label);
      });
    }

    const grid = card.querySelector('[data-activity-grid]');
    if (grid) {
      grid.textContent = '';
      const firstDay = new Date(`${days[0].date}T00:00:00Z`).getUTCDay();
      for (let index = 0; index < firstDay; index += 1) {
        const blank = document.createElement('span');
        blank.className = 'activity-day is-blank';
        blank.setAttribute('aria-hidden', 'true');
        grid.appendChild(blank);
      }
      days.forEach((day) => {
        const cell = document.createElement('span');
        cell.className = 'activity-day';
        cell.dataset.level = String(day.level);
        const readableDate = new Date(`${day.date}T00:00:00Z`).toLocaleDateString('en-IN', {
          day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'
        });
        cell.title = `${readableDate}: ${day.count} ${day.count === 1 ? 'activity' : 'activities'}`;
        cell.setAttribute('aria-label', cell.title);
        grid.appendChild(cell);
      });
    }

    card.classList.remove('is-loading', 'has-error');
    const status = card.querySelector('[data-activity-status]');
    if (status) status.textContent = sourceLabel;
    const updated = card.querySelector('[data-activity-updated]');
    if (updated) updated.textContent = `UPDATED ${new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}`;
    panel.classList.add('has-live-activity');
    setPanelLiveLabel(platform, `LIVE ${platform.toUpperCase()} STATS · SYNCED`);
  }

  function readCache(platform) {
    try {
      const cached = JSON.parse(localStorage.getItem(`${cachePrefix}${platform}`));
      if (!cached?.payload || !cached?.savedAt) return null;
      if (Date.now() - cached.savedAt > 7 * 24 * 60 * 60 * 1000) return null;
      return cached.payload;
    } catch (_) {
      return null;
    }
  }

  function writeCache(platform, payload) {
    try {
      localStorage.setItem(`${cachePrefix}${platform}`, JSON.stringify({ payload, savedAt: Date.now() }));
    } catch (_) {
      /* Storage can be unavailable in private browsing; live rendering still works. */
    }
  }

  async function fetchJson(url, timeout = 16000) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { headers: { Accept: 'application/json' }, signal: controller.signal });
      if (!response.ok) throw new Error(`Request failed with ${response.status}`);
      return await response.json();
    } finally {
      window.clearTimeout(timer);
    }
  }

  async function fetchGithubActivity() {
    const response = await fetchJson(PLATFORM_CONFIG.github.endpoints[0]);
    return {
      records: (response.contributions || []).map((day) => ({
        date: day.date,
        count: Number(day.count || 0),
        level: Number(day.level || 0)
      }))
    };
  }

  async function fetchLeetCodeActivity() {
    const [calendar, solved, profile] = await Promise.all(PLATFORM_CONFIG.leetcode.endpoints.map((url) => fetchJson(url)));
    const rawCalendar = typeof calendar.submissionCalendar === 'string'
      ? JSON.parse(calendar.submissionCalendar)
      : (calendar.submissionCalendar || {});
    const records = Object.entries(rawCalendar).map(([timestamp, count]) => ({
      date: new Date(Number(timestamp) * 1000).toISOString().slice(0, 10),
      count: Number(count || 0)
    }));

    const metrics = document.querySelectorAll('#panel-leetcode .profile-metric strong');
    if (metrics[0]) metrics[0].textContent = numberFormat.format(Number(solved.solvedProblem || 0));
    if (metrics[1]) metrics[1].textContent = numberFormat.format(Number(profile.ranking || 0));
    const note = document.querySelector('#panel-leetcode .profile-note');
    if (note) note.textContent = 'LIVE LEETCODE DATA · CALENDAR, SOLVED TOTAL, AND RANK SYNC AUTOMATICALLY';

    return {
      records,
      currentStreak: Number(calendar.streak),
      activeDays: Number(calendar.totalActiveDays)
    };
  }

  async function fetchCodeChefActivity() {
    const [heatmap, summary] = await Promise.all(PLATFORM_CONFIG.codechef.endpoints.map((url) => fetchJson(url)));
    const data = heatmap.data || {};
    const summaryData = summary.data || {};
    const metrics = document.querySelectorAll('#panel-codechef .profile-metric strong');
    if (metrics[0]) metrics[0].textContent = numberFormat.format(Number(summaryData.totalSolved || 0));
    if (metrics[1]) metrics[1].textContent = numberFormat.format(Number(summaryData.totalActiveDays || 0));
    const labels = document.querySelectorAll('#panel-codechef .profile-metric > span:last-child');
    if (labels[1]) labels[1].textContent = 'TOTAL ACTIVE DAYS';
    const note = document.querySelector('#panel-codechef .profile-note');
    if (note) note.textContent = 'LIVE CODECHEF DATA · SUBMISSION ACTIVITY AND STREAKS SYNC AUTOMATICALLY';

    return {
      records: (data.dailyContributions || []).map((day) => ({
        date: day.date,
        count: Number(day.count || 0),
        level: Number(day.level || 0)
      })),
      currentStreak: Number(data.currentStreak),
      longestStreak: Number(data.longestStreak)
    };
  }

  async function loadPlatform(platform, force = false) {
    if (loaded.has(platform) && !force) return;
    loaded.add(platform);
    const panel = document.querySelector(`[data-profile-panel="${platform}"]`);
    const card = panel?.querySelector('[data-activity-card]');
    card?.classList.add('is-loading');

    try {
      let payload;
      if (platform === 'github') payload = await fetchGithubActivity();
      if (platform === 'leetcode') payload = await fetchLeetCodeActivity();
      if (platform === 'codechef') payload = await fetchCodeChefActivity();
      if (!payload) throw new Error('Unknown coding platform');
      writeCache(platform, payload);
      renderActivity(platform, payload, 'LIVE DATA · SYNCED');
    } catch (error) {
      const cached = readCache(platform);
      if (cached) {
        renderActivity(platform, cached, 'CACHED DATA · API RETRY NEXT VISIT');
        return;
      }
      loaded.delete(platform);
      card?.classList.remove('is-loading');
      card?.classList.add('has-error');
      const status = card?.querySelector('[data-activity-status]');
      if (status) status.textContent = 'LIVE SYNC UNAVAILABLE · OPEN PROFILE';
      const updated = card?.querySelector('[data-activity-updated]');
      if (updated) updated.textContent = 'PLATFORM TEMPORARILY UNAVAILABLE';
    }
  }

  function loadAllPlatforms() {
    Object.keys(PLATFORM_CONFIG).forEach((platform) => loadPlatform(platform));
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      loadAllPlatforms();
      observer.disconnect();
    }, { rootMargin: '420px 0px' });
    observer.observe(profiles);
  } else {
    loadAllPlatforms();
  }

  profiles.addEventListener('click', (event) => {
    const tab = event.target.closest('[data-profile-tab]');
    if (tab) loadPlatform(tab.dataset.profileTab);
  });
})();
