/*--------ROSとの通信----------*/
var ros = new ROSLIB.Ros({ url : 'ws://' + location.hostname + ':9000' });

ros.on('connection', function(){ console.log("WebSocket: connected");});
ros.on('error', function(error){ console.log("WebSocket error: ", error);});
ros.on('close', function(){ console.log("WebSocket: closed");});

var pfoe_node = new ROSLIB.Topic({
    ros : ros,
    name : '/pfoe_out',
    messageType : 'raspimouse_gamepad_teach_and_replay/PFoEOutput'
});

var buttons_node = new ROSLIB.Topic({
    ros : ros,
    name : '/buttons',
    messageType : 'raspimouse_ros_2/ButtonValues'
});

var WebButtons = new ROSLIB.Service({
    ros : ros,
    name : '/web_buttons',
    serviceType : 'raspimouse_ros_2/WebButtons'
});

var cmdvel_node = new ROSLIB.Topic({
    ros : ros,
    name : '/cmd_vel',
    messageType : 'geometry_msgs/Twist'
});

var lightsensors = new ROSLIB.Topic({
    ros : ros,
    name : '/lightsensors',
    messageType : 'raspimouse_ros_2/LightSensorValues'
});

var request = new ROSLIB.ServiceRequest({
    front : false,
    mid : false,
    rear : false,
    front_toggle : false,
    mid_toggle : false,
    rear_toggle : false
});

buttons_node.subscribe(function(message) {
    request.front = message.front;
    request.mid = message.mid;
    request.rear = message.rear;
    request.front_toggle = message.front_toggle;
    request.mid_toggle = message.mid_toggle;
    request.rear_toggle = message.rear_toggle;
});

var max_event;
var recent_max_event = 0;

pfoe_node.subscribe(function(message) {
    particles_pos = message.particles_pos;
    eta = message.eta;
    document.getElementById("eta").innerHTML = Math.round(eta*1000)/1000;
    for (i = 0; i < recent_max_event; i++) {
        y[i] = 0;
    }
    max_event = Math.max.apply(null,particles_pos);
    if(max_event > recent_max_event){
        recent_max_event = max_event;
        for (i = 0; i < max_event; i++){
            x[i] = i;
        }
    }
    requestAnimationFrame(update);
});

cmdvel_node.subscribe(function(message) {
    linear_x = message.linear.x;
    angular_z = message.angular.z;
    document.getElementById("linear_x").innerHTML = Math.round(linear_x*10000)/10000;
    document.getElementById("angular_z").innerHTML = Math.round(angular_z*10000)/10000;
});

lightsensors.subscribe(function(message) {
    right_forward = message.right_forward;
    right_side = message.right_side;
    left_side = message.left_side;
    left_forward = message.left_forward;
    document.getElementById("right_forward").innerHTML = right_forward
    document.getElementById("right_side").innerHTML = right_side;
    document.getElementById("left_side").innerHTML = left_side;
    document.getElementById("left_forward").innerHTML = left_forward;
});

var n = 1000;
var x = [], y = [];

for (i = 0; i < recent_max_event; i++) {
    y[i] = 0;
}

function normalize(){
    var sum = 0.0;
    for (var i = 0; i < recent_max_event; i++) {
        sum += y[i];
    }
    for (var i = 0; i < recent_max_event; i++) {
        y[i] /= sum;
    }
}

Plotly.plot('graph', [{
    x: x,
    y: y,
    type: 'bar',
}], {
	xaxis: {range: [0, max_event],showgrid: false,title:"Episodes [0.1s]"},
    yaxis: {range: [0, 0.5],title:"Probability (Weight)"},
    /*margin: {
        l: 45,
        r: 45,
        b: 45,
        t: 45,
    }*/
},{displayModeBar: false,staticPlot: true})

function compute () {
    for (var i = 0; i < n; i++) {
        y[particles_pos[i]] += 0.1;
    }
}

var changes = {
    xaxis: {range: [0, max_event],title:"Episodes [0.1s]"}
};

function update () {
    compute();
    normalize();
    Plotly.redraw('graph');
    Plotly.relayout('graph', changes);
    /*Plotly.animate('graph', {
        data: [{x: x,y: y,type: 'bar'}],
    },{
        transition: {
            duration: 0,
            easing: 'linear'
        },
        frame: {
            duration: 0,
            redraw: true
            //redraw: false
        }
    });*/
}
