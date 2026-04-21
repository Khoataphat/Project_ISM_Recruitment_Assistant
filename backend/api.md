# Recruitment Assistant - API Documentation

Base URL: `http://localhost:3000`

Compatibility Base URL for the frontend API sheet: `http://localhost:3000/api/v1`

All responses follow the format:

```json
{ "status": "success" | "error", "data": {}, "message": "" }
```

Cookies: Login/Register set `jwt` (access token, 15min) and `refreshToken` (7 days) as HTTP-only cookies automatically.

---

## Frontend Compatibility Layer (`/api/v1`)

The backend now also exposes compatibility endpoints aligned with the Excel API sheet from frontend:

- `GET /api/v1/jobs`
- `GET /api/v1/jobs/:id`
- `POST /api/v1/jobs`
- `PUT /api/v1/jobs/:id`
- `DELETE /api/v1/jobs/:id`
- `POST /api/v1/apply`
- `GET /api/v1/candidates/:email/applied`
- `GET /api/v1/candidates/:email/cv/:pdf`
- `GET /api/v1/jobs/:id/candidates`
- `GET /api/v1/candidates`
- `GET /api/v1/candidates/:id`
- `PATCH /api/v1/candidates/:id`
- `GET /api/v1/jobs/:id/candidates/:email/result`

Notes:

- `POST /api/v1/apply` accepts `multipart/form-data` with fields `fullName`, `email`, `jobId`, and file field `cvFile`.
- The compatibility layer keeps the newer `/auth`, `/jobs`, `/applications`, and `/dashboard` APIs untouched.
- If `DELETE /api/v1/jobs/:id` is called for a job that already has applications, the backend closes the job instead of physically deleting it to preserve application data.

---

## 1. AUTH (`/auth`)

### 1.1 POST `/auth/register`

Register a new account for either `CANDIDATE` or `HR`.

**Request Body (JSON):**

```json
{
  "email": "candidate@example.com",
  "password": "123456",
  "fullName": "Nguyen Van A",
  "role": "CANDIDATE"
}
```


| Field    | Type   | Required | Notes                            |
| -------- | ------ | -------- | -------------------------------- |
| email    | string | Yes      | Valid email, max 64 chars        |
| password | string | Yes      | 6-255 chars                      |
| fullName | string | Yes      | 2-128 chars                      |
| role     | string | Yes      | `CANDIDATE` or `HR`              |

**Example for HR:**

```json
{
  "email": "hr@example.com",
  "password": "123456",
  "fullName": "Tran Thi B",
  "role": "HR"
}
```

**Success Response (201):**

