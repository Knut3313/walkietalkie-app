const socket = io();
let mediaRecorder;
let audioChunks = [];

navigator.mediaDevices.getUserMedia({ audio: true })
.then(stream => {

    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = e => {
        audioChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunks);
        socket.emit("voice", blob);
        audioChunks = [];
    };

});

const btn = document.getElementById("talkBtn");

btn.onmousedown = () => mediaRecorder.start();
btn.onmouseup = () => mediaRecorder.stop();

socket.on("voice", data => {
    const audio = new Audio(URL.createObjectURL(data));
    audio.play();
});