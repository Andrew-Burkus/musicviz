var canvas, sound, analyzer, filter, fft, filterFreq, filterRes,
    circles, max, drawBg, maxHue, maxSat, maxB, maxA, bkColor, lines,
    drawStroke, slider, minRadius, maxRadius;

function preload() {
    analyzer = new p5.Amplitude();
    fft = new p5.FFT();
    filter = new p5.LowPass();
}

function setup() {
    noCursor();
    canvas = createCanvas(windowWidth, windowHeight).parent('container');
    maxHue = 360;
    maxSat = 100;
    maxB = 100;
    maxA = 1;
    colorMode(HSB, maxHue, maxSat, maxB, maxA);
    //
    circles = populateCircles(100);
    max = 250;
    //
    drawBg = true;
    bkColor = 195;
    drawStroke = false;
    slider = new Slider(13, height - 50);
    minRadius = 75;
    maxRadius = 150;
}

function draw() {
    if(drawBg) background(bkColor);
    if(drawStroke) {
        stroke(0);
        strokeWeight(4.0);
    } else {
        noStroke();
    }

    var spectrum = fft.analyze();
    var vol = analyzer.getLevel();

    var i;
    for(i = 0; i < circles.length; i++) {
        var circle = circles[i];
        vertex(circle.x, circle.y);
        circle.draw();
        circle.step(vol, spectrum[spectrum.length % i]);
    }

    filterFreq = map(mouseX, 0, width, 10, 22050);

    filterRes = map(mouseY, 0, height, 5, 15);

    filter.set(filterFreq, filterRes);

    if(sound && slider) {
        if(mouseIsPressed) {
            slider.x = mouseX;
            sound.stop();
            sound.jump(map(slider.x, 0, width, 0, sound.duration()), 0);
        }
        var xPos = map(sound.currentTime() / sound.duration(), 0, 1, 50, width);
        slider.x = xPos;
    }
    drawFooter(0, height - 50);
    slider.draw();
    fill(90);
    ellipse(mouseX, mouseY, 35, 35);
}

function Circle(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = { hue: 145, sat: 0, b: 0, a: 1 };
}

Circle.prototype.draw = function() {
    push();
    fill(this.color.hue, this.color.sat, this.color.b, this.color.a);
    ellipse(this.x, this.y, this.radius, this.radius);
    pop();
};

Circle.prototype.step = function(vol, freq) {
    this.radius = constrain(vol * freq, minRadius, maxRadius);
    this.color.hue = map(freq, 0, 255, 75, maxHue);
    this.color.sat = map(freq, 0, 255, 45, maxSat);
    this.color.b = map(freq, 0, 255, 55, maxB);
    this.color.a = map(freq, 0, 255, 0.5, maxA);

    this.y = map(freq, 0, 255, -100, height - 100);
};

function populateCircles(num) {
    var circles = [];
    var i;
    for(i = 0; i < num; i++) {
        var circle = new Circle(random(50, width), random(50, height), random(5, 25));
        circles.push(circle);
    }
    return circles;
}

function drawAudioSpectrum(fft, sound, step) {
    fft.setInput(sound);
    var spectrum = fft.analyze();
    push();
    fill("#336699");
    beginShape();
    var i;
    for(i = 0; i < spectrum.length; i += step) {
        vertex(i, map(spectrum[i], 0, 1500, 200, 0));
    }
    endShape();
    pop();
}

function volume(sound, level) {
    var volume = map(level, 0, width, 0, 1);
    volume = constrain(volume, 0, 1);
    sound.amp(volume);
}

function playbackRate(sound, rate) {
    var speed = map(rate, 0.1, 100, 0.1, 2);
    sound.rate(speed);
}

function keyPressed() {
    if(keyCode === RETURN || keyCode === ENTER) {
        if(sound) {
            if(sound.isPlaying()) {
                sound.pause();
            } else if(sound.isPaused()) {
                sound.play();
            } else {
                sound.stop();
                sound.play();
            }
        }
    } else if(keyCode === CONTROL) {
        drawStroke = !drawStroke;
    } else if(keyCode === ALT) {
        drawBg = !drawBg;
    }
}

function keyTyped() {
    if(key === 'w') {
        minRadius += 15;
    } else if(key === 's') {
        minRadius -= 15;
    } else if(key === 'a'){
        maxRadius -= 15;
    } else if(key === 'd') {
        maxRadius += 15;
    }
}

window.onresize = function() {
  var w = window.innerWidth;
  var h = window.innerHeight;
  canvas.resize(w, h);
  width = w;
  height = h;
}

function handleFiles(files) {
    var file = files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
        var data = e.target.result;
        window.sound = loadSound(data);
        sound.disconnect();
        sound.connect(filter);
        fft.setInput(filter);
        analyzer.setInput(filter);
    }
    reader.readAsDataURL(file);
}
