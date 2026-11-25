/* PhysResponse project page — small progressive enhancements only. */

(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const film = document.querySelector("#video video");
  const filmAction = document.querySelector("[data-film-action]");
  if (film && filmAction) {
    const startFilm = () => film.play().catch((error) => {
      if (error.name === "NotAllowedError" && film.paused) filmAction.hidden = false;
    });
    film.addEventListener("playing", () => { filmAction.hidden = true; });
    filmAction.querySelector("button").addEventListener("click", () => {
      startFilm();
      film.scrollIntoView({ block: "center" });
    });
    startFilm();
  }

  /* entrance motion + count-up numbers ---------------------------------- */
  const fmt = (n) => n.toLocaleString("en-US");
  const counters = Array.from(document.querySelectorAll("[data-count]"));
  const revealables = Array.from(document.querySelectorAll(".stat, .panel, .eval, .figure, .keyframes"));

  const countUp = (el) => {
    const target = Number(el.dataset.count);
    if (!Number.isFinite(target)) return;
    if (reduceMotion) {
      el.textContent = fmt(target);
      return;
    }
    const start = performance.now();
    const dur = 900;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          if (entry.target.matches(".stat")) {
            entry.target.querySelectorAll("[data-count]").forEach(countUp);
          }
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.2 }
    );
    revealables.forEach((el) => {
      if (!reduceMotion) el.classList.add("reveal");
      io.observe(el);
    });
  }

  /* back-to-top button ------------------------------------------------- */
  const toTop = document.querySelector("[data-to-top]");
  const onScroll = () => toTop?.classList.toggle("is-visible", window.scrollY > 600);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  toTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* gravity strip: every row advances on one clock ---------------------- */
  const TIMES = ["1.00", "1.50", "2.00", "2.50"];
  const STEP_MS = 900;

  document.querySelectorAll("[data-strip]").forEach((strip) => {
    const imgs = Array.from(strip.querySelectorAll("img[data-case]"));
    const labels = Array.from(strip.querySelectorAll(".strip-head .time"));
    if (!imgs.length) return;

    /* preload so a frame change never shows a blank tile */
    imgs.forEach((img) => {
      TIMES.forEach((t) => {
        const pre = new Image();
        pre.src = `assets/img/strip/${img.dataset.case}_reference_${t}.jpg`;
      });
    });

    let index = reduceMotion ? TIMES.length - 1 : 0;
    let timer = null;

    const show = () => {
      imgs.forEach((img) => {
        img.src = `assets/img/strip/${img.dataset.case}_reference_${TIMES[index]}.jpg`;
      });
      labels.forEach((el, i) => el.classList.toggle("is-active", i === index));
    };

    const start = () => {
      if (timer || reduceMotion) return;
      timer = window.setInterval(() => {
        index = (index + 1) % TIMES.length;
        show();
      }, STEP_MS);
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    show();

    if ("IntersectionObserver" in window && !reduceMotion) {
      new IntersectionObserver(
        (entries) => entries.forEach((e) => (e.isIntersecting ? start() : stop())),
        { threshold: 0.25 }
      ).observe(strip);
    } else {
      start();
    }

    strip.addEventListener("click", () => {
      strip.classList.toggle("is-paused");
      strip.classList.contains("is-paused") ? stop() : start();
    });
  });

  /* copy bibtex --------------------------------------------------------- */
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const node = document.querySelector(btn.dataset.copy);
      if (!node) return;
      const text = node.innerText.trim();
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      const original = btn.textContent;
      btn.textContent = "Copied";
      window.setTimeout(() => (btn.textContent = original), 1400);
    });
  });
})();
