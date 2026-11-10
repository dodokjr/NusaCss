const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

$$(".current-year").forEach((node) => node.textContent = new Date().getFullYear());

// Inject the local SVG sprite references into an accessible icon helper.
const icon = (name, extra = "") =>
  `<svg class="icon ${extra}" aria-hidden="true"><use href="assets/icons.svg#i-${name}"></use></svg>`;

const themeButton = $("#themeToggle");
const storedTheme = localStorage.getItem("nusa-theme");
const preferredTheme = window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
document.documentElement.dataset.theme = storedTheme || preferredTheme;

function updateThemeButton() {
  if (!themeButton) return;
  const light = document.documentElement.dataset.theme === "light";
  themeButton.innerHTML = icon(light ? "moon" : "sun");
  themeButton.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
  themeButton.setAttribute("title", light ? "Dark mode" : "Light mode");
}
updateThemeButton();
themeButton?.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("nusa-theme", next);
  updateThemeButton();
});

// Responsive navigation.
const menuButton = $("#menuToggle");
const mainNav = $("#mainNav");
menuButton?.addEventListener("click", () => {
  const open = mainNav?.classList.toggle("open") ?? false;
  menuButton.setAttribute("aria-expanded", String(open));
});
mainNav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  mainNav.classList.remove("open");
  menuButton?.setAttribute("aria-expanded", "false");
}));

// Mark current page in navigation.
const currentFile = location.pathname.split("/").pop() || "index.html";
$$(".navbar nav a").forEach((link) => {
  if (link.getAttribute("href") === currentFile) link.setAttribute("aria-current", "page");
});

// Reveal-on-scroll, with graceful fallback.
const revealItems = $$("[data-reveal]");
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
  revealItems.forEach((item) => observer.observe(item));
} else revealItems.forEach((item) => item.classList.add("visible"));

// Add copy buttons to documentation code blocks.
function showToast(message) {
  let toast = $("#nusaToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "nusaToast";
    toast.className = "toast";
    toast.setAttribute("role", "status");
    document.body.append(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 1800);
}
$$(".docs-content pre").forEach((pre) => {
  if ($(".copy-code", pre)) return;
  const button = document.createElement("button");
  button.className = "copy-code";
  button.type = "button";
  button.innerHTML = icon("copy");
  button.setAttribute("aria-label", "Copy code");
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText($("code", pre)?.innerText || pre.innerText);
      showToast("Code copied");
    } catch {
      showToast("Clipboard tidak tersedia di browser ini");
    }
  });
  pre.append(button);
});

// Documentation sidebar active state.
const docSections = $$(".docs-content section[id]");
const sideLinks = $$(".docs-sidebar a[href^='#']");
if (docSections.length && "IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        sideLinks.forEach((link) => link.classList.toggle("active", link.hash === `#${entry.target.id}`));
      }
    });
  }, { rootMargin: "-20% 0px -65% 0px" });
  docSections.forEach((section) => sectionObserver.observe(section));
}

// Documentation search filters sidebar links and sections by their text.
const docSearch = $("#docsSearch");
docSearch?.addEventListener("input", () => {
  const query = docSearch.value.trim().toLowerCase();
  sideLinks.forEach((link) => {
    const target = $(link.hash);
    const match = !query || `${link.textContent} ${target?.innerText || ""}`.toLowerCase().includes(query);
    link.hidden = !match;
    if (target) target.hidden = Boolean(query) && !match;
  });
});

// Contact form: intentionally does not pretend to send data without a backend.
$("#contactForm")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const status = $("#formStatus");
  if (status) status.textContent = "Form siap digunakan, tetapi belum terhubung ke layanan pengiriman. Hubungkan endpoint/API sebelum menerima pesan.";
});
