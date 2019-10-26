const socket = io.connect('http://localhost:5000');

// time constants
const interval = 500;
const margin = 0.07;
const latency = 0.1;

// initial setup
let tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";

let firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

let player;

function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '390',
    width: '640',
    videoId: 'M7lc1UVf-VE',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange,
    }
  });
}

const onPlayerReady = event => {
  event.target.playVideo();

  let previousTime = -1;

  const checkPlayerTime = () => {
      if (previousTime != -1) {
          if (player.getPlayerState() == YT.PlayerState.PLAYING) {
              const currTime = player.getCurrentTime();
              socket.emit('play');

              let timeDifference = Math.abs(currTime - previousTime - interval/1000);
              if (timeDifference > margin) {
                socket.emit('seek', player.getCurrentTime() + latency);                 
              }
          }
      }
      previousTime = player.getCurrentTime();
      setTimeout(checkPlayerTime, interval); 
  }

  setTimeout(checkPlayerTime, interval);  
}


const onPlayerStateChange = event => {
  if (event.data == YT.PlayerState.PAUSED) {
    socket.emit('pause');
  }
}
  
function youtubeParser(url){
  var videoid = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
  if (videoid != null) {
    console.log("video id = ",videoid[1]);
    return videoid[1];
  } else { 
    console.log("The youtube url is not valid.");
    return null;
  }
}


function changeVideo() {
  let videoUrl = document.getElementById("video_input").value;
  const videoId = youtubeParser(videoUrl);

  if (videoId == null) {
    alert(`${videoUrl} is an invalid URL`);
  } else {
    player.loadVideoById(videoId);
    socket.emit('changeVideo', videoId);
  }
}

// server socket listeners 
socket.on('seek', data => {
  if (player)
    player.seekTo(data, true);
});

socket.on('changeVideo', videoId => {
  if (player)
    player.loadVideoById(videoId);
});

socket.on('play', () => {
  if (typeof player !== 'undefined') {
    player.playVideo();
  }
});

socket.on('pause', () => {
  player.pauseVideo();
});