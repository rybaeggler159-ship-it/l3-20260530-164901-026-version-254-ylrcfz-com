(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mainNav = document.querySelector("[data-main-nav]");

    if (menuButton && mainNav) {
        menuButton.addEventListener("click", function () {
            mainNav.classList.toggle("open");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var index = 0;

        var showSlide = function (nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle("active", current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle("active", current === index);
            });
        };

        dots.forEach(function (dot, current) {
            dot.addEventListener("click", function () {
                showSlide(current);
            });
        });

        window.setInterval(function () {
            showSlide(index + 1);
        }, 5200);
    }

    var scopes = document.querySelectorAll("[data-filter-scope]");

    scopes.forEach(function (scope) {
        var input = scope.querySelector("[data-local-search]");
        var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-type]"));
        var cardContainer = scope.nextElementSibling;
        var cards = cardContainer ? Array.prototype.slice.call(cardContainer.querySelectorAll("[data-filter-card]")) : [];
        var emptyTip = document.querySelector("[data-empty-tip]");
        var typeValue = "all";

        var applyFilter = function () {
            var query = input ? input.value.trim().toLowerCase() : "";
            var shown = 0;

            cards.forEach(function (card) {
                var title = (card.getAttribute("data-title") || "").toLowerCase();
                var type = card.getAttribute("data-type") || "";
                var matchedText = !query || title.indexOf(query) !== -1;
                var matchedType = typeValue === "all" || type === typeValue;
                var visible = matchedText && matchedType;

                card.classList.toggle("is-hidden", !visible);

                if (visible) {
                    shown += 1;
                }
            });

            if (emptyTip) {
                emptyTip.classList.toggle("show", shown === 0);
            }
        };

        if (input) {
            if (input.hasAttribute("data-query-fill")) {
                var params = new URLSearchParams(window.location.search);
                var q = params.get("q");
                if (q) {
                    input.value = q;
                }
            }
            input.addEventListener("input", applyFilter);
        }

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                typeValue = button.getAttribute("data-filter-type") || "all";
                buttons.forEach(function (item) {
                    item.classList.toggle("active", item === button);
                });
                applyFilter();
            });
        });

        applyFilter();
    });
})();
