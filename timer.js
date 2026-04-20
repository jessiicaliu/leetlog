// timer helpers — formatting, tracking elapsed time, start/stop/reset
let timerInterval = null;

function formatDisplay(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function formatForNotion(secs) {
  const m = Math.floor(secs / 60);
  if (m < 10) return "<10 minutes";
  if (m < 20) return "10-20 minutes";
  if (m < 30) return "20-30 minutes";
  if (m < 40) return "30-40 minutes";
  if (m < 50) return "40-50 minutes";
  if (m < 60) return "50-60 minutes";
  return "1 hour+";
}

function getElapsed(data) {
  const base = data.timerBase || 0;
  if (data.timerRunning && data.timerStartedAt) {
    return base + Math.floor((Date.now() - data.timerStartedAt) / 1000);
  }
  return base;
}

function startTicking(displayEl) {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    chrome.storage.local.get(["timerBase", "timerStartedAt", "timerRunning"], (data) => {
      displayEl.textContent = formatDisplay(getElapsed(data));
    });
  }, 1000);
}

function resetTimer(displayEl, btnEl) {
  clearInterval(timerInterval);
  chrome.storage.local.set({ timerBase: 0, timerRunning: false, timerStartedAt: null });
  displayEl.textContent = "00:00";
  btnEl.textContent = "Start";
}
