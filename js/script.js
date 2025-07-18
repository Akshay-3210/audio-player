console.log("start");

let currentsong = new Audio();
let s;
let currfolder;
let z;

function formatSecondsToMinutes(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const totalSeconds = Math.floor(seconds); // Truncate decimal part
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}


async function gsongs(folder) {
    currfolder = folder;
    let a = await fetch(`https://github.com/Akshay-3210/audio-player/tree/main/songs/${folder}`);
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
    // playmusic(s[0]);


    let songul = document.querySelector(".g").getElementsByTagName("ul")[0];
    songul.innerHTML = "";

    for (const i of s) {
        songul.innerHTML = songul.innerHTML + `
        <li>
                            <img src="img/music.svg" style="filter: invert(1);" alt="">
                            <div class="info">
                                <div>${i.replaceAll("%20", " ")}</div>
                                <div>Aks</div>
                            </div>
                            <div class="playnow">
                                <span>Play now</span>
                                <img src="img/play.svg" style="filter: invert(1);" alt="">
                            </div>
                        </li>`;
    }

    // attach event lis to song
    Array.from(document.querySelector(".g").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playmusic(e.querySelector(".info").firstElementChild.innerHTML)
        })
    })
    return s
}


const playmusic = (e, pause = false) => {
    // let audio=new Audio(`/songs/${e}`);
    currentsong.src = `/songs/${currfolder}${e}`;
    if (!pause) {
        currentsong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(e);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

}

async function dsiplayalbums() {
    let a = await fetch(`https://github.com/Akshay-3210/audio-player/tree/main/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardcon=document.querySelector(".cardcon");
    let array=Array.from(anchors);

    for (let i = 0; i < array.length; i++) {
        const e = array[i];
        if (e.href.includes("\songs")) {
            let folder = e.href.split("/").slice(-2)[0];
            //meta data
            let a = await fetch(`https://github.com/Akshay-3210/audio-player/tree/main/songs/${folder}/info.json`);
            // console.log(a);
            let response = await a.json();
            // console.log(response);
            cardcon.innerHTML=cardcon.innerHTML+
            `
            <div data-folder=${folder} class="card">
                        <div class="play">
                            <svg width="45" height="45" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <!-- Green Circle --><circle cx="50" cy="50" r="45" fill="#1ed760" /><!-- Black Triangle --><polygon points="40,30 70,50 40,70" fill="black" />
                            </svg>
                        </div>
                        <img src=https://github.com/Akshay-3210/audio-player/tree/main/songs/${folder}/cover.jpg alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>
            `
        }
    }

    //playlist
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        // console.log(e);

        e.addEventListener("click", async item => {
            // console.log(item,item.currentTarget.dataset);
            await gsongs(`${item.currentTarget.dataset.folder}/`);
            playmusic(s[0]);
        })
    });


}

async function main() {

    await gsongs("cs/");
    // console.log(s);
    //show songs in playlist/
    playmusic(s[0],true);
    // currentsong.src=`/songs/${s[0]}`;

    //albums
    dsiplayalbums();

    //attach an event lis to play,next,previous
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "img/pause.svg";
        }
        else {
            currentsong.pause();
            play.src = "img/play.svg";
        }
    })
    currentsong.addEventListener("timeupdate", () => {
        // console.log(currentsong.currentTime,currentsong.duration);
        document.querySelector(".songtime").innerHTML = `${formatSecondsToMinutes(currentsong.currentTime)} / ${formatSecondsToMinutes(currentsong.duration)}`;
        document.querySelector(".circle").style.left = (currentsong.currentTime * 100) / currentsong.duration + "%";
    })

    //add event lis to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let p = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = p + "%";
        currentsong.currentTime = (currentsong.duration) * (p) / 100;
    })

    //add even lis to hamburger
    document.querySelector(".hamburger").addEventListener("click", e => {
        document.querySelector(".left").style.left = "0";
        document.querySelector(".hamburger").style.display = "none";
        document.querySelector(".cross").style.display = "block";
    })
    //cross
    document.querySelector(".cross").addEventListener("click", e => {
        document.querySelector(".left").style.left = "-100%";
        document.querySelector(".hamburger").style.display = "block";
        document.querySelector(".cross").style.display = "none";
    })

    //previous
    previous.addEventListener("click", () => {
        if (s.indexOf(currentsong.src.split(`/songs/${currfolder}`)[1]) === 0) {
            playmusic(s[s.length - 1]);
        }
        else {
            playmusic(s[s.indexOf(currentsong.src.split(`/songs/${currfolder}`)[1]) - 1]);
        }
        //next    
    })
    next.addEventListener("click", () => {
        if (s.indexOf(currentsong.src.split(`/songs/${currfolder}`)[1]) === (s.length - 1)) {
            playmusic(s[0]);
        }
        else {
            playmusic(s[s.indexOf(currentsong.src.split(`/songs/${currfolder}`)[1]) + 1]);
        }
    })

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentsong.volume = parseFloat(e.target.value) / 100;
        // console.log(e,e.target,parseFloat(e.target.value)/100);
    })
    
    //to mute
    document.querySelector(".volume>img").addEventListener("click",e=>{
        // console.log(e.target.src);
        if(e.target.src.includes("img/volume.svg")){
            e.target.src=e.target.src.replace("img/volume.svg","img/mute.svg");
            currentsong.volume=0;
            document.querySelector(".range").getElementsByTagName("input")[0].value=0;
        }
        else{
            e.target.src=e.target.src.replace("img/mute.svg","img/volume.svg");
            currentsong.volume=0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value=10;
        }
    })

}
main();
