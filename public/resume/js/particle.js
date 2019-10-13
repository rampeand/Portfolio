/*********************************/
/* Perlin Particle System Plugin */
/* Version: 1.0.0.0              */
/* Author: Michael Kainth        */
/* http://www.michaelkainth.com  */
/*********************************/

var CROSS_BROWSER_PARTICLE_SUPPORT = false;

$.fn.ParticleFlow = function( options ) {
  /*****************************************************/
  /* Cross-browser support for requestAnimationFrame() */
  /*****************************************************/
  var lastTime = 0;
  if (CROSS_BROWSER_PARTICLE_SUPPORT == false) {
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0, len = vendors.length; x < len && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
    window.requestAnimationFrame = function(callback, element) {
      var currTime = Date.now();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };

    if (!window.cancelAnimationFrame)
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };

    CROSS_BROWSER_PARTICLE_SUPPORT = true;
  }

  /********************/
  /* Global Variables */
  /********************/

  var FPS_Control = new FPS_Normalizer(100);

  var SCREEN_WIDTH = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  var SCREEN_HEIGHT = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

  var QUANTITY = 100;

  var canvas;
  var context;

  // ParticleSystems should be populated in init()
  var ParticleSystems = new Array();

  // used to store precalculated particle objects for various sizes
  var particleReferences = new ParticleDrawCollection();

  var PARTICLE_SIZE = ~~(Math.min(SCREEN_HEIGHT, SCREEN_WIDTH) * 0.0125); // minimum particle size is 1.25% of the min(height, width)
  var PARTICLE_VARIANCE = 3; // Maximum particle size added

  /*************/
  /* Functions */
  /*************/
  function init() {

    // create a reference to the canvas used to display the animation
    canvas = document.getElementById('nameCanvas');

    // create the animation if the canvas context identifier is supported
    if(canvas && canvas.getContext) {
      context = canvas.getContext('2d');
      context.globalCompositeOperation = 'destination-over';
      window.addEventListener('resize', windowResizeHandler, false);
      windowResizeHandler();

      // create and push a ParticleSystem to the collection
      var sys1 = new ParticleSystem(QUANTITY, '#FFFFFF');
      ParticleSystems.push(sys1);

      update();
    }
  }

  function FPS_Normalizer(size) {
    this.size = size;
    this.fps = 60;
    this.minTime = (1000/60) * (60 / 60) - (1000/60) * 0.5; // minimum frame time
    this.maxTime = 1000/60; // maximum frame time, else skip frame
    this.realFPS = 0;
    this.newFPS = 0;
    this.active = true; // is the animation active?
    this.elapsedTime = 0; // elapsedTime of current frame
    this.prevElapsedTime = 0;
    this.lastFrameTime = 0;
    this.count = 0; // counter for current array indexes (prevFramesTime[], prevFramesChange[])
    this.skip = false; // skipframe flag
    this.skipcount = 0; // skipframe counter

    this.getTimeMultiple = function() {
      //console.log("Elapsed: "+(this.elapsedTime).toString());
      //console.log("Max    : "+(this.maxTime).toString());
      var Time = 1 + ((this.elapsedTime - this.maxTime) / this.maxTime);
      return Time;
    };

    this.prevFramesTime_AVG = 0;
    this.prevFramesTime = (function() {
      arr = new Array(size);
      for (var i = 0; i < size; i++) {
        arr[i] = 0;
      }
      return arr;
    }());

    this.prevFramesChange_AVG = 0;
    this.prevFramesChange = (function() {
      arr = new Array(size);
      for (var i = 0; i < size; i++) {
        arr[i] = 0;
      }
      return arr;
    }());

    this.update = function() {

      var time = Date.now()
      this.prevElapsedTime = this.elapsedTime;
      this.elapsedTime = time - this.lastFrameTime;
      this.lastFrameTime = time;

      // the frame is too early
      if (time - this.elapsedTime < this.minTime) {
        return false;
      } else {
        return true;
      }



      // if we collected 100 new frames of data-target
      //    then optimize the frame rate
      if (this.count >= this.size) {
        console.log("fps:" + (this.fps).toString());
        // reset count for array indexes
        this.count = 0;

        // Calculate Frame Rate and Frame rate change averages
        this.prevFramesTime_AVG = 0;
        this.prevFramesChange_AVG = 0;
        for (var i = 0, len = this.size; i < len; i++) {
          this.prevFramesTime_AVG += this.prevFramesTime[i];
          this.prevFramesChange_AVG += this.prevFramesChange[i];
        }
        this.prevFramesTime_AVG /= this.size;
        this.prevFramesChange_AVG /= this.size;

        console.log("prevFrmAVG: " + (this.prevFramesTime_AVG).toString());
        console.log("prevFrmChngAVG: " + (this.prevFramesChange_AVG).toString());

        // calculate the real fps based on the average frame rate
        this.realFPS = 1000/this.prevFramesTime_AVG;

        console.log("realfps: " + (this.realFPS).toString());

        // change fps if needed
        this.fps = this.realFPS;

        // change the minTime/maxTime according to the fps
        this.minTime = (1000/60) * (60 / this.fps) - (1000/60) * 0.5;
        console.log("minTime: " + (this.minTime).toString());
        this.maxTime = 1000/this.fps;
        console.log("maxTime: " + (this.maxTime).toString());
        // reset the skipframe counter
        this.skipcount = 0;



      } // if (this.count >= this.size)

      // if the frame is behind and the previous frame wasn't skipped
      //    then skip frame
      /*if ((this.elapsedTime > this.maxTime) && (this.skip == false)) {
        //this.skip = true;
        this.skipcount += 1;
      } else {
        this.skip = false;
      }*/

      var prevFramesTime_old = this.prevFramesTime[this.count];
      this.prevFramesTime[this.count] = this.elapsedTime;
      this.prevFramesChange[this.count] = this.prevFramesTime[this.count] - prevFramesTime_old;

      this.count += 1;

      return true;
    } // update()

  } // FPS_Normailzer()

  // updates the animationframe of the current canvas
  function update() {

    // update the FPS Controller
    // if the update returns false, then the call was too earlier
    if(!FPS_Control.update()) {
      requestAnimationFrame(update);
    }

    // else, render frame
    // clear the canvas
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    // draw the particles
    for (var i = 0, len = ParticleSystems.length; i < len; i++) {
      var pSys = ParticleSystems[i];
      pSys.update();
    }

    // request next frame if the animation hasn't been stopped
    if (FPS_Control.active) {
      requestAnimationFrame(update);
    }

    /*
    var time = Date.now();

    // skip the frame if the request was too early
    if (time - lastFrameTime < FRAME_MIN_TIME) {
      requestAnimationFrame(update);
      return;
    }

    lastFrameTime = time; // get time of rendered frame

    //this gives a trail effect as the frames progress
    //context.fillStyle = 'rgba(0,0,0,0.2)';
    //context.fillRect(0, 0, context.canvas.width, context.canvas.height);

    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    // update all ParticleSystems
    for (var i = 0, len = ParticleSystems.length; i < len; i++) {
      var pSys = ParticleSystems[i];
      pSys.update();
    }
    //updateParticles(particles, vecFieldMichael);

    if (!stop) {
      requestAnimationFrame(update); // request next frame
    }
    */
  }

  function ParticleDrawCollection() {
    this.refs = {};

    this.add = function(size, color) {
      var r = this.refs[size];
      if (r === undefined) {
        this.refs[size] = {};
      }
      r = this.refs[size][color];
      if (r === undefined) {
        this.refs[size][color] = (function() {
          var particle = document.createElement('canvas');
          particle.width = size;
          particle.height = size;
          var particleContext = particle.getContext('2d');
          particleContext.beginPath();
          particleContext.fillStyle = "rgba(255, 255, 255, 0.78)";//this.fillColor;
          particleContext.arc(size/2, size/2, size/2, 0, Math.PI*2, true);
          particleContext.closePath();
          particleContext.fill();
          return particle;
        }());
      } // if
    } // add
  } // ParticleDrawCollection

  // A Particle System controls an array of particle objects
  function ParticleSystem(numParticles, particleColor) {
    this.particles = (function() {
      var ret = new Array();

      for (var i = 0; i < numParticles; i++) {

        var posX = PARTICLE_SIZE/2 + Math.random() * (SCREEN_WIDTH - PARTICLE_SIZE/2)
        var posY = PARTICLE_SIZE/2 + Math.random() * (SCREEN_HEIGHT - PARTICLE_SIZE/2);
        var speed = 1.5;
        var directionX = -speed + (Math.random() * speed*2);
        var directionY = -speed + (Math.random()* speed*2);
        if (!particleColor) {
          particleColor =  '#' + (Math.random() * 0x00eaff + 0xff0000 | 0).toString(16);
        }
        var particle = new Particle(
          { x: posX, y: posY }, PARTICLE_SIZE, { x: directionX , y: directionY }, (Math.random() * (6 - 2) + 2),
          {x: 0, y: 0}, particleColor, i
        );

        particleReferences.add(PARTICLE_SIZE, particleColor);

        ret.push( particle );
      }
      return ret;
    }());

  } // ParticleSystem

  ParticleSystem.prototype.update = function(skip) {
    this.vecField.update();
    var Time = FPS_Control.getTimeMultiple();
    //console.log(Time.toString());
    for (var i = 0, len = this.particles.length; i < len; i++) {
      this.particles[i].follow(this.vecField);
      this.particles[i].update(Time);
      this.particles[i].edges();
      this.particles[i].show();
    } // for
  } // update()

  // vecField controls the direction and acceleration of the particles
  ParticleSystem.prototype.vecField = new VectorField(10, 0.05);

  // Particle constructor
  function Particle(pos, size, vel, max, acc, fill, i) {
    this.position = { x: pos.x, y: pos.y };
    this.size = size;
    this.velocity = { x: vel.x, y: vel.y };
    this.maxspeed = max;
    this.acc = { x: acc.x, y: acc.y };
    this.fillColor = fill;
    this.index = i;
  }

  // Particle constructor: variable declaration optimization
  Particle.prototype.lastPlace = { x: 0, y: 0 };

  // Particle method:
  // Updates particles position, velocity, acceleration, lastplace
  // ensures that the velocity does not exceed maxspeed
  Particle.prototype.update = function(Time) {

    //console.log(Time.toString());

    // save current position in lastPlace **to be used in this.show()**
    this.lastPlace.x = this.position.x;
    this.lastPlace.y = this.position.y;

    // update velocity with current acceleration
    this.velocity.x += this.acc.x;
    this.velocity.y += this.acc.y;

    // reset acceleration
    this.acc = { x: 0, y: 0 };

    // calculate the magnitude of velocity using the fast recip sqrt function
    var velocityMagnitude =  1 / reciprocalSqrt (
      this.velocity.x*this.velocity.x + this.velocity.y*this.velocity.y
    );

    /*if (this.velocity.x < 0) {
      console.log("OMG");
    }*/
    // limit the velocity to maxspeed
    if ( velocityMagnitude > this.maxspeed ) {
      //var isXNeg = this.velocity.x < 0;
      //var isYNeg = this.velocity.y < 0;

      // calculate the proportion of current velocity over maxspeed
      var velocityProportion =  velocityMagnitude / this.maxspeed;
      // set the velocity to maxspeed by proportionally changing the x,y components
      this.velocity.x = this.velocity.x / velocityProportion;
      this.velocity.y = this.velocity.y / velocityProportion;
      /*if (isXNeg == true) {
        this.velocity.x *= -1;
      }
      if (isYNeg == true) {
        this.velocity.y *= -1;
      }*/
    }

    // update the position according to its velocity
    this.position.x += this.velocity.x*Time;
    this.position.y += this.velocity.y*Time;
  };

  // Particle method: Draws the particle on the canvas
  Particle.prototype.show = function() {
    context.drawImage(particleReferences.refs[this.size][this.fillColor], this.position.x, this.position.y);
    /*
    context.beginPath();
    context.fillStyle = "rgba(255, 255, 255, 0.7)"//this.fillColor;
    context.arc(this.position.x, this.position.y, this.size/2, 0, Math.PI*2, true);
    context.closePath();
    context.fill();*/
  };

  // Particle method: follows a vector field, where the acceleation is changed
  Particle.prototype.follow = function(vecField) {
    var x = ~~(this.position.x / vecField.scale);
    if (x >= vecField.columns) { //edge case
      x = vecField.columns - 1;
    }
    var y = ~~(this.position.y / vecField.scale);
    if (y >= vecField.rows) { // edge case
      y = vecField.rows - 1;
    }
    var value = x + y * (vecField.columns);
    var v = vecField.vectors[value];

    /*if (value >= vecField.length) {
      console.log("-----------------------------------------");
      console.log("value: "+ value.toString() + " len: " + (vecField.vectors.length).toString());
      console.log("posx: "+ (Math.floor(this.position.x)).toString() + " x: "+ x.toString());
      console.log("posy: "+ (Math.floor(this.position.y)).toString() + " y: "+ y.toString());
      console.log("scale: "+ (vecField.scale).toString() + " col: "+ (vecField.columns).toString() +" row: "+ (vecField.rows).toString());
    }*/

    this.acc.x += v.x;
    this.acc.y += v.y;
  };

  // If particle travels off the screen, reposition to the opposite wall
  Particle.prototype.edges = function() {
    if (this.position.x > SCREEN_WIDTH - PARTICLE_SIZE/2) {
      this.position.x = 0;
      this.acc.x += 10;
    }
    if (this.position.x < 0) {
      this.position.x = SCREEN_WIDTH - PARTICLE_SIZE/2;
      this.acc.x -= 10;
    }
    if (this.position.y > SCREEN_HEIGHT - PARTICLE_SIZE/2) {
      this.position.y = 0;
      this.acc.y += 10;
    }
    if (this.position.y < 0) {
      this.position.y = SCREEN_HEIGHT - PARTICLE_SIZE/2;
      this.acc.y -= 10;
    }
  };

  // VectorField constructor
  // This vector field will contain contain forces to be acted upon objects.
  function VectorField(scl, inc) {
    this.scale = scl;
    this.inc = inc;
    this.columns = ~~(SCREEN_WIDTH / scl); // number of vector columns
    this.rows = ~~(SCREEN_HEIGHT / scl); // number of vector rows

    this.vectors = (function() {
      //console.log((this.scale).toString());
      var columns = ~~(SCREEN_WIDTH / scl);
      var rows = ~~(SCREEN_HEIGHT / scl);
      var ret = new Array();

      var yOffset = 0;
      for (var y = 0; y < rows; y++) {
        var xOffset = 0;
        for (var x = 0; x < columns; x++) {
          var index = x + y * columns;
          var angle = Math.PI/6; //this.Noise.gen(xOffset, yOffset, zOffset) * TWO_PI * 4;
          var v = VectorfromAngle(angle, .1);
          ret.push(v);
          xOffset += inc;
        } // for x
        yOffset += inc;
      } // for y
      return ret;

    }()); // this.vectors

  } // VectorField()

  // updates the VectorField by incrementing the Noise's zOffset (Time Dimension)
  VectorField.prototype.update = function() {
    this.zOffset += 0.004*FPS_Control.getTimeMultiple();

    var yOffset = 0;
    for (var y = 0; y < this.rows; y++) {
      var xOffset = 0;
      for (var x = 0; x < this.columns; x++) {
        var index = x + y * this.columns;
        var angle = (this.Noise.noise(xOffset, yOffset, this.zOffset))*Math.PI*2; //* FPS_Control.elapsedTime / 1000

        /*if (index == 0) {
          console.log(angle.toString());
        }*/

        var v = this.vectors[index];
        //console.log((v.angle).toString());
        v.setValue(angle, 1);
        xOffset += this.inc;
      } // for x
      yOffset += this.inc;
    } // for y
  } //update()

  // zOffset is the 3rd dimension (time) used for generating Perlin Noise (Simplex Noise)
  VectorField.prototype.zOffset = 0;

  // Initalize a new Noise object
  VectorField.prototype.Noise = new ClassicalNoise(this.rand);

  VectorField.prototype.rand = new Alea(598372394872304982);


  // 2D Vector Constructor
  function Vector(vector) {
    this.x = vector.x;
    this.y = vector.y;
    this.mag = vector.mag;
    this.angle = vector.angle;
  }

  Vector.prototype.setValue = function(angle, mag) {
    if (mag) {
      this.mag = mag;
    }
    this.angle = angle;
    this.x = this.mag * Math.cos(this.angle);
    this.y = this.mag * Math.sin(this.angle);
  };
