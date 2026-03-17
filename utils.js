function isExternalUrl(url) {
  return /^(https?:)?\/\//.test(url) || url.startsWith("mailto:");
}

function createLinkMarkup(link) {
  const attrs = isExternalUrl(link.url) ? ' target="_blank" rel="noopener noreferrer"' : "";
  return `<a class="publication-link" href="${link.url}"${attrs}>${link.label}</a>`;
}

function createChipMarkup(chip, index) {
  const accentClass = index === 0 && chip.toLowerCase() === "featured" ? " accent" : "";
  return `<span class="publication-chip${accentClass}">${chip}</span>`;
}

function createPublicationMarkup(publication, index) {
  const titleMarkup = publication.paperUrl
    ? `<a href="${publication.paperUrl}" target="_blank" rel="noopener noreferrer">${publication.title}</a>`
    : publication.title;

  const cardClass = publication.featured ? "publication-card featured" : "publication-card";
  const chipMarkup = (publication.chips || []).map(createChipMarkup).join("");
  const linkMarkup = (publication.links || []).map(createLinkMarkup).join("");
  const noteMarkup = publication.noteHtml ? `<p class="publication-note">${publication.noteHtml}</p>` : "";
  const delay = `${80 + index * 70}ms`;

  return `
    <article class="${cardClass}" data-reveal style="--delay: ${delay};">
      <div class="publication-media">
        <img src="${publication.image}" alt="${publication.imageAlt || publication.title}" loading="lazy">
      </div>
      <div class="publication-content">
        <div class="publication-chips">${chipMarkup}</div>
        <h3 class="publication-title">${titleMarkup}</h3>
        <p class="publication-authors">${publication.authorsHtml}</p>
        ${linkMarkup ? `<div class="publication-links">${linkMarkup}</div>` : ""}
        ${noteMarkup}
      </div>
    </article>
  `;
}

function renderPublications(containerId, publications) {
  const container = document.getElementById(containerId);
  if (!container) {
    return;
  }

  container.innerHTML = publications.map(createPublicationMarkup).join("");
}

function setupRevealAnimations() {
  const revealElements = Array.from(document.querySelectorAll("[data-reveal]"));
  if (!revealElements.length) {
    return;
  }

  if (!("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -36px 0px"
    }
  );

  revealElements.forEach((element) => observer.observe(element));
}

const APPEARANCES = [
  { theme: "studio", mode: "light" },
  { theme: "studio", mode: "dark" },
  { theme: "gallery", mode: "light" },
  { theme: "gallery", mode: "dark" },
  { theme: "blueprint", mode: "light" },
  { theme: "blueprint", mode: "dark" },
  { theme: "solstice", mode: "light" }
];

function getAppearanceKey(themeName, modeName) {
  return `${themeName}:${modeName}`;
}

function updateAppearanceToggle(themeName, modeName) {
  const styleToggle = document.getElementById("style-toggle");
  if (!styleToggle) {
    return;
  }

  styleToggle.setAttribute("aria-label", `Change appearance. Current: ${themeName} ${modeName}`);
  styleToggle.title = `Appearance: ${themeName} ${modeName}`;
}

function applyTheme(themeName) {
  document.body.dataset.theme = themeName;
}

function applyMode(modeName) {
  document.body.dataset.mode = modeName;
}

function setupAppearanceControls() {
  const styleToggle = document.getElementById("style-toggle");
  if (!styleToggle) {
    return;
  }

  const defaultTheme = document.body.dataset.theme || APPEARANCES[0].theme;
  const defaultMode = document.body.dataset.mode || "light";
  const storedAppearance = window.localStorage.getItem("preferred-appearance");
  const defaultAppearance = getAppearanceKey(defaultTheme, defaultMode);
  const activeAppearance = APPEARANCES.find(
    (appearance) => getAppearanceKey(appearance.theme, appearance.mode) === storedAppearance
  ) || APPEARANCES.find(
    (appearance) => getAppearanceKey(appearance.theme, appearance.mode) === defaultAppearance
  ) || APPEARANCES[0];

  applyTheme(activeAppearance.theme);
  applyMode(activeAppearance.mode);
  updateAppearanceToggle(activeAppearance.theme, activeAppearance.mode);

  styleToggle.addEventListener("click", () => {
    const currentKey = getAppearanceKey(
      document.body.dataset.theme || activeAppearance.theme,
      document.body.dataset.mode || activeAppearance.mode
    );
    const currentIndex = APPEARANCES.findIndex(
      (appearance) => getAppearanceKey(appearance.theme, appearance.mode) === currentKey
    );
    const nextAppearance = APPEARANCES[(currentIndex + 1) % APPEARANCES.length];

    applyTheme(nextAppearance.theme);
    applyMode(nextAppearance.mode);
    updateAppearanceToggle(nextAppearance.theme, nextAppearance.mode);
    window.localStorage.setItem(
      "preferred-appearance",
      getAppearanceKey(nextAppearance.theme, nextAppearance.mode)
    );
  });
}

function triggerMimiTrail() {
  const existingTrail = document.querySelector(".mimi-trail");
  if (existingTrail) {
    existingTrail.remove();
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const trail = document.createElement("div");
  trail.className = "mimi-trail";
  trail.setAttribute("aria-hidden", "true");

  const pawPositions = [
    { x: 8, y: 72, rotate: -10, delay: 0 },
    { x: 18, y: 66, rotate: 8, delay: 120 },
    { x: 31, y: 73, rotate: -7, delay: 240 },
    { x: 46, y: 65, rotate: 10, delay: 360 },
    { x: 62, y: 72, rotate: -8, delay: 480 },
    { x: 78, y: 64, rotate: 9, delay: 600 }
  ];

  pawPositions.forEach((paw, index) => {
    const pawEl = document.createElement("span");
    pawEl.className = "mimi-paw";
    pawEl.style.left = `${paw.x}%`;
    pawEl.style.top = `${paw.y}%`;
    pawEl.style.rotate = `${paw.rotate}deg`;
    pawEl.style.animationDelay = prefersReducedMotion ? "0ms" : `${paw.delay}ms`;
    pawEl.textContent = "🐾";
    pawEl.setAttribute("data-paw-index", String(index));
    trail.appendChild(pawEl);
  });

  document.body.appendChild(trail);
  window.setTimeout(trail.remove.bind(trail), prefersReducedMotion ? 900 : 2200);
}

function setupMimiEasterEgg() {
  const mimiLink = document.querySelector(".mimi-link");
  if (!mimiLink) {
    return;
  }

  let isCoolingDown = false;

  mimiLink.addEventListener("mouseenter", () => {
    if (isCoolingDown) {
      return;
    }

    isCoolingDown = true;
    triggerMimiTrail();
    window.setTimeout(() => {
      isCoolingDown = false;
    }, 2600);
  });
}
