// Only enable the popup on LeetCode problem pages
chrome.action.disable();

function updateAction(tab) {
  if (tab.url?.includes("leetcode.com/problems/")) {
    chrome.action.enable(tab.id);
  } else {
    chrome.action.disable(tab.id);
  }
}

chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.get(tabId, updateAction);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") updateAction(tab);
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
