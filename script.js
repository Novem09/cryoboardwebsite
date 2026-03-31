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
const heroVideoFrame = document.querySelector("#hero-video-player");
const lightbox = document.querySelector(".lightbox");
const lightboxImage = document.querySelector(".lightbox-image");
const lightboxVideoWrap = document.querySelector(".lightbox-video-wrap");
const lightboxVideo = document.querySelector(".lightbox-video");
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

let heroPlayer;
let heroLoopTimeout;
let heroLoopInterval;

const HERO_LOOP_SECONDS = 30;
const HERO_VIDEO_ID = "lN1hoBVX73U";

const clearHeroLoopTimeout = () => {
  if (heroLoopTimeout) {
    window.clearTimeout(heroLoopTimeout);
    heroLoopTimeout = undefined;
  }
};

const clearHeroLoopInterval = () => {
  if (heroLoopInterval) {
    window.clearInterval(heroLoopInterval);
    heroLoopInterval = undefined;
  }
};

const scheduleHeroLoopRestart = () => {
  if (!heroPlayer || typeof heroPlayer.seekTo !== "function") {
    return;
  }

  clearHeroLoopTimeout();
  heroLoopTimeout = window.setTimeout(() => {
    heroPlayer.seekTo(0, true);
    heroPlayer.playVideo();
    scheduleHeroLoopRestart();
  }, HERO_LOOP_SECONDS * 1000);
};

const startHeroLoopWatcher = () => {
  if (!heroPlayer || typeof heroPlayer.getCurrentTime !== "function") {
    return;
  }

  clearHeroLoopInterval();
  heroLoopInterval = window.setInterval(() => {
    const currentTime = heroPlayer.getCurrentTime();

    if (typeof currentTime === "number" && currentTime >= HERO_LOOP_SECONDS) {
      heroPlayer.seekTo(0, true);
      heroPlayer.playVideo();
    }
  }, 250);
};

const initializeHeroVideoLoop = () => {
  if (!heroVideoFrame || !window.YT?.Player) {
    return;
  }

  heroPlayer = new window.YT.Player("hero-video-player", {
    events: {
      onReady: (event) => {
        event.target.mute();
        event.target.loadVideoById({
          videoId: HERO_VIDEO_ID,
          startSeconds: 0,
          endSeconds: HERO_LOOP_SECONDS,
          suggestedQuality: "hd1080",
        });
        event.target.playVideo();
        startHeroLoopWatcher();
        scheduleHeroLoopRestart();
      },
      onStateChange: (event) => {
        if (!window.YT) {
          return;
        }

        if (event.data === window.YT.PlayerState.PLAYING) {
          startHeroLoopWatcher();
          scheduleHeroLoopRestart();
        }

        if (
          event.data === window.YT.PlayerState.PAUSED ||
          event.data === window.YT.PlayerState.ENDED
        ) {
          clearHeroLoopInterval();
          clearHeroLoopTimeout();
        }
      },
    },
  });
};

if (heroVideoFrame) {
  window.onYouTubeIframeAPIReady = initializeHeroVideoLoop;

  const youtubeApiScript = document.createElement("script");
  youtubeApiScript.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(youtubeApiScript);
}

const closeLightbox = () => {
  if (!lightbox || !lightboxCaption) {
    return;
  }

  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  body.classList.remove("is-lightbox-open");
  if (lightboxImage) {
    lightboxImage.removeAttribute("src");
    lightboxImage.setAttribute("alt", "");
    lightboxImage.hidden = true;
  }
  if (lightboxVideo) {
    lightboxVideo.removeAttribute("src");
  }
  if (lightboxVideoWrap) {
    lightboxVideoWrap.hidden = true;
  }
  lightboxCaption.textContent = "";
};

const openLightbox = (trigger) => {
  if (!lightbox || !lightboxCaption) {
    return;
  }

  const mediaType = trigger.dataset.lightboxType || "image";
  const mediaSrc = trigger.dataset.lightboxSrc;
  const imageAlt = trigger.dataset.lightboxAlt || "";
  const mediaCaption = trigger.dataset.lightboxCaption || "";

  if (!mediaSrc) {
    return;
  }

  if (mediaType === "youtube") {
    if (lightboxImage) {
      lightboxImage.removeAttribute("src");
      lightboxImage.setAttribute("alt", "");
      lightboxImage.hidden = true;
    }

    if (lightboxVideo && lightboxVideoWrap) {
      lightboxVideo.setAttribute("src", mediaSrc);
      lightboxVideoWrap.hidden = false;
    }
  } else if (lightboxImage) {
    lightboxImage.setAttribute("src", mediaSrc);
    lightboxImage.setAttribute("alt", imageAlt);
    lightboxImage.hidden = false;

    if (lightboxVideo) {
      lightboxVideo.removeAttribute("src");
    }
    if (lightboxVideoWrap) {
      lightboxVideoWrap.hidden = true;
    }
  }

  lightboxCaption.textContent = mediaCaption;
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
