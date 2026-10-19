const header=document.querySelector(".site-header");
const menuToggle=document.querySelector(".menu-toggle");
const mobileNav=document.querySelector(".mobile-nav");
const toast=document.querySelector("#toast");
const serviceSelect=document.querySelector("#service");
const bookingForm=document.querySelector("#bookingForm");
const dateInput=document.querySelector("#date");

window.addEventListener("scroll",()=>header.classList.toggle("scrolled",window.scrollY>20));
menuToggle?.addEventListener("click",()=>{const open=mobileNav.classList.toggle("open");menuToggle.setAttribute("aria-expanded",String(open));mobileNav.setAttribute("aria-hidden",String(!open))});
document.querySelectorAll(".mobile-nav a").forEach(a=>a.addEventListener("click",()=>{mobileNav.classList.remove("open");menuToggle.setAttribute("aria-expanded","false");mobileNav.setAttribute("aria-hidden","true")}));
document.querySelectorAll("[data-service]").forEach(a=>a.addEventListener("click",()=>serviceSelect.value=a.dataset.service));
const today=new Date();today.setMinutes(today.getMinutes()-today.getTimezoneOffset());dateInput.min=today.toISOString().split("T")[0];
bookingForm.addEventListener("submit",e=>{e.preventDefault();if(!bookingForm.reportValidity())return;toast.textContent="Nice choice — live availability will be connected next.";toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),4000)});


// Accessible ten-photo hero slideshow with manual controls and autoplay.
(() => {
  const banner = document.querySelector(".hero-banner");
  if (!banner) return;
  const slides = Array.from(banner.querySelectorAll(".banner-slide"));
  const dots = Array.from(banner.querySelectorAll(".banner-dot"));
  const counter = banner.querySelector("#bannerCounter");
  const prev = banner.querySelector("#bannerPrev");
  const next = banner.querySelector("#bannerNext");
  if (slides.length < 2 || dots.length !== slides.length) return;
  let current = 0;
  let timer = null;
  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const active = i === current;
      slide.classList.toggle("active", active);
      slide.setAttribute("aria-hidden", String(!active));
      dots[i].classList.toggle("active", active);
      dots[i].setAttribute("aria-pressed", String(active));
    });
    if (counter) counter.textContent = String(current + 1).padStart(2, "0") + " / " + String(slides.length).padStart(2, "0");
  };
  const stop = () => { if (timer) window.clearInterval(timer); timer = null; };
  const start = () => {
    stop();
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      timer = window.setInterval(() => show(current + 1), 2000);
    }
  };
  prev?.addEventListener("click", () => { show(current - 1); start(); });
  next?.addEventListener("click", () => { show(current + 1); start(); });
  dots.forEach((dot, i) => dot.addEventListener("click", () => { show(i); start(); }));
  banner.addEventListener("focusin", stop);
  banner.addEventListener("focusout", start);
  document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());
  show(0);
  start();
})();
