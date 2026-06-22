const types = ["일반", "냉장", "파손주의"];

let currentType = "";
let score = 0;
let mistakes = 0;
let combo = 0;
let gameOver = true;
let boxX = 0;
let moveTimer = null;
let canSort = false;
let speed = 2.6;
let scoreSaved = false;
let packageStartTime = 0;

const scoreEl = document.querySelector("#score");
const mistakesEl = document.querySelector("#mistakes");
const box = document.querySelector("#box");
const boxLabel = document.querySelector("#boxLabel");
const message = document.querySelector("#message");
const startBtn = document.querySelector("#startBtn");
const bins = document.querySelectorAll(".bin");
const conveyor = document.querySelector(".conveyor");
const alarm = document.querySelector("#alarm");
const warning = document.querySelector("#warning");
const comboEl = document.querySelector("#combo");
const speedBonusEl = document.querySelector("#speedBonus");
const warehouse = document.querySelector("#warehouse");

const rankingModal = document.querySelector("#rankingModal");
const rankingList = document.querySelector("#rankingList");
const nicknameInput = document.querySelector("#nickname");
const saveScoreBtn = document.querySelector("#saveScoreBtn");
const restartBtn = document.querySelector("#restartBtn");
const finalScore = document.querySelector("#finalScore");

startBtn.addEventListener("click", startGame);
saveScoreBtn.addEventListener("click", saveRanking);
restartBtn.addEventListener("click", restartGame);

bins.forEach((bin) => {
  bin.addEventListener("click", () => {
    if (gameOver || !canSort) return;
    sortPackage(bin.dataset.type, bin);
  });
});

function startGame() {
  score = 0;
  mistakes = 0;
  combo = 0;
  speed = 2.6;
  gameOver = false;
  canSort = true;
  scoreSaved = false;

  scoreEl.textContent = score;
  mistakesEl.textContent = mistakes;
  message.textContent = "1초 안에 분류하면 빠른 분류 보너스 +1점!";

  rankingModal.style.display = "none";
  warehouse.classList.remove("gameover-flash");
  comboEl.classList.remove("show");
  speedBonusEl.classList.remove("show");

  nicknameInput.value = "";
  nicknameInput.style.display = "block";

  saveScoreBtn.textContent = "점수 등록";
  saveScoreBtn.disabled = false;
  saveScoreBtn.style.display = "inline-block";

  restartBtn.textContent = "다시 시작";
  restartBtn.style.display = "inline-block";

  createPackage();
}

function createPackage() {
  clearInterval(moveTimer);
  hideWarning();

  currentType = types[Math.floor(Math.random() * types.length)];
  boxLabel.textContent = currentType;

  boxX = 0;
  canSort = true;
  packageStartTime = Date.now();

  box.classList.remove("drop");
  box.style.display = "flex";
  box.style.left = boxX + "px";
  box.style.top = "-120px";
  box.style.transform = "rotate(0deg) scale(1)";

  moveTimer = setInterval(movePackage, 20);
}

function movePackage() {
  const finishLine = conveyor.clientWidth - box.clientWidth - 15;
  const warningLine = finishLine * 0.8;

  boxX += speed;
  box.style.left = boxX + "px";

  if (boxX >= warningLine) {
    showWarning();
  }

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
  hideWarning();

  if (selectedType === currentType) {
    combo++;

    const reactionTime = Date.now() - packageStartTime;
    const speedBonus = reactionTime <= 1000 ? 1 : 0;
    const comboBonus = getComboBonus();

    score += 1 + comboBonus + speedBonus;
    scoreEl.textContent = score;

    let text = "정답! +1점";

    if (comboBonus > 0) {
      text += ` / 콤보 보너스 +${comboBonus}점`;
    }

    if (speedBonus > 0) {
      text += " / 빠른 분류 +1점";
      showSpeedBonus();
    }

    message.textContent = text;

    playCorrectSound();
    selectedBin.classList.add("correct");
    dropBox(selectedBin);

    if (combo >= 2) {
      showCombo(comboBonus);
    }

    if (score >= 10) {
      speed = 3.6;
    }

    if (score >= 20) {
      setTimeout(() => endGame("🎉 승리! 택배 분류 완료!"), 650);
      return;
    }
  } else {
    mistakes++;
    combo = 0;

    mistakesEl.textContent = mistakes;
    message.textContent = "실수! 콤보가 초기화됐어요.";

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
  }, 850);
}

