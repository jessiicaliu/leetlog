async function logToNotion(problemData, elapsed) {
  const properties = {
    Question: {
      title: [{ text: { content: problemData.title } }]
    },
    Finished: {
      date: { start: new Date().toISOString().split("T")[0] }
    }
  };

  if (problemData.difficulty) {
    properties.Difficulty = {
      select: { name: problemData.difficulty.charAt(0).toUpperCase() + problemData.difficulty.slice(1) }
    };
  }

  if (problemData.tags?.length) {
    properties.Problem = {
      multi_select: problemData.tags.map(tag => ({ name: tag }))
    };
  }

  if (elapsed > 0) {
    properties["Time Taken"] = {
      select: { name: formatForNotion(elapsed) }
    };
  }

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

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || res.status);
  }
}
