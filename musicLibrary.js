
let playButton;
let stopButton;
let skipStartButton;
let skipEndButton;
let loopButton;
let sliderVolume;
let sliderRate;
let sliderPan;
let waveform;
let playhead;
let isPlaying = false;

let songs = [];
let currentSong = 0;


function preload() {
  soundFormats('mp3', 'wav');
  songs.push(loadSound('./music/afro.wav'));
  songs.push(loadSound('./music/paper.mp3'));
  songs.push(loadSound('./music/rock.wav'));
}

function setup() {
  createCanvas(800, 600);
  background(125, 200, 220);
    
 // Song selection buttons
  for (let i = 0; i < songs.length; i++) {
    let button = createButton(`Song ${i + 1}`);
    button.position(10, 200 + i * 40);
    button.mousePressed(() => selectSong(i));
  }
  
  // Play button
  playButton = createButton('Play');
  playButton.position(10, 10);
  playButton.mousePressed(togglePlay);
  
  // Stop button
  stopButton = createButton('Stop');
  stopButton.position(70, 10);
  stopButton.mousePressed(stopSound);
  
  // Skip to start button
  skipStartButton = createButton('Skip to Start');
  skipStartButton.position(140, 10);
  skipStartButton.mousePressed(skipToStart);
  
  // Skip to end button
  skipEndButton = createButton('Skip to End');
  skipEndButton.position(240, 10);
  skipEndButton.mousePressed(skipToEnd);
  
  // Loop button
  loopButton = createButton('Loop: Off');
  loopButton.position(360, 10);
  loopButton.mousePressed(toggleLoop);
  
  // Volume slider (logarithmic scale)
  sliderVolume = createSlider(0, 100, 50, 1);
  sliderVolume.position(10, 50);
  createDiv('Volume').position(140, 50);
  
  // Rate slider
  sliderRate = createSlider(0.5, 2, 1, 0.01);
  sliderRate.position(10, 90);
  createDiv('Rate').position(140, 90);
  
  // Pan slider
  sliderPan = createSlider(-1, 1, 0, 0.01);
  sliderPan.position(10, 130);
  createDiv('Pan').position(140, 130);
  
  // Get the waveform data for visualization
  waveform = songs[currentSong].getPeaks(800);
  
  // Playhead to indicate the current position
  playhead = createSlider(0, 1, 0, 0.01);
  playhead.position(10, 170);
  playhead.style('width', '780px');
  playhead.hide();
  
  songs[currentSong].onended(onSoundEnded);
  songs[currentSong].playMode('restart');
}




function selectSong(index) {
  currentSong = index;
  if (isPlaying) {
    songs[currentSong].stop();
    isPlaying = false;
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
   songs[currentSong].jump( songs[currentSong].duration());
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
  playhead.value(0);
}

function draw() {
  background(125, 200, 220);
  
   songs[currentSong].setVolume(pow(10, sliderVolume.value() / 50)); // Adjust volume on a logarithmic scale
   songs[currentSong].rate(sliderRate.value());
   songs[currentSong].pan(sliderPan.value());
  
  if (isPlaying) {
    let currentTime =  songs[currentSong].currentTime();
    let duration =  songs[currentSong].duration();
    let playheadValue = currentTime / duration;
    playhead.value(playheadValue);
  }
  
  showWaveform();
  showPlayhead();
}


function showWaveform() {
  playhead.show();
  beginShape();
  for (let i = 0; i < waveform.length; i++) {
    let x = map(i, 0, waveform.length, 0, width);
    let y = map(waveform[i], -1, 1, height, 0);
    vertex(x, y);
  }
  endShape();
}

function showPlayhead() {
  let playheadPos = playhead.value() * width;
  stroke(255, 0, 0);
  line(playheadPos, 0, playheadPos, height);
}

function updateWaveform(waveform) {
  playhead.show();
  playhead.value(0);

  beginShape();
  for (let i = 0; i < waveform.length; i++) {
    let x = map(i, 0, waveform.length, 0, width);
    let y = map(waveform[i], -1, 1, height, 0);
    vertex(x, y);
  }
  endShape();
}
