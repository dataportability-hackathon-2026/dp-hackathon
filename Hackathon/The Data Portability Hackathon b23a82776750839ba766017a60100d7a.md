# The Data Portability Hackathon

<aside>
<img src="https://www.notion.so/icons/location_orange.svg" alt="https://www.notion.so/icons/location_orange.svg" width="40px" /> University of Texas

</aside>

<aside>
<img src="https://www.notion.so/icons/calendar_orange.svg" alt="https://www.notion.so/icons/calendar_orange.svg" width="40px" /> Feb 25 - Mar 9

</aside>

<aside>
<img src="https://www.notion.so/icons/child_orange.svg" alt="https://www.notion.so/icons/child_orange.svg" width="40px" /> **In Person + Hybrid**

</aside>

**Welcome to the Data Portability Hackathon!** We're bringing together builders, researchers, policy thinkers, and creative technologists to explore what AI can do for people when it runs on *their* data — safely, transparently, and on their terms.

# Key Hacker Resources

---

[Demo Video Instructions](The%20Data%20Portability%20Hackathon/Demo%20Video%20Instructions%203aaa8277675082d7aafd016c4361ad91.md)

[Data Portability Context](The%20Data%20Portability%20Hackathon/Data%20Portability%20Context%20ca1a8277675082b3ad118104857bce8d.md)

[Synthetic Data Generation](The%20Data%20Portability%20Hackathon/Synthetic%20Data%20Generation%20a4aa827767508288a0ba81ba1f656716.md)

[Open Datasets](The%20Data%20Portability%20Hackathon/Open%20Datasets%20ee8a8277675083e8a15301147c40f927.md)

[Export You Own Data](The%20Data%20Portability%20Hackathon/Export%20You%20Own%20Data%20cbea82776750831096d701aac202d62d.md)

<aside>
<img src="https://www.notion.so/icons/headset_orange.svg" alt="https://www.notion.so/icons/headset_orange.svg" width="40px" />

### [Join The Slack](https://join.slack.com/t/the-aicollective/shared_invite/zt-3qvt01f75-WSrkscRrVknwx1qvR6eNbA)!

This will be the easiest way to communicate with our team, get updates on the hackathon, and connect with other hackers. Please join ASAP!

</aside>

<aside>
<img src="https://www.notion.so/icons/alien-pixel_orange.svg" alt="https://www.notion.so/icons/alien-pixel_orange.svg" width="40px" />

### [SUBMIT YOUR PROJECT!](https://airtable.com/appWQWPtBqDUhCPPj/shrKaXYSgDZ59co2y)

</aside>

<aside>
<img src="https://www.notion.so/icons/map_orange.svg" alt="https://www.notion.so/icons/map_orange.svg" width="40px" />

### Getting Situated

[Wifi & Bathrooms](The%20Data%20Portability%20Hackathon/Wifi%20&%20Bathrooms%203d4a8277675083b18678012ff51e505b.md)

[Parking Options](The%20Data%20Portability%20Hackathon/Parking%20Options%20128a827767508357aaac81d52fc234b8.md)

</aside>

<aside>
<img src="https://www.notion.so/icons/list_orange.svg" alt="https://www.notion.so/icons/list_orange.svg" width="40px" />

### Build Challenges

### **Context**

Teams will choose a build track and come up with a solution that meets the minimum required outcomes. What you build is more open-ended because we won’t be asking for a specific product to be built from the dataset. The goal is to build something that creates genuine value *for the individual whose data it uses*.

[Track 1: Memory Infrastructure](The%20Data%20Portability%20Hackathon/Track%201%20Memory%20Infrastructure%2086ea827767508246a91d01de0789fb86.md)

[Track 2: AI Companions with Purpose](The%20Data%20Portability%20Hackathon/Track%202%20AI%20Companions%20with%20Purpose%20692a82776750832995a8015bfdd5872b.md)

[Track 3: Personal Data, Personal Value](The%20Data%20Portability%20Hackathon/Track%203%20Personal%20Data,%20Personal%20Value%203dfa8277675083cfaaed81e9f6c3b710.md)

</aside>

<aside>

### Datasets

Add your content here. You can include multiple text blocks, lists, or other elements inside a callout.

All participants receive access to 5 fully synthetic personal memory personas. These were purpose-built for this hackathon to reflect real, coherent human lives — not generic bulk data.

