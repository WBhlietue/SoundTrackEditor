const fs = require("fs");
const mapName = "Bloody Stream";
const flyTime = 1;
const diff = ["1", "2", "3", "4"];
const datas = [];
var base64Data;

fs.readFile("./data/audio.mp3", { encoding: "base64" }, (a, b) => {
  base64Data = "data:audio/mp3;base64," + b;
  ReadData(0);
});

// "data": [
//     {
//       "time": 0.869327,
//       "type": 1,
//       "flyTime": 0.5,
//       "value": 0,
//       "name": "default"
//     },

function ReadData(index) {
  if (index >= diff.length) {
    const fullData = {
      name: mapName,
      data: datas,
      audio: base64Data,
    };
    fs.writeFile(
      mapName + ".musicjump",
      JSON.stringify(fullData),
      { encoding: "utf-8" },
      (e, r) => {}
    );
    return;
  }
  if (index == 0) {
    datas.length = 0;
  }
  const data = [];
  fs.readFile(
    "./data/" + diff[index] + ".osu",
    { encoding: "utf-8" },
    (e, r) => {
      const lines = r.split("\n");
      let startWrite = false;
      const line = [];
      for (let i of lines) {
        if (!startWrite) {
          if (i == "[HitObjects]\r") {
            startWrite = true;
          }
          continue;
        }
        if (i[0] == "[") {
          break;
        }
        line.push(i);
      }
      var preTime = 0;
      var preType = GetRandomInt(0, 1);
      for (let i of line) {
        // if (i.split(",")[3] == "1" ||i.split(",")[3] =="4")
        if (parseInt(i.split(",")[2]) - preTime > 100) {
          console.log(parseInt(i.split(",")[2]) - preTime, preTime);
          let time = parseInt(i.split(",")[2]);
          let t = time - preTime > 500 ? GetRandomInt(0, 1) : preType;
          preType = t;
          data.push({
            time: time / 1000,
            type: t,
            flyTime: 1,
            value: 0,
            name: "default",
          });
          preTime = time;
        }
      }
      datas.push({ data: data });
      ReadData(index + 1);
    }
  );
}

function GetRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
