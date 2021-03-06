const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const CANNON = require("./public/cannon.min.js");
const io = new Server(server);

const { instrument } = require("@socket.io/admin-ui");
instrument(io, {
    auth: false,
    namespaceName: "/"
});


var port = process.env.PORT || 3000 || 'current_local_ip';

app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


var clients = [];//the array of connected clients phoneGyro ob
var client_count = 0;
var index = 0;
var default_pos = [0, 0, 3];


var average_orientation = [0, 0, 0];
let level_array = [];
let level0 = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 3, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 4, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 4, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]]
level_array.push(level0);
let level1 = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 1, 1, 1, 0, 0, 1],
    [1, 0, 0, 1, 1, 1, 1, 0, 0, 1],
    [1, 3, 0, 1, 4, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 4, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 1, 1, 1, 0, 0, 1],
    [1, 0, 0, 1, 1, 1, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]]
level_array.push(level1);
let level2 = [
    [1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [1, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]]
level_array.push(level2);
let level3 = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 3, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    [1, 4, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 4, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]]
level_array.push(level3);
let level4 = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 4, 4, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1],
    [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 3, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    [1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]]
level_array.push(level4);
let level5 = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 3, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]]
level_array.push(level5);
let level6 = [
    [2, 2, 2, 0, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 4, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 0, 0, 0, 2, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [0, 0, 0, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [0, 0, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 0, 0, 0, 2, 2, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 2, 2, 2, 2, 2],
    [2, 2, 0, 0, 2, 2, 2, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 2, 2, 2, 2],
    [0, 0, 0, 2, 2, 2, 2, 0, 3, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 2, 2, 2],
    [0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2],
    [0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0],
    [0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0],
    [0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0],
    [2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 2, 2, 0, 0, 2, 2, 2, 0, 2, 2, 2, 2, 2, 0],
    [2, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 0],
    [2, 2, 0, 0, 0, 0, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0],
    [2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0]]
level_array.push(level6);



var current_level = 0;

var world = new CANNON.World();
world.gravity.set(0, 0, -5); // m/s?


var fixedTimeStep = 1.0 / 60.0; // seconds
var maxSubSteps = 3;


let marble0 = createMarble(world, 0.5, 1, 1, 0, 0, 3); //create marble

body = new CANNON.Body({//create physics body for MAZE
    mass: 0
});
goal = new CANNON.Body({//create physics body for MAZE
    mass: 0
});
generate_level(level_array[current_level]);




// Start the simulation PHYSICS loop


//GAME LOGIC START
const hrtimeMs = function () {
    let time = process.hrtime()
    return time[0] * 1000 + time[1] / 1000000
}

const TICK_RATE = 30
let tick = 0
let previous = hrtimeMs()
let tickLengthMs = 1000 / TICK_RATE

const loop = () => {
    setTimeout(loop, tickLengthMs)
    let now = hrtimeMs()
    let delta = (now - previous) / 1000
    world.step(fixedTimeStep, delta, maxSubSteps);

    const euler = new CANNON.Vec3(average_orientation[0], average_orientation[1], average_orientation[2])
    //body.quaternion.setFromEuler(degrees_to_radians(euler.y), degrees_to_radians(euler.z),0, 'XYZ');
    world.gravity.y = average_orientation[1] / -5;
    world.gravity.x = average_orientation[2] / 5;
    if (marble0.position.z < -20) {
        reset();
    }
    //console.log(average_orientation);
    //console.log(body.quaternion);

    //io.emit('marble_info', serverMarble.position, serverMarble.quaternion)
    //io.emit('pivot_info', body.quaternion);
    //average_orientation[1]=5
    
    io.emit('average_orientation', average_orientation, marble0.position, marble0.velocity,timer_string)
    previous = now
    tick++
}

loop()


//GAME LOGIC END 



io.on('connection', (socket) => {

    let new_phone = new phoneGyro(socket.id);
    

    addClient(new_phone);
    io.emit('assign_id', new_phone.id);

    console.log(`user ${new_phone.num_id} connected`);
    client_count++;
    io.to(new_phone.socket_id).emit('new_connect', new_phone.num_id,current_level);
    io.emit('update_count', client_count);



    socket.on('disconnect', () => {
        console.log(`user ${new_phone.num_id} disconnected`);
        clients[new_phone.num_id] = null;
        client_count--;
        
        io.emit('update_count', client_count,0);

    
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
                
                //io.emit('average_orientation', average_orientation,marble0.position,marble0.velocity)
            }
        }


    });
    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
        console.log(clients);
        console.log("DEFAULT POS: " + default_pos);
        console.log('Average orientation: ' + average_orientation);
        //console.log('Average position: ' + average_position);
        console.log(`connected clients = ${client_count}`)
		io.emit('chat message', msg);
		
    });
    socket.on('reset', () => {
        reset();


    });

    socket.on('choose_level', () => {
        next_level();

    });


    socket.on('orientation', (id) => {
        console.log('message: orientation '+id);

        clients[id].gyroData.x = 23;
        clients[id].gyroData.y = 25;
        clients[id].gyroData.z = 26;

    });
    


});




