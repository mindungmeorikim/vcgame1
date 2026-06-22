const types = ["일반", "냉장", "파손주의"];

const MAX_HEARTS = 100;
const AUTO_REGEN_MAX = 5;
const REGEN_TIME = 5 * 60 * 1000;
const HEART_PRICE = 5;

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

let hearts = Number(localStorage.getItem("hearts")) || 5;
let gold = Number(localStorage.getItem("gold")) || 0;
let lastRegenTime = Number(localStorage.getItem("lastRegenTime")) || Date.now();

let lastLoginDate = localStorage.getItem("lastLoginDate") || "";
let loginStreak = Number(localStorage.getItem("loginStreak")) || 0;

const heartsEl = document.querySelector("#hearts");
const goldEl = document.querySelector("#gold");
const loginStreakEl = document.querySelector("#loginStreak");
const scoreEl = document.querySelector("#score");
const mistakesEl = document.querySelector("#mistakes");
const box = document.querySelector("#box");
const boxLabel = document.querySelector("#boxLabel");
const message = document.querySelector("#message");
const regenText = document.querySelector("#regenText");
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
const goldRewardText = document.querySelector("#goldRewardText");

const shopBtn = document.querySelector("#shopBtn");
const shopModal = document.querySelector("#shopModal");
const closeShopBtn = document.querySelector("#closeShopBtn");
const shopItems = document.querySelectorAll(".shop-item");

const loginRewardModal = document.querySelector("#loginRewardModal");
const loginRewardText = document.querySelector("#loginRewardText");
const closeLoginRewardBtn = document.querySelector("#closeLoginRewardBtn");

startBtn.addEventListener("click", startGame);
saveScoreBtn.addEventListener("click", saveRanking);
restartBtn.addEventListener("click", restartGame);
shopBtn.addEventListener("click", openShop);
closeShopBtn.addEventListener("click", closeShop);
closeLoginRewardBtn.addEventListener("click", closeLoginReward);

shopItems.forEach((item) => {
  item.addEventListener("click", () => {
    buyHearts(Number(item.dataset.heart));
  });
});

bins.forEach((bin) => {
  bin.addEventListener("click", () => {
    if (gameOver || !canSort) return;
    sortPackage(bin.dataset.type, bin);
  });
});

applyOfflineRegen();
checkDailyLoginReward();
updateResources();
setInterval(handleHeartRegen, 1000);

