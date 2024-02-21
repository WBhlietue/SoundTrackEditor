class Tile {
  constructor(t) {
    this.time = t;
    this.type = -1;
    (this.flyTime = 0.5), (this.value = 0), (this.selected = false);
    this.x = 0;
    this.name = "default";
    this.value = 0;
  }
}
class TileManager {
  constructor(totalTime) {
    this.totalTime = totalTime;
    this.tiles = [];
  }
  AddTile(tile) {
    this.tiles.push(tile);
    this.tiles.sort((a, b) => {
      return a.time - b.time;
    });
  }
  Remove(tile) {
    this.tiles = this.tiles.filter((i) => i !== tile);
  }
  Sort() {
    this.tiles.sort((a, b) => {
      return a.time - b.time;
    });
  }
  Clear() {
    this.tiles = [];
  }
}

var audioBase;
const clickOffset = 10;
var selectedTile = null;
var wavesurfer;
var loaded = false;
const frame = 60;
const interval = 1000 / frame;
const audioOffset = interval / 2000;
var jumpValue = 0.5;
var tileManager;
var width;
var widthScale = 1;
const aOffset = 0.09;
const edit = document.getElementById("edit");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const waveDiv = document.getElementById("waveform");
const tileSize = [10, 50];
var selectedTrack = 0;
var tracks = [null, null, null, null];
var imageBase;

function getFileExtensionFromBase64(base64String) {
  var matches = base64String.match(/^data:(.*);base64,/);

  if (matches && matches.length > 1) {
    var mimeType = matches[1];

    var extension = mimeType.split("/")[1];

    return extension;
  }

  return null;
}
document.getElementById("LoadFile").onclick = () => {
  var fileInput = document.getElementById("fileInput");
  if (fileInput.files.length > 0) {
    const selectedFile = fileInput.files[0];

    const reader = new FileReader();
    reader.onload = function (e) {
      const jsonContent = JSON.parse(e.target.result);
      console.log(jsonContent);
      audioBase = jsonContent.audio;
      imageBase = jsonContent.image;
      document.getElementById("nameInput").value = jsonContent.name;
      for (let i = 0; i < 4; i++) {
        const tiles = jsonContent.data[i].data;
        const tM = new TileManager();
        for (let j of tiles) {
          const tile = new Tile(j.time);
          tile.name = j.name;
          tile.value = j.value;
          tile.type = j.type;
          tile.flyTime = j.flyTime;
          tM.AddTile(tile);
        }
        tracks[i] = tM;
      }
      wavesurfer = WaveSurfer.create({
        container: "#waveform",
        waveColor: "#4F4A85",
        progressColor: "#383351",
        url: audioBase,
      });
      canvas.height = 200;
      Resize();
      tileManager = tracks[selectedTrack];
      loaded = true;
    };

    reader.readAsText(selectedFile);
  }
};

document.getElementById("select").onchange = () => {
  const value = parseInt(document.getElementById("select").value) - 1;
  //   console.log(value);
  selectedTrack = value;
  tileManager = tracks[selectedTrack];
  console.log(tileManager);
};
document.getElementById("clear").onclick = () => {
  tileManager.Clear();
};
document.getElementById("audioInput").onchange = () => {
  var audioInput = document.getElementById("audioInput");
  console.log(audioInput);
  if (audioInput.files.length > 0) {
    var audioFile = audioInput.files[0];
    var reader = new FileReader();
    reader.onload = function (event) {
      var base64Data = event.target.result;
      wavesurfer = WaveSurfer.create({
        container: "#waveform",
        waveColor: "#4F4A85",
        progressColor: "#383351",
        url: base64Data,
      });
      audioBase = base64Data;
      width = waveDiv.offsetWidth;
      canvas.height = 200;
      canvas.width = waveDiv.offsetWidth;
      tracks[0] = new TileManager(wavesurfer.getDuration());
      tracks[1] = new TileManager(wavesurfer.getDuration());
      tracks[2] = new TileManager(wavesurfer.getDuration());
      tracks[3] = new TileManager(wavesurfer.getDuration());
      tileManager = tracks[selectedTrack];
      loaded = true;
    };
    reader.readAsDataURL(audioFile);
  } else {
    alert("Select file");
  }
};

