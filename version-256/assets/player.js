(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll(".movie-player"));

  players.forEach(function (player) {
    var video = player.querySelector("video");
    var button = player.querySelector(".player-start");
    var stream = player.getAttribute("data-stream");
    var started = false;
    var hlsInstance = null;

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    function start() {
      if (!video || !stream) {
        return;
      }
      player.classList.add("is-started");
      if (started) {
        playVideo();
        return;
      }
      started = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        playVideo();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        return;
      }
      video.src = stream;
      playVideo();
    }

    if (button) {
      button.addEventListener("click", start);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (!started) {
          start();
        }
      });
      video.addEventListener("ended", function () {
        if (hlsInstance) {
          hlsInstance.stopLoad();
        }
      });
    }
  });
})();
