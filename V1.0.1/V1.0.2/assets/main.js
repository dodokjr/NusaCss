// NusaCss Website Controller

// Footer year
document.querySelectorAll(".current-year").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

// Theme management
const themeToggle = document.querySelector("#themeToggle");
const savedTheme = localStorage.getItem("nusa-theme");

if (savedTheme) {
  document.documentElement.dataset.theme = savedTheme;
}

themeToggle?.addEventListener("click", () => {
  const currentTheme =
    document.documentElement.dataset.theme || "dark";

  const nextTheme =
    currentTheme === "dark" ? "light" : "dark";

  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem("nusa-theme", nextTheme);
});

// Reveal animation
const revealElements =
  document.querySelectorAll("[data-nusa-reveal]");

if ("IntersectionObserver" in window) {
  document.documentElement.classList.add("nusa-motion-ready");

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  revealElements.forEach((element) => {
    observer.observe(element);
  });
} else {
  revealElements.forEach((element) => {
    element.classList.add("is-visible");
  });
}

// Contact form placeholder
const contactForm = document.querySelector("#contactForm");
const formStatus = document.querySelector("#formStatus");

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (formStatus) {
    formStatus.textContent =
      "Form belum terhubung ke backend. Konfigurasikan API pengiriman pesan terlebih dahulu.";
  }
});
