/* 
 * Mode:
 * 1.Direct draw: Need an array to record ervery pixel unit we deal with;
 * 2.Cover draw: Canvas option[globalCompositeOperation:source-over], it is so simple to do nothing.
 * and open the template in the editor.
 */

//Global
//status 0:stop; 1:begin; 2:working; 3:pause; 4:end
var Status = 0;
var Color = '0,0,0';
var InkUnits = [];
var PixelUnits = [];
var OriginUnits = []; //They are PixelUnits

var CV = document.getElementById('cv');
var CTX = CV.getContext("2d");

//main function
function main() {
    //Draw a filled circle
    
    //Analyse the non-empty pixels to an array
    
    //Every pixel in the array born 100 ink-units
    
    //First run, every ink-units move and create a new frame (show, or not)
    
    //Secont run, move and another new frame
    
    //...
    
    //All ink-units die, show
}

var PixelUnit = {
    'x':0,
    'y':0,
    'o':1,
    'lc':'',
    'nc':'',
    create_units:function(count){
      for(var i = 0; i < count; ++i) {
        InkUnits.push(object(InkUnit,{
          'x':this.x,
          'y':this.y
        }));
      }
      
    }
}

var InkUnit = {
  'x':0,
  'y':0,
  'o':1,
  'lc':Color,
  'nc':'',
  'last_angle':999,
  'move_angle':0,
  'speed':0,
  'life':100,
  'decay':0,
  run:function(){
    if(this.life > 0) {
      this.make_angle();
      this.move();
      var pixel = CTX.getImageData(this.x,this.y,1,1).data;
      if(!pixel[0] && !pixel[1] && !pixel[2] && pixel[3]==255) {
        //console.log(this.x,this.y);
      }
      else this.plant();      
    }
  },
  angle_probs:function() {
    //base prob:10
    var probs = new Array(10,10,10,10,10,10,10,10);
    for(var angle = 0; angle < probs.length; ++angle){
      //same as the last move angle
      switch(Math.abs(angle-this.last_angle)){
        case 0:
          probs[angle] = 50;
          break;
        case 1:
          probs[angle] = 50;
          break;
        case 2:
          probs[angle] = 30;
          break;
        case 3:
          probs[angle] = 10;
        default:
          probs[angle] = 0;
      }      
    }
    return probs;
  },
  make_angle:function(){
    var probs = this.angle_probs();
    //probs format: array(10,10,10,10,10,10,10,30)
    //angle: 0:top-left, 1:top, 2:top-right
    var sum = probs.sum();
    var angle = 0;
    for(var prob in probs){
      var num = randomFromTo(1,sum);
      if(num<=probs[prob]){
        angle = parseInt(prob);
        break;
      }
      else {
        sum-=probs[prob];
      }
    }
    this.last_angle = this.move_angle;
    this.move_angle = angle;
    //this.move(1);
  },
  move:function(distant){
    distant = 1;
    //cut life
    this.life -= distant;
    //update opacity
    this.o = (this.life/100).toFixed(2);
    switch(this.move_angle) {
      case 0:
        --this.x;--this.y;
        break;
      case 1:
        --this.y;
        break;
      case 2:
        ++this.x;--this.y;
        break;
      case 3:
        ++this.x;
        break;
      case 4:
        ++this.x;++this.y;
        break;
      case 5:
        ++this.y;
        break;
      case 6:
        --this.x;++this.y;
        break;
      case 7:
        --this.x;
        break;          
    }  
    
  },
  plant:function(){
    //cover draw or direct draw
    
    //if cover, not nessesary to record pixels
    cover_draw_pixel(this.x,this.y,Color,this.o);
    
    //if direct, we must caculate the color and opacity manually
    //var pixel = PixelsUnits[this.x][this.y]?PixelsUnits[this.x][this.y]:this.make_PixelUnit();
    //caculate......
    //and update the PixelUnit
    //direct_draw_pixel(pixel.x,pixel.y,pixel.c,pixel.o);
  },
  make_PixelUnit:function(){
    var pixel = object(PixelUnit,{
      'x':this.x,
      'y':this.y,
      'c':'rbga(0,0,0,0)',
      'o':0
    });
    PixelUnits[this.x][this.y] = pixel;
    return pixel;
  }
}

function draw_a_circle(radius,x,y) {
  CTX.beginPath();
  CTX.arc(x,y,radius,0,Math.PI*2);
  CTX.fill();
  CTX.closePath();
  var w = CV.width;
  var h = CV.height;
  var ps = CTX.getImageData(0,0,w,h).data;
  for(var i = 0;i<w*h*4;i+=4){
    if(ps[i]||ps[i+1]||ps[i+2]||ps[i+3]){
      var p = object(PixelUnit);
      p.x = Math.floor(i/(w*4));
      p.y = (i/4)%w;
      PixelUnits.push(p);     
    }
  }
  //console.log(PixelUnits.length);
  for(var i = 0;i <PixelUnits.length;++i) {PixelUnits[i].create_units(20)}
  setInterval(function(){
    for(var i = 0;i<InkUnits.length;++i) {InkUnits[i].run()}
  },200);
  
}

function cover_draw_pixel(x,y,c,o) {
  var color = C(c,o);
  CTX.fillStyle = color;
  CTX.fillRect(x,y,1,1);
}

function get_not_empty_pixels() {
  
}

function randomFromTo(from, to){
       return Math.floor(Math.random() * (to - from + 1) + from);
}

Array.prototype.sum = function() {
  var sum = 0;
  for(var i in this) {
    if(typeof(this[i])=='number') {
      sum+=this[i];
    }
    else if(typeof(this[i])=='string' && !isNaN(parseInt(this[i]))){
      sum+=parseInt(this[i]);
    }
  }
  return sum;
}

function C(s,o){
  switch (typeof(s)) {
    case 'object':
      var colors = Array.prototype.slice.call(s.data);
      colors[3] = (colors[3]/255).toFixed(2);      
      return "rgba("+colors.join(',')+")";
      break;
    case 'string':
      return "rgba("+s+","+o+")";
  }
}

function object(old,obj) {
  function AgentObject(){}
  AgentObject.prototype = old;
  return (new AgentObject(obj)).update(obj);
}

Object.prototype.update = function(obj) {
  for(var key in obj) {
    this[key] = obj[key];
  }
  return this;
}