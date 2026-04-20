// runs in the background — auto starts/resets the timer when you open or close a leetcode problem tab
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url?.includes("leetcode.com/problems/")) {
    chrome.storage.local.set({ timerBase: 0, timerRunning: true, timerStartedAt: Date.now() });
  }
});

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === "LEETCODE_TAB_OPEN") {
    chrome.storage.local.set({ leetcodeTabId: sender.tab.id });
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.local.get("leetcodeTabId", (data) => {
    if (data.leetcodeTabId === tabId) {
      chrome.storage.local.set({ timerBase: 0, timerRunning: false, timerStartedAt: null, leetcodeTabId: null });
    }
  });
});
