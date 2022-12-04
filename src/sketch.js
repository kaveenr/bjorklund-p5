const RANDOM_MIN_ACT = 3;

var bpm = 400;

var kickLength = 16;
var kickActivations = 0;

var snareLength = 16;
var snareActivations = 0;

var hatLength = 16;
var hatActivations = 0;

var melodyLength = 16;
var melodyActivations = 0;
var melodyPreset =0;
var melodyRoot = 0;

var turingProbability = 0.5

let curStep = {};
let curNote = 0;
let lastUpdated = 0;

var muteKick = false;
var muteSnare = false;
var muteHat = false;
var muteMelody = false;

let drumKit, melodySynth, reverb;

function preload() {

  reverb = new Tone.Reverb(0.2).toDestination();
  widener = new Tone.StereoWidener(0.4).toDestination();
  drumKit = new Tone.Sampler({
    urls: {
      C1: "kick.mp3",
      D1: "snare.mp3",
      E1: "hat.mp3"
    },
    baseUrl: "assets/",
    volume: -8
  }).connect(widener);
  
  melodySynth = new Tone.MonoSynth({
    oscillator: {
      type: "sawtooth"
    },
    envelope: {
      attack: 0.01
    },
    volume: -8
  }).connect(reverb);
}

let kickPattern, melodyTuring, voiceConfig;

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.mousePressed(togglePlay);
  noLoop();

  randomizeSequence();

  melodyTuring = new TuringMech(16,turingProbability);
  kickPattern = new EuclideanSequence(kickActivations,kickLength);
  snarePattern = new EuclideanSequence(snareActivations,snareLength);
  hatPattern = new EuclideanSequence(hatActivations,hatLength);
  melodyPattern = new EuclideanSequence(melodyActivations,melodyLength);

  voiceConfig = [
    {
      "label": "Kick",
      "r": 0.5,
      "seq": kickPattern,
      "color": "rgba(249, 168, 37,1)",
      "polyColor": "rgba(249, 168, 37,0.2)"
    },
    {
      "label": "Snare",
      "r": 0.7,
      "seq": snarePattern,
      "color": "rgba(51, 105, 30,1)",
      "polyColor": "rgba(51, 105, 30,0.2)"
    },
    {
      "label": "Hat",
      "r": 0.9,
      "seq": hatPattern,
      "color": "rgba(1, 87, 155,1)",
      "polyColor": "rgba(1, 87, 155,0.2)"
    },
    {
      "label": "Melody",
      "r": 1.1,
      "seq": melodyPattern,
      "color": "rgba(49, 27, 146,1)",
      "polyColor": "rgba(49, 27, 146,0.2)"
    }
  ];
  

  patternSetup();

  gui = createGui("Euclidean Groove Thing");
  gui.prototype.addHTML("About", "Msuical Sequncer based on Euclidean distribution")
  sliderRange(75, 500, 10);
  gui.addGlobals('bpm');
  gui.setPosition(10,10);
  gui.prototype.addButton("Randomize / Generate", ()=> {
    randomizeSequence();
    patternSetup();
  })

  gui1 = createGui("Sequence Modifiers");
  gui1.hide();
  sliderRange(0, 32, 1);
  gui1.prototype.addHTML("Kick Sequence", "Euclidean Kick Sequence")
  gui1.addGlobals('kickLength','kickActivations');
  gui1.prototype.addButton("Rotate L", () => kickPattern.rotate(true))
  gui1.prototype.addButton("Rotate R", () => kickPattern.rotate(false))
  gui1.prototype.addHTML("Snare Sequence", "Euclidean Snare Sequence")
  gui1.addGlobals('snareLength','snareActivations');
  gui1.prototype.addButton("Rotate L", () => snarePattern.rotate(true))
  gui1.prototype.addButton("Rotate R", () => snarePattern.rotate(false))
  gui1.prototype.addHTML("Hat Sequence", "Euclidean Hat Sequence")
  gui1.addGlobals('hatLength', 'hatActivations');
  gui1.prototype.addButton("Rotate L", () => hatPattern.rotate(true))
  gui1.prototype.addButton("Rotate R", () => hatPattern.rotate(false))
  gui1.prototype.addHTML("Melody Sequence", "Euclidean Melody Sequence with Turing Note Sequcer")
  gui1.addGlobals('melodyLength', 'melodyActivations');
  gui1.prototype.addButton("Rotate L", () => melodyPattern.rotate(true))
  gui1.prototype.addButton("Rotate R", () => melodyPattern.rotate(false))
  sliderRange(0, 1, 0.1);
  gui1.addGlobals('turingProbability');
  gui1.setPosition(width - 220,10);

  gui.prototype.addButton("Tweak Parameters / Advance", ()=> {
    gui1.toggleVisibility();
  })

  gui.prototype.addHTML("Mutes", "mute parts of the sequences");
  gui.addGlobals('muteKick', 'muteSnare', 'muteHat', 'muteMelody');

}

