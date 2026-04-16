const socket = io();
let localStream;
let peerConnection;

const statusText = document.getElementById("status");
const btn = document.getElementById("talkBtn");

const config = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};

navigator.mediaDevices.getUserMedia({ audio: true })
.then(stream => {
  localStream = stream;
})
.catch(() => alert("Mikrofon Zugriff verweigert!"));

btn.onmousedown = async () => {
  statusText.innerText = "🟢 Du sprichst...";
  statusText.className = "speaking";
  socket.emit("speaking", true);

  peerConnection = new RTCPeerConnection(config);

  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.onicecandidate = e => {
    if (e.candidate) {
      socket.emit("candidate", e.candidate);
    }
  };

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  socket.emit("offer", offer);
};

btn.onmouseup = () => {
  statusText.innerText = "🔴 Niemand spricht";
  statusText.className = "idle";
  socket.emit("speaking", false);

  if (peerConnection) {
    peerConnection.close();
  }
};

socket.on("offer", async offer => {
  peerConnection = new RTCPeerConnection(config);

  peerConnection.ontrack = e => {
    const audio = new Audio();
    audio.srcObject = e.streams[0];
    audio.play();
  };

  await peerConnection.setRemoteDescription(offer);

  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  socket.emit("answer", answer);
});

socket.on("answer", answer => {
  peerConnection.setRemoteDescription(answer);
});

socket.on("candidate", candidate => {
  if (peerConnection) {
    peerConnection.addIceCandidate(candidate);
  }
});

socket.on("speaking", isSpeaking => {
  if (isSpeaking) {
    statusText.innerText = "🟢 Jemand spricht...";
    statusText.className = "speaking";
  } else {
    statusText.innerText = "🔴 Niemand spricht";
    statusText.className = "idle";
  }
});
