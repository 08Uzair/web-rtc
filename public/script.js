const signalingServer = new WebSocket(`wss://${location.host}`);
const peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
});

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then((stream) => {
        localVideo.srcObject = stream;
        stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));
    })
    .catch((error) => console.error('Error accessing media devices.', error));

peerConnection.ontrack = (event) => {
    remoteVideo.srcObject = event.streams[0];
};

peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
        signalingServer.send(JSON.stringify({ candidate: event.candidate }));
    }
};

signalingServer.onmessage = async (message) => {
    const data = JSON.parse(message.data);

    if (data.offer) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        signalingServer.send(JSON.stringify({ answer }));
    }

    if (data.answer) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
    }

    if (data.candidate) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
};

signalingServer.onopen = async () => {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    signalingServer.send(JSON.stringify({ offer }));
};
