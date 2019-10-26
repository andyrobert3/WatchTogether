const socket = io.connect('http://localhost:3000');

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

// server socket listeners 
socket.on('seek', data => {
  if (player)
    player.seekTo(data, true);
});

socket.on('play', () => {
  player.playVideo();
});

socket.on('pause', () => {
  player.pauseVideo();
});