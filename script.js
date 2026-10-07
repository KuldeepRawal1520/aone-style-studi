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