function startGame() {
  if (hearts <= 0) {
    message.textContent = "❤️ 하트가 부족합니다. 회복을 기다리거나 상점에서 구매하세요!";
    return;
  }

  hearts--;
  saveResources();

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
  saveScoreBtn.style.display = "inline-block";
  saveScoreBtn.disabled = false;
  saveScoreBtn.textContent = "점수 등록";
  restartBtn.textContent = "🎮 다시 플레이";

  updateResources();
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

  if (boxX >= warningLine) showWarning();

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

    if (comboBonus > 0) text += ` / 콤보 보너스 +${comboBonus}점`;

    if (speedBonus > 0) {
      text += " / 빠른 분류 +1점";
      showSpeedBonus();
    }

    message.textContent = text;

    playCorrectSound();
    selectedBin.classList.add("correct");
    dropBox(selectedBin);

    if (combo >= 2) showCombo(comboBonus);

    if (score >= 10) speed = 3.6;

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

function endGame(text) {
  gameOver = true;
  canSort = false;

  clearInterval(moveTimer);
  hideWarning();

  message.textContent = text;
  warehouse.classList.add("gameover-flash");
  finalScore.textContent = score;

  if (score >= 20) {
    gold++;
    goldRewardText.textContent = "🪙 20점 이상 달성! 골드 +1 획득!";
  } else {
    goldRewardText.textContent = "20점 이상 달성하면 골드 1개를 받을 수 있어요.";
  }

  saveResources();
  updateResources();

  setTimeout(() => {
    rankingModal.style.display = "flex";
    renderRanking();
  }, 700);
}

function getComboBonus() {
  if (combo >= 10) return 2;
  if (combo >= 5) return 1;
  return 0;
}

function checkDailyLoginReward() {
  const today = getTodayString();

  if (lastLoginDate === today) {
    return;
  }

  const yesterday = getDateStringByOffset(-1);

  if (lastLoginDate === yesterday) {
    loginStreak++;
  } else {
    loginStreak = 1;
  }

  if (loginStreak > 7) {
    loginStreak = 1;
  }

  const rewardGold = getLoginRewardGold(loginStreak);

  gold += rewardGold;
  lastLoginDate = today;

  saveResources();
  updateResources();

  loginRewardText.innerHTML =
    `🔥 ${loginStreak}일 연속 로그인!<br>` +
    `🪙 골드 +${rewardGold}개를 받았습니다.`;

  loginRewardModal.style.display = "flex";
}

function getLoginRewardGold(day) {
  if (day === 7) return 10;
  return day;
}

function getTodayString() {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

function getDateStringByOffset(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

function closeLoginReward() {
  loginRewardModal.style.display = "none";
}

function openShop() {
  shopModal.style.display = "flex";
}

function closeShop() {
  shopModal.style.display = "none";
}

function buyHearts(amount) {
  const cost = amount * HEART_PRICE;

  if (gold < cost) {
    alert("골드가 부족합니다!");
    return;
  }

  if (hearts >= MAX_HEARTS) {
    alert("하트는 최대 100개까지 보유할 수 있습니다!");
    return;
  }

  const addAmount = Math.min(amount, MAX_HEARTS - hearts);

  gold -= addAmount * HEART_PRICE;
  hearts += addAmount;

  saveResources();
  updateResources();

  alert(`❤️ 하트 ${addAmount}개를 구매했습니다!`);
}

function handleHeartRegen() {
  const now = Date.now();

  if (hearts >= AUTO_REGEN_MAX) {
    lastRegenTime = now;
    saveResources();
    updateResources();
    return;
  }

  const elapsed = now - lastRegenTime;

  if (elapsed >= REGEN_TIME) {
    const recoverCount = Math.floor(elapsed / REGEN_TIME);
    hearts = Math.min(AUTO_REGEN_MAX, hearts + recoverCount);
    lastRegenTime += recoverCount * REGEN_TIME;

    saveResources();
    updateResources();
  } else {
    updateResources();
  }
}

function applyOfflineRegen() {
  const now = Date.now();

  if (hearts >= AUTO_REGEN_MAX) {
    lastRegenTime = now;
    saveResources();
    return;
  }

  const elapsed = now - lastRegenTime;
  const recoverCount = Math.floor(elapsed / REGEN_TIME);

  if (recoverCount > 0) {
    hearts = Math.min(AUTO_REGEN_MAX, hearts + recoverCount);
    lastRegenTime += recoverCount * REGEN_TIME;
    saveResources();
  }
}

function updateResources() {
  heartsEl.textContent = hearts;
  goldEl.textContent = gold;
  loginStreakEl.textContent = loginStreak;

  if (hearts >= AUTO_REGEN_MAX) {
    regenText.textContent = "하트 자동 회복 완료: 5개 이상 보유 중";
    return;
  }

  const remain = REGEN_TIME - (Date.now() - lastRegenTime);
  const seconds = Math.max(0, Math.ceil(remain / 1000));
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;

  regenText.textContent = `다음 하트 회복까지 ${min}분 ${sec}초`;
}

function saveResources() {
  localStorage.setItem("hearts", hearts);
  localStorage.setItem("gold", gold);
  localStorage.setItem("lastRegenTime", lastRegenTime);
  localStorage.setItem("lastLoginDate", lastLoginDate);
  localStorage.setItem("loginStreak", loginStreak);
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
  comboEl.textContent = comboBonus > 0
    ? `COMBO x${combo} +${comboBonus}점`
    : `COMBO x${combo}`;

  comboEl.classList.remove("show");
  void comboEl.offsetWidth;
  comboEl.classList.add("show");

  setTimeout(() => comboEl.classList.remove("show"), 900);
}

function showSpeedBonus() {
  speedBonusEl.classList.remove("show");
  void speedBonusEl.offsetWidth;
  speedBonusEl.classList.add("show");

  setTimeout(() => speedBonusEl.classList.remove("show"), 900);
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