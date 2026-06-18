var MoviePlayer = (function () {
    function start(config) {
        var video = document.getElementById(config.videoId);
        var overlay = document.getElementById(config.overlayId);
        var streamUrl = config.streamUrl;
        var loaded = false;
        var hls = null;

        if (!video || !streamUrl) {
            return;
        }

        function load() {
            if (loaded) {
                return;
            }
            loaded = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function begin() {
            load();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", begin);
        }

        video.addEventListener("click", function () {
            if (!loaded || video.paused) {
                begin();
            } else {
                video.pause();
            }
        });

        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });

        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    return {
        start: start
    };
})();
