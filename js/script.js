// this function will return all the songs from our directory
let currentSong = new Audio();
let songs;
let currfolder;

function secondsToMinutesSecounds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinuted = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");
  return `${formattedMinuted}:${formattedSeconds}`;
}

async function getsongs(folder) {
  currfolder = folder;
  let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1])
    }
  }


  //show all the songs in the playlist
  let songul = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];
  songul.innerHTML = "";
  for (const song of songs) {
    songul.innerHTML =
      songul.innerHTML +
      `<li> 
        
        <img class="invert" src="img/music.svg" alt="" />
        <div class="info">
          <div>${song.replaceAll("%20", " ")}</div>
          <div>IB</div>
        </div>
        <div class="playnow">
          <span>Play now</span>
          <img class="invert" src="img/play.svg" alt="" />
        </div> </li>`;
  }
  //attach an event listner to each song
  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
  return songs
}
const playMusic = (track, pause = false) => {
  // let audio = new Audio("/songs/" + track)
  currentSong.src = `/${currfolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  console.log("displaying albums");
  let a = await fetch(`/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
      let folder = e.href.split("/").slice(-2)[0];
      // Get the metadata of the folder
      let a = await fetch(`/songs/${folder}/info.json`);
      let response = await a.json();
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        ` <div data-folder="${folder}" class="card">
          <div class="play">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                      stroke-linejoin="round" />
              </svg>
          </div>

          <img src="/songs/${folder}/cover.jpg" alt="">
          <h2>${response.title}</h2>
          <p>${response.description}</p>
      </div>`;
    }
  }


  //load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0])


    });
  });
}

async function main() {
  //get the lists of all songs
  await getsongs("songs/ncs");

  playMusic(songs[0], true);

  //display all the albums on the page
  displayAlbums();

  // Attach an event listner to play, next and previous
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });

  

  //listen for time update event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSecounds(
      currentSong.currentTime
    )} / ${secondsToMinutesSecounds(currentSong.duration)}`;

    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // add an event listner to seekbar

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // add an event listner for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });
  // add an event listner for close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-110%";
  });

  // add an event listner to previous
  previous.addEventListener("click", () => {
    console.log("previous clicked");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    console.log(songs, index);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  // add an event listner to next
  next.addEventListener("click", () => {
    console.log("next clicked");

    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    console.log(songs, index);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });
  // add an event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log("setting volume to", e.target.value, "/100");
      currentSong.volume = parseInt(e.target.value) / 100;
    });

  // add eventListner to mute the track
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 0.1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });
}
main();
