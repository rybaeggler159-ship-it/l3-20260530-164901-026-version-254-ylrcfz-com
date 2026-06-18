(function () {
    var panel = document.querySelector('.mobile-panel');
    var menuButton = document.querySelector('.menu-toggle');

    if (menuButton && panel) {
        menuButton.addEventListener('click', function () {
            var open = panel.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    document.querySelectorAll('img').forEach(function (img) {
        img.addEventListener('error', function () {
            var frame = img.closest('.poster-frame');
            if (frame) {
                frame.classList.add('poster-empty');
            }
            img.remove();
        });
    });

    document.querySelectorAll('.hero-carousel').forEach(function (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
        var current = slides.findIndex(function (slide) {
            return slide.classList.contains('active');
        });

        if (current < 0) {
            current = 0;
        }

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }

        var prev = carousel.querySelector('.hero-arrow.prev');
        var next = carousel.querySelector('.hero-arrow.next');

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(parseInt(dot.getAttribute('data-slide-target') || '0', 10));
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                show(current + 1);
            }, 5200);
        }
    });

    document.querySelectorAll('.scroll-controls').forEach(function (controls) {
        var section = controls.closest('.section-block');
        var row = section ? section.querySelector('.scroll-row') : null;

        controls.querySelectorAll('button').forEach(function (button) {
            button.addEventListener('click', function () {
                if (!row) {
                    return;
                }

                var direction = button.getAttribute('data-scroll') === 'left' ? -1 : 1;
                row.scrollBy({ left: direction * 420, behavior: 'smooth' });
            });
        });
    });

    document.querySelectorAll('.page-filter').forEach(function (input) {
        var area = input.closest('.section-block');
        var items = area ? Array.prototype.slice.call(area.querySelectorAll('[data-search]')) : [];

        input.addEventListener('input', function () {
            var value = input.value.trim().toLowerCase();
            items.forEach(function (item) {
                var text = item.getAttribute('data-search') || '';
                item.classList.toggle('is-hidden', value && text.indexOf(value) === -1);
            });
        });
    });

    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim().toLowerCase();
    var searchTitle = document.querySelector('[data-search-title]');

    if (searchTitle && query) {
        searchTitle.textContent = '与“' + query + '”相关的影片';
        document.querySelectorAll('.search-results [data-search]').forEach(function (item) {
            var text = item.getAttribute('data-search') || '';
            item.classList.toggle('is-hidden', text.indexOf(query) === -1);
        });
        document.querySelectorAll('input[name="q"]').forEach(function (input) {
            input.value = query;
        });
    }

    document.querySelectorAll('.player-shell').forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('.player-start');
        var stream = player.getAttribute('data-stream-url') || '';
        var loaded = false;
        var hlsInstance = null;

        function attach() {
            if (!video || !stream || loaded) {
                return;
            }

            loaded = true;
            player.classList.add('playing');

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new Hls();
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else {
                video.src = stream;
            }

            var attempt = video.play();
            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', attach);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!loaded) {
                    attach();
                }
            });
            video.addEventListener('play', function () {
                player.classList.add('playing');
            });
            video.addEventListener('emptied', function () {
                if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        }
    });
})();