/*  function test() {
    var x = VectorfromAngle(Math.PI*2/3, 1);
    console.log("x: " + (x.x).toString() +" y: " + (x.y).toString() +" mag: " + (x.mag).toString() +" angle: " + (x.angle).toString());
    x.setValue(-5);
    console.log("x: " + (x.x).toString() +" y: " + (x.y).toString() +" mag: " + (x.mag).toString() +" angle: " + (x.angle).toString());
  }
test()function test() {
    console.log("x: "+(~~5.093784575957533).toString());
  }
test();*/

  // Creates a Vector object with an angle and magnitude (default mag = 1)
  function VectorfromAngle(angle, mag) {
    if (!mag) {
      mag = 1;
    }
    return new Vector(
      {
        x: mag * Math.cos(angle),
        y: mag * Math.sin(angle),
        angle: angle,
        mag: mag
      }
    ); // return
  }

  // resize the canvas when the window is resized
  // this function is called when an eventListener triggers the "resize" event
  // refer to init()
  function windowResizeHandler() {
    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;
  }

  // fast reciprocal square root
  function reciprocalSqrt(x) {
    var buf = new ArrayBuffer(4),
    f32=new Float32Array(buf),
    u32=new Uint32Array(buf);
    return (function() {
      var x2 = 0.5 * (f32[0] = x);
      u32[0] = (0x5f3759df - (u32[0] >> 1));
      var y = f32[0];
      y  = y * ( 1.5 - ( x2 * y * y ) );
      return y;
    }());
  }

  var seed = Math.random()

  function Alea() {
    return (function(args) {
      // Johannes BaagÃ¸e <baagoe@baagoe.com>, 2010
      var s0 = 0;
      var s1 = 0;
      var s2 = 0;
      var c = 1;

      if (args.length == 0) {
        args = [+new Date];
      }
      var mash = Mash();
      s0 = mash(' ');
      s1 = mash(' ');
      s2 = mash(' ');

      for (var i = 0, len = args.length; i < len; i++) {
        s0 -= mash(args[i]);
        if (s0 < 0) {
          s0 += 1;
        }
        s1 -= mash(args[i]);
        if (s1 < 0) {
          s1 += 1;
        }
        s2 -= mash(args[i]);
        if (s2 < 0) {
          s2 += 1;
        }
      }
      mash = null;

      var random = function() {
        var t = 2091639 * s0 + c * 2.3283064365386963e-10; // 2^-32
        s0 = s1;
        s1 = s2;
        return s2 = t - (c = t | 0);
      };
      random.uint32 = function() {
        return random() * 0x100000000; // 2^32
      };
      random.fract53 = function() {
        return random() +
        (random() * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53
      };
      random.version = 'Alea 0.9';
      random.args = args;
      return random;

    } (Array.prototype.slice.call(arguments)));
  };

  // From http://baagoe.com/en/RandomMusings/javascript/
  // Johannes BaagÃ¸e <baagoe@baagoe.com>, 2010
  function Mash() {
    var n = 0xefc8249d;

    var mash = function(data) {
      data = data.toString();
      for (var i = 0, len = data.length; i < len; i++) {
        n += data.charCodeAt(i);
        var h = 0.02519603282416938 * n;
        n = h >>> 0;
        h -= n;
        h *= n;
        n = h >>> 0;
        h -= n;
        n += h * 0x100000000; // 2^32
      }
      return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
    };

    mash.version = 'Mash 0.9';
    return mash;
  }

  // Classic Perlin noise, 3D version
  //----------------------------------------------------------------------------//

  function ClassicalNoise(r) { // Classic Perlin noise in 3D, for comparison
    if (r == undefined) r = Math;
    this.grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
    [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
    [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
    this.p = [];
    for (var i=0; i<256; i++) {
      this.p[i] = ~~(r.random()*256);
    }
    // To remove the need for index wrapping, double the permutation table length
    this.perm = [];
    for(var i=0; i<512; i++) {
      this.perm[i]=this.p[i & 255];
    }
  };

  ClassicalNoise.prototype.dot = function(g, x, y, z) {
    return g[0]*x + g[1]*y + g[2]*z;
  };

  ClassicalNoise.prototype.mix = function(a, b, t) {
    return (1.0-t)*a + t*b;
  };

  ClassicalNoise.prototype.fade = function(t) {
    return t*t*t*(t*(t*6.0-15.0)+10.0);
  };

  ClassicalNoise.prototype.noise = function(x, y, z) {
    // Find unit grid cell containing point
    var X = ~~(x);
    var Y = ~~(y);
    var Z = ~~(z);

    // Get relative xyz coordinates of point within that cell
    x = x - X;
    y = y - Y;
    z = z - Z;

    // Wrap the integer cells at 255 (smaller integer period can be introduced here)
    X = X & 255;
    Y = Y & 255;
    Z = Z & 255;

    // Calculate a set of eight hashed gradient indices
    var gi000 = this.perm[X+this.perm[Y+this.perm[Z]]] & 11;
    var gi001 = this.perm[X+this.perm[Y+this.perm[Z+1]]] & 11;
    var gi010 = this.perm[X+this.perm[Y+1+this.perm[Z]]] & 11;
    var gi011 = this.perm[X+this.perm[Y+1+this.perm[Z+1]]] & 11;
    var gi100 = this.perm[X+1+this.perm[Y+this.perm[Z]]] & 11;
    var gi101 = this.perm[X+1+this.perm[Y+this.perm[Z+1]]] & 11;
    var gi110 = this.perm[X+1+this.perm[Y+1+this.perm[Z]]] & 11;
    var gi111 = this.perm[X+1+this.perm[Y+1+this.perm[Z+1]]] & 11;

    // The gradients of each corner are now:
    // g000 = grad3[gi000];
    // g001 = grad3[gi001];
    // g010 = grad3[gi010];
    // g011 = grad3[gi011];
    // g100 = grad3[gi100];
    // g101 = grad3[gi101];
    // g110 = grad3[gi110];
    // g111 = grad3[gi111];
    // Calculate noise contributions from each of the eight corners
    var n000= this.dot(this.grad3[gi000], x, y, z);
    var n100= this.dot(this.grad3[gi100], x-1, y, z);
    var n010= this.dot(this.grad3[gi010], x, y-1, z);
    var n110= this.dot(this.grad3[gi110], x-1, y-1, z);
    var n001= this.dot(this.grad3[gi001], x, y, z-1);
    var n101= this.dot(this.grad3[gi101], x-1, y, z-1);
    var n011= this.dot(this.grad3[gi011], x, y-1, z-1);
    var n111= this.dot(this.grad3[gi111], x-1, y-1, z-1);
    // Compute the fade curve value for each of x, y, z
    var u = this.fade(x);
    var v = this.fade(y);
    var w = this.fade(z);
    // Interpolate along x the contributions from each of the corners
    var nx00 = this.mix(n000, n100, u);
    var nx01 = this.mix(n001, n101, u);
    var nx10 = this.mix(n010, n110, u);
    var nx11 = this.mix(n011, n111, u);
    // Interpolate the four results along y
    var nxy0 = this.mix(nx00, nx10, v);
    var nxy1 = this.mix(nx01, nx11, v);
    // Interpolate the two last results along z
    var nxyz = this.mix(nxy0, nxy1, w);

    return nxyz;
  };

  //----------------------------------------------------------------------------//

  init();

};
