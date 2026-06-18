(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === activeSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === activeSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

    panels.forEach(function (panel) {
      var scopeSelector = panel.getAttribute('data-filter-scope');
      var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
      if (!scope) {
        return;
      }

      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
      var input = panel.querySelector('[data-filter-keyword]');
      var yearSelect = panel.querySelector('[data-filter-year]');
      var genreSelect = panel.querySelector('[data-filter-genre]');
      var empty = document.querySelector(panel.getAttribute('data-empty-target'));

      function apply() {
        var keyword = normalize(input ? input.value : '');
        var year = yearSelect ? yearSelect.value : '';
        var genre = genreSelect ? genreSelect.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-region'),
            card.textContent
          ].join(' '));
          var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchYear = !year || card.getAttribute('data-year') === year;
          var matchGenre = !genre || normalize(card.getAttribute('data-genre')).indexOf(normalize(genre)) !== -1;
          var matched = matchKeyword && matchYear && matchGenre;
          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.style.display = visible ? 'none' : 'block';
        }
      }

      [input, yearSelect, genreSelect].forEach(function (element) {
        if (element) {
          element.addEventListener('input', apply);
          element.addEventListener('change', apply);
        }
      });

      var params = new URLSearchParams(window.location.search);
      if (input && params.get('q')) {
        input.value = params.get('q');
      }

      apply();
    });
  }

  function initVideo(video) {
    var source = video.getAttribute('data-video-source');
    if (!source) {
      return;
    }

    if (video.getAttribute('data-video-ready') === '1') {
      return;
    }

    video.setAttribute('data-video-ready', '1');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hlsInstance = hls;
      return;
    }

    video.src = source;
  }

  function setupPlayers() {
    var covers = Array.prototype.slice.call(document.querySelectorAll('.player-cover'));
    covers.forEach(function (cover) {
      var shell = cover.closest('.player-shell');
      var video = shell ? shell.querySelector('video') : null;
      if (!video) {
        return;
      }

      function playVideo() {
        initVideo(video);
        cover.classList.add('is-hidden');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            cover.classList.remove('is-hidden');
          });
        }
      }

      cover.addEventListener('click', playVideo);
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener('play', function () {
        cover.classList.add('is-hidden');
      });
      video.addEventListener('pause', function () {
        if (!video.currentTime) {
          cover.classList.remove('is-hidden');
        }
      });
    });
  }

  setupFilters();
  setupPlayers();
})();
