const intro = document.querySelector("#intro");
const site = document.querySelector("#site");
const video = document.querySelector("#introVideo");
const videoPlaceholder = document.querySelector("#videoPlaceholder");
let hasEntered = false;
site.inert = true;
const invitationReady = Promise.all([
  document.fonts.ready,
  ...Array.from(document.querySelectorAll(".hero img"), (image) => image.decode().catch(() => {})),
]);

async function revealSite() {
  if (hasEntered) return;
  hasEntered = true;
  await Promise.race([invitationReady, new Promise((resolve) => window.setTimeout(resolve, 1200))]);
  document.body.classList.add("intro-transitioning");
  site.classList.remove("is-hidden");
  document.body.classList.add("site-open");
  document.querySelectorAll(".hero .reveal").forEach((element) => {
    element.classList.add("is-visible");
  });
  window.setTimeout(revealVisibleElements, 80);
  const finishIntro = () => {
    window.clearTimeout(finishTimer);
    intro.removeEventListener("transitionend", onFadeEnd);
    intro.setAttribute("aria-hidden", "true");
    document.body.classList.remove("intro-transitioning");
    site.inert = false;
  };
  const onFadeEnd = (event) => {
    if (event.target === intro && event.propertyName === "opacity") finishIntro();
  };
  const finishTimer = window.setTimeout(finishIntro,
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 3400);
  intro.addEventListener("transitionend", onFadeEnd);
  requestAnimationFrame(() => requestAnimationFrame(() => intro.classList.add("is-done")));
}

function hasVideoSource() {
  return Boolean(video.currentSrc || video.querySelector("source"));
}

if (new URLSearchParams(window.location.search).get("preview") === "main") {
  revealSite();
}

video.addEventListener("ended", revealSite);
video.addEventListener("playing", () => {
  videoPlaceholder.style.opacity = "0";
});
video.addEventListener("error", () => window.setTimeout(revealSite, 800));

window.addEventListener("load", async () => {
  window.setTimeout(revealVisibleElements, 120);
  if (!hasVideoSource()) {
    window.setTimeout(revealSite, 800);
    return;
  }

  try {
    await video.play();
  } catch {
    window.setTimeout(revealSite, 800);
  }
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    if (!document.body.classList.contains("site-open")) return;
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

function revealVisibleElements() {
  if (!document.body.classList.contains("site-open")) return;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  document.querySelectorAll(".reveal:not(.is-visible)").forEach((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.top < viewportHeight * 0.92 && rect.bottom > viewportHeight * 0.05) {
      element.classList.add("is-visible");
      revealObserver.unobserve(element);
    }
  });
}

window.addEventListener("scroll", revealVisibleElements, { passive: true });
window.addEventListener("hashchange", () => window.setTimeout(revealVisibleElements, 80));

const petalLayer = document.querySelector("#petalLayer");
if (petalLayer) {
  for (let index = 0; index < 24; index += 1) {
    const petal = document.createElement("span");
    petal.className = "petal";
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.animationDuration = `${10 + Math.random() * 9}s`;
    petal.style.animationDelay = `${Math.random() * 10}s`;
    petal.style.setProperty("--drift", `${-45 + Math.random() * 90}px`);
    petalLayer.appendChild(petal);
  }
}
