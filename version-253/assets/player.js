
function setupMoviePlayer(config) {
  var video = document.getElementById(config.videoId);
  var button = document.getElementById(config.buttonId);
  var message = document.getElementById(config.messageId);
  var hlsInstance = null;
  var attached = false;

  if (!video || !button || !config.sourceUrl) {
    return;
  }

  function showMessage(text) {
    if (!message) {
      return;
    }
    message.textContent = text;
    message.classList.add("show");
    window.setTimeout(function () {
      message.classList.remove("show");
    }, 3200);
  }

  function attachSource() {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = config.sourceUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hlsInstance.loadSource(config.sourceUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hlsInstance.startLoad();
          showMessage("视频加载中，请稍后重试");
          return;
        }

        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hlsInstance.recoverMediaError();
          showMessage("视频加载中，请稍后重试");
          return;
        }

        hlsInstance.destroy();
        showMessage("视频暂时无法播放");
      });
      return;
    }

    showMessage("视频暂时无法播放");
  }

  function startPlayback() {
    attachSource();
    button.classList.add("is-hidden");
    video.play().catch(function () {
      window.setTimeout(function () {
        video.play().catch(function () {});
      }, 500);
    });
  }

  button.addEventListener("click", startPlayback);
  video.addEventListener("play", function () {
    button.classList.add("is-hidden");
  });
  video.addEventListener("pause", function () {
    if (video.currentTime === 0 || video.ended) {
      button.classList.remove("is-hidden");
    }
  });
  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
