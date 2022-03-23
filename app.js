const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);


var port = process.env.PORT || 3000 || 'current_local_ip';

app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

var clients = [];
var client_count = 0;
var index = 0;

io.on('connection', (socket) => {

    let new_phone = new phoneGyro(socket.id, index++);
    console.log(`user ${new_phone.num_id} connected`);
    clients.push(new_phone)
    client_count++;
    io.to(new_phone.socket_id).emit('new_connect', new_phone.num_id);
    io.emit('update_count', client_count);



    socket.on('disconnect', () => {
        console.log(`user ${new_phone.num_id} disconnected`);
        clients[new_phone.num_id] = null;
        client_count--;
        io.emit('update_count', client_count);

    
    });

    socket.on('created_gyro', (gyroObject,id) => {
        console.log('recieved gyro '+id);

        clients[id].gyroData = gyroObject;

    });
    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
        console.log(clients);
        console.log(`connected clients = ${client_count}`)
		io.emit('chat message', msg);
		
    });
    /*socket.on('orientation', (x,y,z) => {
        console.log('message: orientation');

        clients[new_phone.num_id].x = x;
        clients[new_phone.num_id].y = y;
        clients[new_phone.num_id].z = z;

        io.emit('update_gyro', new_phone);

    });
    */


});




server.listen(port, () => {
    console.log('listening on *:3000');
});

class phoneGyro {
    constructor(socket_id, num_id, gyroData) {
        this.socket_id = socket_id;
        this.num_id = num_id;
        this.gyroData = gyroData;
    }
}

//First we will add the deviceorientation events, and later we will intialize them into Javascript variables.

//This is where we are temporarily storing the values.  Each Gyroscope client/Object made from script.js will have it's own x, y, z.
