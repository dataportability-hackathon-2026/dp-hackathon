# Track 2: AI Companions with Purpose

## **Prizes:**

**1st Place: $5,000 Cash**

**2nd Place: $2,000 Cash**

**3rd Place: $1,000 Cash**

### **The Goal:**

Build AI agents that use a person's memory to deliver something genuinely useful to them.

### **The Problem:**

The key constraint: the value should flow *to the user*, not to a corporation. Projects might include agents that help users reflect on their own patterns, plan based on their history, process their past decisions, or generate personalized creative work.

### **Example projects:**

- A weekly "life coach" agent that reviews a user's calendar, sleep data, and AI chat history to surface patterns and suggest micro-interventions
- A post-call decompression companion for a medical resident that adapts its support based on what happened during the shift
- An agent that turns a user's AI conversation history into a structured "personal insight report" showing their recurring themes and growth areas over time

### Datasets

<aside>
<img src="https://www.notion.so/icons/light-bulb_orange.svg" alt="https://www.notion.so/icons/light-bulb_orange.svg" width="40px" />

### About

This track is where the AI conversation logs shine. Each persona's `conversations.jsonl` contains multi-turn AI sessions covering career decisions, mental health, relationships, finances, and creative work — exactly the kind of intimate, contextual data that makes personalized AI companions possible. Combined with the `lifelog.jsonl`, you have a 2-year narrative arc for each person: what they did, what they felt, what they asked for help with, and how they grew.

Recommended personas: **p02 (Maya Patel)** for high-stakes emotional support use cases, and **p05 (Theo Nakamura)** for productivity, creative work, and self-coaching scenarios.

</aside>

<aside>
<img src="https://www.notion.so/icons/light-bulb_orange.svg" alt="https://www.notion.so/icons/light-bulb_orange.svg" width="40px" />

### Accessing Dataset

[→ Download from Google Drive](https://drive.google.com/drive/folders/1TEWhdzff-FgkDNY-53IDXIWaPZQ7_5F3?usp=sharing) 

**Quick load — conversations + lifelog combined (Python):**

python

`import json

with open("persona_p02/conversations.jsonl") as f:
    conversations = [json.loads(line) for line in f]

with open("persona_p02/lifelog.jsonl") as f:
    lifelog = [json.loads(line) for line in f]

# Build a combined timeline sorted by date
timeline = sorted(conversations + lifelog, key=lambda x: x["ts"])

# Pull all mental health entries across both files
mh_entries = [e for e in timeline if "mental_health" in e["tags"]]`

See `QUICKSTART.md` in the dataset folder for full examples including cross-file queries.

</aside>

<aside>
<img src="https://www.notion.so/icons/light-bulb_orange.svg" alt="https://www.notion.so/icons/light-bulb_orange.svg" width="40px" />

### Additional Datasets

- 🤖 **Google Synthetic-Persona-Chat** — [huggingface.co/datasets/google/Synthetic-Persona-Chat](https://huggingface.co/datasets/google/Synthetic-Persona-Chat) — 20k persona-grounded conversations for training and testing
- 👤 **PersonaHub (1B personas, Tencent/HuggingFace)** — [huggingface.co/datasets/proj-persona/PersonaHub](https://huggingface.co/datasets/proj-persona/PersonaHub) — large-scale synthetic persona diversity
- 🧑 **FinePersonas (21M personas, Argilla)** — [huggingface.co/datasets/argilla/FinePersonas-v0.1](https://huggingface.co/datasets/argilla/FinePersonas-v0.1) — detailed personas for realistic synthetic data generation
</aside>