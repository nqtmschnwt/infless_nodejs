//based on an Example by @curran
window.requestAnimFrame = (function(){   return  window.requestAnimationFrame})();
var canvas = document.getElementById("space");
var c = canvas.getContext("2d");

var numStars = 1000;
var radius = '0.'+Math.floor(Math.random() * 9) + 1  ;
var focalLength = canvas.width *2;
var warp = 0;
var centerX, centerY;

var stars = [], star;
var i;

var animate = true;

initializeStars();

function executeFrame(){

  if(animate)
    requestAnimFrame(executeFrame);
  moveStars();
  drawStars();
}

function initializeStars(){
  centerX = canvas.width / 2;
  centerY = canvas.height / 2;

  stars = [];
  for(i = 0; i < numStars; i++){
    star = {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * canvas.width,
      o: '0.'+Math.floor(Math.random() * 99) + 1
    };
    stars.push(star);
  }
}

function moveStars(){
  for(i = 0; i < numStars; i++){
    star = stars[i];
    star.z--;

    if(star.z <= 0){
      star.z = canvas.width;
    }
  }
}

function drawStars(){
  var pixelX, pixelY, pixelRadius;

  // Resize to the screen
  if(canvas.width != window.innerWidth || canvas.width != window.innerWidth){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initializeStars();
  }
  if(warp==0)
  {c.fillStyle = "rgba(0,10,20,1)";
  c.fillRect(0,0, canvas.width, canvas.height);}
  c.fillStyle = "rgba(209, 255, 255, "+radius+")";

  //Glow effect;
  c.shadowBlur = 5;
  c.shadowColor = "white";

  for(i = 0; i < numStars; i++){
    star = stars[i];

    pixelX = (star.x - centerX) * (focalLength / star.z);
    pixelX += centerX;
    pixelY = (star.y - centerY) * (focalLength / star.z);
    pixelY += centerY;
    pixelRadius = 1 * (focalLength / star.z);

    /*c.fillRect(pixelX, pixelY, pixelRadius, pixelRadius);
    c.fillStyle = "rgba(209, 255, 255, "+star.o+")";
    //c.fill();*/
    c.beginPath()
    c.arc(pixelX, pixelY, pixelRadius, 0, Math.PI * 2);
    c.fillStyle = "rgba(" + parseInt(Math.random()*7 + 150) + ", " + parseInt(Math.random()*7 + 150) + ", " + parseInt(Math.random()*7 + 150) + ", "+star.o+")";
    c.fill();
  }
}

/*document.getElementById('warp').addEventListener("click",function(e){
 window.warp = window.warp==1 ? 0 : 1;
window.c.clearRect(0, 0, window.canvas.width, window.canvas.height);
executeFrame();
});*/

executeFrame();


var scene1btn = document.getElementById("scene-01-next");
/*scene1btn.addEventListener('click', function() {
  alert('bingo');
})*/

var timerID = 0;

function transition12(elem1,elem2) {
  hide(document.getElementById(elem1));
  show(document.getElementById(elem2));
  document.querySelector('.circle').classList.toggle('open');
}

function hide(elem) {
  var opacity =
    Number(window.getComputedStyle(elem).getPropertyValue("opacity"));
  if (opacity > 0) {
    opacity = opacity - 0.1;
    //console.log(opacity);
    elem.style.opacity = opacity;
    /* you can simply comment out the setTimeout function  and see that the
    opacity reduces on every click of the <button> */
        setTimeout(function(){hide(elem)}, 20);
  } else {
    clearTimeout(timerID);
    elem.style.display = "none";
  }
}

function show(elem) {
  //elem.style.display = "block";
  elem.style.visibility = "visible";
  elem.style.opacity = 1;
}

/* Circle menu */
var items = document.querySelectorAll('.circle a');

for(var i = 0, l = items.length; i < l; i++) {
  items[i].style.left = (50 - 35*Math.cos(-0.5 * Math.PI - 2*(1/l)*i*Math.PI)).toFixed(4) + "%";
  items[i].style.top = (50 + 35*Math.sin(-0.5 * Math.PI - 2*(1/l)*i*Math.PI)).toFixed(4) + "%";
}
