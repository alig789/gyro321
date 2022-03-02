//Javascript file script.js 
//CS321 Gyroscope project
//
//This file will be the script used to direct mobile users to the gyroscope file.
//Any non-mobile users are not supposed to be visiting this file.
//
//


//We do not necessarily need to validate for mobile/desktop clients, the scripts will just record null values for non-mobile users.

//Initialize the Gyroscope object for the mobile user
let gyroObject = new Gyroscope(0);
let display = new displayCanvas();
let frameCounter = 0;

//This is the recursive function that will keep updating the gyroscope and display canvas
function runGyroscope() {
    gyroObject.update();
    display.update();
    frameCounter++;
    requestAnimationFrame(runGyroscope);
}

runGyroscope();



