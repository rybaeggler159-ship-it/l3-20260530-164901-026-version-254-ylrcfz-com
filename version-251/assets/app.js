(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function bindMenus() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function bindSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var target = form.getAttribute("data-search-target") || "./search.html";
        if (query.length > 0) {
          window.location.href = target + "?q=" + encodeURIComponent(query);
        } else {
          window.location.href = target;
        }
      });
    });
  }

  function bindHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function bindViewSwitch() {
    var container = document.querySelector("[data-view-container]");
    if (!container) {
      return;
    }
    document.querySelectorAll("[data-view-button]").forEach(function (button) {
      button.addEventListener("click", function () {
        var mode = button.getAttribute("data-view-button");
        document.querySelectorAll("[data-view-button]").forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        container.classList.toggle("is-list", mode === "list");
      });
    });
  }

  function bindSearchResults() {
    var results = document.querySelector("[data-search-results]");
    if (!results) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim().toLowerCase();
    var note = document.querySelector("[data-search-note]");
    var forms = document.querySelectorAll("[data-search-form]");
    forms.forEach(function (form) {
      var input = form.querySelector("input[name='q']");
      if (input && query) {
        input.value = params.get("q") || "";
      }
    });
    var cards = Array.prototype.slice.call(results.querySelectorAll(".movie-card"));
    var visible = 0;
    cards.forEach(function (card) {
      var text = (card.getAttribute("data-search-text") || "").toLowerCase();
      var matched = !query || text.indexOf(query) !== -1;
      card.style.display = matched ? "" : "none";
      if (matched) {
        visible += 1;
      }
    });
    if (note) {
      note.textContent = query ? "已为你筛选出 " + visible + " 部相关影片。" : "浏览片库或使用关键词筛选影片。";
    }
  }

  ready(function () {
    bindMenus();
    bindSearchForms();
    bindHero();
    bindViewSwitch();
    bindSearchResults();
  });
})();

function setupMoviePlayer(videoUrl) {
  var video = document.querySelector(".movie-video");
  var cover = document.querySelector(".player-cover");
  if (!video || !cover || !videoUrl) {
    return;
  }
  var loaded = false;
  var hlsInstance = null;

  function loadVideo() {
    if (loaded) {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        maxBufferLength: 30,
        enableWorker: true
      });
      hlsInstance.loadSource(videoUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = videoUrl;
    }
    loaded = true;
  }

  function playVideo() {
    loadVideo();
    video.controls = true;
    cover.classList.add("is-hidden");
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  cover.addEventListener("click", playVideo);
  video.addEventListener("click", function () {
    if (video.paused) {
      playVideo();
    } else {
      video.pause();
    }
  });
  video.addEventListener("play", function () {
    cover.classList.add("is-hidden");
  });
  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
