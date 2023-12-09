let mic;
let recorder;
let soundFile; // Store the recorded sound
let state = 0;
let songList = [];

function setup() {
  createCanvas(800, 800);

  mic = new p5.AudioIn();
  mic.start();

  recorder = new p5.SoundRecorder();
  recorder.setInput(mic);

  createSongList();

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
}

function draw() {
  background(220);
  displaySongList();
}

function createSongList() {
  songList.push('./music/afro.wav');
  songList.push('./music/paper.mp3');
  songList.push('./music/rock.wav');
}

function displaySongList() {
  textSize(18);
  fill(0);
  text('Select a song to play:', 20, 20);

  for (let i = 0; i < songList.length; i++) {
    let button = createButton(`Play Song ${i + 1}`);
    button.position(20, 50 + i * 40);
    button.mousePressed(() => playSound(songList[i]));
  }
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
    songList.push('recorded_audio.wav');
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
