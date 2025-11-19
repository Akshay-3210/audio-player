console.log("start");

let currentsong = new Audio();
let s = [];
let currfolder = "";

// Format time
function formatSecondsToMinutes(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(Math.floor(seconds % 60)).padStart(2, '0');
    return `${mins}:${secs}`;
}

// Load songs from an album folder
async function gsongs(folder) {
    currfolder = folder;

    let res = await fetch(`/songs/${folder}/info.json`);
    let meta = await res.json();

    s = meta.songs;

    renderSongList();
    return s;
}

// Render song list dynamically
function renderSongList() {
    let songul = document.querySelector(".g ul");
    songul.innerHTML = "";

    for (const file of s) {
        songul.innerHTML += `
        <li>
            <img src="img/music.svg" style="filter: invert(1);">
            <div class="info">
                <div>${file}</div>
                <div></div>
            </div>
            <div class="playnow">
                <span>Play now</span>
                <img src="img/play.svg" style="filter: invert(1);">
            </div>
        </li>`;
    }

    // Click listener on each song
    document.querySelectorAll(".g li").forEach(li => {
        li.addEventListener("click", () => {
            let name = li.querySelector(".info div").innerText;
            playmusic(name);
        });
    });
}

// Play a song
function playmusic(filename, pause = false) {
    currentsong.src = `/songs/${currfolder}/${filename}`;

    if (!pause) {
        currentsong.play();
        play.src = "img/pause.svg";
    }

    document.querySelector(".songinfo").innerHTML = filename;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

// Display album cards
async function dsiplayalbums() {
    let cardcon = document.querySelector(".cardcon");
    const albums = ["cs", "ncs", "shin"]; // SIMPLE LIST

    for (const folder of albums) {
        let info = await fetch(`/songs/${folder}/info.json`);
        let meta = await info.json();

        cardcon.innerHTML += `
        <div data-folder="${folder}" class="card">
            <div class="play">▶</div>
            <img src="/songs/${folder}/cover.jpg">
            <h2>${meta.title}</h2>
            <p>${meta.description}</p>
        </div>`;
    }

    // When clicking on an album card
    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", async () => {
            await gsongs(card.dataset.folder);
            playmusic(s[0]);
        });
    });
}

async function main() {
    await dsiplayalbums();

    await gsongs("cs");  // default album
    playmusic(s[0], true);

    const playBtn = document.getElementById("play");
    const nextBtn = document.getElementById("next");
    const prevBtn = document.getElementById("previous");

    // Play / Pause
    playBtn.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            playBtn.src = "img/pause.svg";
        } else {
            currentsong.pause();
            playBtn.src = "img/play.svg";
        }
    });

    // Update time
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${formatSecondsToMinutes(currentsong.currentTime)} / ${formatSecondsToMinutes(currentsong.duration)}`;

        document.querySelector(".circle").style.left =
            (currentsong.currentTime * 100) / currentsong.duration + "%";
    });

    // Seekbar click
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.clientWidth) * 100;
        currentsong.currentTime = (percent * currentsong.duration) / 100;
        document.querySelector(".circle").style.left = percent + "%";
    });

    // Next / Previous
    prevBtn.addEventListener("click", () => {
        let currentFile = decodeURIComponent(currentsong.src.split("/").pop());
        let idx = s.indexOf(currentFile);
        idx = idx === 0 ? s.length - 1 : idx - 1;
        playmusic(s[idx]);
    });

    nextBtn.addEventListener("click", () => {
        let currentFile = decodeURIComponent(currentsong.src.split("/").pop());
        let idx = s.indexOf(currentFile);
        idx = idx === s.length - 1 ? 0 : idx + 1;
        playmusic(s[idx]);
    });

    // Volume
    document.querySelector(".range input").addEventListener("input", e => {
        currentsong.volume = e.target.value / 100;
    });

    // Mute
    document.querySelector(".volume img").addEventListener("click", e => {
        if (currentsong.volume > 0) {
            e.target.src = "img/mute.svg";
            currentsong.volume = 0;
        } else {
            e.target.src = "img/volume.svg";
            currentsong.volume = 0.5;
        }
        document.querySelector(".range input").value = currentsong.volume * 100;
    });

    // ===== Add Song =====
    document.getElementById("addSongBtn").addEventListener("click", () => {
        const input = document.getElementById("newSong");
        const filename = input.value.trim();
        if (!filename) return alert("Enter a filename!");

        s.push(filename); // add to current song list
        renderSongList();
        input.value = "";
    });

    // ===== Search Songs =====
    document.getElementById("searchInput").addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = s.filter(song => song.toLowerCase().includes(query));
        const songul = document.querySelector(".g ul");
        songul.innerHTML = "";
        for (const file of filtered) {
            songul.innerHTML += `
            <li>
                <img src="img/music.svg" style="filter: invert(1);">
                <div class="info">
                    <div>${file}</div>
                    <div></div>
                </div>
                <div class="playnow">
                    <span>Play now</span>
                    <img src="img/play.svg" style="filter: invert(1);">
                </div>
            </li>`;
        }

        // Reattach click listeners
        document.querySelectorAll(".g li").forEach(li => {
            li.addEventListener("click", () => {
                let name = li.querySelector(".info div").innerText;
                playmusic(name);
            });
        });
    });
}

main();
