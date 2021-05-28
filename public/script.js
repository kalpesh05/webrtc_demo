const socket = io('/');
// made object variable to store data
const peers = {};
// get reference to vide grid
const videoGridEle = document.getElementById('video-grid');

// peer server
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001'
});

// create video element
const myVideo = document.createElement('video');
// make self mic off
myVideo.muted = true;

// allow to video and audio for other user
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true
  })
  .then(stream => {
    // add video
    addVideoStream(myVideo, stream);

    // answer call to other user
    myPeer.on('call', call => {
      call.answer(stream);
      // add stream to answer call
      let video = document.createElement('video');
      call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
      });
    });

    // listen connect event
    socket.on('user-connected', userId => {
      connectedToNewUser(userId, stream);
    });
  });

// listen disconnet
socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close();
});

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id);
});

function connectedToNewUser(userId, videoStream) {
  const call = myPeer.call(userId, videoStream);
  const video = document.createElement('video');
  // get user call even
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream);
  });
  call.on('close', () => {
    video.remove();
  });
  peers[userId] = call;
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGridEle.append(video);
}
