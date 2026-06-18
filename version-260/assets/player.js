document.addEventListener("DOMContentLoaded", function () {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (player) {
        var button = player.querySelector("[data-play-button]");
        var video = player.querySelector("[data-video]");
        var status = player.querySelector("[data-player-status]");

        if (!button || !video) {
            return;
        }

        button.addEventListener("click", function () {
            startHlsPlayback(player, video, status);
        });
    });
});

function startHlsPlayback(player, video, status) {
    var source = video.getAttribute("data-source");

    if (!source) {
        setPlayerStatus(status, "当前影片未配置播放源");
        return;
    }

    setPlayerStatus(status, "正在加载播放源...");

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.controls = true;
        player.classList.add("playing");
        playVideo(video, status);
        return;
    }

    loadHlsLibrary()
        .then(function () {
            if (!window.Hls || !window.Hls.isSupported()) {
                setPlayerStatus(status, "当前浏览器不支持 HLS 播放");
                return;
            }

            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            hls.loadSource(source);
            hls.attachMedia(video);

            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.controls = true;
                player.classList.add("playing");
                playVideo(video, status);
            });

            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    setPlayerStatus(status, "播放线路加载失败，请检查 m3u8 源是否可访问");
                    hls.destroy();
                }
            });
        })
        .catch(function () {
            setPlayerStatus(status, "HLS 播放库加载失败");
        });
}

function playVideo(video, status) {
    var promise = video.play();

    if (promise && typeof promise.then === "function") {
        promise
            .then(function () {
                setPlayerStatus(status, "正在播放");
            })
            .catch(function () {
                setPlayerStatus(status, "请再次点击视频区域开始播放");
            });
    } else {
        setPlayerStatus(status, "正在播放");
    }
}

function loadHlsLibrary() {
    if (window.Hls) {
        return Promise.resolve();
    }

    return new Promise(function (resolve, reject) {
        var existing = document.querySelector("script[data-hls-library]");

        if (existing) {
            existing.addEventListener("load", resolve);
            existing.addEventListener("error", reject);
            return;
        }

        var script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
        script.async = true;
        script.setAttribute("data-hls-library", "true");
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function setPlayerStatus(status, message) {
    if (status) {
        status.textContent = message;
    }
}