function randomizeSequence(){

  bpm = floor(random(100,400));

  let patlen = floor(random(3,32));
  kickLength = patlen;
  kickActivations = floor(random(RANDOM_MIN_ACT,patlen));
  
  patlen = floor(random(3,32));
  snareLength = patlen;
  snareActivations = floor(random(RANDOM_MIN_ACT,patlen));
  
  patlen = floor(random(3,32));
  hatLength = patlen;
  hatActivations = floor(random(RANDOM_MIN_ACT,patlen))

  patlen = floor(random(3,32));
  melodyLength = patlen;
  melodyActivations = floor(random(RANDOM_MIN_ACT,patlen));
  melodyRoot = floor(random(0,M_NOTES.length))
  melodyPreset = floor(random(0,1));
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function patternSetup() {

  kickPattern.update(kickActivations,kickLength);
  snarePattern.update(snareActivations,snareLength);
  hatPattern.update(hatActivations,hatLength);
  melodyPattern.update(melodyActivations,melodyLength);
  
  melodyTuring.setProbability(turingProbability);

  melodyScale = makeScale(
    M_NOTES[melodyRoot],
    M_PRESET[melodyPreset].Value
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
  
  // Tempo
  const delayTime = 60000 / bpm;
  if (millis() > lastUpdated + delayTime) {
    lastUpdated = millis();
   
    // Trigger Sounds
    const drumNotes = [];
    if (kickPattern.advance() && !muteKick) drumNotes.push("C1");
    if (snarePattern.advance() && !muteSnare) drumNotes.push("D1");
    if (hatPattern.advance() && !muteHat) drumNotes.push("E1");
    drumKit.triggerAttackRelease(drumNotes, 0.4);

    if (melodyPattern.advance() && !muteMelody) {
      let choiceNote = melodyTuring.advance();
      // TODO: Fix this shit
      melodySynth.triggerAttackRelease((melodyScale[choiceNote] || melodyScale[0]) + 3, 0.1);
    }

    patternSetup();
    background(0);
    expensiveDraw();
  }

  if (!isLooping()) {
    background(0);
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

  for (let i = 0 ; i < voiceConfig.length; i++) {
    const current = voiceConfig[i];
    
    const divs = 360 / current.seq.n;
    let subr = r * current.r;

    beginShape();
    noStroke();
    for (let subd = 0; subd < current.seq.n; subd++) {
      const rads = radians(divs * subd);
      const divx = cx + subr * cos(rads);
      const divy = cy + subr * sin(rads);
      if (current.seq.isActive(subd)) {
        vertex(divx, divy)
      } else {
        fill('rgb(224, 224, 224)');
        circle(divx, divy, subr/10);
      }
    }
    fill(current.polyColor);
    endShape(CLOSE);

    for (let subd = 0; subd < current.seq.n; subd++) {
      const rads = radians(divs * subd);
      const divx = cx + subr * cos(rads);
      const divy = cy + subr * sin(rads);
      noStroke();
      if (current.seq.isActive(subd)) {
        fill(current.color);
      } else {
        noFill();
      }
      circle(divx, divy, subr/8);
      if (current.seq.step - 1 == subd) {
        noFill();
        stroke('red');
        strokeWeight(4);
        line(cx, cy, divx, divy);
        circle(divx, divy, subr/8);
      }
    }
  }
}
