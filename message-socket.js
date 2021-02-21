const port = 3001;
const app = require('express')();
const http = require('http').createServer(app);
const ws = require('socket.io')(http, {
    cors : {
        origin : "http://localhost:3000",
        methods : ["GET", "POST"]
    }
})

let connectedIDs = []

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
    console.log("Sessions:", connectedIDs)

    socket.on('disconnect', () => {
        console.log("disconnect")
        connectedIDs = connectedIDs.filter((c) => {
            return c.socket_id !== socket.id 
        })
        console.log("Sessions:", connectedIDs)
    })

    socket.on('message-send', (message) => {
        console.log(message)

        targets = connectedIDs.filter((c) => {
            // todo determine why strict equality fails here
            return (c.user_id == message.recipient_id);
        })
        console.log(targets)

        for(let i = 0; i < targets.length; i++) {
            targets[i].socket.emit('message-to-client', message)
            console.log("message sent")
        }
    })
})