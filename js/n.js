console.log("start");

let currentsong = new Audio();
let s;
let currfolder;

function formatSecondsToMinutes(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const totalSeconds = Math.floor(seconds);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

async function gsongs(folder) {
    currfolder = folder;
    let a = await fetch(`../songs/${folder}`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    s = [];
    for (let i = 0; i < as.length; i++) {
        const e = as[i];
        if (e.href.endsWith(".mp3")) {
            s.push(e.href.split(`/songs/${folder}`)[1]);
        }
    }

    let songul = document.querySelector(".g").getElementsByTagName("ul")[0];
    songul.innerHTML = "";

    for (const i of s) {
        songul.innerHTML += `
        <li>
            <img src="../img/music.svg" style="filter: invert(1);" alt="">
            <div class="info">
                <div>${i.replaceAll("%20", " ")}</div>
                <div>Aks</div>
            </div>
            <div class="playnow">
                <span>Play now</span>
                <img src="../img/play.svg" style="filter: invert(1);" alt="">
            </div>
        </li>`;
    }

    Array.from(document.querySelector(".g").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playmusic(e.querySelector(".info").firstElementChild.innerHTML);
        });
    });

    return s;
}

const playmusic = (e, pause = false) => {
    currentsong.src = `../songs/${currfolder}${e}`;
    if (!pause) {
        currentsong.play().catch(err => console.warn("Autoplay blocked:", err));
        play.src = "../img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(e);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function dsiplayalbums() {
    let a = await fetch(`../songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardcon = document.querySelector(".cardcon");
    let array = Array.from(anchors);

    for (let i = 0; i < array.length; i++) {
        const e = array[i];
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0];
            try {
                let a = await fetch(`../songs/${folder}/info.json`);
                let response = await a.json();

                cardcon.innerHTML += `
                <div data-folder=${folder} class="card">
                    <div class="play">
                        <svg width="45" height="45" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="50" r="45" fill="#1ed760" />
                            <polygon points="40,30 70,50 40,70" fill="black" />
                        </svg>
                    </div>
                    <img src="../songs/${folder}/cover.jpg" alt="">
                    <h2>${response.title}</h2>
                    <p>${response.description}</p>
                </div>`;
            } catch (err) {
                console.warn(`Missing info.json or image in folder: ${folder}`);
            }
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            await gsongs(`${item.currentTarget.dataset.folder}/`);
            playmusic(s[0]);
        });
    });
}

async function main() {
    await gsongs("cs/");
    playmusic(s[0], true);
    dsiplayalbums();

    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play().catch(err => console.warn("Play blocked:", err));
            play.src = "../img/pause.svg";
        } else {
            currentsong.pause();
            play.src = "../img/play.svg";
        }
    });

    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${formatSecondsToMinutes(currentsong.currentTime)} / ${formatSecondsToMinutes(currentsong.duration)}`;
        document.querySelector(".circle").style.left =
            (currentsong.currentTime * 100) / currentsong.duration + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let p = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = p + "%";
        currentsong.currentTime = currentsong.duration * (p / 100);
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
        document.querySelector(".hamburger").style.display = "none";
        document.querySelector(".cross").style.display = "block";
    });

    document.querySelector(".cross").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
        document.querySelector(".hamburger").style.display = "block";
        document.querySelector(".cross").style.display = "none";
    });

    previous.addEventListener("click", () => {
        let idx = s.indexOf(currentsong.src.split(`songs/${currfolder}`)[1]);
        playmusic(idx === 0 ? s[s.length - 1] : s[idx - 1]);
    });

    next.addEventListener("click", () => {
        let idx = s.indexOf(currentsong.src.split(`songs/${currfolder}`)[1]);
        playmusic(idx === s.length - 1 ? s[0] : s[idx + 1]);
    });

    document.querySelector(".range input").addEventListener("change", (e) => {
        currentsong.volume = parseFloat(e.target.value) / 100;
    });

    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("img/volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg");
            currentsong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg");
            currentsong.volume = 0.1;
            document.querySelector(".range input").value = 10;
        }
    });
}

main();
