function getProblemData() {
  const title =
    document.querySelector('h1')?.innerText?.trim() ||
    document.querySelector('[data-cy="question-title"]')?.innerText?.trim() ||
    document.querySelector('.text-title-large')?.innerText?.trim() ||
    document.title.replace(/\s*[-|].*$/, '').trim();

  const difficultyEl =
    document.querySelector('[class*="text-difficulty-easy"]') ||
    document.querySelector('[class*="text-difficulty-medium"]') ||
    document.querySelector('[class*="text-difficulty-hard"]') ||
    document.querySelector('[diff]');

  let difficulty = difficultyEl?.innerText?.trim().toLowerCase() || "";
  if (!difficulty) {
    const text = document.body.innerText;
    if (text.match(/\bEasy\b/)) difficulty = "easy";
    else if (text.match(/\bMedium\b/)) difficulty = "medium";
    else if (text.match(/\bHard\b/)) difficulty = "hard";
  }

  const tagEls = document.querySelectorAll('a[href*="/tag/"]');
  const tags = [...new Set([...tagEls].map(el => el.innerText.trim()).filter(Boolean))];

  return { title, difficulty, tags, url: window.location.href };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_PROBLEM") {
    sendResponse(getProblemData());
  }
});
