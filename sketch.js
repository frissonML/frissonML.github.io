// Copyright (c) 2024 MIT
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

const serviceUuid = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E";

let writeCharacteristic,notifyCharacteristic;
let myValue = 0;
let myBLE;

var isConnected = 0;
var writeArr = new Uint8Array([20, 0, 0, 0]);

var elements = 4;

var vals = new Uint8Array([0, 0, 0, 255]);
var tsP = new Uint8Array([0, 10, 20, 25]);
var tlP = new Uint8Array([10, 20, 30, 30]);

// Location/Index of elements 20 - Pelter, 30 - Motor, 50 - Led
var actionP = new Uint8Array([20, 20, 20, 20]);
var locP = new Uint8Array([0, 3, 4, 2]);

var strength = 0 ;

let r,b,g;

let bcolor = '#228' ;
var introLine = "Frisson!";

let xPos = 0;

var pageCount = 0 ;

var P1_Start = 0.0
var P1_Stop = 1.0

var P2_Start = 1.0
var P2_Stop = 2.0
var P3_Start = 2.0
var P3_Stop = 3.0

var M1_Start = 2.5
var M1_Stop = 3.0

var Stimulus_Duration = 60
var Timings = '10,20,30'

var P1_Strength = 255
var P2_Strength = 255
var P3_Strength = 255
var M1_Strength = 30

// gui
var gui_visible = false;
var gui, gui2;


var timerStart = false;

var intervalId = null;

var timerArray = [] ;

var timerIndex = 0 ;

var gif,pg;



let playing = false;
let videoLoaded = false;
let vidSizeH = 1080 ;
let vidSizeV = 720 ;
let input;

var vidDuration = 0;


const socket = new WebSocket('ws://localhost:8766');

let sockOpen = false


let TCDB ="https://script.google.com/macros/s/AKfycbyF_6NTYmjoib8A_vxzhHUc8j1EgZG-3kaXCozIkzVMei2LDgvMg5Ou15P_NSNhZuIS/exec"
var isDBLoaded = false;


var myVideo;
var base_url = "https://www.youtube.com/embed/";


//var video_ids = ['fRm2csOPV1U','xJ2Je9TMIVs','ypjY0gLY0U4','ev-lJUFa-lg','AGRfJ6-qkr4'];
//var video_timings = ['10,20,30','5,10,15','10,20,30','5,10,15','5,10,15'];


var video_ids = [];
var video_timings = [];

var vid_imgs = [];

var video_url = "";

// YouTube player
var player;
var playerLoaded = false ;

let tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);



// Carousal Graphics

var carouselWidth; 
var currentVideoIndex = 0;
var carousalView = false;
var selectedVideo = 0;
var isVideoSelected = false;
var thumbnailOpacity = 1; 

var ccLeftButton;
var ccRightButton;
var backButton;

function preload(){
    
    fetchDB();
    
    logo = loadImage("assets/logo.png");
    gif = loadImage("assets/back.gif");
    frisson_img = loadImage("assets/frisson.png");
    
}

function setup() {
  // Create a p5ble class
  myBLE = new p5ble();
  r = 120;
  g = 150;
  b = 250;
//  gif.position(0,0);
//  gif.size(windowWidth,windowHeight);
//    
  createCanvas(windowWidth, windowHeight);
  //pg = createGraphics(windowWidth, windowHeight);
  background(gif);
  carouselWidth = windowWidth/3;
    
  // Create Shape GUI
  gui = createGui('Timings').setPosition(width - 220, 20);
  //colorMode(HSB);
  sliderRange(0, 6, 0.1);
  gui.addGlobals('P1_Start', 'P1_Stop', 'P2_Start', 'P2_Stop', 'P3_Start', 'P3_Stop',  'M1_Start', 'M1_Stop');
    
  sliderRange(0, 300, 1);
  gui.addGlobals('Stimulus_Duration', 'Timings');
    
  gui2 = createGui('Strength').setPosition(width - 440, 20);
  sliderRange(0, 255, 1);
  gui2.addGlobals('P1_Strength', 'P2_Strength', 'P3_Strength', 'M1_Strength');

    
  textSize(32);
  stroke(r, g, b);
  fill(0, 0, 0, 127);

  pg = createGraphics(600, 200);
//  input = createFileInput(handleFile);
//  input.position(100, 100);
    
    
    ccLeftButton = new Button({
    x: 60, y: windowHeight/2 - 100,
    width: 100, height: 50,
    align_x: 0, align_y: 0,
    content: '<--',
    on_press() {
      if(currentVideoIndex>0) currentVideoIndex--;
      ccLeftButton.text( '<--' );
    }
  });
    
    ccRightButton = new Button({
    x: windowWidth - 60, y: windowHeight/2 - 100,
    width: 100, height: 50,
    align_x: 0, align_y: 0,
    content: '-->',
    on_press() {
      if(currentVideoIndex < video_ids.length - 2) currentVideoIndex++;
      ccRightButton.text( '-->' );
    }
  });
    
     backButton = new Button({
    x: windowWidth/2, y: windowHeight - 100,
    width: 100, height: 50,
    align_x: 0, align_y: 0,
    content: '< Back',
    on_press() {
      isVideoSelected = false;
      carousalView = true;
      backButton.text( '< Back' );
      myVideo.hide();
      YT_reset_video();
    }
  });

    
    //loadYTVideo(video_ids[0]);
}


