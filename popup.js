const timerDisplay = document.getElementById("timer");
const startPauseBtn = document.getElementById("startPauseBtn");
const resetBtn = document.getElementById("resetBtn");
const logBtn = document.getElementById("logBtn");
const status = document.getElementById("status");
const notesEl = document.getElementById("notes");

const TOPICS = [
  "array", "string", "binary search", "dynamic programming", "dfs", "bfs",
  "graph", "tree", "binary tree", "binary search tree", "linked list",
  "stack/queue", "heap", "trie", "hashtable", "matrix", "two pointers",
  "sliding window", "recursion", "backtracking", "bit manipulation",
  "math", "set", "sort", "design"
];

const selectedTopics = new Set();
const topicsList = document.getElementById("topics-list");
const topicCount = document.getElementById("topic-count");

TOPICS.forEach(topic => {
  const pill = document.createElement("button");
  pill.className = "topic-pill";
  pill.textContent = topic;
  pill.addEventListener("click", () => {
    if (selectedTopics.has(topic)) {
      selectedTopics.delete(topic);
      pill.classList.remove("selected");
    } else {
      selectedTopics.add(topic);
      pill.classList.add("selected");
    }
    topicCount.textContent = selectedTopics.size ? `(${selectedTopics.size})` : "";
  });
  topicsList.appendChild(pill);
});

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  if (tab.url?.includes("leetcode.com/problems/")) {
    document.getElementById("main").style.display = "block";
    chrome.storage.local.get(["timerBase", "timerStartedAt", "timerRunning"], (data) => {
      if (!data.timerRunning && !data.timerBase) {
        chrome.storage.local.set({ timerRunning: true, timerStartedAt: Date.now(), timerBase: 0 });
        startPauseBtn.textContent = "pause";
        startTicking(timerDisplay);
      }
    });
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
    startPauseBtn.textContent = "pause";
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

  const getProblem = (tabId) => new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, { type: "GET_PROBLEM" }, (data) => {
      if (chrome.runtime.lastError) resolve(null);
      else resolve(data);
    });
  });

  let problemData = await getProblem(tab.id);

  if (!problemData) {
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content.js"] });
    problemData = await getProblem(tab.id);
  }

  if (!problemData?.title) {
    status.textContent = "could not read page — try refreshing";
    logBtn.disabled = false;
    return;
  }

  const timerData = await new Promise(r => chrome.storage.local.get(["timerBase", "timerStartedAt", "timerRunning"], r));
  const elapsed = getElapsed(timerData);

  if (selectedTopics.size) problemData.tags = [...selectedTopics];
  const notes = notesEl.value.trim();

  try {
    await logToNotion(problemData, elapsed, notes);
    status.textContent = "saved to notion!";
    resetTimer(timerDisplay, startPauseBtn);
    notesEl.value = "";
    selectedTopics.clear();
    document.querySelectorAll(".topic-pill.selected").forEach(p => p.classList.remove("selected"));
    topicCount.textContent = "";
  } catch (e) {
    status.textContent = `error: ${e.message}`;
  }

  logBtn.disabled = false;
});
