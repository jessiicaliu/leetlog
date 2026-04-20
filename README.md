# leetlog

Chrome extension that logs your LeetCode solutions to Notion. Tracks time, difficulty, topic tags, and any notes you want to add.

## Features

- Timer auto-starts when you open a problem
- Pick topic tags (array, dp, graph, etc.) from a built-in list
- Optional notes field for your approach or anything you want to remember
- One click to log everything to Notion

## Setup

1. Clone the repo
2. Fill in your Notion API key and database ID in `config.js`
3. Go to `chrome://extensions`, turn on Developer Mode, and load the folder as an unpacked extension

### Notion Database Properties

Your database needs these columns set up exactly like this or the logging won't work.

- `Question` - title (the problem name)
- `Difficulty` - select (Easy, Medium, Hard)
- `Finished` - date (auto-filled to today)
- `Problem` - multi-select (topic tags like array, dp, etc.)
- `Time Taken` - select (logged as a range, e.g. 10-20 minutes)
