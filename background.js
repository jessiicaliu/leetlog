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
