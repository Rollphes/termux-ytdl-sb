const fs = require('fs');
const ytdl = require('ytdl-core');
const ytlist = require('youtube-playlist');
const {
  execSync
} = require('child_process');
const ffmpeg = require('fluent-ffmpeg');
const config = require('./config.json');

let downloaduuid = uuid();
let starttime = Date.now();
let downloadurl;
let flagtime = 0;
let foldername;
let completed = 0;
let errcount = 0;
let dialog_result = "";
let playlist_count = 0;
var datalist = {
  total: new Map(),
  downloaded: new Map()
}
let progress = 0;

var i = 0;
var c = 0;
function main() {
  i = 0;
  c = 0;
  downloadurl = process.argv[2];


  if (config.dialog == true) {
    let stdout = execSync(`termux-dialog sheet -v "mp3をダウンロード","mp4をダウンロード" -t "Please select a format"`);
    stdout.forEach(uni=> {
      dialog_result += String.fromCharCode(uni);
    });
    let dialog = JSON.parse(dialog_result);
    if (dialog.index == 0) {
      config.format = "mp3"
    }
    if (dialog.index == 1) {
      config.format = "mp4"
    }
  }
  if (downloadurl.match(/youtu.be/g)) {
    let chars = downloadurl.split('/');
    downloadurl = "https://www.youtube.com/watch?v="+chars[3];
    console.log(downloadurl);
  }
  if (downloadurl.match(/youtube/g)) {
    if (downloadurl.match(/list=/g)) {
      let url = `https://www.youtube.com/playlist?${downloadurl.match(/list=.*?$/g)}`;
      ytlist(url, ['id', 'name', 'url']).then((res) => {
        starttime = Date.now();
        foldername = res.data.name.replace(/\//g, '／');
        playlist_count = res.data.playlist.length;
        if (config.format == "mp4") {
          res.data.playlist.forEach((data)=> {
            totalgetmp4(data.url);
          });
          if (isExistFile(`/data/data/com.termux/files/home/storage/movies/${foldername}`)) {
            execSync(`rm "/data/data/com.termux/files/home/storage/movies/${foldername}" -r -f`);
          }
          fs.mkdirSync(`/data/data/com.termux/files/home/storage/movies/${foldername}`);
          ydpl4(res.data.playlist);
          progress++;
          ydpl4(res.data.playlist);
          progress++;
          ydpl4(res.data.playlist);
          progress++;
          ydpl4(res.data.playlist);
          progress++;
          ydpl4(res.data.playlist);
        } else if (config.format == "mp3") {
          res.data.playlist.forEach((data)=> {
            totalgetmp3(data.url);
          });
          if (isExistFile(`/data/data/com.termux/files/home/storage/music/${foldername}`)) {
            execSync(`rm "/data/data/com.termux/files/home/storage/music/${foldername}" -r -f`);
          }
          fs.mkdirSync(`/data/data/com.termux/files/home/storage/music/${foldername}`);
          ydpl3(res.data.playlist);
          progress++;
          ydpl3(res.data.playlist);
          progress++;
          ydpl3(res.data.playlist);
          progress++;
          ydpl3(res.data.playlist);
          progress++;
          ydpl3(res.data.playlist);
        } else {
          throw new Error(`There is no format called ${config.format}`);
        }
      });
    } else {
      singleytdl(downloadurl);
    }
  } else {
    throw new Error(`this not youtube url`);
  }
}

function ydpl4(playlist) {
  let data = playlist[progress];
  const video = ytdl(data.url)
  video.pipe(fs.createWriteStream(`/data/data/com.termux/files/home/storage/movies/${data.id}.mp4`));
  video.on('progress',
    (chunkLength, downloaded, total) => {
      datalist.total.set(data.url, total);
      datalist.downloaded.set(data.url, downloaded);
      if ((Date.now()-flagtime) >= 1000) {
        const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;
        flagtime = Date.now();
        execSync(`termux-notification --alert-once  --id ${downloaduuid} -t "${foldername}:${completed}/${playlist_count}downloaded" -c "${(sum(datalist.downloaded)/sum(datalist.total) * 100).toFixed(2)}% (${(sum(datalist.downloaded) / 1024 / 1024).toFixed(2)}MB/${(sum(datalist.total) / 1024 / 1024).toFixed(2)}MB)${(downloadedMinutes / (sum(datalist.downloaded)/sum(datalist.total)) - downloadedMinutes).toFixed(2)} minute left"`);
      }
    });
  video.on('error',
    (e)=> {
      execSync(`rm "/data/data/com.termux/files/home/storage/movies/${data.id}" -r -f`);
      playlist.push(data);
    });
  video.on('end',
    ()=> {
      const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;
      flagtime = Date.now();
      progress++;
      execSync(`mv "/data/data/com.termux/files/home/storage/movies/${data.id}.mp4" "/data/data/com.termux/files/home/storage/movies/${foldername}/${data.name.replace(/\//g, '／')}.mp4"`);
      completed = fs.readdirSync(`/data/data/com.termux/files/home/storage/movies/${foldername}`).length;
      execSync(`termux-notification --alert-once  --id ${downloaduuid} -t "${foldername}:${completed}/${playlist_count}downloaded" -c "${(sum(datalist.downloaded)/sum(datalist.total) * 100).toFixed(2)}% (${(sum(datalist.downloaded) / 1024 / 1024).toFixed(2)}MB/${(sum(datalist.total) / 1024 / 1024).toFixed(2)}MB)${(downloadedMinutes / (sum(datalist.downloaded)/sum(datalist.total)) - downloadedMinutes).toFixed(2)} minute left"`);
      if ((progress) < (playlist.length)) {
        ydpl4(playlist);
      }
      if (completed >= playlist_count) {
        execSync(`termux-notification-remove ${downloaduuid}`);
        execSync(`termux-toast ダウンロードが完了しました`);
        process.exit();
      }
    });
}
function singleytdl(data) {
  starttime = Date.now();
  ytdl.getInfo(data).then(info => {
    if (config.format == "mp4") {
      const video = ytdl(data);
      video.pipe(fs.createWriteStream(`/data/data/com.termux/files/home/storage/movies/${info.videoDetails.title.replace(/\//g, '／')}.mp4`));
      video.on('progress',
        (chunkLength, downloaded, total) => {
          if ((Date.now()-flagtime) >= 1000) {
            const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;
            flagtime = Date.now();
            execSync(`termux-notification --alert-once  --id ${downloaduuid} -t "${info.videoDetails.title.replace(/\//g, '／')}" -c "${(downloaded/total * 100).toFixed(2)}% (${(downloaded / 1024 / 1024).toFixed(2)}MB/${(total / 1024 / 1024).toFixed(2)}MB)${(downloadedMinutes / (downloaded/total) - downloadedMinutes).toFixed(2)} minute left"`);
          }
        });
      video.on('error',
        (e)=> {
          singleytdl(data);
        });
      video.on('end',
        ()=> {
          execSync(`termux-notification-remove ${downloaduuid}`);
          execSync(`termux-toast ダウンロードが完了しました`);
          process.exit();
        });
    } else if (config.format == "mp3") {
      const video = ytdl(data, {
        filter: 'audioonly',
        highWaterMark: 1024*1024*10
      });
      video.on('progress',
        (chunkLength, downloaded, total) => {
          if ((Date.now()-flagtime) >= 1000) {
            const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;
            flagtime = Date.now();
            execSync(`termux-notification --alert-once  --id ${downloaduuid} -t "${info.videoDetails.title.replace(/\//g, '／')}" -c "${(downloaded/total * 100).toFixed(2)}% (${(downloaded / 1024 / 1024).toFixed(2)}MB/${(total / 1024 / 1024).toFixed(2)}MB)${(downloadedMinutes / (downloaded/total) - downloadedMinutes).toFixed(2)} minute left"`);
          }
        });
      video.on('error',
        (e)=> {
          singleytdl(data);
        });
      video.on('end',
        ()=> {
          execSync(`termux-notification-remove ${downloaduuid}`);
          execSync(`termux-toast ダウンロードが完了しました`);
          process.exit();
        });
      ffmpeg(video)
      .audioBitrate(128)
      .audioFrequency(22050)
      .save(`/data/data/com.termux/files/home/storage/music/${info.videoDetails.title.replace(/\//g, '／')}.mp3`);
    } else {
      throw new Error(`There is no format called ${config.format}`);
    }
  });
}

function ydpl3(playlist) {
  let data = playlist[progress];
  const video = ytdl(data.url,
    {
      filter: 'audioonly'
    });
  video.on('progress',
    (chunkLength, downloaded, total) => {
      datalist.total.set(data.url, total);
      datalist.downloaded.set(data.url, downloaded);
      if ((Date.now()-flagtime) >= 1000) {
        const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;
        flagtime = Date.now();
        execSync(`termux-notification --alert-once  --id ${downloaduuid} -t "${foldername}:${completed}/${playlist_count}downloaded" -c "${(sum(datalist.downloaded)/sum(datalist.total) * 100).toFixed(2)}% (${(sum(datalist.downloaded) / 1024 / 1024).toFixed(2)}MB/${(sum(datalist.total) / 1024 / 1024).toFixed(2)}MB)${(downloadedMinutes / (sum(datalist.downloaded)/sum(datalist.total)) - downloadedMinutes).toFixed(2)} minute left"`);
      }
    });
  video.on('error',
    (e)=> {
      execSync(`rm "/data/data/com.termux/files/home/storage/music/${data.id}" -r -f`);
      playlist.push(data);
    });
  video.on('end',
    ()=> {
      const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;
      flagtime = Date.now();
      progress++;
      execSync(`mv "/data/data/com.termux/files/home/storage/music/${data.id}.mp3" "/data/data/com.termux/files/home/storage/music/${foldername}/${data.name.replace(/\//g, '／')}.mp3"`);
      completed = fs.readdirSync(`/data/data/com.termux/files/home/storage/music/${foldername}`).length;
      execSync(`termux-notification --alert-once  --id ${downloaduuid} -t "${foldername}:${completed}/${playlist_count}downloaded" -c "${(sum(datalist.downloaded)/sum(datalist.total) * 100).toFixed(2)}% (${(sum(datalist.downloaded) / 1024 / 1024).toFixed(2)}MB/${(sum(datalist.total) / 1024 / 1024).toFixed(2)}MB)${(downloadedMinutes / (sum(datalist.downloaded)/sum(datalist.total)) - downloadedMinutes).toFixed(2)} minute left"`);
      if ((progress) < (playlist.length)) {
        ydpl3(playlist);
      }
      if (completed >= playlist_count) {
        execSync(`termux-notification-remove ${downloaduuid}`);
        execSync(`termux-toast ダウンロードが完了しました`);
        process.exit();
      }
    });
  ffmpeg(video)
  .audioBitrate(128)
  .save(`/data/data/com.termux/files/home/storage/music/${data.id}.mp3`);

}
function isExistFile(file) {
  try {
    fs.statSync(file);
    return true
  } catch(err) {
    if (err.code === 'ENOENT') return false
  }
}
var sum = function(arr) {
  let sum = 0;
  arr.forEach(function(elm) {
    sum += elm;
  });
  return sum;
};
var average = function(arr) {
  return sum(arr)/arr.length;
};

function uuid() {
  var uuid = "",
  i,
  random;
  for (i = 0; i < 32; i++) {
    random = Math.random() * 16 | 0;

    if (i == 8 || i == 12 || i == 16 || i == 20) {
      uuid += "-"
    }
    uuid += (i == 12 ? 4: (i == 16 ? (random & 3 | 8): random)).toString(16);
  }
  return uuid;
}

function totalgetmp4(url) {
  ytdl(url)
  .on('error', (e)=> {
    totalgetmp4(url);
  })
  .on('progress',
    (chunkLength, downloaded, total) => {
      datalist.total.set(url, total);
    });
}
function totalgetmp3(url) {
  ytdl(url, {
    filter: 'audioonly'
  })
  .on('error', (e)=> {
    totalgetmp3(url);
  })
  .on('progress',
    (chunkLength, downloaded, total) => {
      datalist.total.set(url, total);
    });
}


main();