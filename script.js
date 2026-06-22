const packageTypes = ["일반", "냉장", "파손주의"];

let currentPackage = "";
let score = 0;
let mistakes = 0;
let isPlaying = false;

const scoreEl = document.querySelector("#score");
const mistakesEl = document.querySelector("#mistakes");
const packageBox = document.querySelector("#packageBox");
const messageEl = document.querySelector("#message");
const startBtn = document.querySelector("#startBtn");
const sortButtons = document.querySelectorAll(".buttons button");

startBtn.addEventListener("click", startGame);

sortButtons.forEach((button) => {
  button.addEventListener("click", () => {
    classifyPackage(button.dataset.type);
  });
});

function startGame() {
  score = 0;
  mistakes = 0;
  isPlaying = true;

  scoreEl.textContent = score;
  mistakesEl.textContent = mistakes;
  messageEl.textContent = "";

  createPackage();
}

function createPackage() {
  const randomIndex = Math.floor(Math.random() * packageTypes.length);
  currentPackage = packageTypes[randomIndex];
  packageBox.textContent = currentPackage;
}

function classifyPackage(selectedType) {
  if (!isPlaying) {
    messageEl.textContent = "먼저 게임 시작을 눌러주세요!";
    return;
  }

  if (selectedType === currentPackage) {
    score++;
    scoreEl.textContent = score;

    if (score >= 20) {
      endGame("🎉 승리! 택배 분류 완료!");
      return;
    }
  } else {
    mistakes++;
    mistakesEl.textContent = mistakes;

    if (mistakes >= 5) {
      endGame("💀 게임 오버! 실수가 너무 많아요.");
      return;
    }
  }

  createPackage();
}

function endGame(text) {
  isPlaying = false;
  messageEl.textContent = text;
  packageBox.textContent = "게임 종료";
}