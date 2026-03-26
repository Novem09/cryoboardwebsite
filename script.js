const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.18,
  }
);

document.querySelectorAll(".reveal").forEach((element) => {
  observer.observe(element);
});

const body = document.body;
const introDuration = 2400;
const scrollFill = document.querySelector(".scroll-rail__fill");
const siteHeader = document.querySelector(".site-header");

const setReadyState = () => {
  body.classList.add("is-ready");
  body.classList.remove("is-loading");
};

if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  setReadyState();
} else {
  window.setTimeout(setReadyState, introDuration);
}

const updateScrollRail = () => {
  if (!scrollFill) {
    return;
  }

  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  scrollFill.style.height = `${Math.min(progress, 100)}%`;
};

const updateHeaderState = () => {
  if (!siteHeader) {
    return;
  }

  siteHeader.classList.toggle("is-scrolled", window.scrollY > 24);
};

const onScroll = () => {
  updateScrollRail();
  updateHeaderState();
};

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll);
window.addEventListener("load", onScroll);

onScroll();
