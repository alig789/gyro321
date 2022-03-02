//First we will add the deviceorientation events, and later we will intialize them into Javascript variables.
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

//This is where we are temporarily storing the values.  Each Gyroscope client/Object made from script.js will have it's own x, y, z.
const controller = {
    x: 0,
    y: 0,
    z: 0
}

//This will be the main Gyroscope object, we can initialize it in the main (script.js) if we've confirmed a mobile device.
//That object can then use the functions within the class below.  
class Gyroscope {
    constructor(mobileUserId) {
        this.player = mobileUserId;
        this.x = controller.x
        this.y = controller.y
        this.z = controller.z
    }

    //We will call this function recursively from script.  It will return the device orientation data.
    update() {
        this.x = controller.x
        this.y = controller.y
        this.z = controller.z


        //Now that we have the X,Y,Z values, we need to send the data to the server and the client webpage will be finished.

        /*******
         * 
         * YOUR CODE HERE
         * 
         *******/
    }
}