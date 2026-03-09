# Track 1: Memory Infrastructure

## **Prizes:**

**1st Place: $5,000 Cash**

**2nd Place: $2,000 Cash**

**3rd Place: $1,000 Cash**

### The Goal

Build the tools and systems that make user-controlled personal data portable.

### The Problem

The goal is to solve the plumbing: how does data move between systems securely, with user consent intact? Projects might include secure data vaults, interoperability APIs, consent-driven data pipelines, or tools that unify a person's scattered digital history into something they actually own and control.

### **Example projects**

- A consent-aware personal data vault that ingests exports from multiple platforms and provides a unified, queryable timeline
- An interoperability API that translates between common personal data formats (Google Takeout, ChatGPT export, Apple Health)
- A permission layer that lets a user granularly control which apps can access which parts of their memory

### Datasets

<aside>
<img src="https://www.notion.so/icons/light-bulb_orange.svg" alt="https://www.notion.so/icons/light-bulb_orange.svg" width="40px" />

### About

The provided synthetic personas each contain data from 8 distinct sources — AI conversations, email, calendar, financial transactions, social posts, a personal lifelog, file metadata, and a persona profile. This mirrors what a real person could download today from Google, OpenAI, their bank, and their social platforms. Each record includes cross-references (`refs`) linking related entries across files, making it possible to reconstruct coherent events and timelines.

Recommended personas: **p01 (Jordan Lee)** and **p03 (Darius Webb)** — both have rich multi-source data well-suited for infrastructure and pipeline work.

</aside>

<aside>
<img src="https://www.notion.so/icons/headset_orange.svg" alt="https://www.notion.so/icons/headset_orange.svg" width="40px" />

### Accessing the Datasets

[→ Download from Google Drive](https://drive.google.com/drive/folders/1TEWhdzff-FgkDNY-53IDXIWaPZQ7_5F3?usp=sharing) 

**Quick load (Python):**

python

`import json

with open("persona_p01/persona_profile.json") as f:
    profile = json.load(f)

with open("persona_p01/lifelog.jsonl") as f:
    lifelog = [json.loads(line) for line in f]

work_entries = [e for e in lifelog if "work" in e["tags"]]`

See `QUICKSTART.md` in the dataset folder for full loading examples in Python and JavaScript.

</aside>

<aside>
<img src="https://www.notion.so/icons/comment_orange.svg" alt="https://www.notion.so/icons/comment_orange.svg" width="40px" />

### Additional Datasets

- 🌐 **Google Takeout format reference** — [takeout.google.com](https://takeout.google.com/) (see export guide in dataset folder)
- 🔄 **Data Transfer Project (DTI open source)** — [github.com/dtinit/data-transfer-project](https://github.com/dtinit/data-transfer-project) — open-source framework powering Google, Meta, and Apple data transfer features
- 🏙️ **City of Austin Open Data Portal** — [data.austintexas.gov](https://data.austintexas.gov/) — for location, mobility, and civic data overlays
- 🧬 **Open Humans public datasets** — [openhumans.org](https://www.openhumans.org/) — consent-based personal data (Fitbit, genomics, activity logs) from real contributors
</aside>