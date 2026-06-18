(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setBackground(element) {
    var src = element.getAttribute('data-bg');
    if (!src || element.getAttribute('data-bg-loaded') === '1') {
      return;
    }
    element.style.backgroundImage = 'linear-gradient(135deg, rgba(244, 63, 94, 0.32), rgba(249, 115, 22, 0.32)), url("' + src + '")';
    element.setAttribute('data-bg-loaded', '1');
  }

  function initLazyBackgrounds() {
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-bg]'));
    if (!items.length) {
      return;
    }
    if (!('IntersectionObserver' in window)) {
      items.forEach(setBackground);
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          setBackground(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '240px 0px' });
    items.forEach(function (item) {
      observer.observe(item);
    });
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-nav]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var active = 0;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
      setBackground(slides[active]);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    setBackground(slides[0]);
    window.setInterval(function () {
      show(active + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initFilters() {
    var grid = document.querySelector('[data-card-grid]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card="movie"]'));
    var input = document.querySelector('[data-filter-input]');
    var year = document.querySelector('[data-filter-year]');
    var type = document.querySelector('[data-filter-type]');
    var empty = document.querySelector('[data-empty-state]');
    if (!grid || !cards.length || !input) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      input.value = q;
    }
    function apply() {
      var keyword = normalize(input.value);
      var yearValue = normalize(year && year.value);
      var typeValue = normalize(type && type.value);
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardType = normalize(card.getAttribute('data-type'));
        var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchesYear = !yearValue || cardYear === yearValue;
        var matchesType = !typeValue || cardType.indexOf(typeValue) !== -1 || text.indexOf(typeValue) !== -1;
        var show = matchesKeyword && matchesYear && matchesType;
        card.classList.toggle('is-hidden', !show);
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }
    input.addEventListener('input', apply);
    if (year) {
      year.addEventListener('change', apply);
    }
    if (type) {
      type.addEventListener('change', apply);
    }
    apply();
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play-button]');
      var error = player.querySelector('[data-player-error]');
      var source = player.getAttribute('data-source');
      var hlsInstance = null;
      if (!video || !button || !source) {
        return;
      }
      function showError(message) {
        if (!error) {
          return;
        }
        error.textContent = message;
        error.classList.add('is-visible');
      }
      function attachSource() {
        if (player.getAttribute('data-ready') === '1') {
          return;
        }
        player.setAttribute('data-ready', '1');
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal) {
              showError('视频加载失败，请稍后再试');
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          video.src = source;
        }
      }
      function play() {
        attachSource();
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {
            showError('点击视频控件即可继续播放');
          });
        }
      }
      button.addEventListener('click', function (event) {
        event.preventDefault();
        play();
      });
      player.addEventListener('click', function (event) {
        if (event.target === video || event.target.closest('video')) {
          return;
        }
        if (event.target.closest('[data-play-button]')) {
          return;
        }
        play();
      });
      video.addEventListener('play', function () {
        button.classList.add('is-hidden');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          return;
        }
        button.classList.remove('is-hidden');
      });
      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  }

  ready(function () {
    initLazyBackgrounds();
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
