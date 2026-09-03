# 🤖 Shop-Floor AI Agent

A lightweight AI agent prototype for cabinet production that helps operators verify panels, check workstation compatibility, retrieve SOP instructions, and escalate issues when information is unavailable or inconsistent.

Built for the **Junior AI Engineer Practical Assessment**.

---

## 🔗 Project Links

|                  |                     |
| ---------------- | ------------------- |
| **Demo**         | `YOUR_DEMO_URL`     |
| **Repository**   | `YOUR_GITHUB_URL`   |
| **LLM**          | `YOUR_LLM_PROVIDER` |
| **Approx. Time** | `~1 hour`           |

---

## 🏗️ Architecture

```text
Operator
   ↓
HTML / CSS / JavaScript
   ↓
n8n Webhook
   ↓
AI Agent
   ↓
Google Sheets
   ↓
Decision + SOP + Trace
```

### Agent Flow

```text
Input
  → Decide
  → Call Tool
  → Read Result
  → Decide Next Step
  → Respond / Act
```

![n8n Workflow](screenshots/n8n-workflow.png)

---

## 🖥️ Web UI

The operator can:

* Select a workstation
* Enter a panel code
* View panel information
* Verify workstation compatibility
* Ask the AI questions
* View instructions and sources
* View the agent/tool trace
* Review activity history

![Web UI](screenshots/web-ui.png)

---

## 📊 Structured Data

Google Sheets is used as the **source of truth** for the fictional production data used by the AI Agent.

The database is organized into four sheets: **Panels, Workstations, SOPs, and Events.**

### 📋 Panel Data

Contains the production information for each panel, including dimensions, material, cabinet ID, and required operation.

![Panel Data](https://github.com/Raven-D3v/Project-Auto/blob/7b97a82a23c9c20a0a8b8f9865301c77f50b2b2e/ABCab/shop-floor-ai-agent/images/panels.png)

### 🏭 Workstation Data

Defines each workstation and the production operation it supports. The Agent uses this data to verify workstation compatibility.

![Workstation Data](https://github.com/Raven-D3v/Project-Auto/blob/7b97a82a23c9c20a0a8b8f9865301c77f50b2b2e/ABCab/shop-floor-ai-agent/images/worksta.png)

### 📖 SOP Data

Contains the approved Standard Operating Procedures used by the Agent to provide grounded production instructions.

![SOP Data](https://github.com/Raven-D3v/Project-Auto/blob/7b97a82a23c9c20a0a8b8f9865301c77f50b2b2e/ABCab/shop-floor-ai-agent/images/sop.png)

### 📝 Event History

Stores scans, questions, workstation mismatches, and supervisor escalations for basic activity tracking.

![Event History](https://github.com/Raven-D3v/Project-Auto/blob/7b97a82a23c9c20a0a8b8f9865301c77f50b2b2e/ABCab/shop-floor-ai-agent/images/ev.png)

### Example Production Data

| Panel | Operation | Workstation |
|---|---|---|
| P-1001 | Edge Banding | EDGE-01 |
| P-1002 | Edge Banding | EDGE-01 |
| P-2001 | Drilling | DRILL-01 |
| P-2002 | Drilling | DRILL-01 |

---

---

## 🧰 Agent Tools

| Tool                             | Purpose                                 |
| -------------------------------- | --------------------------------------- |
| `get_panel()`                    | Retrieve panel data                     |
| `get_workstation_requirements()` | Check workstation capability            |
| `search_sop()`                   | Retrieve approved SOP instructions      |
| `record_event()`                 | Record activity                         |
| `escalate_to_supervisor()`       | Handle unresolved/mismatched situations |

The LLM decides which tools are needed based on the operator's request.

---

# ✅ Required Tests

### 1. Correct Workstation

**P-1001 → EDGE-01**

Result: **PASS ✅**

Panel requires Edge Banding and EDGE-01 supports Edge Banding.

---

### 2. Wrong Workstation

**P-1001 → DRILL-01**

Result: **PASS ✅**

Agent detects the mismatch and tells the operator not to process the panel at the selected workstation.

---

### 3. Unsupported Question

**"What spindle speed should I use?"**

Result: **PASS ✅**

The agent does not invent a machine setting when it is not available in the SOP/data.

---

### 4. Unknown Panel

**P-9999**

Result: **PASS ✅**

Agent returns **Panel Not Found** without inventing panel information.

---

### 5. Supervisor Escalation

**"The physical panel label does not match the system."**

Result: **PASS ✅**

Agent recognizes the mismatch and triggers/simulates supervisor escalation.

---

# 🔒 Grounding & Safety

Production facts come from **Google Sheets**, not the LLM.

The agent does not invent:

* Dimensions
* Materials
* Cabinet IDs
* Operations
* Machine settings
* Speeds
* Tooling parameters
* Safety procedures

When information is unavailable or inconsistent, the agent reports it and recommends escalation.

---

# 🧠 Technical Questions

**1. How does the agent decide which tool to call?**
The LLM selects tools based on the operator's request and the available tool descriptions.

**2. What tools are available?**
`get_panel`, `get_workstation_requirements`, `search_sop`, `record_event`, and `escalate_to_supervisor`.

**3. What comes from structured data?**
Panel, workstation, and SOP information comes from Google Sheets.

**4. How are hallucinations prevented?**
The agent is instructed to use tools as the source of truth and never guess unavailable production information.

**5. What happens if a tool/LLM call fails?**
The system returns an error/retry response rather than generating unsupported production information.

**6. What would you improve with one more day?**
I would improve tool error handling, validation, and observability before adding more features.

---

# ⚙️ Setup

### Requirements

* n8n
* Google Sheets
* LLM API
* Modern web browser

### Basic Setup

1. Create the Google Sheets tabs: `Panels`, `Workstations`, `SOPs`, `Events`.
2. Configure Google Sheets credentials in n8n.
3. Configure the LLM credentials.
4. Import/configure the n8n workflow.
5. Set the webhook URL in the frontend.
6. Open the web application.

No database server, vector database, Docker, or complex infrastructure is required.

---

## 📁 Project Structure

```text
shop-floor-ai-agent/
│
├── index.html
├── style.css
├── script.js
├── screenshots/
│   ├── n8n-workflow.png
│   ├── web-ui.png
│   └── google-sheets.png
└── README.md
```

---

## 🎥 Demo

The demo video covers:

1. Correct workstation
2. Wrong workstation
3. Unsupported question
4. Agent tool trace
5. Supervisor escalation

**Demo:** `https://drive.google.com/file/d/1CHMClPd3rly1qZ5ZgdDeFQJWH3Upmtnm/view?usp=drivesdk`

---

## MVP Scope

This prototype intentionally focuses on the core assessment requirements rather than production infrastructure.

**Implemented:**

* ✅ AI agent
* ✅ Tool calling
* ✅ Structured production data
* ✅ SOP retrieval
* ✅ Workstation verification
* ✅ Safety/grounding
* ✅ Event history
* ✅ Supervisor escalation
* ✅ Simple web UI
* ✅ Agent execution trace

**Not included:**

* Real barcode scanner
* Authentication
* Real factory integration
* Machine control
* Advanced RAG/vector database
* Multi-agent system

> **A simple, reliable implementation was prioritized over unnecessary complexity.**
