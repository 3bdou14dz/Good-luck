document.addEventListener('DOMContentLoaded', () => {
  const elements = {
    slots: [
      document.getElementById('slot1'),
      document.getElementById('slot2'),
      document.getElementById('slot3')
    ],
    spinBtn: document.getElementById('spin-btn'),
    result: document.getElementById('result'),
    scoreDisplay: document.getElementById('score'),
    attemptsDisplay: document.getElementById('attempts'),
    timerDisplay: document.getElementById('timer'),
    contactInfo: document.getElementById('contact-info')
  };

  const gameData = {
    icons: ["🎁", "🎃", "💌", "⭐", "🍒", "🍀", "🎯", "🏆"],
    score: 0,
    attempts: 3,
    lastSpinTime: 0,
    isSpinning: false,
    firstVisit: true
  };

  function initGame() {
    loadGameData();
    if (gameData.firstVisit) {
      showWelcomeModal();
      gameData.firstVisit = false;
    }
    updateUI();
    setupEventListeners();
    checkAttemptsReset();
  }

  function showWelcomeModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h2>مرحباً بك في آلة الحظ الذهبية!</h2>
        <p>لعبة ترفيهية مسلية، لقد حصلت على 500 نقطة ترحيبية!</p>
        <button class="modal-btn" id="welcome-ok-btn">موافق</button>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('welcome-ok-btn').addEventListener('click', () => {
      gameData.score += 500;
      saveGameData();
      updateUI();
      document.body.removeChild(modal);
    });
  }

  function showPrizeModal(message, points) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h2>مبروك!</h2>
        <p>${message}</p>
        <p>لقد ربحت ${points} نقطة!</p>
        <button class="modal-btn" id="prize-ok-btn">موافق</button>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('prize-ok-btn').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
  }

  function loadGameData() {
    const savedData = localStorage.getItem('slotGameData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      gameData.score = parsedData.score ?? 0;
      gameData.attempts = (parsedData.attempts !== undefined) ? parsedData.attempts : 3;
      gameData.lastSpinTime = parsedData.lastSpinTime ?? 0;
      gameData.firstVisit = parsedData.firstVisit !== false;
    } else {
      gameData.score = 0;
      gameData.attempts = 3;
      gameData.lastSpinTime = 0;
      gameData.firstVisit = true;
      saveGameData();
    }
  }

  function saveGameData() {
    const dataToSave = {
      score: gameData.score,
      attempts: gameData.attempts,
      lastSpinTime: gameData.lastSpinTime,
      firstVisit: gameData.firstVisit
    };
    localStorage.setItem('slotGameData', JSON.stringify(dataToSave));
  }

  function checkAttemptsReset() {
    const now = Date.now();
    const eightHours = 8 * 60 * 60 * 1000;

    if (gameData.attempts === 0 && gameData.lastSpinTime > 0) {
      if (now - gameData.lastSpinTime >= eightHours) {
        gameData.attempts = 3;
        saveGameData();
        updateUI();
      } else {
        // عرض وقت الانتظار المتبقي
        const timeLeft = eightHours - (now - gameData.lastSpinTime);
        const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        
        elements.timerDisplay.textContent = `⏳ المحاولات ستعود بعد: ${hoursLeft} ساعة و ${minutesLeft} دقيقة`;
      }
    }
  }

  function updateUI() {
    elements.scoreDisplay.textContent = gameData.score;
    elements.attemptsDisplay.textContent = gameData.attempts;

    if (gameData.attempts <= 0) {
      elements.spinBtn.disabled = true;
      checkAttemptsReset(); // تحديث العداد
    } else {
      elements.spinBtn.disabled = false;
      elements.timerDisplay.textContent = "";
    }
  }

  function spinSlots() {
    if (gameData.isSpinning || gameData.attempts <= 0) return;

    gameData.isSpinning = true;
    gameData.attempts--;
    gameData.lastSpinTime = Date.now();
    saveGameData();

    elements.result.textContent = "جاري السحب...";
    elements.spinBtn.disabled = true;

    const spinResults = [];
    let spinsCompleted = 0;

    elements.slots.forEach((slot, index) => {
      const spinDuration = 1000 + index * 500;
      const spinInterval = setInterval(() => {
        slot.textContent = gameData.icons[Math.floor(Math.random() * gameData.icons.length)];
      }, 100);

      setTimeout(() => {
        clearInterval(spinInterval);
        const resultIcon = getWeightedRandomIcon();
        slot.textContent = resultIcon;
        spinResults[index] = resultIcon;
        spinsCompleted++;

        if (spinsCompleted === 3) {
          finishSpin(spinResults);
        }
      }, spinDuration);
    });
  }

  function getWeightedRandomIcon() {
    const rand = Math.random();
    if (rand < 0.0001) return "💌";
    else if (rand < 0.3) return "🎃";
    else if (rand < 0.6) return "🎁";
    else if (rand < 0.75) return "⭐";
    else if (rand < 0.85) return "🍒";
    else if (rand < 0.92) return "🍀";
    else if (rand < 0.97) return "🎯";
    else return "🏆";
  }

  function finishSpin(results) {
    gameData.isSpinning = false;
    checkWin(results);
    updateUI();
  }

  function checkWin(results) {
    const [a, b, c] = results;
    let points = 0;
    let message = "😢 لم تفز هذه المرة! حاول مرة أخرى";

    if (a === "🎁" && b === "🎁" && c === "🎁") {
      points = 30;
      showPrizeModal("3 هدايا! مبروك!", points);
      message = "🎁🎁🎁 ربحت 30 نقطة!";
    } else if (a === "🎃" && b === "🎃" && c === "🎃") {
      points = 100;
      showPrizeModal("3 قرعات! مبروك!", points);
      message = "🎃🎃🎃 ربحت 100 نقطة!";
    } else if (a === "💌" && b === "💌" && c === "💌") {
      points = 500;
      showPrizeModal("الجائزة الكبرى! 3 قلوب! مبروك!", points);
      message = "🎊 الجائزة الكبرى! 💌💌💌";
      showJackpotInfo();
    } else if (a === "⭐" && b === "⭐" && c === "⭐") {
      points = 50;
      showPrizeModal("3 نجوم! مبروك!", points);
      message = "⭐⭐⭐ ربحت 50 نقطة!";
    } else if (a === "🍒" && b === "🍒" && c === "🍒") {
      points = 40;
      showPrizeModal("3 كرز! مبروك!", points);
      message = "🍒🍒🍒 ربحت 40 نقطة!";
    } else if (a === b || a === c || b === c) {
      const matched = a === b ? a : c;
      points = Math.floor(Math.random() * 60);
      showPrizeModal(`2 ${matched} متطابقة! مبروك!`, points);
      message = `🎉 ${matched}${matched} ربحت ${points} نقطة!`;
    }

    gameData.score += points;
    saveGameData();
    elements.result.textContent = message;
  }

  function showJackpotInfo() {
    elements.contactInfo.innerHTML = `
      <h3>مبروك! لقد فزت بالجائزة الكبرى!</h3>
      <p>هذه الجائزة افتراضية للتسلية فقط</p>
    `;
    elements.contactInfo.style.display = "block";
  }

  function setupEventListeners() {
    elements.spinBtn.addEventListener('click', spinSlots);
  }

  initGame();
});
