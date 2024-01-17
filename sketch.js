

//playback controls
let sliderRate;
let sliderPan;

//Recording
let mic;
let recorder;
let startButton;
let soundFile; // Store the recorded sound
let state = 0;
let isPlaying = false;
let isRecording = false;

//Buttons
let playButton;
let stopButton;
let skipStartButton;
let skipEndButton;
let loopButton;
let saveButton;
var buttons;
let buttonWidth = 100;

// low-pass filter
var lp_cutOffSlider;
var lp_resonanceSlider;
var lp_dryWetSlider;
var lp_outputSlider;
var lowPassfilter;
let spectrumOriginal;
let spectrumFiltered;

// dynamic compressor
var dc_attackSlider;
var dc_kneeSlider;
var dc_releaseSlider;
var dc_ratioSlider;
var dc_thresholdSlider;
var dc_dryWetSlider;
var dc_outputSlider;
var compressor;

// master volume
var mv_volumeSlider;

// reverb
var reverb;
var rv_durationSlider;
var rv_decaySlider;
var rv_dryWetSlider;
var rv_outputSlider;
var rv_reverseButton;

// waveshaper distortion
var wd_amountSlider;
var wd_dryWetSlider;
var wd_outputSlider;
var distortion;
var oversampleDropdown;

//Song Playlist
var songs = [];
var currentSong = 0;
var filteredSound;
var distortedSound;
var processedSound;
function preload() {
  soundFormats('mp3', 'wav');
  songs.push(loadSound('../music/afro.wav'));
  songs.push(loadSound('../music/patty.wav'));
  
}

function setup() {
  createCanvas(800, 700);
  colorMode(HSB);
  background(125, 200, 220);
  lowPassfilter = new p5.LowPass();
  distortion= new p5.Distortion();
  compressor = new p5.Compressor();
  reverb = new p5.Reverb();
  masterVolume= new p5.Gain();
  gui_configuration();
}

function draw() {
  
  //songs[currentSong].setVolume(pow(10,  mv_volumeSlider.value() / 50)); // Adjust volume on a logarithmic scale
  songs[currentSong].rate(sliderRate.value());
  songs[currentSong].pan(sliderPan.value());

  if (isPlaying) {
    let currentTime = songs[currentSong].currentTime();
    let duration = songs[currentSong].duration();
  }
  textSize(20);
  text('Song Playlist', 500,270);
  displaySongList(500, 280, 150, 200);

  fftOriginal.setInput(songs[currentSong])
  spectrumOriginal = fftOriginal.analyze(songs[currentSong]);
  drawSpectrum(10, 550, 300, 150, spectrumOriginal, 'Spectrum In');

  lowPassFilterFunction();
  distortionFunction();
  reverbFunction();
  compressorFunction();
  masterVolume.amp(mv_volumeSlider.value())
  processAudio()
//draw original spectrum
  
  // Process the output audio and draw its spectrum
  fftFiltered.setInput()
  spectrumFiltered = fftFiltered.analyze();
  drawSpectrum(400, 550, 300, 150, spectrumFiltered, 'Spectrum Out');

}

function lowPassFilterFunction()
{
 
  lowPassfilter.amp(lp_outputSlider.value());
  lowPassfilter.set( lp_cutOffSlider.value(),lp_resonanceSlider.value());
  lowPassfilter.drywet(lp_dryWetSlider.value());
  
}

function distortionFunction()
{
    distortion.drywet(wd_dryWetSlider.value());
    distortion.amp(wd_outputSlider.value());
    oversample = oversampleDropdown.value();
    distortion.set(wd_amountSlider.value(), oversample);
    
  

}

function compressorFunction()
{
  compressor.set(dc_attackSlider.value(),dc_kneeSlider.value(),dc_ratioSlider.value(),dc_thresholdSlider.value(),  dc_releaseSlider.value());
  compressor.amp(dc_outputSlider.value());
  compressor.drywet(dc_dryWetSlider.value());
  
}

function reverbFunction()
{
  
  reverb.set(rv_durationSlider.value(), rv_decaySlider.value());
  reverb.drywet(rv_dryWetSlider.value());
  reverb.amp(rv_outputSlider.value());
  
}