document.getElementById("imageInput").onchange = () => {
  var audioInput = document.getElementById("imageInput");
  if (audioInput.files.length > 0) {
    var audioFile = audioInput.files[0];
    var reader = new FileReader();
    reader.onload = function (event) {
      var base64Data = event.target.result;
      imageBase = base64Data;
    };
    reader.readAsDataURL(audioFile);
  } else {
    alert("Select file");
  }
};

function Resize() {
  waveDiv.style.width = width * widthScale + "px";
  canvas.width = waveDiv.offsetWidth;
  canvas.height = 200;
}

window.onresize = () => {
  if (!loaded) {
    return;
  }
  Resize();
};
var canScale = false;
window.onkeydown = (e) => {
  if (e.code == "KeyS") {
    canScale = true;
  }
};
window.onkeyup = (e) => {
  if (e.code == "KeyS") {
    canScale = false;
  }
};
document.getElementById("main").onwheel = (e) => {
  if (!canScale || !loaded || e.shiftKey) {
    return;
  }
  if (e.deltaY < 0) {
    widthScale *= 0.9;
  }
  if (e.deltaY > 0) {
    widthScale /= 0.9;
  }
  document.getElementById("size").value = widthScale;
  Resize();
};

document.getElementById("step").oninput = () => {
  const value = document.getElementById("step").value;
  jumpValue = value;
};
document.getElementById("volume").oninput = () => {
  if (!loaded) {
    return;
  }
  const value = document.getElementById("volume").value;
  wavesurfer.setVolume(value);
};
document.getElementById("size").oninput = () => {
  if (!loaded) {
    return;
  }
  const value = document.getElementById("size").value;
  widthScale = value;
  Resize();
};
document.getElementById("speed").oninput = () => {
  if (!loaded) {
    return;
  }
  const value = document.getElementById("speed").value;
  wavesurfer.setPlaybackRate(value);
};
document.onkeydown = (e) => {
  if (!loaded) {
    return;
  }
  if (e.code == "ArrowLeft") {
    wavesurfer.setTime(wavesurfer.getCurrentTime() - jumpValue);
  }
  if (e.code == "ArrowRight") {
    wavesurfer.setTime(wavesurfer.getCurrentTime() + jumpValue);
  }
  if (e.code == "Space") {
    wavesurfer.playPause();
  }
  if (e.code == "KeyR") {
    RecordKey();
  }
};
document.getElementById("PlayPause").onclick = () => {
  if (!loaded) {
    return;
  }
  wavesurfer.playPause();
};

document.getElementById("Reset").onclick = () => {
  if (!loaded) {
    return;
  }
  wavesurfer.stop();
};
document.getElementById("Export").onclick = () => {
  if (!loaded) {
    return;
  }
  Export();
};
var mouseSelect = false;
waveDiv.onmousedown = () => {
  mouseSelect = true;
};
waveDiv.onmouseup = () => {
  mouseSelect = false;
};
waveDiv.onmouseout = () => {
  mouseSelect = false;
};
waveDiv.onmouseover = () => {
  mouseSelect = false;
};
waveDiv.onmousemove = (e) => {
  if (!mouseSelect) {
    return;
  }
  const value = e.offsetX / waveDiv.offsetWidth;
  wavesurfer.setTime(value * wavesurfer.getDuration());
};
function GetRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
canvas.onclick = (e) => {
  const clickedPos = e.offsetX;
  var tmpTile = null;
  for (let i = 0; i < tileManager.tiles.length; i++) {
    if (clickedPos < tileManager.tiles[i].x) {
      if (i == 0) {
        tmpTile = tileManager.tiles[i];
      } else {
        if (
          Math.abs(clickedPos - tileManager.tiles[i].x) >
          Math.abs(clickedPos - tileManager.tiles[i - 1].x)
        ) {
          tmpTile = tileManager.tiles[i - 1];
        } else {
          tmpTile = tileManager.tiles[i];
        }
      }
      break;
    }
  }
  if (tmpTile == null) {
    tmpTile = tileManager.tiles[tileManager.tiles.length - 1];
  }
  if (selectedTile) {
    selectedTile.selected = false;
  }
  if (Math.abs(tmpTile.x - clickedPos) < clickOffset) {
    selectedTile = tmpTile;
    tmpTile.selected = true;
    document.getElementById("tileTime").value = selectedTile.time;
  } else {
    selectedTile = null;
  }
};
var moveValue = 0.1;
document.getElementById("tileDelete").onclick = () => {
  tileManager.Remove(selectedTile);
  selectedTile = null;
};
document.getElementById("tileTime").oninput = () => {
  const value = document.getElementById("tileTime").value;
  selectedTile.time = value;
  tileManager.Sort();
};
document.getElementById("moveValue").oninput = () => {
  const value = document.getElementById("moveValue").value;
  moveValue = value;
};
document.getElementById("moveLeft").onclick = () => {
  selectedTile.time -= moveValue;
  document.getElementById("tileTime").value = selectedTile.time;
};
document.getElementById("moveRight").onclick = () => {
  selectedTile.time -= -moveValue;
  document.getElementById("tileTime").value = selectedTile.time;
};