[**→ Download Hackathon Datasets**](https://drive.google.com/drive/folders/1TEWhdzff-FgkDNY-53IDXIWaPZQ7_5F3?usp=sharing) 

### What's included

| Persona | Age | Background | Key Themes |
| --- | --- | --- | --- |
| Jordan Lee (p01) | 32 | Senior Product Manager, Austin | Burnout, promotion anxiety, saving for a home, relationship strain |
| Maya Patel (p02) | 26 | Medical Resident, UT Health Austin | Exhaustion, $178k debt, isolation, fellowship vs. hospitalist decision |
| Darius Webb (p03) | 41 | Agency Founder/CEO, Austin | Post-divorce rebuild, co-parenting, scaling a business, book writing |
| Sunita Rajan (p04) | 58 | AP Chemistry Teacher, Round Rock | Pre-retirement, supporting adult son, cautious tech adopter |
| Theo Nakamura (p05) | 23 | Freelance Designer, East Austin | ADHD, undercharging, debt payoff, building a creative career |

Each persona includes: lifelog (150 entries), AI conversation history, emails (80), calendar events (80), social posts (50), financial transactions (120), file metadata index (40), a persona profile, and a README with project ideas per track.

[**→ View DATASET_SCHEMA.md**](https://drive.google.com/file/d/1OYLZYBCzsvSYQQouDB9k2nigzQZ11180/view?usp=sharing) 

### Using your own data (optional)

Participants may also build with their own real exported data. See `how_to_export_your_own_data.md` in the dataset folder for step-by-step export instructions for Google Takeout, ChatGPT, Claude, Instagram, Facebook, and Apple Health.

**Privacy note:** If you use real personal data, process it locally, remove sensitive content before sharing, and you are responsible for what you disclose.

</aside>

<aside>
<img src="https://www.notion.so/icons/judicial-scales_orange.svg" alt="https://www.notion.so/icons/judicial-scales_orange.svg" width="40px" />

### Judging Criteria

**Philosophy:** A winning project isn't just a slide deck or a simple API wrapper — it's a functioning system that ingests personal data, processes it meaningfully, and produces something genuinely valuable for the person whose data it is.

**Total: 100 Points**

---

### 1. Completeness — 50 pts

*Did they actually build a working system?*

- **Does the system successfully complete the full data workflow without crashing?** Can a judge follow the core loop from data input to meaningful output, live, without it breaking?
- **Is there significant depth under the hood?** Did they build a real pipeline — e.g., a consent layer, a RAG system, a personalized inference loop, custom logic — rather than a static dashboard or a thin API wrapper?

A project that partially works but shows real engineering depth will score better than a polished demo with nothing behind it.

---

### 2. Meets Track Criteria — 25 pts

*Did they actually solve the problem they chose?*

- **Does the project address the stated goal of their chosen track?** Track 1 should move or structure data. Track 2 should deliver personal value through an AI agent. Track 3 should surface insight from a user's own data.
- **Can they articulate the "data story"?** Who owns the data? Where does it come from? How is consent handled? Why does this build something better for the individual?

---

### 3. Innovation — 15 pts

*Did they push the boundaries?*

- **Did they combine data sources or approaches in a novel way?** (e.g., fusing AI conversation history with calendar data to detect burnout patterns — not just displaying data in a new format)
- **Is the insight non-obvious and valuable?** "This person spends a lot on food" is obvious. "This person's discretionary spending spikes in the week after high-stress calendar periods" is valuable.

---

### 4. User Experience — 10 pts

*Is it actually usable?*

- **Could a real person — not a developer — use this tool to make a decision or understand something about themselves?**
- **Is the output clear and actionable?** Judges will ask: would Jordan, Maya, Darius, Sunita, or Theo actually want this?

---

### Bonus Awards

- 🏛️ **Policy + Law Innovation Award** — UT Austin School of Law
- 🔄 **Interoperability Infrastructure Award** — Data Transfer Initiative
- 🧡 **Human-Centric Design Award** — AI Collective
</aside>

<aside>

[Submission Checklist](The%20Data%20Portability%20Hackathon/Submission%20Checklist%20527a82776750837fbe820130ead0df05.md)

</aside>

# Agenda - Kickoff                                                 Feb 25th

---

[Doors Open + Check-in](The%20Data%20Portability%20Hackathon/Doors%20Open%20+%20Check-in%20752a8277675082a1bb2481b00f530bab.md)

5:30 PM - 6:00 PM

---

[Networking & Pizza](The%20Data%20Portability%20Hackathon/Networking%20&%20Pizza%2061ea8277675082d0824081c28e8015f0.md)

6:00 PM - 6:45 PM

---

[Hackathon Intro & Welcome](The%20Data%20Portability%20Hackathon/Hackathon%20Intro%20&%20Welcome%2073da827767508332a9008111c6d0c832.md)

6:45 – 7:00 PM

---

[Team Formation & Track Selection](The%20Data%20Portability%20Hackathon/Team%20Formation%20&%20Track%20Selection%20ee6a827767508231972c0146d17b2938.md)

7:00 – 8:00 PM

---

[Hacking Begins](The%20Data%20Portability%20Hackathon/Hacking%20Begins%209a7a827767508298a378819513aa3424.md)

8:00 PM Onwards

---

# Agenda - Day 14                                                    Mar 11th

---

[TBD](The%20Data%20Portability%20Hackathon/TBD%20581a8277675083d7a58b0165a21ec448.md)

---

---

<aside>
<img src="https://www.notion.so/icons/alert_orange.svg" alt="https://www.notion.so/icons/alert_orange.svg" width="40px" /> Post in Slack channel or email us at

</aside>

[Thank you to our Sponsors!](The%20Data%20Portability%20Hackathon/Thank%20you%20to%20our%20Sponsors!%20484a827767508344afe0816fb77ed75f.csv)