function getComboBonus() {
  if (combo >= 10) return 2;
  if (combo >= 5) return 1;
  return 0;
}

function dropBox(bin) {
  const conveyorRect = conveyor.getBoundingClientRect();
  const binRect = bin.getBoundingClientRect();

  const targetX = binRect.left - conveyorRect.left + 35;

  box.style.left = targetX + "px";
  box.style.top = "145px";
  box.classList.add("drop");
}

function showWarning() {
  alarm.classList.add("active");
  warning.classList.add("show");
}

function hideWarning() {
  alarm.classList.remove("active");
  warning.classList.remove("show");
}

function showCombo(comboBonus) {
  if (comboBonus > 0) {
    comboEl.textContent = `COMBO x${combo}  +${comboBonus}점`;
  } else {
    comboEl.textContent = `COMBO x${combo}`;
  }

  comboEl.classList.remove("show");
  void comboEl.offsetWidth;
  comboEl.classList.add("show");

  setTimeout(() => {
    comboEl.classList.remove("show");
  }, 900);
}

function showSpeedBonus() {
  speedBonusEl.classList.remove("show");
  void speedBonusEl.offsetWidth;
  speedBonusEl.classList.add("show");

  setTimeout(() => {
    speedBonusEl.classList.remove("show");
  }, 900);
}

function endGame(text) {
  gameOver = true;
  canSort = false;

  clearInterval(moveTimer);
  hideWarning();

  message.textContent = text;
  warehouse.classList.add("gameover-flash");
  finalScore.textContent = score;

  setTimeout(() => {
    rankingModal.style.display = "flex";
    renderRanking();
  }, 700);
}

function saveRanking() {
  if (scoreSaved) return;

  const nickname = nicknameInput.value.trim();

  if (!nickname) {
    alert("닉네임을 입력해주세요!");
    return;
  }

  const rankings = JSON.parse(localStorage.getItem("parcelRanking")) || [];

  rankings.push({
    name: nickname,
    score: score
  });

  rankings.sort((a, b) => b.score - a.score);
  rankings.splice(10);

  localStorage.setItem("parcelRanking", JSON.stringify(rankings));

  scoreSaved = true;

  renderRanking();

  nicknameInput.style.display = "none";
  saveScoreBtn.style.display = "none";

  restartBtn.textContent = "🎮 다시 플레이";
  restartBtn.style.display = "inline-block";
}

function renderRanking() {
  const rankings = JSON.parse(localStorage.getItem("parcelRanking")) || [];

  rankingList.innerHTML = "";

  if (rankings.length === 0) {
    rankingList.innerHTML = "<li>아직 랭킹이 없습니다.</li>";
    return;
  }

  rankings.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.name} - ${item.score}점`;
    rankingList.appendChild(li);
  });
}

function restartGame() {
  nicknameInput.value = "";
  nicknameInput.style.display = "block";

  saveScoreBtn.textContent = "점수 등록";
  saveScoreBtn.disabled = false;
  saveScoreBtn.style.display = "inline-block";

  restartBtn.textContent = "다시 시작";
  restartBtn.style.display = "inline-block";

  rankingModal.style.display = "none";

  startGame();
}

function playCorrectSound() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  playTone(audioCtx, 660, 0, 0.12);
  playTone(audioCtx, 880, 0.13, 0.16);
}

function playWrongSound() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  playTone(audioCtx, 1200, 0, 0.08);
  playTone(audioCtx, 900, 0.08, 0.1);
  playTone(audioCtx, 600, 0.18, 0.15);
  playTone(audioCtx, 350, 0.33, 0.3);
}

function playTone(audioCtx, frequency, startTime, duration) {
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  gainNode.gain.setValueAtTime(0.0001, audioCtx.currentTime + startTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.25,
    audioCtx.currentTime + startTime + 0.02
  );
  gainNode.gain.exponentialRampToValueAtTime(
    0.0001,
    audioCtx.currentTime + startTime + duration
  );

  oscillator.start(audioCtx.currentTime + startTime);
  oscillator.stop(audioCtx.currentTime + startTime + duration);
}