var bpm = 400;

var kickLength = 32;
var kickActivations = 0;
var kickRotation = 0;

var snareLength = 32;
var snareActivations = 0;
var snareRotation = 0;

var hatLength = 32;
var hatActivations = 0;
var hatRotation = 0;

var melodyLength = 32;
var melodyActivations = 0;
var melodyRotation = 0;

let curStep = {};
let curNote = 0;
let lastUpdated = 0;

const voiceConfig = [
  {
    "label": "Kick",
    "r": 0.5,
    "n": () => (kickLength),
    "active": (step) => (kickPattern[step] == 'x'),
    "color": "rgba(249, 168, 37,1)",
    "polyColor": "rgba(249, 168, 37,0.2)"
  },
  {
    "label": "Snare",
    "r": 0.7,
    "n": () => (snareLength),
    "active": (step) => (snarePattern[step] == 'x'),
    "color": "rgba(51, 105, 30,1)",
    "polyColor": "rgba(51, 105, 30,0.2)"
  },
  {
    "label": "Hat",
    "r": 0.9,
    "n": () => (hatLength),
    "active": (step) => (hatPattern[step] == 'x'),
    "color": "rgba(1, 87, 155,1)",
    "polyColor": "rgba(1, 87, 155,0.2)"
  },
  {
    "label": "Melody",
    "r": 1.1,
    "n": () => (melodyLength),
    "active": (step) => (melodyPattern[step] == 'x'),
    "color": "rgba(49, 27, 146,1)",
    "polyColor": "rgba(49, 27, 146,0.2)"
  }
];

let drumKit, melodySynth, reverb;
function preload() {

  reverb = new Tone.Reverb(0.5).toDestination();
  reverb.preDelay = 0.2;
  widener = new Tone.StereoWidener(0.4).toDestination();
  drumKit = new Tone.Sampler({
    urls: {
      C1: "kick.mp3",
      D1: "snare.mp3",
      E1: "hat.mp3"
    },
    baseUrl: "assets/"
  }).connect(widener);
  
  melodySynth = new Tone.MonoSynth({
    oscillator: {
      type: "sine"
    },
    envelope: {
      attack: 0.01
    },
    volume: -6
  }).connect(reverb);
}

let kickPattern, melodyTuring;

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.mousePressed(togglePlay);
  noLoop();
  patternSetup();

  gui = createGui("Euclidean Groove Thing");
  gui.prototype.addHTML("Sequencer Control", "<hr/>")
  sliderRange(75, 500, 10);
  gui.addGlobals('bpm');

  sliderRange(0, 32, 1);
  gui.prototype.addHTML("Kick Sequence", "<hr/>")
  gui.addGlobals('kickLength','kickActivations','kickRotation');
  gui.prototype.addHTML("Snare Sequence", "<hr/>")
  gui.addGlobals('snareLength','snareActivations','snareRotation');
  gui.prototype.addHTML("Hat Sequence", "<hr/>")
  gui.addGlobals('hatLength', 'hatActivations','hatRotation');
  gui.prototype.addHTML("Melody Sequence", "<hr/>")
  gui.addGlobals('melodyLength', 'melodyActivations','melodyRotation');

  // Init Counters
  syncSteps();

  melodyTuring = new TuringMech(8,0.5);
}

function syncSteps() {
  voiceConfig.forEach((v) => {
    curStep[v.label] = 0;
  })
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function patternSetup() {
  kickPattern = patternRotate(bjorklund(kickActivations,kickLength),kickRotation);
  snarePattern = patternRotate(bjorklund(snareActivations,snareLength),snareRotation);
  hatPattern = patternRotate(bjorklund(hatActivations,hatLength),hatRotation);
  melodyPattern = patternRotate(bjorklund(melodyActivations,melodyLength),melodyRotation);
  melodyScale = makeScale(
    M_NOTES[1],
    M_PRESET[2].Value
  );
  melodyScale = [...melodyScale, ...melodyScale.reverse()]
}

function togglePlay() {
  if (!isLooping()) {
    Tone.start();
    syncSteps();
    loop();    
  } else {
    noLoop()
  }

}

function draw() {
  
  // Wrap around step
  voiceConfig.forEach((v) => {
    if (curStep[v.label] >= v.n()) curStep[v.label] = 0;
  })

  // Tempo
  const delayTime = 60000 / bpm;
  if (millis() > lastUpdated + delayTime) {
    lastUpdated = millis();
   
    // Trigger Sounds
    const drumNotes = [];
    if (kickPattern[curStep['Kick']] == 'x') drumNotes.push("C1");
    if (snarePattern[curStep['Snare']] == 'x') drumNotes.push("D1");
    if (hatPattern[curStep['Hat']] == 'x') drumNotes.push("E1");
    drumKit.triggerAttackRelease(drumNotes, 0.4);
    if (melodyPattern[curStep['Melody']] == 'x') {
      let choiceNote = melodyTuring.advance();
      melodySynth.triggerAttackRelease(melodyScale[choiceNote] + 4, 0.1);
    }
    patternSetup();
    background(0);
    expensiveDraw();

    voiceConfig.forEach((v) => {
      curStep[v.label] = curStep[v.label] + 1;
    })
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
    
    const divs = 360 / current.n();
    let subr = r * current.r;

    beginShape();
    noStroke();
    for (let subd = 0; subd < current.n(); subd++) {
      const rads = radians(divs * subd);
      const divx = cx + subr * cos(rads);
      const divy = cy + subr * sin(rads);
      if (current.active(subd)) {
        vertex(divx, divy)
      } else {
        fill('rgb(224, 224, 224)');
        circle(divx, divy, subr/10);
      }
    }
    fill(current.polyColor);
    endShape(CLOSE);

    for (let subd = 0; subd < current.n(); subd++) {
      const rads = radians(divs * subd);
      const divx = cx + subr * cos(rads);
      const divy = cy + subr * sin(rads);
      noStroke();
      if (current.active(subd)) {
        fill(current.color);
      } else {
        noFill();
      }
      circle(divx, divy, subr/8);
      if (curStep[current.label] == subd) {
        noFill();
        stroke('red');
        strokeWeight(4);
        line(cx, cy, divx, divy);
        circle(divx, divy, subr/8);
      }
    }
  }
}
