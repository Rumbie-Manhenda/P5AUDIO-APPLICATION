// Create  web-based audio application using p5.js and its sound library  that can:
    // 1. Record audio
    // 2. Process the audio or a pre-recorded sound file
    // 3. Play audio (Sending  the audio to the computer's speakers or audio output)
    // 4. Save audio
    // 6. Delete audio
//The application should include the following effects:
    //1. Low-pass filter
    //2. Waveshaper distortion
    //3. Dynamic range compression
    //4. Reverb
    //5. Master volume

// combined.js

let mic;
let recorder;
let soundFile; // Store the recorded sound
let state = 0;


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
  createCanvas(800, 800);

  mic = new p5.AudioIn();
  mic.start();

  recorder = new p5.SoundRecorder();
  recorder.setInput(mic);


  // Buttons for recording control
  let startButton = createButton('Start Recording');
  startButton.position(20, 350);
  startButton.mousePressed(startRecording);

  let stopButton = createButton('Stop Recording');
  stopButton.position(150, 350);
  stopButton.mousePressed(stopRecording);

  // Button for saving and adding to the songList
  let saveButton = createButton('Save and Add to Playlist');
  saveButton.position(20, 400);
  saveButton.mousePressed(saveAndAddToPlaylist);

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

// ... (rest of the functions from musicLibrary.js and record.js)

function onSoundEnded() {
  playButton.html('Play');
  isPlaying = false;
  playhead.value(0);
}

function draw() {
  background(220);

  songs[currentSong].setVolume(pow(10, sliderVolume.value() / 50)); // Adjust volume on a logarithmic scale
  songs[currentSong].rate(sliderRate.value());
  songs[currentSong].pan(sliderPan.value());

  if (isPlaying) {
    let currentTime = songs[currentSong].currentTime();
    let duration = songs[currentSong].duration();
    let playheadValue = currentTime / duration;
    playhead.value(playheadValue);
  }

  showWaveform();
  showPlayhead();
  displaySongList();
  
}
function selectSong(index) {
  currentSong = index;
  if (isPlaying) {
    songs[currentSong].stop();
    isPlaying = false;
  }
}


  // Song selection buttons
  function displaySongList(){
    for (let i = 0; i < songs.length; i++) {
      let button = createButton(`Song ${i + 1}`);
      button.position(10, 200 + i * 40);
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

function startRecording() {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }

  if (state === 0 && mic.enabled) {
    background(255, 0, 0);
    text('Recording', 200, 200);
    soundFile = new p5.SoundFile(); // Create a new sound file
    recorder.record(soundFile); // Record into the sound file
    state++;
  }
}

function stopRecording() {
  if (state === 1) {
    background(0, 255, 0);
    text('Click to stop recording', 200, 200);
    recorder.stop(); // Stop recording
    state++;
  }
}

function saveAndAddToPlaylist() {
  if (state === 2 && soundFile) {
    saveSound(soundFile, 'recorded_audio.wav');
    songs.push(soundFile);
    state = 0; // Reset state
  }
}

function playSound(filePath) {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }

  soundFile = loadSound(filePath, () => {
    soundFile.play(); // Play the loaded sound file
  });
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
