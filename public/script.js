//Javascript file script.js 
//CS321 Gyroscope project
//
//This file will be the script used to direct mobile users to the gyroscope file.
//Any non-mobile users are not supposed to be visiting this file.
//
//


//We do not necessarily need to validate for mobile/desktop clients, the scripts will just record null values for non-mobile users.

//Initialize the Gyroscope object for the mobile user

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


function askPermission() {   //askPermission is an HTML requirement of iOS
    DeviceOrientationEvent.requestPermission() //This asks for permission (iOS requirement)
    window.addEventListener("deviceorientation", function (event) { //This listens to the phone orientation values
        controller.x = event.alpha;
        controller.y = event.beta;
        controller.z = event.gamma;
    });
}

//Android users will have their data automatically working on page load from this one.  It can be removed, the button above should also work.
if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", function (event) {
        controller.x = event.alpha;
        controller.y = event.beta;
        controller.z = event.gamma;

    });
}

