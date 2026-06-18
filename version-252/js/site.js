(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var menuButton = document.querySelector(".menu-toggle");
        var mobileMenu = document.querySelector(".mobile-menu");

        if (menuButton && mobileMenu) {
            menuButton.addEventListener("click", function () {
                mobileMenu.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector(".hero-prev");
        var next = document.querySelector(".hero-next");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, pos) {
                slide.classList.toggle("is-active", pos === current);
            });
            dots.forEach(function (dot, pos) {
                dot.classList.toggle("is-active", pos === current);
            });
        }

        function playCarousel() {
            if (slides.length < 2) {
                return;
            }
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        if (slides.length) {
            showSlide(0);
            playCarousel();
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                playCarousel();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                playCarousel();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                playCarousel();
            });
        });

        var filterInput = document.querySelector(".movie-filter-input");
        var typeFilter = document.querySelector(".type-filter");
        var yearFilter = document.querySelector(".year-filter");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-card"));
        var emptyMessage = document.querySelector(".empty-message");

        if (filterInput && cards.length) {
            var params = new URLSearchParams(window.location.search);
            var queryValue = params.get("q") || "";
            if (queryValue) {
                filterInput.value = queryValue;
            }

            function normalize(value) {
                return String(value || "").trim().toLowerCase();
            }

            function applyFilter() {
                var query = normalize(filterInput.value);
                var type = normalize(typeFilter ? typeFilter.value : "");
                var year = normalize(yearFilter ? yearFilter.value : "");
                var visible = 0;

                cards.forEach(function (card) {
                    var keywords = normalize(card.getAttribute("data-keywords"));
                    var cardType = normalize(card.getAttribute("data-type"));
                    var cardYear = normalize(card.getAttribute("data-year"));
                    var matched = true;

                    if (query && keywords.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (type && cardType !== type) {
                        matched = false;
                    }
                    if (year && cardYear !== year) {
                        matched = false;
                    }

                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });

                if (emptyMessage) {
                    emptyMessage.hidden = visible !== 0;
                }
            }

            filterInput.addEventListener("input", applyFilter);
            if (typeFilter) {
                typeFilter.addEventListener("change", applyFilter);
            }
            if (yearFilter) {
                yearFilter.addEventListener("change", applyFilter);
            }
            applyFilter();
        }
    });
})();
