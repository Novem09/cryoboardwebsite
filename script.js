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
const lightbox = document.querySelector(".lightbox");
const lightboxImage = document.querySelector(".lightbox-image");
const lightboxCaption = document.querySelector(".lightbox-caption");
const lightboxClose = document.querySelector(".lightbox-close");
const lightboxBackdrop = document.querySelector(".lightbox-backdrop");
const lightboxTriggers = document.querySelectorAll(".breakdown-card-trigger");

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

const closeLightbox = () => {
  if (!lightbox || !lightboxImage || !lightboxCaption) {
    return;
  }

  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  body.classList.remove("is-lightbox-open");
  lightboxImage.removeAttribute("src");
  lightboxImage.setAttribute("alt", "");
  lightboxCaption.textContent = "";
};

const openLightbox = (trigger) => {
  if (!lightbox || !lightboxImage || !lightboxCaption) {
    return;
  }

  const imageSrc = trigger.dataset.lightboxSrc;
  const imageAlt = trigger.dataset.lightboxAlt || "";
  const imageCaption = trigger.dataset.lightboxCaption || "";

  if (!imageSrc) {
    return;
  }

  lightboxImage.setAttribute("src", imageSrc);
  lightboxImage.setAttribute("alt", imageAlt);
  lightboxCaption.textContent = imageCaption;
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  body.classList.add("is-lightbox-open");
};

lightboxTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => openLightbox(trigger));
});

if (lightboxClose) {
  lightboxClose.addEventListener("click", closeLightbox);
}

if (lightboxBackdrop) {
  lightboxBackdrop.addEventListener("click", closeLightbox);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox?.classList.contains("is-open")) {
    closeLightbox();
  }
});

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll);
window.addEventListener("load", onScroll);

onScroll();
