# Track 3: Personal Data, Personal Value

## **Prizes:**

**1st Place: $5,000 Cash**

**2nd Place: $2,000 Cash**

**3rd Place: $1,000 Cash**

### **The Goal:**

Build services that analyze a user's own exported data and give them something they couldn't see before.

### **The Problem:**

Think of all the data a person can already download today — emails, AI chat logs, social media archives, calendar history, financial transactions. What insights are buried in there? What patterns? What could you build that helps a real person understand themselves, their habits, their finances, or their relationships better?

### Example Projects

- A tool that analyzes a user's ChatGPT conversation history to surface recurring anxieties, growth themes, and decision patterns
- A freelancer's "business brain" that ingests invoices, emails, and calendar data to auto-generate a weekly income + pipeline summary
- A service that combines social posts and transaction data to help a user understand their spending triggers and distraction patterns

### Dataset

[Issued Construction Permits (Austin)](https://data.austintexas.gov/Building-and-Development/Issued-Construction-Permits/3syk-w9eu) (2M+ rows of text)

<aside>
<img src="https://www.notion.so/icons/light-bulb_orange.svg" alt="https://www.notion.so/icons/light-bulb_orange.svg" width="40px" />

### About

This track benefits most from combining multiple data sources for a single person. The real magic happens at the intersections — what does someone's spending look like in the weeks after high-stress calendar periods? Do their social posts reflect what they're actually dealing with in their lifelog? Each persona's files cross-reference each other via `refs` fields, making these patterns discoverable. All data types a real person can export today (AI history, email, social, financial, calendar) are represented.

Any persona works well for this track. **p01 (Jordan Lee)** and **p05 (Theo Nakamura)** have particularly interesting financial + professional tension that's rich for analysis.

</aside>

<aside>
<img src="https://www.notion.so/icons/code_orange.svg" alt="https://www.notion.so/icons/code_orange.svg" width="40px" />

### Accessing the Datasets

[→ Download from Google Drive](https://drive.google.com/drive/folders/1TEWhdzff-FgkDNY-53IDXIWaPZQ7_5F3?usp=sharing) 

**Quick load — combining sources for cross-analysis (Python):**

python

`import json
from collections import Counter

with open("persona_p05/transactions.jsonl") as f:
    transactions = [json.loads(line) for line in f]

with open("persona_p05/social_posts.jsonl") as f:
    social = [json.loads(line) for line in f]

with open("persona_p05/conversations.jsonl") as f:
    conversations = [json.loads(line) for line in f]

# What does this person spend on most?
spend_tags = [tag for t in transactions for tag in t["tags"]]
print(Counter(spend_tags).most_common(10))

# What topics come up most in their AI sessions?
ai_tags = [tag for c in conversations for tag in c["tags"]]
print(Counter(ai_tags).most_common(10))`

See `QUICKSTART.md` in the dataset folder for full examples.

</aside>

<aside>
<img src="https://www.notion.so/icons/code_orange.svg" alt="https://www.notion.so/icons/code_orange.svg" width="40px" />

### Using Your Own Real Data (*optional*)

- 💬 **ChatGPT export** — [help.openai.com](https://help.openai.com/en/articles/7260999-how-do-i-export-my-chatgpt-history-and-data)
- 🌐 **Google Takeout** — [takeout.google.com](https://takeout.google.com/) — Gmail, Calendar, Drive, Location History
- 📱 **Instagram / Facebook** — Settings → Your Activity → Download Your Information (JSON format)
- 🍎 **Apple Health** — Health app → Profile → Export All Health Data

See `how_to_export_your_own_data.md` in the dataset folder for step-by-step instructions.

</aside>