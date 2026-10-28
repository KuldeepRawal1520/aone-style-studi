"use strict";

(() => {
  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");

  if (header) {
    const updateHeader = () => header.classList.toggle("scrolled", window.scrollY > 20);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  const closeMobileMenu = () => {
    if (!menuToggle || !mobileNav) return;
    mobileNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    mobileNav.setAttribute("aria-hidden", "true");
  };

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = mobileNav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
      mobileNav.setAttribute("aria-hidden", String(!isOpen));
    });
    mobileNav.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMobileMenu));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        closeMobileMenu();
        menuToggle.focus();
      }
    });
    document.addEventListener("click", event => {
      if (mobileNav.classList.contains("open") &&
          !mobileNav.contains(event.target) &&
          !menuToggle.contains(event.target)) closeMobileMenu();
    });
  }

  const banner = document.querySelector(".hero-banner");
  if (!banner) return;
  const slides = Array.from(banner.querySelectorAll(".banner-slide"));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (slides.length < 2 || reducedMotion.matches) return;

  let currentIndex = 0;
  let timerId = null;
  const showSlide = index => {
    currentIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const active = i === currentIndex;
      slide.classList.toggle("active", active);
      slide.setAttribute("aria-hidden", String(!active));
    });
  };
  const stop = () => {
    if (timerId !== null) window.clearInterval(timerId);
    timerId = null;
  };
  const start = () => {
    stop();
    if (!document.hidden && !reducedMotion.matches) {
      timerId = window.setInterval(() => showSlide(currentIndex + 1), 4500);
    }
  };
  banner.addEventListener("mouseenter", stop);
  banner.addEventListener("mouseleave", start);
  banner.addEventListener("focusin", stop);
  banner.addEventListener("focusout", start);
  document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());
  if (typeof reducedMotion.addEventListener === "function") reducedMotion.addEventListener("change", start);
  start();
})();
