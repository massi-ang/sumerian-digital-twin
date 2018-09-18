import AWS from 'aws-sdk/global';
import iot from 'aws-iot-device-sdk';

var connected;
var device;

var msg = function(t) {
    document.getElementById("conn").innerText = t;
}

AWS.config.region = 'us-east-1';
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId : 'us-east-1:8a570d6a-d92e-4ecb-a843-2859663aa3e7', // your identity pool id here
    });
AWS.config.credentials.get(function(err) {
    if (err) {
        console.log(err);
        msg(err.toString());
        return;
    }
    var accessKeyId = AWS.config.credentials.accessKeyId;
    var secretAccessKey = AWS.config.credentials.secretAccessKey;
    var sessionToken = AWS.config.credentials.sessionToken;
    console.log('access key + '+accessKeyId);
    console.log('secret access key + '+secretAccessKey);
    console.log('session token + '+sessionToken);
    msg("Authenticated");
    device = iot.device({
        protocol: "wss",
        host: "a2uqpse4ucpn10.iot.us-east-1.amazonaws.com",
        accessKeyId: accessKeyId, 
        secretKey: secretAccessKey, 
        sessionToken:sessionToken, 
        clientId: "mobile"});

    device.on('connect', function() { 
        connected = true;
        console.log('connected');
        msg("Connected");
    });
    
    device.on('disconnect', function() { 
        connected = false;
        console.log('disconnected');
        msg("Disconnected");
    });
   
});

var lastTime = Date.now();

var tilt = function(p) {
    if (Date.now() - lastTime < 1000)
        return;
    lastTime = Date.now();
    document.getElementById("a").innerText = p.alpha.toFixed(0);
    document.getElementById("b").innerText = p.beta.toFixed(0);
    document.getElementById("g").innerText = p.gamma.toFixed(0);
    if (connected){
        var state = {state: {reported: { gamma: p.gamma.toFixed(0), beta: p.beta.toFixed(0)}}};
        device.publish('$aws/things/box/shadow/update', JSON.stringify(state));
    }
}
if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", function (event) {
        tilt(event);
    }, true);
}