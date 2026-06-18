(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".site-nav");
    var search = document.querySelector(".top-search");

    if (menuButton && nav && search) {
        menuButton.addEventListener("click", function () {
            var open = nav.classList.toggle("is-open");
            search.classList.toggle("is-open", open);
            menuButton.setAttribute("aria-expanded", String(open));
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var current = 0;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 6200);
        }
    }

    var filterFields = Array.prototype.slice.call(document.querySelectorAll(".filter-field"));

    filterFields.forEach(function (field) {
        var scope = field.closest(".content-section") || document;
        var items = Array.prototype.slice.call(scope.querySelectorAll("[data-search]"));

        field.addEventListener("input", function () {
            var value = field.value.trim().toLowerCase();

            items.forEach(function (item) {
                var text = (item.getAttribute("data-search") || item.textContent || "").toLowerCase();
                item.classList.toggle("is-filter-hidden", value && text.indexOf(value) === -1);
            });
        });
    });
})();

function initMoviePlayer(url) {
    var video = document.getElementById("moviePlayer");
    var cover = document.querySelector(".player-cover");

    if (!video || !cover || !url) {
        return;
    }

    var ready = false;
    var hlsInstance = null;

    function attach() {
        if (ready) {
            return;
        }

        ready = true;
        cover.classList.add("is-hidden");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            video.play().catch(function () {});
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(url);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            return;
        }

        video.src = url;
        video.play().catch(function () {});
    }

    cover.addEventListener("click", attach);
    video.addEventListener("click", function () {
        if (!ready) {
            attach();
        }
    });
    video.addEventListener("play", function () {
        cover.classList.add("is-hidden");
    });
    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}

(function () {
    var input = document.getElementById("searchInput");
    var results = document.getElementById("searchResults");
    var info = document.getElementById("searchResultInfo");

    if (!input || !results || !info || !window.MOVIE_INDEX) {
        return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function render(list, query) {
        results.innerHTML = list.map(function (movie) {
            return [
                '<article class="movie-card">',
                '<a class="movie-cover" href="./' + movie.file + '" aria-label="' + escapeHtml(movie.title) + '">',
                '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '<span class="score-badge">' + movie.score + '</span>',
                '</a>',
                '<div class="movie-card-body">',
                '<h3><a href="./' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>',
                '<p class="movie-meta">' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.type) + '</p>',
                '<p class="movie-line">' + escapeHtml(movie.line) + '</p>',
                '<div class="tag-list"><span>' + escapeHtml(movie.genre) + '</span></div>',
                '</div>',
                '</article>'
            ].join('');
        }).join('');

        info.textContent = query ? '搜索结果：' + query : '热门影片推荐';
    }

    function run() {
        var query = input.value.trim().toLowerCase();
        var list = window.MOVIE_INDEX.filter(function (movie) {
            var text = [movie.title, movie.region, movie.type, movie.genre, movie.tags, movie.year].join(' ').toLowerCase();
            return !query || text.indexOf(query) !== -1;
        }).slice(0, 120);
        render(list, input.value.trim());
    }

    input.addEventListener("input", run);
    run();

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }
})();
