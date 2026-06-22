const types = ["일반", "냉장", "파손주의"];

let currentType = "";
let score = 0;
let mistakes = 0;
let gameOver = true;
let boxX = 0;
let moveTimer = null;

const scoreEl = document.querySelector("#score");
const mistakesEl = document.querySelector("#mistakes");
const box = document.querySelector("#box");
const boxLabel = document.querySelector("#boxLabel");
const message = document.querySelector("#message");
const startBtn = document.querySelector("#startBtn");
const bins = document.querySelectorAll(".bin");
const conveyor = document.querySelector(".conveyor");

startBtn.addEventListener("click", startGame);

bins.forEach((bin) => {
  bin.addEventListener("click", () => {
    if (gameOver) return;
    sortPackage(bin.dataset.type, bin);
  });
});

function startGame() {
  score = 0;
  mistakes = 0;
  gameOver = false;

  scoreEl.textContent = score;
  mistakesEl.textContent = mistakes;
  message.textContent = "택배가 도착하면 알맞은 박스를 클릭하세요!";

  createPackage();
}

function createPackage() {
  clearInterval(moveTimer);

  currentType = types[Math.floor(Math.random() * types.length)];
  boxLabel.textContent = currentType;

  boxX = 0;
  box.style.display = "flex";
  box.style.left = boxX + "px";
  box.style.top = "-95px";
  box.style.transform = "rotate(0deg)";

  moveTimer = setInterval(movePackage, 20);
}

function movePackage() {
  const finishLine = conveyor.clientWidth - box.clientWidth - 10;

  boxX += 2.5;
  box.style.left = boxX + "px";

  if (boxX >= finishLine) {
    clearInterval(moveTimer);
    message.textContent = "지금 분류하세요!";
  }
}

function sortPackage(selectedType, selectedBin) {
  clearInterval(moveTimer);

  if (selectedType === currentType) {
    score++;
    scoreEl.textContent = score;
    message.textContent = "정답! 알맞은 박스에 들어갔어요.";
    playCorrectSound();
    selectedBin.classList.add("wrong");
    dropBox(selectedBin);

    if (score >= 20) {
      setTimeout(() => endGame("🎉 승리! 택배 분류 완료!"), 500);
      return;
    }
  } else {
    mistakes++;
    mistakesEl.textContent = mistakes;
    message.textContent = "실수! 다른 박스에 넣었어요.";
    playWrongSound();
    selectedBin.classList.add("correct");

    if (mistakes >= 5) {
      setTimeout(() => endGame("💀 게임 오버! 실수가 너무 많아요."), 500);
      return;
    }
  }

  setTimeout(() => {
    selectedBin.classList.remove("correct", "wrong");
    createPackage();
  }, 700);
}

function dropBox(bin) {
  const conveyorRect = conveyor.getBoundingClientRect();
  const binRect = bin.getBoundingClientRect();

  const targetX = binRect.left - conveyorRect.left + 25;
  box.style.left = targetX + "px";
  box.style.top = "150px";
  box.style.transform = "rotate(15deg) scale(0.75)";
}

function endGame(text) {
  gameOver = true;
  clearInterval(moveTimer);
  box.style.display = "none";
  message.textContent = text;
}

function playCorrectSound() {
  const sound = new Audio(
    "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg"
  );
  sound.volume = 0.35;
  sound.play();
}

function playWrongSound() {
  const sound = new Audio(
    "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg"
  );
  sound.volume = 0.35;
  sound.play();
}