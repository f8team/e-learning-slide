(function () {
  const body = document.body;
  const decks = window.SLIDE_DECKS || (window.SLIDE_DECK ? { vi: window.SLIDE_DECK } : null);
  if (!decks) return;

  const requestedLanguage = body.dataset.lang || document.documentElement.lang || "vi";
  const deck = decks[requestedLanguage] || decks.vi;
  const ui = deck.ui || {};
  const total = deck.slides.length;
  const assetRoot = body.dataset.assetRoot || "";
  const localeRoot = body.dataset.localeRoot || "";
  let isTransitioning = false;

  document.documentElement.lang = deck.lang || requestedLanguage;

  const escapeHtml = (value) =>
    String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const resolveAsset = (src) => {
    if (!src) return "";
    if (/^(https?:)?\/\//.test(src) || src.startsWith("/")) return src;
    return `${assetRoot}${src}`;
  };

  const slideHref = (index) => {
    const id = String(index).padStart(2, "0");
    return `${localeRoot}slides/${id}.html`;
  };

  const rootHref = (file) => `${localeRoot}${file}`;

  const prefersReducedMotion = () =>
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches || false;

  const navigateTo = (url) => {
    if (!url || isTransitioning) return;
    isTransitioning = true;

    if (!body.classList.contains("single-slide") || prefersReducedMotion()) {
      window.location.href = url;
      return;
    }

    body.classList.add("is-exiting");
    window.setTimeout(() => {
      window.location.href = url;
    }, 220);
  };

  const renderBullets = (bullets) => {
    if (!bullets || !bullets.length) return "";
    return `
      <ul class="bullet-list">
        ${bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    `;
  };

  const renderChips = (chips) => {
    if (!chips || !chips.length) return "";
    return `<div class="chip-row">${chips
      .map((chip) => `<span>${escapeHtml(chip)}</span>`)
      .join("")}</div>`;
  };

  const renderFeatures = (features) => {
    if (!features || !features.length) return "";
    return `
      <div class="feature-grid">
        ${features
          .map(
            (feature, index) => `
              <div class="feature-item">
                <span class="feature-index">${String(index + 1).padStart(2, "0")}</span>
                <strong>${escapeHtml(feature)}</strong>
              </div>
            `
          )
          .join("")}
      </div>
    `;
  };

  const renderSteps = (steps) => {
    if (!steps || !steps.length) return "";
    return `
      <ol class="journey-list">
        ${steps
          .map(
            (step, index) => `
              <li>
                <span>${String(index + 1).padStart(2, "0")}</span>
                <strong>${escapeHtml(step)}</strong>
              </li>
            `
          )
          .join("")}
      </ol>
    `;
  };

  const renderVisual = (visual) => {
    if (!visual) return "";

    if (visual.kind === "image") {
      const displayClass = visual.display ? `visual-display-${escapeHtml(visual.display)}` : "";
      return `
        <figure class="visual-figure ${visual.display === "screenshot" ? "screenshot-figure" : ""} ${displayClass}">
          <div class="visual-stage">
            <img data-visual-image src="${escapeHtml(resolveAsset(visual.src))}" alt="${escapeHtml(visual.alt || "")}" />
          </div>
          ${visual.caption ? `<figcaption>${escapeHtml(visual.caption)}</figcaption>` : ""}
        </figure>
      `;
    }

    return `
      <div class="screenshot-placeholder" role="img" aria-label="${escapeHtml(visual.title)}">
        <div class="placeholder-toolbar">
          <span></span><span></span><span></span>
        </div>
        <div class="placeholder-body">
          <span class="placeholder-kicker">Screenshot placeholder</span>
          <strong>${escapeHtml(visual.title)}</strong>
          <p>${escapeHtml(visual.description)}</p>
        </div>
      </div>
    `;
  };

  const renderSlide = (slide, index) => {
    const number = index + 1;
    const slideNumber = String(number).padStart(2, "0");
    const hasFeatureGrid = Boolean(slide.features && slide.features.length);
    const hasSteps = Boolean(slide.steps && slide.steps.length);
    const visual = slide.visual || {};
    const hasScreenshot = visual.display === "screenshot";
    const hasImage = visual.kind === "image";
    const hasIllustration = hasImage && !hasScreenshot;
    const hasHeroVisual = slide.layout === "cover" || slide.layout === "closing";
    const slideClasses = [
      "slide-frame",
      `slide-layout-${escapeHtml(slide.layout)}`,
      `tone-${escapeHtml(slide.tone)}`,
      hasFeatureGrid ? "slide-has-features" : "",
      hasSteps ? "slide-has-steps" : "",
      hasScreenshot ? "slide-has-screenshot" : "",
      hasIllustration ? "slide-has-illustration" : "",
      hasHeroVisual ? "slide-hero-visual" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return `
      <article class="${slideClasses}" data-slide="${slideNumber}">
        <header class="slide-header">
          <span>${escapeHtml(slide.eyebrow)}</span>
          <span>${slideNumber} / ${String(total).padStart(2, "0")}</span>
        </header>

        <section class="slide-main">
          <div class="slide-copy">
            <h1>${escapeHtml(slide.title)}</h1>
            <p class="lead">${escapeHtml(slide.lead)}</p>
            ${renderSteps(slide.steps)}
            ${renderBullets(slide.bullets)}
            ${renderChips(slide.chips)}
          </div>

          <aside class="slide-visual ${hasFeatureGrid ? "with-features" : ""} ${
            hasScreenshot ? "with-screenshot" : hasIllustration ? "with-illustration" : ""
          }">
            ${hasFeatureGrid ? renderFeatures(slide.features) : renderVisual(slide.visual)}
          </aside>
        </section>

        <footer class="slide-footer">
          <span>${escapeHtml(ui.footerBrand || deck.title)}</span>
          <span>${escapeHtml(
            hasSteps ? ui.footerJourney || "" : hasFeatureGrid ? ui.footerPlatform || "" : ui.footerDemo || ""
          )}</span>
        </footer>
      </article>
    `;
  };

  const renderChromeCopy = () => {
    const deckTitle = document.querySelector("[data-deck-title]");
    const deckDescription = document.querySelector("[data-deck-description]");
    const slideListTitle = document.querySelector("[data-slide-list-title]");
    const printTitle = document.querySelector("[data-print-title]");
    const printDescription = document.querySelector("[data-print-description]");

    if (deckTitle) deckTitle.textContent = deck.title;
    if (deckDescription) deckDescription.textContent = deck.description || deck.subtitle || "";
    if (slideListTitle) slideListTitle.textContent = ui.slideListTitle || "";
    if (printTitle) printTitle.textContent = ui.printTitle || deck.title;
    if (printDescription) printDescription.textContent = ui.printDescription || "";

    document.querySelectorAll("[data-ui]").forEach((element) => {
      const key = element.dataset.ui;
      if (ui[key]) element.textContent = ui[key];
    });

    document.querySelectorAll("[data-language-link]").forEach((element) => {
      const active = element.dataset.languageLink === deck.lang;
      element.classList.toggle("active", active);
      if (active) element.setAttribute("aria-current", "page");
    });

    if (!body.classList.contains("single-slide")) {
      document.title = deck.title;
    }
  };

  const renderSingleSlide = () => {
    const mount = document.querySelector("#slideMount");
    if (!mount) return;

    const requested = Number(body.dataset.slideNumber || 1);
    const index = Math.min(Math.max(requested, 1), total) - 1;
    const slide = deck.slides[index];
    mount.innerHTML = renderSlide(slide, index);
    document.title = `${slide.id}. ${slide.title}`;

    const prev = document.querySelector("[data-prev-slide]");
    const next = document.querySelector("[data-next-slide]");
    const progress = document.querySelector("[data-progress]");

    if (prev) {
      prev.href = index > 0 ? `${String(index).padStart(2, "0")}.html` : rootHref("index.html");
      prev.setAttribute("aria-label", index > 0 ? "Previous slide" : ui.home || "Index");
    }

    if (next) {
      next.href = index < total - 1 ? `${String(index + 2).padStart(2, "0")}.html` : rootHref("print.html");
      next.setAttribute("aria-label", index < total - 1 ? "Next slide" : ui.openPrint || "PDF export");
    }

    if (progress) {
      progress.style.setProperty("--progress", `${((index + 1) / total) * 100}%`);
    }

    document.querySelectorAll("[data-nav-index]").forEach((element) => {
      element.textContent = ui.indexLabel || ui.home || "Index";
      element.href = rootHref("index.html");
    });
  };

  const renderIndex = () => {
    const list = document.querySelector("#slideList");
    if (!list) return;

    list.innerHTML = deck.slides
      .map(
        (slide, index) => `
          <a class="index-card tone-${escapeHtml(slide.tone)}" href="${escapeHtml(slideHref(index + 1))}">
            <span>${String(index + 1).padStart(2, "0")}</span>
            <strong>${escapeHtml(slide.title)}</strong>
            <small>${escapeHtml(slide.eyebrow)}</small>
          </a>
        `
      )
      .join("");
  };

  const renderPrint = () => {
    const printDeck = document.querySelector("#printDeck");
    if (!printDeck) return;

    printDeck.innerHTML = deck.slides.map((slide, index) => renderSlide(slide, index)).join("");
  };

  const fitVisualStages = () => {
    const getMaxHeight = (figure) => {
      if (figure.classList.contains("screenshot-figure")) return 570;
      if (figure.closest(".slide-layout-cover, .slide-layout-closing, .slide-has-illustration")) return 590;
      return 560;
    };

    document.querySelectorAll(".visual-figure img").forEach((image) => {
      const applyRatio = () => {
        const figure = image.closest(".visual-figure");
        if (!figure || !image.naturalWidth || !image.naturalHeight) return;
        const ratio = image.naturalWidth / image.naturalHeight;
        const maxHeight = getMaxHeight(figure);
        figure.style.setProperty("--image-ratio", String(ratio));
        figure.style.setProperty("--image-max-width", `${Math.round(maxHeight * ratio)}px`);
        figure.classList.add("is-ratio-ready");
      };

      if (image.complete) {
        window.requestAnimationFrame(applyRatio);
      } else {
        image.addEventListener("load", applyRatio, { once: true });
      }
    });
  };

  const updateSlideScale = () => {
    if (!body.classList.contains("single-slide")) return;
    const horizontalGutter = window.innerWidth <= 980 ? 28 : 56;
    const verticalGutter = window.innerWidth <= 980 ? 88 : 104;
    const scale = Math.min(
      (window.innerWidth - horizontalGutter) / 1600,
      (window.innerHeight - verticalGutter) / 900
    );
    document.documentElement.style.setProperty("--deck-scale", String(Math.max(0.22, Math.min(scale, 1))));
  };

  const wireKeyboard = () => {
    if (!body.classList.contains("single-slide")) return;

    document.addEventListener("keydown", (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;

      const activeElement = document.activeElement;
      const activeTag = activeElement?.tagName?.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea" || activeElement?.isContentEditable) return;

      const prev = document.querySelector("[data-prev-slide]");
      const next = document.querySelector("[data-next-slide]");
      const key = event.key || "";
      const code = event.code || "";
      const isKey = (...values) => values.includes(key) || values.includes(code);
      const isSpace = isKey(" ", "Space", "Spacebar");
      const shouldGoPrev =
        (event.shiftKey && isSpace) ||
        isKey(
          "ArrowLeft",
          "ArrowUp",
          "PageUp",
          "Backspace",
          "MediaTrackPrevious",
          "BrowserBack",
          "p",
          "P",
          "KeyP"
        );
      const shouldGoNext =
        (!event.shiftKey && isSpace) ||
        isKey(
          "ArrowRight",
          "ArrowDown",
          "PageDown",
          "Enter",
          "NumpadEnter",
          "MediaTrackNext",
          "BrowserForward",
          "n",
          "N",
          "KeyN"
        );

      if (shouldGoNext) {
        event.preventDefault();
        if (next) navigateTo(next.href);
        return;
      }

      if (shouldGoPrev) {
        event.preventDefault();
        if (prev) navigateTo(prev.href);
        return;
      }

      if (key.toLowerCase() === "f") {
        event.preventDefault();
        document.documentElement.requestFullscreen?.();
      }
    });
  };

  const wireSlideLinks = () => {
    if (!body.classList.contains("single-slide")) return;

    document.querySelectorAll("[data-prev-slide], [data-next-slide], [data-nav-index]").forEach((link) => {
      link.addEventListener("click", (event) => {
        if (event.defaultPrevented || event.button !== 0) return;
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        event.preventDefault();
        navigateTo(link.href);
      });
    });
  };

  const wirePrintButton = () => {
    const button = document.querySelector("[data-print]");
    if (!button) return;
    button.addEventListener("click", () => window.print());
  };

  document.addEventListener("DOMContentLoaded", () => {
    renderChromeCopy();
    renderSingleSlide();
    renderIndex();
    renderPrint();
    fitVisualStages();
    updateSlideScale();
    window.addEventListener("resize", updateSlideScale);
    wireKeyboard();
    wireSlideLinks();
    wirePrintButton();
  });
})();
