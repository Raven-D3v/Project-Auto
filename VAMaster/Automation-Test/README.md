# Developer & Automation Expert Skill Test

## Recruitment Pipeline & Remote Job Import Automation

This repository contains my submission for the **VAMasters Developer & Automation Expert Skill Test**.

The assessment demonstrates two primary areas:

1. **Database Architecture** — Designing a structured recruitment database in Airtable.
2. **Automation & API Integration** — Building an n8n workflow that retrieves remote job listings from the Remotive API, transforms the data, and imports it into Airtable with deduplication and error handling.

---

# Assessment Tasks

| Task | Description | Technology |
|---|---|---|
| **Task 1** | Database Architecture | Airtable |
| **Task 2** | External API Integration | n8n + Remotive API + Airtable |
| **Task 3** | Documentation | GitHub README |
| **Task 4** | Screen Recording Walkthrough | OBS |

---

# Task 1 — Database Architecture in Airtable

## 1.1 Objective

The objective of Task 1 was to design a structured recruitment database that can manage clients, job openings, candidates, applications, and successful placements.

The database was designed around the recruitment lifecycle:

**Client → Job Opening → Application → Placement**

Candidates are connected to job openings through the **Applications** table, allowing the database to represent multiple applications from the same candidate to different jobs.

---

## 1.2 Schema Overview

The Airtable base contains five core tables:

```text
Clients
   │
   └── Job Openings
          │
          └── Applications ─── Candidates
                    │
                    └── Placements
```

### Core relationships

- One **Client** can have many **Job Openings**.
- One **Job Opening** can receive many **Applications**.
- One **Candidate** can submit many **Applications**.
- **Applications** acts as the junction between Candidates and Job Openings.
- One **Candidate** can have multiple **Placements** over time.
- A **Job Opening** can have at most one successful Placement.

This structure avoids storing repeated candidate, client, and job information in multiple places.

---

## 1.3 Table Structure

### 1.3.1 Clients

Stores information about companies using the recruitment service.

| Field | Type |
|---|---|
| Client Name | Single line text |
| Client ID | Single line text |
| Industry | Single select |
| Contact Name | Single line text |
| Contact Email | Email |
| Phone | Phone |
| Status | Single select |
| Website | URL |
| Job Openings | Linked record |
| Open Positions | Rollup |

---

### 1.3.2 Job Openings

Stores job vacancies submitted by clients.

| Field | Type |
|---|---|
| Job Title | Single line text |
| Job ID | Single line text |
| Client | Linked record → Clients |
| Employment Type | Single select |
| Status | Single select |
| Location | Single line text |
| Salary Min | Currency |
| Salary Max | Currency |
| Posted Date | Date |
| Job URL | URL |
| Description | Long text |
| Applications | Linked record |
| Placements | Linked record |

Example status values:

- Open
- On Hold
- Filled
- Closed

---

### 1.3.3 Candidates

Stores candidate profiles.

| Field | Type |
|---|---|
| Candidate Name | Single line text |
| Candidate ID | Single line text |
| Email | Email |
| Phone | Phone |
| Location | Single line text |
| Skills | Multiple select |
| Years Experience | Number |
| Current Status | Single select |
| Applications | Linked record |
| Placements | Linked record |

Example candidate statuses:

- Active
- Inactive
- Hired

---

### 1.3.4 Applications

Represents a candidate applying for a specific job opening.

| Field | Type |
|---|---|
| Application ID | Single line text |
| Candidate | Linked record → Candidates |
| Job Opening | Linked record → Job Openings |
| Applied Date | Date |
| Status | Single select |
| Notes | Long text |
| Interview Date | Date |
| Client Name | Lookup |

An Application always connects:

```text
1 Candidate
      +
1 Job Opening
      =
1 Application
```

This allows the same candidate to apply for multiple job openings while maintaining each application as a separate recruitment record.

---

### 1.3.5 Placements

Represents a successful recruitment outcome.

| Field | Type |
|---|---|
| Placement ID | Single line text |
| Candidate | Linked record → Candidates |
| Job Opening | Linked record → Job Openings |
| Placement Date | Date |
| Start Date | Date |
| Salary | Currency |
| Placement Fee | Currency |
| Status | Single select |