```json
{
  "status": "success",
  "data": {
    "user": {
      "userId": 1,
      "email": "candidate@example.com",
      "fullName": "Nguyen Van A",
      "role": "CANDIDATE"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Responses:**


| Status | Message             |
| ------ | ------------------- |
| 400    | Validation errors   |
| 409    | User already exists |


---

### 1.2 POST `/auth/login`

**Request Body (JSON):**

```json
{
  "email": "candidate@example.com",
  "password": "123456"
}
```


| Field    | Type   | Required | Notes       |
| -------- | ------ | -------- | ----------- |
| email    | string | Yes      | Valid email |
| password | string | Yes      | 6-255 chars |


**Success Response (200):**

```json
{
  "status": "success",
  "data": {
    "user": {
      "userId": 1,
      "email": "candidate@example.com",
      "fullName": "Nguyen Van A",
      "role": "CANDIDATE"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Responses:**


| Status | Message                                    |
| ------ | ------------------------------------------ |
| 400    | Validation errors                          |
| 401    | Invalid email or password                  |
| 403    | Please verify your email before logging in |


---

### 1.3 POST `/auth/logout`

**Auth:** Required (Bearer token or cookie)

**Request Body:** None

**Success Response (200):**

```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

---

### 1.4 GET `/auth/me`

**Auth:** Required (Bearer token or cookie)

**Request Body:** None

**Success Response (200):**

```json
{
  "status": "success",
  "data": {
    "user": {
      "userId": 1,
      "email": "candidate@example.com",
      "fullName": "Nguyen Van A",
      "role": "CANDIDATE"
    }
  }
}
```

**Error Responses:**


| Status | Message        |
| ------ | -------------- |
| 401    | Not authorized |
| 404    | User not found |


---

### 1.5 POST `/auth/verify-email`

**Request Body (JSON):**

```json
{
  "email": "candidate@example.com",
  "code": "123456"
}
```


| Field | Type   | Required | Notes                |
| ----- | ------ | -------- | -------------------- |
| email | string | Yes      | Valid email          |
| code  | string | Yes      | Exactly 6 characters |


**Success Response (200):**

```json
{
  "status": "success",
  "message": "Email verified successfully",
  "data": {
    "email": "candidate@example.com",
    "isVerified": true
  }
}
```

**Error Responses:**


| Status | Message                                |
| ------ | -------------------------------------- |
| 400    | Email is already verified              |
| 400    | No verification pending for this email |
| 400    | Verification code has expired          |
| 400    | Invalid verification code              |
| 404    | User not found                         |


---

### 1.6 POST `/auth/resend-verification`

**Request Body (JSON):**

```json
{
  "email": "candidate@example.com"
}
```


| Field | Type   | Required | Notes       |
| ----- | ------ | -------- | ----------- |
| email | string | Yes      | Valid email |


**Success Response (200):**

```json
{
  "status": "success",
  "message": "Verification code resent successfully"
}
```

**Error Responses:**


| Status | Message                   |
| ------ | ------------------------- |
| 400    | Email is already verified |
| 404    | User not found            |


---

### 1.7 POST `/auth/refresh-token`

Refresh the access token using the refresh token cookie.

**Request Body:** None (uses `refreshToken` cookie automatically)

**Success Response (200):**

```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Responses:**


| Status | Message                          |
| ------ | -------------------------------- |
| 401    | No refresh token provided        |
| 401    | Invalid or expired refresh token |


---

## 2. JOBS (`/jobs`)

Use this flow when frontend needs HR to create jobs first and candidates to apply afterward.

### 2.1 GET `/jobs`

Public endpoint. Returns all open jobs.

### 2.2 GET `/jobs/:id`

Public endpoint. Returns detail of one open job.

### 2.3 POST `/jobs`

**Auth:** Required, Role `HR`

**Request Body (JSON):**

```json
{
  "title": "Backend Engineer",
  "description": "Build APIs for HR job posting and candidate application flow.",
  "status": "open"
}
```

| Field       | Type   | Required | Notes              |
| ----------- | ------ | -------- | ------------------ |
| title       | string | Yes      | 2-256 chars        |
| description | string | Yes      | At least 10 chars  |
| status      | string | No       | `open` or `closed` |

### 2.4 PATCH `/jobs/:id`

**Auth:** Required, Role `HR`

Update one or more job fields.

### 2.5 GET `/jobs/hr/manage`

**Auth:** Required, Role `HR`

Returns all jobs, including closed jobs, for HR management screens.

---

## 3. APPLICATIONS (`/applications`) - Role: CANDIDATE only

All endpoints require auth with role `CANDIDATE`.

### 3.1 POST `/applications`

Submit an application with a PDF resume.

**Request: `multipart/form-data`**


| Field       | Type   | Required | Notes             |
| ----------- | ------ | -------- | ----------------- |
| resume      | file   | Yes      | PDF only, max 5MB |
| jobId       | number | Yes      | Positive integer  |
| coverLetter | string | No       | Max 2000 chars    |

**Body (`form-data` as JSON representation):**

```json
{
  "resume": "(binary file - PDF only, max 5MB)",
  "jobId": 1,
  "coverLetter": "I am very interested in this position."
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:3000/applications \
  -H "Authorization: Bearer <token>" \
  -F "resume=@./my_resume.pdf" \
  -F "jobId=1" \
  -F "coverLetter=I am very interested in this position."
```

**Success Response (201):**

```json
{
  "status": "success",
  "data": {
    "applicationId": 1,
    "userId": 1,
    "jobId": 1,
    "resumeUrl": "uploads/resume_1_1_1713350000000.pdf",
    "coverLetter": "I am very interested in this position.",
    "status": "pending",
    "submittedAt": "2026-04-17T10:00:00.000Z",
    "reviewedAt": null,
    "reviewedBy": null
  }
}
```

**Error Responses:**


| Status | Message                                                          |
| ------ | ---------------------------------------------------------------- |
| 400    | File is required (field: resume)                                 |
| 400    | Only PDF files are allowed                                       |
| 400    | Only PDF files are allowed. The uploaded file is not a valid PDF |
| 400    | This job is no longer accepting applications                     |
| 400    | Validation errors (jobId, coverLetter)                           |
| 403    | Forbidden (not CANDIDATE role)                                   |
| 404    | Job not found                                                    |
| 409    | You have already applied for this job                            |
| 413    | File too large. Maximum size is 5MB                              |


---

### 3.2 GET `/applications`

Get all applications for the current candidate.

**Request Body:** None

**Success Response (200):**

```json
{
  "status": "success",
  "data": [
    {
      "applicationId": 1,
      "userId": 1,
      "jobId": 1,
      "resumeUrl": "uploads/resume_1_1_1713350000000.pdf",
      "coverLetter": "I am very interested in this position.",
      "status": "pending",
      "submittedAt": "2026-04-17T10:00:00.000Z",
      "reviewedAt": null,
      "reviewedBy": null,
      "job": {
        "title": "Backend Developer",
        "status": "open"
      }
    }
  ]
}
```

---

## 4. DASHBOARD (`/dashboard`) - Role: HR only

All endpoints require auth with role `HR`.

### 4.1 GET `/dashboard/applications`

List all applications with pagination, filter, and search.

**Query Parameters:**


| Param  | Type   | Required | Default | Notes                                   |
| ------ | ------ | -------- | ------- | --------------------------------------- |
| page   | number | No       | 1       | Positive integer                        |
| limit  | number | No       | 10      | 1-100                                   |
| status | string | No       | -       | `"pending"`, `"accepted"`, `"rejected"` |
| search | string | No       | -       | Max 128 chars, searches name/email/job  |


**Example:**

```
GET /dashboard/applications?page=1&limit=10&status=pending&search=Nguyen
```

**Success Response (200):**

```json
{
  "status": "success",
  "data": {
    "applications": [
      {
        "applicationId": 1,
        "userId": 1,
        "jobId": 1,
        "resumeUrl": "uploads/resume_1_1_1713350000000.pdf",
        "coverLetter": "I am very interested in this position.",
        "status": "pending",
        "submittedAt": "2026-04-17T10:00:00.000Z",
        "reviewedAt": null,
        "reviewedBy": null,
        "user": {
          "userId": 1,
          "email": "candidate@example.com",
          "fullName": "Nguyen Van A"
        },
        "job": {
          "jobId": 1,
          "title": "Backend Developer"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

### 4.2 GET `/dashboard/applications/:id`

Get detail of a single application.

**Path Parameters:**


| Param | Type   | Notes            |
| ----- | ------ | ---------------- |
| id    | number | Positive integer |


**Example:**

```
GET /dashboard/applications/1
```

**Success Response (200):**

```json
{
  "status": "success",
  "data": {
    "applicationId": 1,
    "userId": 1,
    "jobId": 1,
    "resumeUrl": "uploads/resume_1_1_1713350000000.pdf",
    "coverLetter": "I am very interested in this position.",
    "status": "pending",
    "submittedAt": "2026-04-17T10:00:00.000Z",
    "reviewedAt": null,
    "reviewedBy": null,
    "user": {
      "userId": 1,
      "email": "candidate@example.com",
      "fullName": "Nguyen Van A"
    },
    "job": {
      "jobId": 1,
      "title": "Backend Developer"
    }
  }
}
```

**Error Responses:**


| Status | Message                |
| ------ | ---------------------- |
| 400    | Application ID invalid |
| 404    | Application not found  |


---

### 4.3 PATCH `/dashboard/applications/:id/accept`

Accept an application and send interview invitation email to the candidate.

**Path Parameters:**


| Param | Type   | Notes            |
| ----- | ------ | ---------------- |
| id    | number | Positive integer |


**Request Body (JSON):**

```json
{
  "interviewDate": "2026-04-25 10:00 AM",
  "interviewLocation": "Room 301, Building A, IU-VNU"
}
```


| Field             | Type   | Required | Notes       |
| ----------------- | ------ | -------- | ----------- |
| interviewDate     | string | Yes      | Non-empty   |
| interviewLocation | string | Yes      | 1-256 chars |


**Success Response (200):**

```json
{
  "status": "success",
  "message": "Application accepted and interview invitation sent",
  "data": {
    "applicationId": 1,
    "userId": 1,
    "jobId": 1,
    "resumeUrl": "uploads/resume_1_1_1713350000000.pdf",
    "coverLetter": "I am very interested in this position.",
    "status": "accepted",
    "submittedAt": "2026-04-17T10:00:00.000Z",
    "reviewedAt": "2026-04-18T09:00:00.000Z",
    "reviewedBy": 2
  }
}
```

**Error Responses:**


| Status | Message                               |
| ------ | ------------------------------------- |
| 400    | Validation errors                     |
| 400    | Application has already been reviewed |
| 404    | Application not found                 |


---

### 4.4 PATCH `/dashboard/applications/:id/reject`

Reject an application.

**Path Parameters:**


| Param | Type   | Notes            |
| ----- | ------ | ---------------- |
| id    | number | Positive integer |


**Request Body:** None

**Success Response (200):**

```json
{
  "status": "success",
  "message": "Application rejected",
  "data": {
    "applicationId": 1,
    "userId": 1,
    "jobId": 1,
    "resumeUrl": "uploads/resume_1_1_1713350000000.pdf",
    "coverLetter": "I am very interested in this position.",
    "status": "rejected",
    "submittedAt": "2026-04-17T10:00:00.000Z",
    "reviewedAt": "2026-04-18T09:00:00.000Z",
    "reviewedBy": 2
  }
}
```

**Error Responses:**


| Status | Message                               |
| ------ | ------------------------------------- |
| 400    | Application has already been reviewed |
| 404    | Application not found                 |


---

## Common Error Responses

**Validation Error (400):**

```json
{
  "status": "error",
  "errors": [
    { "field": "email", "message": "Invalid email format" },
    { "field": "password", "message": "Password must be at least 6 characters" }
  ]
}
```

**Unauthorized (401):**

```json
{
  "status": "error",
  "message": "Not authorized, no token provided"
}
```

**Forbidden (403):**

```json
{
  "status": "error",
  "message": "Forbidden: you do not have permission to access this resource"
}
```

**Internal Server Error (500):**

```json
{
  "status": "error",
  "message": "Internal server error"
}
```

---

## Test Flow (Postman / cURL)

### Step 1: Register a Candidate user

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"candidate@example.com","password":"123456","fullName":"Nguyen Van A","role":"CANDIDATE"}'
```

### Step 2: Register an HR user

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"hr@example.com","password":"123456","fullName":"Tran Thi B","role":"HR"}'
```

> **Note:** Both `CANDIDATE` and `HR` must verify email before logging in.

### Step 3: Verify email (Candidate or HR)

```bash
curl -X POST http://localhost:3000/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"email":"candidate@example.com","code":"123456"}'
```

### Step 4: Login as Candidate (save the token)

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"candidate@example.com","password":"123456"}'
```

### Step 5: Submit application (as Candidate)

```bash
curl -X POST http://localhost:3000/applications \
  -H "Authorization: Bearer <CANDIDATE_TOKEN>" \
  -F "resume=@./resume.pdf" \
  -F "jobId=1" \
  -F "coverLetter=I would love to join your team."
```

### Step 6: Login as HR (save the token)

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"hr@example.com","password":"123456"}'
```

### Step 7: View applications (as HR)

```bash
curl -X GET "http://localhost:3000/dashboard/applications?page=1&limit=10" \
  -H "Authorization: Bearer <HR_TOKEN>"
```

### Step 8: Accept application (as HR)

```bash
curl -X PATCH http://localhost:3000/dashboard/applications/1/accept \
  -H "Authorization: Bearer <HR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"interviewDate":"2026-04-25 10:00 AM","interviewLocation":"Room 301, Building A"}'
```