function reverbReverse()
{
  reverb.process(songs[currentSong] ,rv_durationSlider.value(),rv_decaySlider.value(),true);
}
function gui_configuration() {
  // Playback controls
  mic = new p5.AudioIn();
  mic.start();
  recorder = new p5.SoundRecorder();
  recorder.setInput(mic);

  startButton = createButton(' Record');
  startButton.mousePressed(startRecording);

  playButton = createButton('Play');
  playButton.mousePressed(togglePlay);

  stopButton = createButton('Stop');
  stopButton.mousePressed(stopSound);

  skipStartButton = createButton('Skip to Start');
  skipStartButton.mousePressed(skipToStart);

  skipEndButton = createButton('Skip to End');
  skipEndButton.mousePressed(skipToEnd);

  loopButton = createButton('Loop: Off');
  loopButton.mousePressed(toggleLoop);

  saveButton = createButton('Save Audio');
  saveButton.mousePressed(saveProcessedSound);

  buttons= [startButton, playButton, stopButton, skipStartButton, skipEndButton, loopButton, saveButton];  
   let gap = (width - buttonWidth * buttons.length) / (buttons.length + 2);
   for(let i = 0; i < buttons.length; i++) {
    let button = buttons[i];
    // Set button style with CSS
    button.style('background-color', '#fff');
    button.style('color', '#333');
    button.style('padding', '10px');
    button.style('border', '2px solid #333');
    button.style('cursor', 'pointer');

    // Calculate button position
    let xPosition = gap * (i + 1) + buttonWidth * i;

    // Position the buttons
    button.position(xPosition, 10);
   }


  
  fftOriginal = new p5.FFT();
  fftFiltered = new p5.FFT();
  // low-pass filter

  textSize(14);
  text('low-pass filter', 10,80);
  textSize(10);
  lp_cutOffSlider = createSlider(20,20000, 10, 500);
  lp_cutOffSlider.position(10,110);
  text('cutoff frequency', 10,105);
  lp_resonanceSlider = createSlider(5, 15, 1, 1);
  lp_resonanceSlider.position(10,155);
  text('resonance', 10,150);
  lp_dryWetSlider = createSlider(0, 1, 0.1, 0.01);
  lp_dryWetSlider.position(10,200);
  text('dry/wet', 10,195);
  lp_outputSlider = createSlider(0, 1, 0.1, 0.01);
  lp_outputSlider.position(10,245);
  text('output level', 10,240);
  
  // dynamic compressor

  textSize(14);
  text('dynamic compressor', 210,80);
  textSize(10);
  dc_attackSlider = createSlider(0, 1, 0, 0.01);
  dc_attackSlider.position(210,110);
  text('attack', 210,105);
  dc_kneeSlider = createSlider(0, 40, 0, 5);
  dc_kneeSlider.position(210,155);
  text('knee', 210,150);
  dc_releaseSlider = createSlider(0, 1, 0.1, 0.01);
  dc_releaseSlider.position(210,200);
  text('release', 210,195);
  dc_ratioSlider = createSlider(1, 20, 1, 2);
  dc_ratioSlider.position(210,245);
  text('ratio', 210,240);
  dc_thresholdSlider = createSlider(-100, 0, -5, 5);
  dc_thresholdSlider.position(360,110);
  text('threshold', 360,105);
  dc_dryWetSlider = createSlider(0, 1, 0.1, 0.01);
  dc_dryWetSlider.position(360,155);
  text('dry/wet', 360,150);
  dc_outputSlider = createSlider(0, 1, 0.1, 0.01);
  dc_outputSlider.position(360,200);
  text('output level', 360,195);
  
  // master volume
  
  textSize(14);
  text('master volume', 560,80);
  textSize(10);
  mv_volumeSlider = createSlider(0, 1, 0.1, 0.01);
  mv_volumeSlider.position(560,110);
  text('level', 560,105)
  sliderRate = createSlider(0.5, 2, 1, 0.01);
  sliderRate.position(560,155);
  text('rate', 560,150);
  sliderPan = createSlider(-1, 1, 0, 0.01);
  sliderPan.position(560,200);
  text('pan', 560,195);



  // reverb

  textSize(14);
  text('reverb', 10,305);
  textSize(10);
  rv_durationSlider = createSlider(0, 10, 0, 1);
  rv_durationSlider.position(10,335);
  text('duration', 10,330);
  rv_decaySlider = createSlider(0, 100, 0, 5);
  rv_decaySlider.position(10,380);
  text('decay', 10,375);
  rv_dryWetSlider = createSlider(0, 1, 0, 0.01);
  rv_dryWetSlider.position(10,425);
  text('dry/wet', 10,420);
  rv_outputSlider = createSlider(0, 1, 0, 0.01);
  rv_outputSlider.position(10,470);
  text('output level', 10,465);
  rv_reverseButton = createButton('reverb reverse');
  rv_reverseButton.position(10, 510);
  rv_reverseButton.mousePressed(reverbReverse);

  // waveshaper distortion

  textSize(14);
  text('waveshaper distortion', 210,305);
  textSize(10);
  wd_amountSlider = createSlider(0, 1, 0, 0.01);
  wd_amountSlider.position(210,335);
  text('distortion amount', 210,330);
  // Create a dropdown for oversample
  oversampleDropdown = createSelect();
  oversampleDropdown.option('none');
  oversampleDropdown.option('2x');
  oversampleDropdown.option('4x');
 oversampleDropdown.position(210,380);
  text('oversample', 210,375);
  wd_dryWetSlider = createSlider(0, 1, 0, 0.01);
  wd_dryWetSlider.position(210,425);
  text('dry/wet', 210,420);
  wd_outputSlider = createSlider(0, 1, 0, 0.01);
  wd_outputSlider.position(210,470);
  text('output level', 210,465);
  
}

