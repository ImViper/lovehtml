(() => {
  "use strict";

  // Preserve the original noon start time, with an explicit February date and timezone.
  const together = new Date("2022-02-01T12:00:00+08:00").getTime();
  const clock = document.querySelector(".elapsed-clock");
  const clockParts = ["days", "hours", "minutes", "seconds"].map((id) => document.getElementById(id));
  function updateClock() {
    const seconds = Math.max(0, Math.floor((Date.now() - together) / 1000));
    const values = [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60];
    clockParts.forEach((element, index) => {
      const value = index === 0 ? String(values[index]) : String(values[index]).padStart(2, "0");
      if (element.textContent !== value) element.textContent = value;
    });
    clock.setAttribute("aria-label", `已在一起 ${values[0]} 天 ${values[1]} 小时 ${values[2]} 分 ${values[3]} 秒`);
  }
  updateClock();
  setInterval(updateClock, 1000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) updateClock(); });

  const audio = document.getElementById("bgMusic");
  const musicButton = document.getElementById("musicBtn");
  const nextButton = document.getElementById("nextTrack");
  const player = document.querySelector(".music-player");
  const trackTitle = document.getElementById("trackTitle");
  const trackStatus = document.getElementById("trackStatus");
  const playlist = [
    { title: "声声", src: "files/Zhang_Shengsheng.mp3" },
    { title: "世界", src: "files/Mo_Shijie.mp3" },
    { title: "浪浪山", src: "files/He_Langlangshan.mp3" },
    { title: "当爱已成往事", src: "files/Zhang_dangaichengwangshi.mp3" },
  ];
  let trackIndex = 0;
  let playRequest = 0;
  audio.volume = 0.45;
  function syncMusic() {
    const playing = !audio.paused && !audio.ended;
    player.classList.toggle("is-playing", playing);
    musicButton.setAttribute("aria-pressed", String(playing));
    musicButton.setAttribute("aria-label", playing ? "暂停音乐" : "播放音乐");
    trackStatus.textContent = playing ? "正在播放 · 慢慢听" : "给此刻配一首歌";
  }
  async function playMusic() {
    const request = ++playRequest;
    musicButton.disabled = true;
    trackStatus.textContent = "正在加载…";
    try {
      await audio.play();
    } catch (error) {
      if (request !== playRequest || error.name === "AbortError") return;
      syncMusic();
      trackStatus.textContent = "暂时无法播放，点击重试";
    } finally {
      if (request === playRequest) musicButton.disabled = false;
    }
  }
  musicButton.addEventListener("click", () => {
    if (audio.paused) {
      if (audio.error) audio.load();
      void playMusic();
    } else audio.pause();
  });
  nextButton.addEventListener("click", () => {
    const resume = !audio.paused;
    ++playRequest;
    musicButton.disabled = false;
    trackIndex = (trackIndex + 1) % playlist.length;
    audio.src = playlist[trackIndex].src;
    trackTitle.textContent = playlist[trackIndex].title;
    audio.load();
    syncMusic();
    if (resume) void playMusic();
  });
  audio.addEventListener("play", syncMusic);
  audio.addEventListener("pause", syncMusic);
  audio.addEventListener("ended", syncMusic);
  audio.addEventListener("error", () => {
    syncMusic();
    trackStatus.textContent = "暂时无法播放，试试下一首";
  });

  const dialog = document.getElementById("photoDialog");
  const dialogImage = document.getElementById("dialogImage");
  const dialogCaption = document.getElementById("dialogCaption");
  const photoButtons = Array.from(document.querySelectorAll("[data-photo]"));
  let photoIndex = 0;
  function showPhoto(index) {
    photoIndex = (index + photoButtons.length) % photoButtons.length;
    const button = photoButtons[photoIndex];
    const image = button.querySelector("img");
    dialogImage.src = image.getAttribute("src");
    dialogImage.alt = image.alt;
    dialogCaption.textContent = `${button.querySelector(".album-caption > span").textContent}  ·  ${photoIndex + 1} / ${photoButtons.length}`;
  }
  photoButtons.forEach((button, index) => {
    button.addEventListener("click", () => { showPhoto(index); dialog.showModal(); });
  });
  dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
  dialog.querySelector(".dialog-prev").addEventListener("click", () => showPhoto(photoIndex - 1));
  dialog.querySelector(".dialog-next").addEventListener("click", () => showPhoto(photoIndex + 1));
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      showPhoto(photoIndex + (event.key === "ArrowRight" ? 1 : -1));
    }
  });
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });

  if ("IntersectionObserver" in window) {
    const links = Array.from(document.querySelectorAll(".navigation a"));
    const visible = new Set();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) visible.add(entry.target.id); else visible.delete(entry.target.id); });
      const active = links.find((link) => visible.has(link.hash.slice(1)));
      links.forEach((link) => { if (link === active) link.setAttribute("aria-current", "location"); else link.removeAttribute("aria-current"); });
    }, { rootMargin: "-10% 0px -25% 0px", threshold: 0 });
    links.forEach((link) => observer.observe(document.querySelector(link.hash)));
  }
})();