server.listen(port,'0.0.0.0', () => {
    console.log('listening on *:3000');
    
});

function next_level() {
    current_level++;
    if (current_level >= level_array.length) {
        current_level = 0;
    }
    clearInterval(timerVar);
    timerVar = setInterval(countTimer, 100);
    generate_level(level_array[current_level]);
    io.emit('level_selected', current_level);
}

function reset() {
    marble0.velocity.x = 0;
    marble0.velocity.y = 0;
    marble0.velocity.z = 0;
    marble0.position.x = default_pos[0];
    marble0.position.y = default_pos[1];
    marble0.position.z = default_pos[2];
    marble0.wakeUp();
    clearInterval(timerVar);
    timerVar = setInterval(countTimer, 100);
    totalSeconds = 0;
}

function generate_level(level) {
    world.remove(body);
    world.remove(goal);
    body = new CANNON.Body({//create physics body for MAZE
        mass: 0
    });
    goal = new CANNON.Body({//create physics body for MAZE
        mass: 0
    });
    //create floor
    for (let i = 0; i < level.length; i++) {
        for (let j = 0; j < level[i].length; j++) {

            if (level[i][j] == 0 || level[i][j] == 3) {
                createBoxShape(world, body, 1, 1, 1, i - (level.length / 2), j - (level[0].length / 2), 0);
            }
            if (level[i][j] == 4) {
                createBoxShape(world, goal, 1, 1, 1, i - (level.length / 2), j - (level[0].length / 2), 0);
            }
        }
    }


    for (let i = 0; i < level.length; i++) {
        for (let j = 0; j < level[i].length; j++) {

            if (level[i][j] == 1) {
                createBoxShape(world, body, 1, 1, 1, i - (level.length / 2), j - (level[0].length / 2), 1);
            }
            if (level[i][j] == 3) {
                default_pos[0] =  i-(level.length / 2);
                default_pos[1] =  j-(level[0].length / 2);
            }
        }
    }
    goal.addEventListener("collide", function (e) {
        level_complete();
    });
    world.addBody(body);
    world.addBody(goal);

    reset();
}

function level_complete() {
    
    clearInterval(timerVar);
    marble0.sleep();
    io.emit('level_complete', timer_string);
    setTimeout(next_level, 5000);

}

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



    for (i = 0; i < phone_array.length; i++) {
        if (phone_array[i] == null) {
            continue;
        }
        else {
            if (phone_array[i].gyroData != null && phone_array[i].gyroData.enabled == true) {
                big_x += phone_array[i].gyroData.x;
                big_y += phone_array[i].gyroData.y;
                big_z += phone_array[i].gyroData.z;

                num_phones++;
            }
        }
    }
    if (num_phones > 0) {
        average_orientation = [big_x / num_phones, big_y / num_phones, big_z / num_phones];

    }
    else {
        average_orientation = [0, 0, 0];

    }
    
}

function createMarble(world, xscale, yscale, zscale, xpos, ypos, zpos) { //create our marble. We only need 1


    var sphereBody = new CANNON.Body({ //create physics body
        mass: 5, // kg
        position: new CANNON.Vec3(xpos, ypos, zpos), // m
        shape: new CANNON.Sphere(xscale) //radius
    });
    world.addBody(sphereBody); //Add PHYSICS body to world

    return sphereBody; //return our physicsbody and 3d body together

}
//createBoxShape will create both a THREE.js object and add it to our maze physics object "pivot"
function createBoxShape( world, body, xscale, yscale, zscale, xpos, ypos, zpos) {


    boxBody = new CANNON.Box(new CANNON.Vec3(xscale / 2, yscale / 2, zscale / 2));
    body.addShape(boxBody, new CANNON.Vec3(xpos, ypos, zpos));



    return;

}


function degrees_to_radians(degrees) { //orientation is stored in degrees
    var pi = Math.PI;
    return degrees * (pi / 180);
}
//First we will add the deviceorientation events, and later we will intialize them into Javascript variables.

//This is where we are temporarily storing the values.  Each Gyroscope client/Object made from script.js will have it's own x, y, z.
var timerVar;
var totalSeconds = 0;

var timer_string = "";
function countTimer() {
    ++totalSeconds;

    var minute = Math.floor((totalSeconds / 10) / 60);
    var seconds = (totalSeconds / 10 - (minute * 60)).toFixed(1);
    var milliseconds = 5;

    if (minute < 10)
        minute = "0" + minute;
    if (seconds < 10)
        seconds = "0" + seconds;
    timer_string = minute + ":" + seconds
    
}


