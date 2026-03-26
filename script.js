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
const loopedVideos = [...document.querySelectorAll("video[data-loop-end]")];

const setReadyState = () => {
  body.classList.add("is-ready");
  body.classList.remove("is-loading");
};

if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  setReadyState();
} else {
  window.setTimeout(setReadyState, introDuration);
}

loopedVideos.forEach((video) => {
  const loopEnd = Number(video.dataset.loopEnd || 0);

  if (!loopEnd) {
    return;
  }

  const restartLoop = () => {
    video.currentTime = 0;
    video.play().catch(() => {});
  };

  video.addEventListener("timeupdate", () => {
    if (video.currentTime >= loopEnd - 0.12) {
      restartLoop();
    }
  });

  video.addEventListener("ended", restartLoop);
});

const updateScrollRail = () => {
  if (!scrollFill) {
    return;
  }

  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  scrollFill.style.height = `${Math.min(progress, 100)}%`;
};

const onScroll = () => {
  updateScrollRail();
};

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll);
window.addEventListener("load", onScroll);

onScroll();
