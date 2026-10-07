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


/* Subtle mouse-driven 3D depth on desktop */
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && window.matchMedia("(pointer:fine)").matches) {
  const heroVisual = document.querySelector(".hero-visual");
  const orb = document.querySelector(".hero-orb");
  const cube = document.querySelector(".hero-cube");
  if (heroVisual && orb && cube) {
    heroVisual.addEventListener("pointermove", (e) => {
      const r = heroVisual.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      orb.style.transform = `translate3d(${x * 18}px,${y * 14}px,70px) rotateX(${12 - y * 10}deg) rotateY(${-18 + x * 14}deg)`;
      cube.style.transform = `translate3d(${x * -12}px,${y * -10}px,80px) rotateX(${15 + y * 8}deg) rotateY(${-25 + x * 12}deg) rotateZ(-6deg)`;
    });
    heroVisual.addEventListener("pointerleave", () => {
      orb.style.transform = "";
      cube.style.transform = "";
    });
  }
}