function fetchDB(){
     fetch(TCDB).then(function(response) {
        return response.json();
      })
      .then(function(myJson) {
        videoDB=myJson; // DB of videoIDs and ViewCount
        console.log(videoDB); 
        parseDB();
      });
}

function parseDB(){

    var i = 0

    for(let i = 1 ; i < videoDB.length ; i++){
        
        video_ids.push(videoDB[i][0]);
        video_timings.push(videoDB[i][1]);
    }

    console.log(video_timings);
    
  for(let i = 0; i < video_ids.length; i++) {

     vid_imgs.push(loadImage("http://cors-anywhere.herokuapp.com/http://img.youtube.com/vi/" + video_ids[i] + "/0.jpg"));
  }
    isDBLoaded = true;
}

function draw() {
    
    background(gif);
    image(logo,10,10,240,50);

    
    if(isConnected && gui_visible){
        gui.show();
        gui2.show();
    }  else {
        gui.hide();
        gui2.hide();
    }
    
    if(!isDBLoaded) return;
    
    if(isConnected) secondPage(true);
    else firstPage(true);
    
    if(isConnected){
    vals[0] = P1_Strength;
    vals[1] = P2_Strength;
    vals[2] = P3_Strength;
    vals[3] = M1_Strength;
    
    tsP[0] = P1_Start * 10;
    tsP[1] = P2_Start * 10;
    tsP[2] = P3_Start * 10;
    tsP[3] = M1_Start * 10;
    
    tlP[0] = P1_Stop * 10;
    tlP[1] = P2_Stop * 10;
    tlP[2] = P3_Stop * 10;
    tlP[3] = M1_Stop * 10;
    
    timerArray = video_timings[selectedVideo].split(",").filter(x => x.trim().length && !isNaN(x)).map(Number);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    background(gif);
    gui.setPosition(width - 220, 20);
    gui2.setPosition(width - 440, 20);
    carouselWidth = windowWidth/3;
    if(playerLoaded){
        myVideo.position(windowWidth/2 - 320, windowHeight/2 - 240);
    }
    
    ccLeftButton.place( 60, windowHeight/2 - 100,  100, 50);
    ccRightButton.place( windowWidth - 60, windowHeight/2 - 100,  100, 50);
     backButton.place(windowWidth/2, windowHeight - 100,  100,  50);
    
}

function mousePressed() {
  // Check if mouse is inside the circle
  let d = dist(mouseX, mouseY, windowWidth / 2, windowHeight / 2);
  if (d < 100) {

    console.log("click");
      
   if(!isConnected) {
    connectToBle();
    }
    else{ 
        
        if(!timerStart){
            intervalId = setInterval(timeIt, 1000);
            timerStart = true
        }
        else{
            clearInterval(intervalId);
            timerStart = false
        }
    }
  }
    
    
 if(carousalView){
    for(let i = 0; i < video_ids.length; i++) {
   
    let x = i * carouselWidth - currentVideoIndex * carouselWidth + carouselWidth/2;
    let y = -60;
    // Check if mouse over this video thumbnail 
     if (mouseX >= x &&  
      mouseX <= x + carouselWidth &&
      mouseY >= carouselWidth &&
      mouseY <= windowHeight + y ) {
      selectedVideo = i;
      console.log(selectedVideo);
      isVideoSelected = true;
      carousalView = false;
      YT_reset_video();
      myVideo.show();
      player.cueVideoById(video_ids[selectedVideo]);
      break;
    }
    
  }
 }

}


function firstPage(i){
    if(!i) return ;
       stroke(r, g, b);
       fill(r, g, b, 127);
       ellipse(windowWidth / 2, windowHeight / 2, 200, 200);
        
       //strokeWidth(2);
       stroke(0, 0, 0);
       fill(0, 102, 153);
       text("Connect ",windowWidth / 2 - 60, windowHeight / 2 + 5);
       ageCount = 1;
        
}


function secondPage(i){
    if(!i) return ;
    
    loadYTVideo(video_ids[0]);
    
    if(isVideoSelected){
    backButton.draw();
    //console.log('currentTime:', player.getCurrentTime(), 'duration:', player.getDuration());
    }
    else{
    ccScroll();
    }
        
}


/////////////// YT API 

function loadYTVideo(id){
    if(playerLoaded) return;
    
     myVideo = createDiv('<iframe id="yt_player" width="640" height="480" src="https://www.youtube.com/embed/'+id+'?enablejsapi=1" frameborder="0" allowfullscreen allow="accelerometer" ></iframe>');
     myVideo.position(windowWidth/2 - 320, windowHeight/2 - 240);
     myVideo.hide();
     onYouTubeIframeAPIReady();
     playerLoaded  = true ;
}


function onYouTubeIframeAPIReady() {
  player = new YT.Player('yt_player', {
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

// The API will call this function when the video player is ready.
function onPlayerReady(event) {
    console.log("player ready");
   
    // console.log(player);
}

function onPlayerStateChange(event) {
     //console.log('currentTime:', player.getCurrentTime(), 'duration:', player.getDuration());
   
    
    if(event.data == YT.PlayerState.PLAYING){
     console.log("started");
     YTvideoTrigger();
    }
    
    if(event.data == YT.PlayerState.PAUSED){
     console.log("pause");
     YTvideoTrigger();
    }
    
    if (event.data == YT.PlayerState.ENDED) {
          carousalView = true;
          isVideoSelected = false;
          myVideo.hide();
          YTVidFinish();
    }
  }

/////////////// Carousal View

function ccScroll(){
    
    carousalView = true;
    ccLeftButton.draw();
    ccRightButton.draw();
  translate(carouselWidth/2, windowHeight/2);
    

  for(let i = 0; i < video_ids.length; i++) {

    let x = i * carouselWidth - currentVideoIndex*carouselWidth + carouselWidth/2;
    drawVideo(x, i);

  }
}

function drawVideo(x, id) {
    
  if(isMouseOverThumbnail(x, -60, carouselWidth, carouselWidth - 60)){
    thumbnailOpacity = 0.5;  
  } else {
    thumbnailOpacity = 1;
  }

  tint(255, thumbnailOpacity*255);

  image(vid_imgs[id], x-carouselWidth/2, -60, carouselWidth, carouselWidth - 60);  
  textAlign(CENTER);
  //text(id, x, 40);

}


function isMouseOverThumbnail(x, y, width, height) {

  if (mouseX >= x &&  
      mouseX <= x + width &&
      mouseY >= height &&
      mouseY <= windowHeight + y ) {

    return true;

  } else {
    return false;
  }
}


function YTvideoTrigger() {

    
    Stimulus_Duration = player.getDuration();
    
    if(playerLoaded && !playing){
        timerIndex = parseInt(player.getCurrentTime());
        intervalId = setInterval(timeIt, 1000);
        timerStart = true
        socket.send('YT_Stimulus_Start');
      }
    else if(playing){
          clearInterval(intervalId);
          timerStart = false;
      }
     
      playing = !playing ;
}


function YTVidFinish() {

  socket.send('FW_Stimulus_End');
  clearInterval(intervalId);
  timerStart = false
  timerIndex = 0;
  
}

function YT_reset_video() {
  player.stopVideo();
  clearInterval(intervalId);
  timerStart = false;
  playing = false;
  timerIndex = 0;
  socket.send('FW_Stimulus_Reset');
}


function handleFile(file) {
 print(file);
  if (file.type === 'video') {
   vid = createVideo(file.data, 'mp4');
   vid.position((windowWidth - vidSizeH )/2,(windowHeight - vidSizeV + 200)/2);
   vid.size(vidSizeH,AUTO);
   videoLoaded = true ;
   //setButtons();
  } else {
    vid = null;
  }
}


function timeIt() {
  if (timerIndex < Stimulus_Duration) {
      timerIndex++ ;
    if(timerArray.includes(timerIndex)){
        console.log("Sending");
        //writeToBle();
    }
  }
  else{
      clearInterval(intervalId);
      timerStart = false
      timerIndex = 0;
  }
}



function drawChart(newData) {
  // map the range of the input to the window height:
  var yPos = map(255 - newData, 0, 512, 0, height);
  // draw the line in a pretty color:
  stroke(0xFF, 0xC0, 0xCB);
    
  line(xPos, height, xPos, height - yPos);
  // at the edge of the screen, go back to the beginning:
  if (xPos >= width) {
    xPos = 0;
    // clear the screen by resetting the background:
    background(bcolor);
  } else {
    // increment the horizontal position for the next reading:
    xPos++;
  }
}


function typeWriter(sentence, n, x, y, speed) {
  if (n < (sentence.length)) {
    text(sentence.substring(0, n+1), x, y);
    n++;
    setTimeout(function() {
      typeWriter(sentence, n, x, y, speed)
    }, speed);
  }
}


function connectToBle() {
  // Connect to a device by passing the service UUID
  myBLE.connect(serviceUuid, gotCharacteristics);
}

// A function that will be called once got characteristics
function gotCharacteristics(error, characteristics) {
  if (error) console.log('error: ', error);
  console.log('characteristics: ', characteristics);
  writeCharacteristic = characteristics[0];
  // notifyCharacteristic = characteristics[1];
  // myBLE.startNotifications(notifyCharacteristic, handleNotifications,'custom');
  isConnected = 1;
  //background(bcolor);
  // You can also pass in the dataType
  // Options: 'unit8', 'uint16', 'uint32', 'int8', 'int16', 'int32', 'float32', 'float64', 'string'
  //myBLE.startNotifications(notifyCharacteristic, handleNotifications, 'int16');
}



var timeIndex = 0
var elementIndex = 0

var ble_action = 0
var ble_time = 0
var ble_index = 0
var ble_strength = 0

function writeToBle() {
timeIndex = 0;
let myVar = setInterval(function(){elementTimer();}, 100);


var elementTimer = function(){
    for (let i = 0; i < elements; i++) {
      if(tsP[i] == timeIndex){
        ble_action = actionP[i];
        ble_index = locP[i];
        ble_time = tlP[i] - tsP[i];
        ble_strength = vals[i];
        sendBLEPacket();
        elementIndex  = elementIndex + 1;
      }
    }

    timeIndex = timeIndex + 1;

    if(elementIndex == elements){
      elementIndex = 0 ;
      timeIndex = 0;
      clearInterval(myVar); 

    } 
  }

}

function sendBLEPacket(){

  if(isConnected){
    var sendDataPacket = new Uint8Array([ble_action,ble_index, ble_time, ble_strength]);

    try{
      console.log(sendDataPacket)
      writeCharacteristic.writeValue(sendDataPacket);
      if(elementIndex == 0){
        socket.send('FW_Frisson_Trigger');
      }
    }
    catch(err){
      isConnected = 0;
    }
  }

}

function bak_writeToBle() {

if(isConnected){
  var sendDataPacket = new Uint8Array([20,...vals, ...tsP, ...tlP]);

  try{
    console.log(sendDataPacket)
    writeCharacteristic.writeValue(sendDataPacket);
    socket.send('FW_Frisson_Trigger');
  }
  catch(err){
    isConnected = 0;
  }
 }
}

function uint16(v) {
  return v & 0xFFFF;
}


function keyPressed() {
  switch(key) {
    case 'p':
      if(isConnected){
          writeToBle();
      }
          break;
    case 'm':
          videoTrigger();
          break;
    case 'r':
          reset_video();
          break;
    case 'g':
          gui_visible = !gui_visible;
          break;
    case 'c':
          isConnected = 1;
          break;
//    case 'x':
//         player.loadVideoById(video_ids[2]);
//          break;
      
  }
}

function videoTrigger() {
    vidDuration = vid.time();
    vidDuration = vid.duration();
    
    Stimulus_Duration = parseInt(vidDuration);
    console.log(Stimulus_Duration);
    
    if(videoLoaded && !playing){
        vid.play();
        gui_visible = false;
        intervalId = setInterval(timeIt, 1000);
        timerStart = true
        vid.onended(onVidFinish);
        socket.send('FW_Stimulus_Start');
        vid.position(0,0);
        vid.size(windowWidth,AUTO);
      }
    else if(playing){
          vid.pause();
          gui_visible = true;
          clearInterval(intervalId);
          timerStart = false;
        vid.position((windowWidth - vidSizeH )/2,(windowHeight - vidSizeV + 200)/2);
        vid.size(vidSizeH,AUTO);
      }
     
      playing = !playing ;
      

}

function reset_video() {
  vid.stop();
  clearInterval(intervalId);
  timerStart = false;
  playing = false;
  timerIndex = 0;
  socket.send('FW_Stimulus_Reset');
  vid.position((windowWidth - vidSizeH )/2,(windowHeight - vidSizeV + 200)/2);
  vid.size(vidSizeH,AUTO);
}

function onVidFinish() {

  socket.send('FW_Stimulus_End');
  gui_visible = true;
  clearInterval(intervalId);
  timerStart = false
  timerIndex = 0;
   vid.position((windowWidth - vidSizeH )/2,(windowHeight - vidSizeV + 200)/2);
   vid.size(vidSizeH,AUTO);
  
}

socket.addEventListener('open', function (event) {
    socket.send('FW_Frisson_Hello');
});

// Listen for messages
socket.addEventListener('message', function (event) {

    console.log('Message from server ', event.data);

    if(event.data == "start_stimulus"){
        console.log("starting");
        videoTrigger();
    }
    else if(event.data == "reset_stimulus"){
        console.log("reset");
        reset_video();
    }
    else if(event.data == "trigger_device"){
        console.log("trigger");
        writeToBle();
    }
});


