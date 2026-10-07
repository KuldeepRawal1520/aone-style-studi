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


/* Premium motion: reveal, magnetic controls, cursor, tilt and parallax */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer:fine)").matches;

if (!reduceMotion) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, {threshold:0.14, rootMargin:"0px 0px -8% 0px"});
  document.querySelectorAll(".reveal-section").forEach(el => revealObserver.observe(el));

  if (finePointer) {
    const dot = document.querySelector(".cursor-dot");
    const ring = document.querySelector(".cursor-ring");
    let mx = -100, my = -100, rx = -100, ry = -100;
    window.addEventListener("pointermove", e => {
      mx=e.clientX; my=e.clientY;
      if(dot){dot.style.opacity="1";dot.style.left=mx+"px";dot.style.top=my+"px";}
    });
    const cursorLoop = () => {
      rx += (mx-rx)*0.16; ry += (my-ry)*0.16;
      if(ring){ring.style.opacity="1";ring.style.left=rx+"px";ring.style.top=ry+"px";}
      requestAnimationFrame(cursorLoop);
    };
    cursorLoop();

    document.querySelectorAll("a,button,.service-card,.gallery-card").forEach(el=>{
      el.addEventListener("mouseenter",()=>ring?.classList.add("is-hover"));
      el.addEventListener("mouseleave",()=>ring?.classList.remove("is-hover"));
    });

    document.querySelectorAll(".magnetic").forEach(el=>{
      el.addEventListener("pointermove",e=>{
        const r=el.getBoundingClientRect();
        const x=(e.clientX-r.left-r.width/2)/(r.width/2);
        const y=(e.clientY-r.top-r.height/2)/(r.height/2);
        el.style.transform=`translate(${x*7}px,${y*5}px)`;
      });
      el.addEventListener("pointerleave",()=>el.style.transform="");
    });

    document.querySelectorAll(".service-card,.gallery-card").forEach(card=>{
      card.addEventListener("pointermove",e=>{
        const r=card.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width-.5;
        const y=(e.clientY-r.top)/r.height-.5;
        card.style.transform=`perspective(900px) rotateX(${-y*4}deg) rotateY(${x*5}deg) translateY(-7px)`;
        const img=card.querySelector("img");
        if(img) img.style.transform=`scale(1.06) translate(${x*-5}px,${y*-5}px)`;
      });
      card.addEventListener("pointerleave",()=>{
        card.style.transform="";
        const img=card.querySelector("img");
        if(img) img.style.transform="";
      });
    });

    const heroImage=document.querySelector(".hero-image");
    if(heroImage){
      heroImage.addEventListener("pointermove",e=>{
        const r=heroImage.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width-.5;
        const y=(e.clientY-r.top)/r.height-.5;
        heroImage.style.transform=`scale(1.015) translate(${x*-7}px,${y*-5}px)`;
      });
      heroImage.addEventListener("pointerleave",()=>heroImage.style.transform="");
    }

    let ticking=false;
    window.addEventListener("scroll",()=>{
      if(ticking)return;
      ticking=true;
      requestAnimationFrame(()=>{
        const scrollY=window.scrollY;
        document.querySelectorAll("[data-parallax-section]").forEach(section=>{
          const rect=section.getBoundingClientRect();
          if(rect.bottom>0 && rect.top<window.innerHeight){
            const progress=(window.innerHeight/2-(rect.top+rect.height/2))/window.innerHeight;
            const heading=section.querySelector(".section-top,.story-copy");
            if(heading) heading.style.transform=`translate3d(0,${progress*-14}px,0)`;
          }
        });
        ticking=false;
      });
    },{passive:true});
  }
}
