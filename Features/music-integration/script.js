document.addEventListener("DOMContentLoaded", function () {
    const searchBtn = document.getElementById("searchBtn");
    const searchInput = document.getElementById("searchInput");
    const resultsDiv = document.getElementById("results");
    const playPauseBtn = document.getElementById("playPauseBtn");
    const volumeControl = document.getElementById("volumeControl");
    const muteBtn = document.getElementById("muteBtn");
    const loopBtn = document.getElementById("loopBtn");
    const progressContainer = document.getElementById("progressContainer");
    const progressBar = document.getElementById("progressBar");
    const timeRemaining = document.createElement("span");
    timeRemaining.id = "timeRemaining";
    loopBtn.insertAdjacentElement("afterend", timeRemaining);

    let audio = new Audio();
    let currentPlayingBtn = null;

    searchBtn.addEventListener("click", () => {
        const query = searchInput.value.trim();
        if (query === "") return;

        fetch(`https://freesound.org/apiv2/search/text/?query=${query}&token=DjjgOXi7suJFvlxhN35iMdRoxXOyc7DOrhID9GiI`)
            .then(response => response.json())
            .then(data => displayResults(data.results))
            .catch(error => console.error("Error fetching sounds:", error));
    });

    function displayResults(sounds) {
        resultsDiv.innerHTML = "";
        sounds.forEach(sound => {
            fetch(`https://freesound.org/apiv2/sounds/${sound.id}/?token=DjjgOXi7suJFvlxhN35iMdRoxXOyc7DOrhID9GiI`)
                .then(response => response.json())
                .then(data => {
                    if (data.previews && data.previews["preview-hq-mp3"]) {
                        const soundElement = document.createElement("div");
                        soundElement.classList.add("result");

                        soundElement.innerHTML = `
                            <span>${data.name}</span>
                            <button class="playBtn" data-url="${data.previews["preview-hq-mp3"]}">▶️</button>
                        `;

                        resultsDiv.appendChild(soundElement);

                        soundElement.querySelector(".playBtn").addEventListener("click", function () {
                            if (currentPlayingBtn && currentPlayingBtn !== this) {
                                currentPlayingBtn.textContent = "▶️";
                            }

                            if (audio.src !== this.dataset.url) {
                                audio.src = this.dataset.url;
                                audio.play();
                                this.textContent = "⏸️";
                                currentPlayingBtn = this;
                            } else {
                                if (audio.paused) {
                                    audio.play();
                                    this.textContent = "⏸️";
                                } else {
                                    audio.pause();
                                    this.textContent = "▶️";
                                }
                            }
                        });
                    }
                });
        });
    }

    playPauseBtn.addEventListener("click", () => {
        if (audio.paused) {
            audio.play();
            playPauseBtn.textContent = "⏸️";
        } else {
            audio.pause();
            playPauseBtn.textContent = "▶️";
        }
    });

    volumeControl.addEventListener("input", () => {
        audio.volume = volumeControl.value;
    });

    muteBtn.addEventListener("click", () => {
        audio.muted = !audio.muted;
        muteBtn.textContent = audio.muted ? "🔊" : "🔇";
    });

    loopBtn.addEventListener("click", () => {
        audio.loop = !audio.loop;
        loopBtn.style.color = audio.loop ? "#ff9800" : "white";
    });

    audio.addEventListener("timeupdate", () => {
        progressBar.style.width = (audio.currentTime / audio.duration) * 100 + "%";

        let remaining = audio.duration - audio.currentTime;
        if (!isNaN(remaining)) {
            timeRemaining.textContent = `⏳ ${formatTime(remaining)}`;
        }
    });

    function formatTime(seconds) {
        let min = Math.floor(seconds / 60);
        let sec = Math.floor(seconds % 60);
        return `${min}:${sec < 10 ? "0" : ""}${sec}`;
    }

    // Allow seeking by clicking on progress bar
    progressContainer.addEventListener("click", (e) => {
        const clickX = e.offsetX;
        const width = progressContainer.clientWidth;
        const newTime = (clickX / width) * audio.duration;
        audio.currentTime = newTime;
    });
});
