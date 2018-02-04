/*--------ROSとの通信----------*/
var ros = new ROSLIB.Ros({ url : 'ws://' + location.hostname + ':9000' });

ros.on('connection', function(){ console.log("WebSocket: connected");});
ros.on('error', function(error){ console.log("WebSocket error: ", error);});
ros.on('close', function(){ console.log("WebSocket: closed");});

var pfoe_node = new ROSLIB.Topic({
    ros : ros,
    name : '/pfoe_out',
    messageType : 'raspimouse_gamepad_teach_and_replay_clustering/PFoEOutput'
});

var buttons_node = new ROSLIB.Topic({
    ros : ros,
    name : '/buttons',
    messageType : 'raspimouse_ros_2/ButtonValues'
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

var WebButtons = new ROSLIB.Service({
    ros : ros,
    name : '/web_buttons',
    serviceType : 'raspimouse_ros_2/WebButtons'
});

var request = new ROSLIB.ServiceRequest({
    front : false,
    mid : false,
    rear : false,
    front_toggle : false,
    mid_toggle : false,
    rear_toggle : false
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

buttons_node.subscribe(function(message) {
    request.front = message.front;
    request.mid = message.mid;
    request.rear = message.rear;
    request.front_toggle = message.front_toggle;
    request.mid_toggle = message.mid_toggle;
    request.rear_toggle = message.rear_toggle;
});

delta_x = 0;
delta_y = 0;

function cmd_pub(){
    if(request.mid_toggle == false){
        var msg = new ROSLIB.Message({linear:{x:-delta_y,y:0,z:0}, angular:{x:0,y:0,z:-delta_x}});
        cmdvel_node.publish(msg);
    }
}
setInterval(cmd_pub,100);

var max_event;
var recent_max_event = 0;

var max_prob;
var recent_max_prob = 0;

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
        console.log("Over",recent_max_event)
        for (i = 0; i < recent_max_event; i++){
            x[i] = i;
        }
    }
    requestAnimationFrame(update);
});

var n = 1000;
var x = [], y = [];

for (i = 0; i < recent_max_event; i++) {
    y[i] = 0;
}

Plotly.plot('graph', [{
    x: x,
    y: y,
    line: {width: 0.5,color: 'rgb(0, 0, 0)'}
}], {
    xaxis: {range: [0, 1000],showgrid: false},
    yaxis: {range: [0, 0.01]},
    margin: {
        l: 25,
        r: 25,
        b: 25,
        t: 25,
    }
},{displayModeBar: false,staticPlot: true})

function compute () {
    for (var i = 0; i < n; i++) {
        y[particles_pos[i]] += 1;
    }
    for (var i = 0; i < recent_max_event; i++) {
        if(y[i] > recent_max_prob){
            recent_max_prob = y[i];
        }
    }
}

function update () {
    compute();
    Plotly.relayout('graph', {
        xaxis: {range: [0, recent_max_event],showgrid: false},
        yaxis: {range: [0, recent_max_prob]}
    });
    //Plotly.redraw('graph');
    Plotly.animate('graph', {
        data: [{x: x,y: y}],
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
    });
}

var canvas_box = document.getElementById('canvas-box');
var canvas = document.getElementById('virtual-pad');
var mode = 0;

var updateXY = function(event) {
    var touchObject = event.changedTouches[0] ;
    var moveX = touchObject.pageX ;
    var moveY = touchObject.pageY ;
    var clientRect = canvas.getBoundingClientRect() ;
    var positionX = clientRect.left + window.pageXOffset ;
    var positionY = clientRect.top + window.pageYOffset ;

    touch_x = moveX - positionX;
    touch_y = moveY - positionY;
};


function draw(x,y) {
    canvas.width = canvas_box.clientWidth * 2;
    canvas.height = canvas_box.clientHeight * 2;
    canvas.style.width = String(canvas.width * 0.5) + "px";
    canvas.style.height = String(canvas.height * 0.5) + "px";

    if ( ! canvas || ! canvas.getContext ) { return false; }
    var ctx = canvas.getContext('2d');
    ctx.scale(2, 2);

    ctx.beginPath();
    ctx.arc(x, y, mm_w * 0.1, 0, Math.PI * 2, true);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(vp_hc, vp_hc, joyring_r, 0, Math.PI * 2, true);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(vp_hc, (vp_hc - 100), joyring_r, 0, Math.PI * 2, true);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(vp_hc, (vp_hc + 100), joyring_r, 0, Math.PI * 2, true);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc((vp_hc + 100), vp_hc, joyring_r, 0, Math.PI * 2, true);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc((vp_hc - 100), vp_hc, joyring_r, 0, Math.PI * 2, true);
    ctx.stroke();
}

Number.prototype.format = function(char, cnt){
  return (Array(cnt).fill(char).join("") + this.valueOf()).substr(-1*cnt);
}

canvas.addEventListener('touchstart', function(event) {
    updateXY(event);

    //上
    if((vp_hc - (joyring_r) <= touch_x) && (vp_hc + (joyring_r) >= touch_x)){
        if((vp_hc - (joyring_r) - 100 <= touch_y) && (vp_hc + (joyring_r) - 100 >= touch_y)){
            draw(vp_hc,(vp_hc - 100));
            delta_x = 0.0;
            delta_y = -0.2;
            mode = 1;
        }
    }
    //下
    if((vp_hc - (joyring_r) <= touch_x) && (vp_hc + (joyring_r) >= touch_x)){
        if((vp_hc - (joyring_r) + 100 <= touch_y) && (vp_hc + (joyring_r) + 100 >= touch_y)){
            draw(vp_hc,(vp_hc + 100));
            delta_x = 0.0;
            delta_y = 0.2;
            mode = 1;
        }
    }
    //右
    if((vp_hc - (joyring_r) + 100 <= touch_x) && (vp_hc + (joyring_r) + 100 >= touch_x)){
        if((vp_hc - (joyring_r) <= touch_y) && (vp_hc + (joyring_r) >= touch_y)){
            draw((vp_hc+100),vp_hc);
            delta_x = 1.57079608;
            delta_y = 0.0;
            mode = 1;

        }
    }
    //左
    if((vp_hc - (joyring_r) - 100 <= touch_x) && (vp_hc + (joyring_r) - 100 >= touch_x)){
        if((vp_hc - (joyring_r) <= touch_y) && (vp_hc + (joyring_r) >= touch_y)){
            draw((vp_hc-100),vp_hc);
            delta_x = -1.57079608;
            delta_y = 0.0;
            mode = 1;
        }
    }
    if(mode == 0){
        draw(touch_x,touch_y);
    }
    pubMotorValues();
}, false);

canvas.addEventListener('touchmove', function(event) {
    event.preventDefault(); // タッチによる画面スクロールを止める
    updateXY(event);
    if(mode==0){
        draw(touch_x,touch_y);
        delta_x = (touch_x - (canvas_box.clientWidth * 0.5)) * 0.1 * 3.14 / 32;
        delta_y = (touch_y - (canvas_box.clientWidth * 0.5)) * 0.01 * 0.2;
    }
}, false);

canvas.addEventListener('touchend', function(event) {
    updateXY(event);
    draw(vp_hc, vp_hc);
    mode=0;
    delta_x = 0;
    delta_y = 0;
},false);


//画面の縦幅を自動調整
$(function(){
    $('.status-box').css('height',
        $("body").outerHeight(true) -
        $("#first_box").outerHeight(true) -
        $("#footer").outerHeight(true) -
        $("#second-status-header").outerHeight(true) - 11);
});

$(function(){
    $("#modal-open").click(function(){
        mm_w = $("#modal-main").width();
        $('#modal-main').css('height', mm_w);
        $('#virtual-pad').css({
            "width": mm_w,
            "height": mm_w});

        var b_w = $("body").width();
        var b_h = $("body").height();
        var ps_w = $("#pad_stop").width();

        $('#modal-main').css('display',"block");
        $('#modal-main').css('display',"none");

        $('#pad_stop').css({
            "left":(b_w * 0.5) - (ps_w * 0.5),
            "top":(b_h * 0.5) + (mm_w * 0.5) + 20
        });
        $('#modal-main_menu').css({
            "left":0,
            "top":(b_h * 0.5) - (mm_w * 0.5) - 50
        });

        $("body").append('<div id="modal-bg"></div>');

        modalResize();

        $("#modal-bg,#modal-main").fadeIn("slow");
        $("body").append('<div id="pad_stop"></div>');

        /*------キャンパス初期化-------*/
        vp_h = $("#virtual-pad").outerHeight(true);
        vp_hc = vp_h * 0.5;
        joyring_r = mm_w * 0.11;
        draw(vp_hc, vp_hc);
        /*-----------------------------*/

        //画面のどこかをクリックしたらモーダルを閉じる
        $("#pad_stop").click(function(){
            $("#modal-main,#modal-bg").fadeOut("slow",function(){
                $('#modal-bg').remove();
            });
        });
        $(window).resize(modalResize);
        function modalResize(){
            var w = $(window).width();
            var h = $(window).height();
            var cw = $("#modal-main").outerWidth();
            var ch = $("#modal-main").outerHeight();

            $("#modal-main").css({
                "left": ((w - cw) / 2) + "px",
                "top": ((h - ch) / 2) + "px"
            });
        }
    });
});