document.getElementById("tileName").oninput = () => {
  const value = document.getElementById("tileName").value;
  selectedTile.name = value;
};
document.getElementById("tileType").oninput = () => {
  const value = document.getElementById("tileType").value;
  selectedTile.type = parseInt(value);
};
document.getElementById("tileValue").oninput = () => {
  const value = document.getElementById("tileValue").value;
  selectedTile.value = parseFloat(value);
};

function RecordKey() {
  const time = wavesurfer.getCurrentTime();
  const tile = new Tile(time);
  tileManager.AddTile(tile);
}
function Export() {
  const data = [];
  for (let j of tracks) {
    const d = [];
    for (let i of j.tiles) {
      d.push({
        time: i.time,
        type:
          i.type == -1
            ? GetRandomInt(
                0,
                parseInt(document.getElementById("typeRandom").value)
              )
            : i.type,
        flyTime: i.flyTime,
        value: i.value,
        name: i.name,
      });
    }
    data.push({ data: d });
  }
  const n = document.getElementById("nameInput").value;
  const jsonString = JSON.stringify(
    {
      audio: audioBase,
      image: imageBase,
      name: n.length == 0 ? "no name" : n,
      data: data,
    },
    null,
    2
  );
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "data.json";
  a.click();
}

function AudioPlay() {
  if (wavesurfer.isPlaying()) {
    document.getElementById("audio").pause();
    document.getElementById("audio").currentTime = 0;

    document.getElementById("audio").play();
  }
}

function DrawTile() {
  ctx.fillStyle = "#303030";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  let height = 0;
  let reverse = false;
  for (let i = 0; i < tileManager.tiles.length; i++) {
    const tile = tileManager.tiles[i];
    const x =
      (tile.time / wavesurfer.getDuration()) * canvas.width - tileSize[0] / 2;
    tile.x = x;
    // const y = height * tileSize[1]
    // if(reverse){
    //     height--;
    //     if(height == 0){
    //         reverse = false;
    //     }
    // }else{
    //     height++
    //     if(height == 3){
    //         reverse = true
    //     }
    // }
    const y = (canvas.height - tileSize[1]) / 2;

    ctx.fillStyle = tile.selected ? "#0000ff" : "#00ff00";
    ctx.fillRect(x, y, tileSize[0], tileSize[1]);
  }
}

function CheckAudio() {
  const currentTime = wavesurfer.getCurrentTime();
  for (let i of tileManager.tiles) {
    if (Math.abs(currentTime - (i.time - aOffset)) < audioOffset) {
      AudioPlay();
      return;
    }
  }
}

function Update() {
  if (loaded) {
    const currentTime = wavesurfer.getCurrentTime().toFixed(2);
    const duration = wavesurfer.getDuration().toFixed(2);

    document.getElementById(
      "timeView"
    ).innerHTML = `${currentTime}:${duration}`;

    DrawTile();
    CheckAudio();
  }
  edit.style.display = selectedTile ? "inline" : "none";
}

setInterval(() => {
  Update();
}, interval);
