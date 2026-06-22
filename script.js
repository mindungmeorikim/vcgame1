const packageTypes = [
    "일반",
    "냉장",
    "파손주의"
];

let currentPackage = "";
let score = 0;
let mistakes = 0;
let gameOver = true;

const packageBox = document.getElementById("packageBox");
const scoreText = document.getElementById("score");
const mistakeText = document.getElementById("mistakes");
const message = document.getElementById("message");

function randomPackage() {
    currentPackage =
        packageTypes[Math.floor(Math.random() * packageTypes.length)];

    packageBox.textContent = currentPackage;
}

function startGame() {
    score = 0;
    mistakes = 0;
    gameOver = false;

    scoreText.textContent = score;
    mistakeText.textContent = mistakes;

    message.textContent = "";

    randomPackage();
}

function classify(type) {

    if (gameOver) return;

    if (type === currentPackage) {
        score++;
        scoreText.textContent = score;

        if (score >= 20) {
            message.textContent = "🎉 승리!";
            gameOver = true;
            return;
        }
    } else {
        mistakes++;
        mistakeText.textContent = mistakes;

        if (mistakes >= 5) {
            message.textContent = "💀 게임 오버!";
            gameOver = true;
            return;
        }
    }

    randomPackage();
}