
(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    setupHero();
    setupRails();
    setupFilters();
  });

  function setupHero() {
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
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });

    show(0);
    restart();
  }

  function setupRails() {
    var sections = Array.prototype.slice.call(document.querySelectorAll(".section-block"));

    sections.forEach(function (section) {
      var rail = section.querySelector("[data-scroll-rail]");
      var left = section.querySelector("[data-scroll-left]");
      var right = section.querySelector("[data-scroll-right]");

      if (!rail) {
        return;
      }

      if (left) {
        left.addEventListener("click", function () {
          rail.scrollBy({ left: -420, behavior: "smooth" });
        });
      }

      if (right) {
        right.addEventListener("click", function () {
          rail.scrollBy({ left: 420, behavior: "smooth" });
        });
      }
    });
  }

  function setupFilters() {
    var list = document.querySelector("[data-card-list]");
    var panel = document.querySelector("[data-filter-panel]");

    if (!list || !panel) {
      return;
    }

    var input = panel.querySelector("[data-search-input]");
    var type = panel.querySelector("[data-type-filter]");
    var sort = panel.querySelector("[data-year-sort]");
    var count = panel.querySelector("[data-result-count]");
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    if (input && query && !input.value) {
      input.value = query;
    }

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function apply() {
      var term = normalize(input ? input.value : "");
      var typeValue = normalize(type ? type.value : "");
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.type,
          card.dataset.tags
        ].join(" "));
        var matchesTerm = !term || haystack.indexOf(term) !== -1;
        var matchesType = !typeValue || normalize(card.dataset.type).indexOf(typeValue) !== -1;
        var show = matchesTerm && matchesType;

        card.classList.toggle("is-hidden", !show);
        if (show) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible + " 部影片";
      }
    }

    function applySort() {
      if (!sort) {
        return;
      }

      var direction = sort.value === "asc" ? 1 : -1;
      cards.sort(function (a, b) {
        var yearA = parseInt(a.dataset.year, 10) || 0;
        var yearB = parseInt(b.dataset.year, 10) || 0;
        return (yearA - yearB) * direction;
      });
      cards.forEach(function (card) {
        list.appendChild(card);
      });
      apply();
    }

    if (input) {
      input.addEventListener("input", apply);
    }

    if (type) {
      type.addEventListener("change", apply);
    }

    if (sort) {
      sort.addEventListener("change", applySort);
    }

    applySort();
  }
}());
