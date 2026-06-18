document.addEventListener("DOMContentLoaded", function () {
    setupMobileNavigation();
    setupHeroSlider();
    setupFiltering();
    applySearchQueryFromUrl();
});

function setupMobileNavigation() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!button || !nav) {
        return;
    }

    button.addEventListener("click", function () {
        nav.classList.toggle("open");
    });
}

function setupHeroSlider() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
        return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeIndex = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === activeIndex);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === activeIndex);
        });
    }

    function startTimer() {
        stopTimer();
        timer = window.setInterval(function () {
            showSlide(activeIndex + 1);
        }, 5200);
    }

    function stopTimer() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            var nextIndex = Number(dot.getAttribute("data-hero-dot") || 0);
            showSlide(nextIndex);
            startTimer();
        });
    });

    hero.addEventListener("mouseenter", stopTimer);
    hero.addEventListener("mouseleave", startTimer);

    showSlide(0);
    startTimer();
}

function setupFiltering() {
    var containers = Array.prototype.slice.call(document.querySelectorAll("[data-filter-container]"));

    if (!containers.length) {
        return;
    }

    var searchInput = document.querySelector("[data-filter-search]");
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
    var result = document.querySelector("[data-filter-result]");
    var activeValue = "";

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function applyFilter() {
        var query = normalize(searchInput ? searchInput.value : "");
        var visible = 0;
        var total = 0;

        containers.forEach(function (container) {
            var cards = Array.prototype.slice.call(container.querySelectorAll("[data-movie-card]"));

            cards.forEach(function (card) {
                total += 1;

                var text = normalize(card.getAttribute("data-search"));
                var matchesQuery = !query || text.indexOf(query) !== -1;
                var matchesChip = !activeValue || text.indexOf(normalize(activeValue)) !== -1;
                var shouldShow = matchesQuery && matchesChip;

                card.classList.toggle("hidden-by-filter", !shouldShow);

                if (shouldShow) {
                    visible += 1;
                }
            });
        });

        if (result) {
            result.textContent = "当前显示 " + visible + " / " + total + " 部影片";
        }
    }

    if (searchInput) {
        searchInput.addEventListener("input", applyFilter);
    }

    chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
            activeValue = chip.getAttribute("data-filter-value") || "";

            chips.forEach(function (item) {
                item.classList.toggle("active", item === chip);
            });

            applyFilter();
        });
    });

    applyFilter();
}

function applySearchQueryFromUrl() {
    var input = document.querySelector("[data-filter-search]");

    if (!input) {
        return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");

    if (!query) {
        return;
    }

    input.value = query;
    input.dispatchEvent(new Event("input", { bubbles: true }));
}
