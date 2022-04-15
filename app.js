const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const CANNON  = require("./public/cannon.min.js");
const io = new Server(server);


var port = process.env.PORT || 3000 || 'current_local_ip';

app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

var clients = [];
var client_count = 0;
var index = 0;

var world = new CANNON.World();
world.gravity.set(0, 0, -9.82); // m/s²

var fixedTimeStep = 1.0 / 60.0; // seconds
var maxSubSteps = 3;
var serverMarble = null;
var serverBoxes_pos = [];
var serverBoxes_scale = [];


startSimulation();

function startSimulation() {
    body = new CANNON.Body({
            mass: 0
    });
    serverMarble = createMarble(world, 1, 1, 1, 0, 0, 10);
    createBoxShape(world, body, 10, 10, 1, 0, 0, 0);
    createBoxShape(world, body, 1, 10, 1, 5, 0, 1);
    createBoxShape(world, body, 1, 10, 1, -5, 0, 1);
    
    world.addBody(body);
        
}
//GAME LOGIC

const hrtimeMs = function () {
    let time = process.hrtime()
    return time[0] * 1000 + time[1] / 1000000
}

const TICK_RATE = 20
let tick = 0
let previous = hrtimeMs()
let tickLengthMs = 1000 / TICK_RATE

const loop = () => {
    setTimeout(loop, tickLengthMs)
    let now = hrtimeMs()
    let delta = (now - previous) / 1000
    world.step(fixedTimeStep, delta, maxSubSteps);
    io.emit('marble_info', serverMarble.position, serverMarble.quaternion)
    io.emit('pivot_info', body.quaternion);
    body.quaternion.y+=0.001
   
    previous = now
    tick++
}

loop()

//GAME LOGIC END

io.on('connection', (socket) => {

    let new_phone = new phoneGyro(socket.id, index++);
    console.log(`user ${new_phone.num_id} connected`);
    clients.push(new_phone)
    client_count++;
    io.to(new_phone.socket_id).emit('new_connect', new_phone.num_id);
    io.emit('update_count', client_count);
    io.emit('server_boxes', serverBoxes_pos, serverBoxes_scale);
    io.emit('new_marble', serverMarble.radius);



    socket.on('disconnect', () => {
        console.log(`user ${new_phone.num_id} disconnected`);
        clients[new_phone.num_id] = null;
        client_count--;
        io.emit('update_count', client_count);

    
    });

    socket.on('created_gyro', (gyroObject,id) => {
        console.log('recieved new gyro '+id);

        clients[id].gyroData = gyroObject;

    });
    socket.on('gyro_update', (id, x,y,z) => {
        //console.log('recieved gyro update' + id);
        if (clients[id] != null) {
            if (clients[id].gyroData != null) {
                clients[id].gyroData.x = x;
                clients[id].gyroData.y = y;
                clients[id].gyroData.z = z;
                io.emit('average_orientation', averageOrientation(clients))
                
            }
        }


    });
    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
        console.log(clients);
        console.log('Average orientation: ' + averageOrientation(clients));
        console.log(`connected clients = ${client_count}`)
		io.emit('chat message', msg);
		
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
        this.num_id = num_id;
        this.gyroData = gyroData;
    }
}

function averageOrientation(phone_array) {

    num_phones = 0;
    big_x = 0;
    big_y = 0;
    big_z = 0;
    for (i = 0; i < phone_array.length; i++) {
        if (phone_array[i] == null) {
            continue;
        }
        else {
            if (phone_array[i].gyroData != null) {
                big_x += phone_array[i].gyroData.x;
                big_y += phone_array[i].gyroData.y;
                big_z += phone_array[i].gyroData.z;
                num_phones++;
            }
        }
    }
    if (num_phones > 0) {
        return [big_x / num_phones, big_y / num_phones, big_z / num_phones];
    }
    else {
        return null;
    }
}


function createMarble(world, xscale, yscale, zscale, xpos, ypos, zpos) {

    var sphereBody = new CANNON.Body({
        mass: 5, // kg
        position: new CANNON.Vec3(xpos, ypos, zpos), // m
        shape: new CANNON.Sphere(xscale)
    });
    world.addBody(sphereBody);
    
    //threejsBodies.push(sphere1);
    //cannonjsBodies.push(sphereBody);
    return sphereBody;

}

function createBoxShape(world, body, xscale, yscale, zscale, xpos, ypos, zpos) {


    var scale = new CANNON.Vec3(xscale , yscale , zscale); //for some reason cannon uses half scale of threejs
    var scale2 = new CANNON.Vec3(xscale / 2, yscale / 2, zscale / 2);
    var pos = new CANNON.Vec3(xpos, ypos, zpos);

    boxBody = new CANNON.Box(scale2);
    body.addShape(boxBody, pos);

    serverBoxes_pos.push(pos);
    serverBoxes_scale.push(scale);

    //cannonjsBodies.push(boxBody);
    return;


}


//First we will add the deviceorientation events, and later we will intialize them into Javascript variables.

//This is where we are temporarily storing the values.  Each Gyroscope client/Object made from script.js will have it's own x, y, z.