Example placement statuses:

- Active
- Completed
- Cancelled

A Placement is separate from an Application because not every application results in a hire.

---

## 1.4 Relationships and Data Logic

### 1.4.1 Client → Job Openings

A client can have multiple job openings.

```text
Client
  │
  ├── Job Opening A
  ├── Job Opening B
  └── Job Opening C
```

The `Client` field in Job Openings is a linked record pointing to the Clients table.

---

### 1.4.2 Candidate → Applications

A candidate can apply to multiple jobs.

```text
Candidate
  │
  ├── Application A
  ├── Application B
  └── Application C
```

The Candidate relationship is stored in the Applications table rather than duplicating application information inside the Candidate record.

---

### 1.4.3 Job Opening → Applications

A job opening can receive multiple applications.

```text
Job Opening
  │
  ├── Candidate A
  ├── Candidate B
  └── Candidate C
```

Each application links one candidate to one job opening.

---

### 1.4.4 Applications as the Many-to-Many Junction

Candidates and Job Openings have a many-to-many relationship.

For example:

```text
Candidate A
   │
   ├── Job A
   ├── Job B
   └── Job C
```

At the same time:

```text
Job A
   │
   ├── Candidate A
   ├── Candidate B
   └── Candidate C
```

The Applications table resolves this relationship.

Instead of directly connecting Candidates and Job Openings as a many-to-many relationship, each combination is represented by its own Application record.

This provides a place to store recruitment-specific information such as:

- Application status
- Applied date
- Interview date
- Notes

---

### 1.4.5 Candidates / Job Openings → Placements

Placements represent successful recruitment outcomes.

A Placement connects:

```text
1 Candidate
      +
1 Job Opening
      =
1 Placement
```

This separates the recruitment process from the final hiring outcome.

For example:

```text
Application
    ↓
Screening
    ↓
Interview
    ↓
Offer
    ↓
Hired
    ↓
Placement
```

---

## 1.5 Lookup and Rollup

### 1.5.1 Lookup — Application → Client

The Applications table contains a `Client Name` Lookup field.

The relationship is:

```text
Application
    ↓
Job Opening
    ↓
Client
```

The Client Name is therefore retrieved through the Job Opening relationship instead of being manually duplicated in every Application record.

This reduces duplicate data and keeps the client information consistent.

---

### 1.5.2 Rollup — Open Positions per Client

The Clients table contains an `Open Positions` Rollup field.

It uses:

```text
Clients
   ↓
Job Openings
   ↓
Status
```

The rollup counts Job Openings where the status is **Open**.

Example:

```text
Acme Digital
Open Positions: 1

Nova Commerce
Open Positions: 1

Prime Support Solutions
Open Positions: 1
```

This gives the recruitment team an immediate view of how many active vacancies each client currently has.

---

## 1.6 Design Reasoning

The database was structured around separate entities and relationships rather than storing all recruitment information in a single table.

This provides several benefits:

- Reduces duplicated information.
- Makes relationships between records explicit.
- Allows candidates to apply to multiple jobs.
- Keeps applications separate from successful placements.
- Makes the database easier to maintain and extend.
- Allows Airtable's linked records, lookups, and rollups to provide relational-style functionality.

The Applications table is particularly important because it represents the recruitment transaction between a candidate and a job opening.

---

## 1.7 Airtable vs. Relational SQL

Airtable provides a visual, low-code database experience that is convenient for recruitment teams and non-technical users.

A traditional relational SQL database would provide stronger database-level controls and is better suited for larger or more complex systems.

For example, SQL could enforce constraints such as:

```sql
UNIQUE(job_id)
```

to ensure that only one placement exists for a job opening.

In Airtable, these rules generally need to be handled through field configuration, views, automation logic, or operational processes.

### Why Airtable was used

Airtable was appropriate for this assessment because:

- It provides an intuitive visual interface.
- Linked records make relationships easy to understand.
- Lookup and Rollup fields provide relational functionality.
- It is quick to configure and demonstrate.
- It is accessible to non-technical recruitment users.

### When SQL would be preferable

A relational SQL database would be more appropriate when the system requires:

- Large-scale data volumes.
- Strong transactional integrity.
- Complex queries.
- Strict database constraints.
- Advanced indexing and performance optimization.
- More sophisticated backend applications.

---

# Task 2 — External API Integration with n8n

## 2.1 Objective

The objective of Task 2 was to build an n8n workflow that retrieves remote job listings from the **Remotive API**, transforms the API response into a consistent structure, and stores the imported jobs in Airtable.

The workflow also implements deduplication so that running the workflow multiple times does not create duplicate job records.

---

## 2.2 API and Data Source

The workflow uses the free Remotive remote jobs API:

```text
https://remotive.com/api/remote-jobs
```

The API provides remote job listings containing information such as:

- Job title
- Company
- Location
- Job type
- Publication date
- Job URL
- Job description
- Source job ID

The `Source Job ID` is used as the primary deduplication key for imported listings.

---

## 2.3 Imported Jobs Table

A dedicated **Imported Jobs** table was created in Airtable for external job listings.

This was intentionally separated from the core Job Openings table.

The reason is that an external Remotive listing does not necessarily represent a staffing-agency job opening belonging to one of the Clients in the recruitment database.

Keeping imported external listings separate prevents external API data from being incorrectly treated as an internal recruitment job.

### Imported Jobs fields

| Field | Type |
|---|---|
| Job Title | Single line text |
| Company | Single line text |
| Location | Single line text |
| Job Type | Single select |
| Publication Date | Date |
| Job URL | URL |
| Source | Single select |
| Source Job ID | Single line text |
| Salary | Single line text |

`Source Job ID` is the key field used for deduplication.

---

## 2.4 Workflow Architecture

The workflow follows this general process:

```text
Manual Trigger
      ↓
HTTP Request
      ↓
Validate API Response
      ↓
Split Out Jobs
      ↓
Map Job Fields
      ↓
Search Airtable
      ↓
Check if Existing
   ↙          ↘
YES            NO
 ↓             ↓
Skip       Create Record
```

---

### 2.4.1 Trigger

The workflow starts with a **Manual Trigger**.

This was selected for the assessment because it allows the workflow to be executed and demonstrated directly during testing.

A scheduled trigger could be added later for production use.

---

### 2.4.2 HTTP Request

An HTTP Request node calls the Remotive API.

Example endpoint:

```text
https://remotive.com/api/remote-jobs
```

Query parameters can be provided for the search term and result limit.

Example:

```text
search = n8n automation
limit = 10
```

The API response contains a `jobs` array containing the returned listings.

---

### 2.4.3 Response Validation

The workflow validates that the API returned usable data before attempting to process the jobs.

The validation checks that the expected job data exists.

This prevents the workflow from continuing with an invalid or empty API response.

---

### 2.4.4 Split Jobs

The API returns multiple job listings inside the `jobs` array.

The workflow splits this array so that each job can be processed individually.

Conceptually:

```text
API Response
    │
    ├── Job 1
    ├── Job 2
    ├── Job 3
    └── ...
```

Each job then continues through the mapping and deduplication process independently.

---

### 2.4.5 Field Mapping

The API response is transformed into the structure required by the Airtable `Imported Jobs` table.

Example mapping:

| Remotive API | Airtable |
|---|---|
| `title` | Job Title |
| `company_name` | Company |
| `candidate_required_location` | Location |
| `job_type` | Job Type |
| `publication_date` | Publication Date |
| `url` | Job URL |
| `id` | Source Job ID |
| `salary` | Salary |
| Source | Remotive |

The mapping creates a consistent internal structure while preserving the original external job identifier.

---

### 2.4.6 Deduplication Search

Before creating a new Airtable record, the workflow searches the `Imported Jobs` table using the external `Source Job ID`.

The search logic is conceptually:

```text
Search Imported Jobs
WHERE Source Job ID = current API Job ID
```

This allows the workflow to determine whether the job has already been imported.

---

### 2.4.7 Conditional Check

An IF node checks whether the Airtable search returned an existing record.

The logic is:

```text
Existing Airtable Record?
        │
   ┌────┴────┐
  YES        NO
   │          │
 Skip       Create
```

If a matching record exists, the workflow skips creation.

If no matching record exists, the workflow proceeds to the Airtable Create Record node.

---

### 2.4.8 Create Record

