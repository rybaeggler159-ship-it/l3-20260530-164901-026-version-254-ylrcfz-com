(function () {
    window.initMoviePlayer = function (config) {
        var video = document.getElementById(config.videoId);
        var cover = document.getElementById(config.coverId);
        var loaded = false;
        var hlsInstance = null;

        if (!video || !config.src) {
            return;
        }

        var loadVideo = function () {
            if (loaded) {
                return;
            }

            loaded = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = config.src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(config.src);
                hlsInstance.attachMedia(video);
            } else {
                video.src = config.src;
            }
        };

        var start = function () {
            loadVideo();

            if (cover) {
                cover.classList.add("is-hidden");
            }

            var promise = video.play();

            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        };

        if (cover) {
            cover.addEventListener("click", start);
        }

        video.addEventListener("click", function () {
            if (!loaded) {
                start();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };
})();
