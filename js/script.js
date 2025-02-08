// This function will return all the songs from our directory
let currentSong = new Audio();
let songs = [];
let currfolder = "";

function secondsToMinutesSecounds(seconds) {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

async function getsongs(folder) {
  try {
    currfolder = folder;
    console.log(`Fetching songs from: /${folder}/`);

    let response = await fetch(`/${folder}/`);
    let text = await response.text();

    let div = document.createElement("div");
    div.innerHTML = text;
    let anchors = div.getElementsByTagName("a");

    songs = [];
    for (let element of anchors) {
      let href = element.href;
      if (href.endsWith(".mp3")) {
        let songName = decodeURIComponent(href.split(`/${folder}/`).pop());
        songs.push(songName);
      }
    }

    console.log("Songs found:", songs);
    
    // Show all the songs in the playlist
    let songul = document.querySelector(".songlist ul");
    songul.innerHTML = songs.map(song => `
      <li> 
        <img class="invert" src="img/music.svg" alt="" />
        <div class="info">
          <div>${song.replaceAll("%20", " ")}</div>
          <div>IB</div>
        </div>
        <div class="playnow">
          <span>Play now</span>
          <img class="invert" src="img/play.svg" alt="" />
        </div>
      </li>
    `).join("");

    // Attach event listeners to songs
    document.querySelectorAll(".songlist li").forEach(e => {
      e.addEventListener("click", () => {
        playMusic(e.querySelector(".info div").textContent.trim());
      });
    });

    return songs;
  } catch (error) {
    console.error("Error fetching songs:", error);
  }
}

const playMusic = (track, pause = false) => {
  if (!track) return;
  currentSong.src = `/${currfolder}/` + encodeURIComponent(track);
  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = track;
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  try {
    console.log("Displaying albums...");
    let response = await fetch(`/songs/`);
    let text = await response.text();

    let div = document.createElement("div");
    div.innerHTML = text;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");

    for (let e of anchors) {
      if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
        let folder = e.href.split("/").slice(-2)[0];

        // Fetch metadata if available
        let metadataResponse = await fetch(`/songs/${folder}/info.json`);
        let metadata = await metadataResponse.json();

        cardContainer.innerHTML += `
          <div data-folder="${folder}" class="card">
            <div class="play">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round"/>
              </svg>
            </div>
            <img src="/songs/${folder}/cover.jpg" alt="">
            <h2>${metadata.title}</h2>
            <p>${metadata.description}</p>
          </div>
        `;
      }
    }

    // Load playlist when a card is clicked
    document.querySelectorAll(".card").forEach(e => {
      e.addEventListener("click", async () => {
        songs = await getsongs(`songs/${e.dataset.folder}`);
        if (songs.length > 0) playMusic(songs[Math.floor(Math.random() * songs.length)]);
      });
    });

  } catch (error) {
    console.error("Error displaying albums:", error);
  }
}

async function main() {
  await getsongs("songs/ncs");
  if (songs.length > 0) playMusic(songs[0], true);

  displayAlbums();

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = 
      `${secondsToMinutesSecounds(currentSong.currentTime)} / ${secondsToMinutesSecounds(currentSong.duration)}`;
    document.querySelector(".circle").style.left = 
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-110%";
  });

  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").pop());
    if (index > 0) playMusic(songs[index - 1]);
  });

  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").pop());
    if (index < songs.length - 1) playMusic(songs[index + 1]);
  });

  document.querySelector(".range input").addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100;
    document.querySelector(".volume img").src = currentSong.volume > 0 ? 
      "img/volume.svg" : "img/mute.svg";
  });

  document.querySelector(".volume img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = "img/mute.svg";
      currentSong.volume = 0;
      document.querySelector(".range input").value = 0;
    } else {
      e.target.src = "img/volume.svg";
      currentSong.volume = 0.1;
      document.querySelector(".range input").value = 10;
    }
  });
}

main();
