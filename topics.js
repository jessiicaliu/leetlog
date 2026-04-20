// topic pill selector — renders the list and tracks which ones are selected
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

function clearTopics() {
  selectedTopics.clear();
  document.querySelectorAll(".topic-pill.selected").forEach(p => p.classList.remove("selected"));
  topicCount.textContent = "";
}
