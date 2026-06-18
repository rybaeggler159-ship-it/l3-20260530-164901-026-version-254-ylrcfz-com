(function () {
  var toggle = document.querySelector("[data-menu-toggle]");
  var panel = document.querySelector("[data-mobile-panel]");
  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
  panels.forEach(function (filterPanel) {
    var section = filterPanel.parentElement;
    var cards = Array.prototype.slice.call(section.querySelectorAll("[data-movie-card]"));
    var searchInput = filterPanel.querySelector("[data-search-input]");
    var selects = Array.prototype.slice.call(filterPanel.querySelectorAll("[data-filter-select]"));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (searchInput && initialQuery) {
      searchInput.value = initialQuery;
    }

    function applyFilters() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var active = {};
      selects.forEach(function (select) {
        active[select.getAttribute("data-filter-select")] = select.value;
      });
      cards.forEach(function (card) {
        var text = card.getAttribute("data-search") || "";
        var matchesText = !query || text.indexOf(query) !== -1;
        var matchesSelects = selects.every(function (select) {
          var key = select.getAttribute("data-filter-select");
          var value = active[key];
          return !value || card.getAttribute("data-" + key) === value;
        });
        card.classList.toggle("is-hidden", !(matchesText && matchesSelects));
      });
    }

    if (searchInput) {
      searchInput.addEventListener("input", applyFilters);
    }
    selects.forEach(function (select) {
      select.addEventListener("change", applyFilters);
    });
    applyFilters();
  });
})();
