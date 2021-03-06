const port = 3001;
const app = require('express')();
const http = require('http').createServer(app);
const ws = require('socket.io')(http, {
    cors : {
        origin : "http://localhost:3000",
        methods : ["GET", "POST"]
    }
})
const axios = require('axios').default;

const baseURL = "http://localhost:8000/"
const sendURL = baseURL.concat("messaging/send/")

let connectedIDs = []

function printConnections() {
    connectedIDs.forEach(function(connection) {
        console.log("user ", connection.user_id, " on ", connection.socket_id);
    })
}

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

http.listen(port, () => {
  console.log('listening on *:', port);
});

ws.on('connection', (socket) => {
    console.log("a user connected")
    // console.log(socket.id)
    // console.log(socket.handshake.headers.user_id)
    connectedIDs.push(
        {
            user_id: socket.handshake.headers.user_id,
            socket_id: socket.id,
            socket : socket
        })
    printConnections();

    socket.on('disconnect', () => {
        console.log("disconnect")
        connectedIDs = connectedIDs.filter((c) => {
            return c.socket_id !== socket.id 
        })
        printConnections()
    })

    socket.on('message-send', (message) => {
        console.log(message)

        axios.post(sendURL, message, { withCredentials: true })
        .then((response) => {
            console.log("success")
        })
        .catch((response) => {
            console.log("failure")
        })

        targets = connectedIDs.filter((c) => {
            // todo determine why strict equality fails here
            return (c.user_id == message.recipient_id);
        })
        // console.log(targets)

        for(let i = 0; i < targets.length; i++) {
            targets[i].socket.emit('message-to-client', message)
            console.log("message sent")
        }
    })
})