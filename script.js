(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* =========================================================
     ENVELOPE OPENING
     ========================================================= */
  const envelope = document.getElementById("envelope");
  const openBtn = document.getElementById("openInvitation");
  const site = document.getElementById("site");
  const audio = document.getElementById("weddingAudio");
  const musicToggle = document.getElementById("musicToggle");

  function openInvitation() {
    if (envelope.classList.contains("is-opening")) return;

    // Start music on first interaction (browsers require a user gesture)
    startMusic();

    envelope.classList.add("is-opening");
    site.removeAttribute("aria-hidden");
    document.body.style.overflow = "";

    const revealDelay = prefersReducedMotion ? 0 : 900;
    window.setTimeout(() => {
      envelope.style.visibility = "hidden";
      envelope.style.pointerEvents = "none";
      runHeroReveal();
    }, revealDelay);
  }

  openBtn.addEventListener("click", openInvitation);
  openBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openInvitation();
    }
  });

  // Lock scroll until the invitation is opened
  document.body.style.overflow = "hidden";

  /* =========================================================
     MUSIC CONTROL
     ========================================================= */
  let musicStarted = false;
  let musicPlaying = false;
  const MUSIC_PREF_KEY = "md-wedding-music-on";

  function startMusic() {
    if (musicStarted) return;
    musicStarted = true;
    const storedPref = sessionStorage.getItem(MUSIC_PREF_KEY);
    if (storedPref === "off") return;

    audio.volume = 0.55;
    const playPromise = audio.play();
    if (playPromise && playPromise.then) {
      playPromise
        .then(() => setMusicState(true))
        .catch(() => setMusicState(false));
    } else {
      setMusicState(true);
    }
  }

  function setMusicState(isPlaying) {
    musicPlaying = isPlaying;
    musicToggle.classList.toggle("is-playing", isPlaying);
    musicToggle.setAttribute("aria-pressed", String(isPlaying));
    musicToggle.setAttribute("aria-label", isPlaying ? "Pause wedding music" : "Play wedding music");
  }

  musicToggle.addEventListener("click", () => {
    if (!musicStarted) {
      // First click landed on the music button before opening — still honor it
      startMusic();
      return;
    }
    if (musicPlaying) {
      audio.pause();
      setMusicState(false);
      sessionStorage.setItem(MUSIC_PREF_KEY, "off");
    } else {
      audio.play().then(() => {
        setMusicState(true);
        sessionStorage.setItem(MUSIC_PREF_KEY, "on");
      }).catch(() => setMusicState(false));
    }
  });

  // If the audio file is missing/broken, fail silently and keep the button inert-looking
  audio.addEventListener("error", () => {
    setMusicState(false);
  });

  /* =========================================================
     HERO STAGED REVEAL (on invitation open)
     ========================================================= */
  function runHeroReveal() {
    const items = document.querySelectorAll(".hero .reveal[data-reveal-order]");
    items.forEach((el) => {
      const order = Number(el.dataset.revealOrder) || 1;
      const delay = prefersReducedMotion ? 0 : order * 180;
      window.setTimeout(() => el.classList.add("is-visible"), delay);
    });
  }

  /* =========================================================
     SCROLL-TRIGGERED REVEALS (Intersection Observer)
     ========================================================= */
  const revealTargets = document.querySelectorAll(".reveal-up[data-reveal]");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const siblingsInGroup = Array.from(el.parentElement.children).filter(
              (c) => c.hasAttribute && c.hasAttribute("data-reveal")
            );
            const idx = siblingsInGroup.indexOf(el);
            window.setTimeout(() => el.classList.add("is-visible"), Math.max(idx, 0) * 90);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  }

  /* =========================================================
     SCROLL PROGRESS BAR
     ========================================================= */
  const scrollBar = document.getElementById("scrollBar");
  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollBar.style.width = pct + "%";
  }
  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  updateScrollProgress();

  /* =========================================================
     AMBIENT PARTICLES (hero + final section)
     ========================================================= */
  function spawnParticles(container, count) {
    if (!container || prefersReducedMotion) return;
    for (let i = 0; i < count; i++) {
      const p = document.createElement("span");
      const left = Math.random() * 100;
      const duration = 10 + Math.random() * 14;
      const delay = Math.random() * 12;
      const size = 1 + Math.random() * 2;
      p.style.left = left + "%";
      p.style.bottom = "-10px";
      p.style.width = size + "px";
      p.style.height = size + "px";
      p.style.animationDuration = duration + "s";
      p.style.animationDelay = delay + "s";
      container.appendChild(p);
    }
  }
  spawnParticles(document.getElementById("heroParticles"), 26);
  spawnParticles(document.getElementById("finalParticles"), 18);

  /* =========================================================
     SUBTLE PARALLAX ON HERO SILHOUETTES (pointer move, slow)
     ========================================================= */
  const hero = document.getElementById("hero");
  const silhouettes = document.querySelectorAll(".hero__silhouette");
  if (hero && !prefersReducedMotion && window.matchMedia("(hover:hover)").matches) {
    let raf = null;
    hero.addEventListener("mousemove", (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const { innerWidth, innerHeight } = window;
        const x = (e.clientX / innerWidth - 0.5) * 12;
        const y = (e.clientY / innerHeight - 0.5) * 12;
        silhouettes.forEach((el, i) => {
          const mult = i === 0 ? 1 : -1;
          el.style.transform = `translate(${x * mult}px, ${y * 0.5}px)`;
        });
        raf = null;
      });
    });
  }

  /* =========================================================
     LIVE COUNTDOWN
     ========================================================= */
  const WEDDING_DATE = new Date("2026-09-17T21:00:00");
  const cdDays = document.getElementById("cd-days");
  const cdHours = document.getElementById("cd-hours");
  const cdMinutes = document.getElementById("cd-minutes");
  const cdSeconds = document.getElementById("cd-seconds");
  const countdownGrid = document.getElementById("countdownGrid");
  const countdownDone = document.getElementById("countdownDone");

  function pad(n) { return String(n).padStart(2, "0"); }

  let lastSecond = null;
  function tickCountdown() {
    const now = new Date();
    const diff = WEDDING_DATE.getTime() - now.getTime();

    if (diff <= 0) {
      countdownGrid.hidden = true;
      countdownDone.hidden = false;
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    cdDays.textContent = pad(days);
    cdHours.textContent = pad(hours);
    cdMinutes.textContent = pad(minutes);
    if (seconds !== lastSecond) {
      cdSeconds.textContent = pad(seconds);
      if (!prefersReducedMotion) {
        cdSeconds.classList.remove("is-tick");
        void cdSeconds.offsetWidth; // restart animation
        cdSeconds.classList.add("is-tick");
      }
      lastSecond = seconds;
    }
  }
  tickCountdown();
  setInterval(tickCountdown, 1000);

  /* =========================================================
     GALLERY LIGHTBOX
     ========================================================= */
  const galleryItems = Array.from(document.querySelectorAll(".gallery__item"));
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxPrev = document.getElementById("lightboxPrev");
  const lightboxNext = document.getElementById("lightboxNext");
  let currentIndex = 0;

  function openLightbox(index) {
    const item = galleryItems[index];
    if (!item || item.classList.contains("gallery__item--empty")) return;
    currentIndex = index;
    lightboxImg.src = item.dataset.src;
    lightbox.classList.add("is-open");
    lightbox.removeAttribute("aria-hidden");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function showNext(delta) {
    let idx = currentIndex;
    for (let i = 0; i < galleryItems.length; i++) {
      idx = (idx + delta + galleryItems.length) % galleryItems.length;
      if (!galleryItems[idx].classList.contains("gallery__item--empty")) {
        openLightbox(idx);
        return;
      }
    }
  }

  galleryItems.forEach((item, index) => {
    item.addEventListener("click", () => openLightbox(index));
  });
  lightboxClose.addEventListener("click", closeLightbox);
  lightboxPrev.addEventListener("click", () => showNext(-1));
  lightboxNext.addEventListener("click", () => showNext(1));
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showNext(-1);
    if (e.key === "ArrowRight") showNext(1);
  });

  // Swipe gestures on mobile
  let touchStartX = 0;
  lightbox.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) showNext(dx > 0 ? -1 : 1);
  }, { passive: true });

})();