function processAudio() {
  // Disconnect previous connections
  songs[currentSong].disconnect();

  // Connect the effects in the desired order
  songs[currentSong].connect(lowPassfilter);
  lowPassfilter.connect(distortion);
  distortion.connect(compressor);
  compressor.connect(reverb);
  reverb.connect(masterVolume);

  // Connect the master volume to the audio context destination
  masterVolume.connect(getAudioContext().destination);
  //  a new p5.SoundFile to hold the processed sound
  processedSound = new p5.SoundFile();
  // proessed sound  to the master volume
  masterVolume.connect(processedSound);
}


function drawSpectrum(x, y, w, h, spectrum, label) {
  push();
  translate(x, y);
  scale(w / spectrum.length, h / 255);

  // Draw the background rectangle for the spectrum
  noStroke();
  fill(255, 50, 180);
  rect(0, 0, spectrum.length, 255);

  // Draw a line to distinguish between the two spectra
  stroke(0);
  strokeWeight(2);
  line(0, h, spectrum.length, h);

  // Draw the spectrum bars
  for (let i = 0; i < spectrum.length; i++) {
    let heightValue = map(spectrum[i], 0, 255, 0, h);
    fill(i, 255, 0);
    rect(i, h - heightValue, 1, heightValue);
  }

  // Draw the label
  fill(0);
  textSize(30);
  textAlign(CENTER, CENTER);
  text(label, w / 2, h + 30);

  pop();
}


 // Song selection from the songs list
 function selectSong(index) {
  currentSong = index;
  if (isPlaying) {
    songs[currentSong].stop();
    isPlaying = false;
  }
}

function displaySongList(rectX, rectY, rectW, rectH) {
  fill(255, 50, 180);
  rect(rectX, rectY, rectW, rectH);
  for (let i = 0; i < songs.length; i++) {
    let button = createButton(`Song ${i + 1}`);
    button.position(rectX + 10, rectY + 40 + i * 40);
    button.mousePressed(() => selectSong(i));
  }
}


function togglePlay() {
  if (!isPlaying) {
      songs[currentSong].play();
      playButton.html('Pause');
      isPlaying = true;
  } else {
      songs[currentSong].pause();
      playButton.html('Play');
      isPlaying = false;
  }
}
function stopSound() {
    songs[currentSong].stop();
    playButton.html('Play');
    isPlaying = false;
}

function skipToStart() {
   songs[currentSong].jump(0);
}

function skipToEnd() {
  let duration = songs[currentSong].duration();
  let jumpTime = duration - 0.1; 
  if (jumpTime < 0) jumpTime = 0; // To ensure the jump time is not negative
  songs[currentSong].jump(jumpTime);
}

function toggleLoop() {
  if ( songs[currentSong].isLooping()) {
     songs[currentSong].setLoop(false);
    loopButton.html('Loop: Off');
  } else {
     songs[currentSong].setLoop(true);
    loopButton.html('Loop: On');
  }
}

function onSoundEnded() {
  playButton.html('Play');
  isPlaying = false;
 
}

function startRecording() {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }

  if (state === 0 && mic.enabled) {
    text('Recording.....', 10, 10);
    soundFile = new p5.SoundFile(); 
    recorder.record(soundFile);
    startButton.html("Stop") 
    state++;
  } else if (state === 1) {
    recorder.stop(); 
    startButton.html("Save");
    state++;
  } else if(state === 2) {
    startButton.mousePressed(saveAndAddToPlaylist);
    state++;
  }
}

function saveAndAddToPlaylist() {
  if (state === 3 && soundFile) {
    saveSound(soundFile, 'recorded_audio.wav');
    songs.push(soundFile);
    state = 0; 
  }
}

function playSound(filePath) {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }

  soundFile = loadSound(filePath, () => {
    soundFile.play(); 
  });
}

function saveProcessedSound() {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }
  let fileName = "ProcessedAudio.wav";
  // Save the processed sound
  saveSound(songs[currentSong], fileName);
  alert("Processed sound saved as processed.wav.")
}