var n = 32;
var bpm = 400;
var kickActivations = 0;
var kickRotation = 0;
var snareActivations = 0;
var snareRotation = 0;
var hatActivations = 0;
var hatRotation = 0;
var melodyActivations = 0;
var melodyRotation = 0;

let curStep = 0;
let curNote = 0;
let lastUpdated = 0;

let drumKit, melodySynth, reverb;
function preload() {

  reverb = new Tone.Reverb(0.5).toDestination();
  drumKit = new Tone.Sampler({
    urls: {
      C1: "kick.mp3",
      D1: "snare.mp3",
      E1: "hat.mp3"
    },
    baseUrl: "assets/"
  }).toDestination();
  
  melodySynth = new Tone.PolySynth(Tone.MonoSynth, {
    volume: -8,
    oscillator: {
      type: "sine"
    },
    envelope: {
      attack: 0.05,
      decay: 0.3,
      sustain: 0.4,
      release: 0.8,
    },
    filterEnvelope: {
      attack: 0.001,
      decay: 0.7,
      sustain: 0.1,
      release: 0.8,
      baseFrequency: 300,
      octaves: 4
    }
  }).connect(reverb);
}

let kickPattern;

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.mousePressed(togglePlay);
  noLoop();
  patternSetup();

  // reverb = new p5.Reverb();
	// reverb.drywet(0.5);
  // melodySynth = new p5.MonoSynth();
  // melodySynth.amp(0.5);
	// melodySynth.setADSR(0.1, 0.1);
  // melodySynth.disconnect();

  // snareSound.disconnect();
  // reverb.process(melodySynth, 3, 2);
  // reverb.process(snareSound, 2, 2);

  gui = createGui("Euclidean Groove Thing");
  gui.prototype.addHTML("Sequencer Control", "<hr/>")
  sliderRange(5, 32, 1);
  gui.addGlobals('n');
  sliderRange(75, 500, 10);
  gui.addGlobals('bpm');

  sliderRange(0, n, 1);
  gui.prototype.addHTML("Kick Sequence", "<hr/>")
  gui.prototype.add
  gui.addGlobals('kickActivations','kickRotation');
  gui.prototype.addHTML("Snare Sequence", "<hr/>")
  gui.addGlobals('snareActivations','snareRotation');
  gui.prototype.addHTML("Hat Sequence", "<hr/>")
  gui.addGlobals('hatActivations','hatRotation');
  gui.prototype.addHTML("Melody Sequence", "<hr/>")
  gui.addGlobals('melodyActivations','melodyRotation');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function patternSetup() {
  kickPattern = patternRotate(bjorklund(kickActivations,n),kickRotation);
  snarePattern = patternRotate(bjorklund(snareActivations,n),snareRotation);
  hatPattern = patternRotate(bjorklund(hatActivations,n),hatRotation);
  melodyPattern = patternRotate(bjorklund(melodyActivations,n),melodyRotation);
  melodyScale = makeScale(
    M_NOTES[0],
    M_PRESET[1].Value
  );
}

function togglePlay() {
  if (!isLooping()) {
    Tone.start();
    loop();    
  } else {
    noLoop()
  }

}

function draw() {
  
  // Wrap around step
  if (curStep >= n ) curStep = 0;
  if (curNote > melodyScale.length) curNote = 0;

  // Tempo
  const delayTime = 60000 / bpm;
  if (millis() > lastUpdated + delayTime) {
    lastUpdated = millis();
   
    // Trigger Sounds
    const drumNotes = []
    if (kickPattern[curStep] == 'x') drumNotes.push("C1");
    if (snarePattern[curStep] == 'x') drumNotes.push("D1");
    if (hatPattern[curStep] == 'x') drumNotes.push("E1");
    if (melodyPattern[curStep] == 'x') melodySynth.triggerAttackRelease(melodyScale[curNote] + 4, 0.05);
    drumKit.triggerAttackRelease(drumNotes);

    patternSetup();

    background(0);
    expensiveDraw();

    curStep++;
    curNote++;
  }

  if (!isLooping()) {
		fill(color(255, 220));
		rect(0, 0, width, height);
		fill(color(0));
		textSize(32);
		textAlign(CENTER, CENTER);
		text('Tap/Click To Start', width / 2, height / 2);
  }
}

function expensiveDraw() {

  const sizeRoot = windowWidth < windowHeight ? windowWidth : windowHeight;

  // Circle Outline
  const cx = width/2, cy = height/2, r = sizeRoot/3;
  fill(245)
  noStroke();
  circle(cx, cy, r*2.5);
  
  const divs = 360 / n;
  
  // Draw Kick Polygon
  fill('yellow');
  beginShape();
  noStroke();
  for (let subd = 0; subd < n; subd++) {
    const rads = radians(divs * subd);
    const divx = cx + r * cos(rads);
    const divy = cy + r * sin(rads);
    if (kickPattern[subd] == 'x' ) vertex(divx, divy);
  }
  endShape(CLOSE);

  // Draw Snare Polygon
  fill('rgba(0,255,0, 0.25)');
  beginShape();
  noStroke();
  for (let subd = 0; subd < n; subd++) {
    const rads = radians(divs * subd);
    const divx = cx + r * cos(rads);
    const divy = cy + r * sin(rads);
    if (snarePattern[subd] == 'x' ) vertex(divx, divy);
  }
  endShape(CLOSE);
  
  // Draw Hat Polygon
  fill('rgba(150,0,255, 0.20)');
  beginShape();
  noStroke();
  for (let subd = 0; subd < n; subd++) {
    const rads = radians(divs * subd);
    const divx = cx + r * cos(rads);
    const divy = cy + r * sin(rads);
    if (hatPattern[subd] == 'x' ) vertex(divx, divy);
  }
  endShape(CLOSE);

  // Draw Melody Polygon
  fill('rgba(222,184,135, 0.5)');
  beginShape();
  noStroke();
  for (let subd = 0; subd < n; subd++) {
    const rads = radians(divs * subd);
    const divx = cx + r * cos(rads);
    const divy = cy + r * sin(rads);
    if (melodyPattern[subd] == 'x' ) vertex(divx, divy);
  }
  endShape(CLOSE);
  

  // Draw Subdivisons
  let subr = r + 20;
  for (let subd = 0; subd < n; subd++) {
    const rads = radians(divs * subd);
    const divx = cx + subr * cos(rads);
    const divy = cy + subr * sin(rads);
    noStroke(4);
    if (kickPattern[subd] == 'x') {
      fill('gold');
    } else if (snarePattern[subd] == 'x') {
      fill('lightgreen');
    } else if (hatPattern[subd] == 'x') {
      fill('darkorchid');
    } else if (melodyPattern[subd] == 'x') {
      fill('burlywood');
    } else {
      noFill();
    }
    if (curStep == subd) fill('red');
    circle(divx, divy, r/5);
    fill('black');
    textSize(22);
    textAlign(CENTER, CENTER);
    text(subd, divx, divy);
  }  
}
