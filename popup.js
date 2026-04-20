const timerDisplay = document.getElementById("timer");
const startPauseBtn = document.getElementById("startPauseBtn");
const resetBtn = document.getElementById("resetBtn");
const logBtn = document.getElementById("logBtn");
const status = document.getElementById("status");

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  if (tab.url?.includes("leetcode.com/problems/")) {
    document.getElementById("main").style.display = "block";
  } else {
    document.getElementById("not-leetcode").style.display = "block";
  }
});

// Timer controls
startPauseBtn.addEventListener("click", () => {
  chrome.storage.local.get(["timerBase", "timerStartedAt", "timerRunning"], (data) => {
    if (data.timerRunning) {
      const elapsed = getElapsed(data);
      chrome.storage.local.set({ timerBase: elapsed, timerRunning: false, timerStartedAt: null });
      clearInterval(timerInterval);
      startPauseBtn.textContent = "Start";
    } else {
      chrome.storage.local.set({ timerRunning: true, timerStartedAt: Date.now() });
      startPauseBtn.textContent = "Pause";
      startTicking(timerDisplay);
    }
  });
});

resetBtn.addEventListener("click", () => {
  resetTimer(timerDisplay, startPauseBtn);
});

// Restore timer state when popup opens
chrome.storage.local.get(["timerBase", "timerStartedAt", "timerRunning"], (data) => {
  timerDisplay.textContent = formatDisplay(getElapsed(data));
  if (data.timerRunning) {
    startPauseBtn.textContent = "Pause";
    startTicking(timerDisplay);
  }
});

// Log to Notion
logBtn.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab.url?.includes("leetcode.com/problems/")) {
    status.textContent = "Open a LeetCode problem first";
    return;
  }

  logBtn.disabled = true;
  status.textContent = "Logging...";

  chrome.tabs.sendMessage(tab.id, { type: "GET_PROBLEM" }, async (problemData) => {
    if (chrome.runtime.lastError) {
      status.textContent = "Refresh the LeetCode page and try again";
      logBtn.disabled = false;
      return;
    }
    if (!problemData?.title) {
      status.textContent = "Could not read title — refresh page";
      logBtn.disabled = false;
      return;
    }

    const timerData = await new Promise(r => chrome.storage.local.get(["timerBase", "timerStartedAt", "timerRunning"], r));
    const elapsed = getElapsed(timerData);

    try {
      await logToNotion(problemData, elapsed);
      status.textContent = "Saved to Notion!";
      resetTimer(timerDisplay, startPauseBtn);
    } catch (e) {
      status.textContent = `Error: ${e.message}`;
    }

    logBtn.disabled = false;
  });
});