Only jobs that do not already exist in Airtable are inserted.

The Airtable Create Record node receives the mapped fields and creates a new record in `Imported Jobs`.

This keeps the table clean when the workflow is executed repeatedly.

---

## 2.5 Deduplication

Deduplication is based on the Remotive `Source Job ID`.

The workflow performs the following sequence:

```text
Get Job
   ↓
Read Source Job ID
   ↓
Search Imported Jobs
   ↓
Record exists?
   ├── Yes → Skip
   └── No  → Create
```

This means that running the workflow twice should not create duplicate records for the same external job.

Using the source job ID is preferable to checking only the job title because titles may not be unique.

---

## 2.6 Error Handling

The workflow includes deliberate validation/error handling rather than assuming that every API request will succeed.

The API response is checked before processing the returned jobs.

Potential failure scenarios include:

- API request failure.
- Unexpected API response structure.
- Missing job data.
- Missing source job ID.
- Airtable record creation failure.

The workflow can therefore stop invalid data from being blindly inserted into Airtable.

For production use, this could be expanded with:

- n8n Error Trigger workflow.
- Email or Slack notifications.
- Automatic retries.
- Execution logging.
- API availability monitoring.

The assessment implementation focuses on the MVP requirement of having deliberate validation and error-handling logic without overcomplicating the workflow.

---

## 2.7 Setup Instructions

### Airtable

1. Create an Airtable base named:

```text
VA Recruitment Automation
```

2. Create the five Task 1 tables:
   - Clients
   - Job Openings
   - Candidates
   - Applications
   - Placements

3. Create the Task 2 table:
   - Imported Jobs

4. Configure the linked records, Lookup, and Rollup fields described in Task 1.

5. Add the required Airtable credential to n8n.

---

### n8n

1. Import the workflow JSON from:

```text
n8n/remotive-job-import.json
```

2. Configure the Airtable credential.

3. Select the appropriate Airtable base and `Imported Jobs` table.

4. Verify the Remotive API HTTP Request node.

5. Execute the workflow using the Manual Trigger.

6. Confirm that new jobs appear in the `Imported Jobs` table.

7. Run the workflow again and verify that existing jobs are skipped.

---

# Repository Structure

```text
VAMasters-Developer-Automation-Skill-Test/
│
├── README.md
│
├── airtable/
│   └── sample-data/
│
├── n8n/
│   └── remotive-job-import.json
│
└── assets/
    └── screenshots/
```

---

# Limitations and Potential Improvements

The assessment implementation intentionally focuses on the required MVP functionality.

Potential production improvements include:

### Database

- Add stronger validation rules.
- Add candidate-to-job matching.
- Add recruitment pipeline views.
- Add additional reporting fields.
- Migrate to SQL for larger-scale applications.

### Automation

- Add scheduled execution.
- Add automatic retries.
- Add dedicated n8n error workflows.
- Add Slack/email failure notifications.
- Add execution logging.
- Add update handling for changed job listings.
- Add more robust API response validation.

### Data Quality

- Validate required fields before Airtable insertion.
- Handle missing salary or location values.
- Normalize job types and locations.
- Track the last synchronization timestamp.

---

# Assessment Coverage

| Requirement | Implementation |
|---|---|
| Structured recruitment database | Airtable relational-style schema |
| Clients table | ✅ |
| Job Openings table | ✅ |
| Candidates table | ✅ |
| Applications table | ✅ |
| Placements table | ✅ |
| Linked records | ✅ |
| Lookup | Application → Client |
| Rollup | Client → Open Positions |
| External API integration | Remotive API |
| n8n workflow | ✅ |
| Field mapping | ✅ |
| Deduplication | Source Job ID |
| Error/validation handling | ✅ |
| Documentation | This README |
| Walkthrough | Loom recording |

---

# Final Summary

This submission demonstrates a recruitment data model in Airtable combined with an n8n API integration workflow.

**Task 1** focuses on structuring recruitment data and relationships using Airtable.

**Task 2** focuses on integrating an external job API with n8n, transforming the response, storing the results in Airtable, and preventing duplicate records.

The implementation prioritizes clarity, maintainability, and practical automation while keeping the solution appropriate for the scope of the assessment.
