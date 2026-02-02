// ===============================
// GAME STATE
// ===============================
let gameMode = "normal"; // normal | hardcore
let currentRound = 1;
const totalRounds = 10;

let doorsCount = 3;
let safeDoor = 1;
let timeLeft = 8;
let timerInterval = null;
let gameActive = false;

// ===============================
// DOM ELEMENTS
// ===============================
const modeScreen = document.getElementById("modeScreen");
const gameScreen = document.getElementById("game");

const modeLabel = document.getElementById("modeLabel");
const roundText = document.getElementById("round");
const bestText = document.getElementById("best");
const timerText = document.getElementById("timer");

const hintsBox = document.getElementById("hints");
const doorsContainer = document.getElementById("doors");
const messageBox = document.getElementById("message");

const restartBtn = document.getElementById("restartBtn");
const backBtn = document.getElementById("backBtn");
const resetBestBtn = document.getElementById("resetBestBtn");

// ===============================
// BEST SCORE (localStorage)
// ===============================
function getBestScore() {
    return Number(localStorage.getItem(`best_${gameMode}`)) || 0;
}

function setBestScore(score) {
    localStorage.setItem(`best_${gameMode}`, score);
}

function resetBestScore() {
    localStorage.removeItem(`best_${gameMode}`);
    bestText.textContent = "Best: 0";

    messageBox.style.color = "#ffd000";
    messageBox.textContent = "Best score reset!";
}

// ===============================
// START GAME (MODE SELECTION)
// ===============================
function startGame(mode) {
    gameMode = mode;
    currentRound = 1;

    modeScreen.style.display = "none";
    gameScreen.style.display = "block";

    modeLabel.textContent =
        mode === "hardcore"
            ? "Hardcore Mode – No Mercy"
            : "Normal Mode";

    bestText.textContent = `Best: ${getBestScore()}`;
    startRound();
}

// ===============================
// START ROUND
// ===============================
function startRound() {
    gameActive = true;
    clearInterval(timerInterval);

    messageBox.textContent = "";
    restartBtn.style.display = "none";
    backBtn.style.display = "none";

    // Difficulty rules
    if (gameMode === "normal") {
        if (currentRound <= 2) doorsCount = 3;
        else if (currentRound <= 4) doorsCount = 4;
        else if (currentRound <= 6) doorsCount = 5;
        else doorsCount = 6;

        timeLeft = Math.max(3, 8 - currentRound);
    } else {
        doorsCount = Math.min(10, 6 + currentRound);
        timeLeft = 3;
    }

    roundText.textContent = `Round ${currentRound} / ${totalRounds}`;
    timerText.textContent = `Time: ${timeLeft}s`;
    bestText.textContent = `Best: ${getBestScore()}`;

    safeDoor = Math.floor(Math.random() * doorsCount) + 1;

    generateHints();
    createDoors();
    startTimer();
}

// ===============================
// TIMER
// ===============================
function startTimer() {
    timerInterval = setInterval(() => {
        if (!gameActive) return;

        timeLeft--;
        timerText.textContent = `Time: ${timeLeft}s`;

        if (timeLeft <= 0) {
            gameOver("⏱ Time ran out. GAME OVER.");
        }
    }, 1000);
}

// ===============================
// DOORS
// ===============================
function createDoors() {
    doorsContainer.innerHTML = "";

    for (let i = 1; i <= doorsCount; i++) {
        const door = document.createElement("button");
        door.className = "door";
        door.textContent = `Door ${i}`;
        door.onclick = () => chooseDoor(i);
        doorsContainer.appendChild(door);
    }
}

// ===============================
// HINTS
// ===============================
function generateHints() {
    hintsBox.innerHTML = "";

    const hints = [];
    hints.push(`Door ${safeDoor} is safe`); // true hint

    const lieCount = gameMode === "hardcore" ? 2 : 1;

    for (let i = 0; i < lieCount; i++) {
        let fake;
        do {
            fake = Math.floor(Math.random() * doorsCount) + 1;
        } while (fake === safeDoor);

        hints.push(`Door ${fake} is safe`);
    }

    hints.sort(() => Math.random() - 0.5);

    hints.forEach(hint => {
        const p = document.createElement("p");
        p.textContent = hint;
        hintsBox.appendChild(p);
    });
}

// ===============================
// DOOR CHOICE
// ===============================
function chooseDoor(choice) {
    if (!gameActive) return;

    clearInterval(timerInterval);

    if (choice === safeDoor) {
        messageBox.style.color = "lightgreen";
        messageBox.textContent = "You survived this round!";
        currentRound++;

        if (currentRound > totalRounds) {
            gameWin();
        } else {
            setTimeout(startRound, 1200);
        }
    } else {
        gameOver("💀 You trusted the wrong door. GAME OVER.");
    }
}

// ===============================
// GAME OVER
// ===============================
function gameOver(text) {
    endGame();

    const reachedRound = currentRound - 1;
    if (reachedRound > getBestScore()) {
        setBestScore(reachedRound);
    }

    bestText.textContent = `Best: ${getBestScore()}`;
    messageBox.style.color = "red";
    messageBox.innerHTML = `${text}<br>You reached: <b>Round ${reachedRound}</b>`;
}

// ===============================
// GAME WIN (CONGRATS)
// ===============================
function gameWin() {
    endGame();

    setBestScore(totalRounds);
    bestText.textContent = `Best: ${totalRounds}`;

    messageBox.style.color = "gold";
    messageBox.innerHTML =
        gameMode === "hardcore"
            ? `🔥 LEGENDARY!<br>You completed <b>Hardcore Mode</b>!`
            : `🎉 CONGRATULATIONS!<br>You completed <b>Normal Mode</b>!`;
}

// ===============================
// END GAME COMMON
// ===============================
function endGame() {
    gameActive = false;
    clearInterval(timerInterval);

    document.querySelectorAll(".door").forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = "0.4";
    });

    restartBtn.style.display = "block";
    backBtn.style.display = "block";
}

// ===============================
// BUTTON ACTIONS
// ===============================
restartBtn.onclick = () => {
    currentRound = 1;
    startRound();
};

backBtn.onclick = () => {
    clearInterval(timerInterval);
    gameActive = false;

    gameScreen.style.display = "none";
    modeScreen.style.display = "block";

    messageBox.textContent = "";
    restartBtn.style.display = "none";
    backBtn.style.display = "none";
};

resetBestBtn.onclick = resetBestScore;
