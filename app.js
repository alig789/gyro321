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

var average_orientation = [0, 0, 0];
var average_position = [0, 0, 3];
var average_velocity = [0, 0, 0];

io.on('connection', (socket) => {

    let new_phone = new phoneGyro(socket.id);
    

    addClient(new_phone);
    io.emit('assign_id', new_phone.id);

    console.log(`user ${new_phone.num_id} connected`);
    client_count++;
    io.to(new_phone.socket_id).emit('new_connect', new_phone.num_id);
    io.emit('update_count', client_count);



    socket.on('disconnect', () => {
        console.log(`user ${new_phone.num_id} disconnected`);
        clients[new_phone.num_id] = null;
        client_count--;
        
        io.emit('update_count', client_count,average_position);

    
    });

    socket.on('created_gyro', (gyroObject,id) => {
        console.log('recieved new gyro '+id);

        clients[id].gyroData = gyroObject;

    });
    socket.on('gyro_update', (id, x,y,z,ball_pos,gyro_enabled,velocity) => {
        //console.log('recieved gyro update' + id);
        if (clients[id] != null) {
            if (clients[id].gyroData != null) {
                clients[id].gyroData.x = x;
                clients[id].gyroData.y = y;
                clients[id].gyroData.z = z;
                clients[id].ball_pos = ball_pos;
                clients[id].gyroData.enabled = gyro_enabled;
                clients[id].velocity = velocity;
                averageOrientation(clients);
                io.emit('average_orientation', average_orientation,average_position,average_velocity)
            }
        }


    });
    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
        console.log(clients);
        console.log('Average orientation: ' + average_orientation);
        console.log('Average position: ' + average_position);
        console.log(`connected clients = ${client_count}`)
		io.emit('chat message', msg);
		
    });
    socket.on('reset', () => {
        average_position = [0, 0, 3];
        average_velocity = [0, 0, 0];
        io.emit('client_reset')
        //average_position = [0, 0, 3];
        //io.emit('average_orientation', average_orientation, average_position);
        //average_orientation = [0, 0, 0];
        //io.emit('chat message', msg);

    });

    socket.on('orientation', (id) => {
        console.log('message: orientation '+id);

        clients[id].gyroData.x = 23;
        clients[id].gyroData.y = 25;
        clients[id].gyroData.z = 26;



    });
    


});




server.listen(port, () => {
    console.log('listening on *:3000');
});

class phoneGyro {
    constructor(socket_id, num_id, gyroData) {
        this.socket_id = socket_id;
        this.num_id = null;
        this.gyroData = null;
        this.ball_pos = null;
        this.velocity = null;
        
    }
}

function addClient(new_phone) {
    console.log(clients.length);

    for (let i = 0; i < clients.length; i++) {
        if (clients[i] == null) {
            clients[i] = new_phone;
            new_phone.num_id = i;
            return;
        }
    }
    new_phone.num_id = clients.length;
    clients.push(new_phone);
    return;
}

function averageOrientation(phone_array) {

    num_phones = 0;
    big_x = 0;
    big_y = 0;
    big_z = 0;

    pos_x = 0;
    pos_y = 0;
    pos_z = 0;

    vel_x = 0;
    vel_y = 0;
    vel_z = 0;

    for (i = 0; i < phone_array.length; i++) {
        if (phone_array[i] == null) {
            continue;
        }
        else {
            if (phone_array[i].gyroData != null && phone_array[i].ball_pos != null && phone_array[i].velocity != null && phone_array[i].gyroData.enabled == true) {
                big_x += phone_array[i].gyroData.x;
                big_y += phone_array[i].gyroData.y;
                big_z += phone_array[i].gyroData.z;

                pos_x += phone_array[i].ball_pos.x;
                pos_y += phone_array[i].ball_pos.y;
                pos_z += phone_array[i].ball_pos.z;

                vel_x += phone_array[i].velocity.x;
                vel_y += phone_array[i].velocity.y;
                vel_z += phone_array[i].velocity.z;
                num_phones++;
            }
        }
    }
    if (num_phones > 0) {
        average_orientation = [big_x / num_phones, big_y / num_phones, big_z / num_phones];
        average_position = [pos_x / num_phones, pos_y / num_phones, pos_z / num_phones];
        average_velocity = [vel_x / num_phones, vel_y / num_phones, vel_z / num_phones];
    }
    else {
        average_orientation = [0, 0, 0];
        average_velocity = [0, 0, 0];
    }
    
}

//First we will add the deviceorientation events, and later we will intialize them into Javascript variables.

//This is where we are temporarily storing the values.  Each Gyroscope client/Object made from script.js will have it's own x, y, z.
