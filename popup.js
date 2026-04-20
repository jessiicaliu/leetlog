const btn = document.getElementById("addBtn");
const status = document.getElementById("status");

btn.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab.url?.includes("leetcode.com/problems/")) {
    status.textContent = "Open a LeetCode problem first";
    return;
  }

  btn.disabled = true;
  status.textContent = "Logging...";

  chrome.tabs.sendMessage(tab.id, { type: "GET_PROBLEM" }, async (data) => {
    if (chrome.runtime.lastError) {
      status.textContent = "Refresh the LeetCode page and try again";
      btn.disabled = false;
      return;
    }
    if (!data || !data.title) {
      status.textContent = "Could not read title — refresh page";
      btn.disabled = false;
      return;
    }

    const properties = {
      Question: {
        title: [{ text: { content: data.title } }]
      },
      Finished: {
        date: { start: new Date().toISOString().split("T")[0] }
      }
    };

    if (data.difficulty) {
      properties.Difficulty = {
        select: { name: data.difficulty.charAt(0).toUpperCase() + data.difficulty.slice(1) }
      };
    }

    if (data.tags?.length) {
      properties.Problem = {
        multi_select: data.tags.map(tag => ({ name: tag }))
      };
    }

    try {
      const res = await fetch("https://api.notion.com/v1/pages", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${CONFIG.NOTION_API_KEY}`,
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28"
        },
        body: JSON.stringify({
          parent: { database_id: CONFIG.DATABASE_ID },
          properties
        })
      });

      if (res.ok) {
        status.textContent = "Saved to Notion!";
      } else {
        const err = await res.json();
        status.textContent = `Error: ${err.message || res.status}`;
      }
    } catch (e) {
      status.textContent = "Network error";
    }

    btn.disabled = false;
  });
});
