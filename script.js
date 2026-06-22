const types = ["일반", "냉장", "파손주의"];

let currentType = "";
let score = 0;
let mistakes = 0;
let gameOver = true;
let boxX = 0;
let moveTimer = null;
let canSort = false;

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
    if (gameOver || !canSort) return;
    sortPackage(bin.dataset.type, bin);
  });
});

function startGame() {
  score = 0;
  mistakes = 0;
  gameOver = false;
  canSort = true;

  scoreEl.textContent = score;
  mistakesEl.textContent = mistakes;
  message.textContent = "택배가 끝에 도착하기 전에 알맞은 박스를 클릭하세요!";

  createPackage();
}

function createPackage() {
  clearInterval(moveTimer);

  currentType = types[Math.floor(Math.random() * types.length)];
  boxLabel.textContent = currentType;

  boxX = 0;
  canSort = true;

  box.style.display = "flex";
  box.style.left = boxX + "px";
  box.style.top = "-120px";
  box.style.transform = "rotate(0deg) scale(1)";

  moveTimer = setInterval(movePackage, 20);
}

function movePackage() {
  const finishLine = conveyor.clientWidth - box.clientWidth - 15;

  boxX += 2.6;
  box.style.left = boxX + "px";

  if (boxX >= finishLine) {
    clearInterval(moveTimer);
    canSort = false;
    playWrongSound();
    endGame("💀 게임 오버! 택배가 끝까지 가버렸어요.");
  }
}

function sortPackage(selectedType, selectedBin) {
  clearInterval(moveTimer);
  canSort = false;

  if (selectedType === currentType) {
    score++;
    scoreEl.textContent = score;
    message.textContent = "정답! 알맞은 박스에 들어갔어요.";

    playCorrectSound();
    selectedBin.classList.add("correct");
    dropBox(selectedBin);

    if (score >= 20) {
      setTimeout(() => endGame("🎉 승리! 택배 분류 완료!"), 650);
      return;
    }
  } else {
    mistakes++;
    mistakesEl.textContent = mistakes;
    message.textContent = "실수! 다른 박스에 넣었어요.";

    playWrongSound();
    selectedBin.classList.add("wrong");
    dropBox(selectedBin);

    if (mistakes >= 5) {
      setTimeout(() => endGame("💀 게임 오버! 실수가 너무 많아요."), 650);
      return;
    }
  }

  setTimeout(() => {
    selectedBin.classList.remove("correct", "wrong");
    createPackage();
  }, 800);
}

function dropBox(bin) {
  const conveyorRect = conveyor.getBoundingClientRect();
  const binRect = bin.getBoundingClientRect();

  const targetX = binRect.left - conveyorRect.left + 35;

  box.style.left = targetX + "px";
  box.style.top = "145px";
  box.style.transform = "rotate(12deg) scale(0.75)";
}

function endGame(text) {
  gameOver = true;
  canSort = false;
  clearInterval(moveTimer);
  message.textContent = text;
}

function playCorrectSound() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  playTone(audioCtx, 660, 0, 0.12);
  playTone(audioCtx, 880, 0.13, 0.16);
}

function playWrongSound() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  playTone(audioCtx, 180, 0, 0.35);
}

function playTone(audioCtx, frequency, startTime, duration) {
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  gainNode.gain.setValueAtTime(0.0001, audioCtx.currentTime + startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.25, audioCtx.currentTime + startTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + startTime + duration);

  oscillator.start(audioCtx.currentTime + startTime);
  oscillator.stop(audioCtx.currentTime + startTime + duration);
}