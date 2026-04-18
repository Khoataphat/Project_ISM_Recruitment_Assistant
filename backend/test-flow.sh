#!/usr/bin/env bash

set -euo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:3000}"
AI_SERVICE_URL="${AI_SERVICE_URL:-http://127.0.0.1:8000/score}"
HR_EMAIL="${HR_EMAIL:-hr@example.com}"
HR_PASSWORD="${HR_PASSWORD:-123456}"
HR_NAME="${HR_NAME:-HR Tester}"

WORKDIR="$(cd "$(dirname "$0")" && pwd)"
TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

if ! command -v node >/dev/null 2>&1; then
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [[ -s "$NVM_DIR/nvm.sh" ]]; then
    # Load nvm for non-login shells so the script can find node/npm.
    . "$NVM_DIR/nvm.sh"
  fi
fi

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

print_step() {
  printf "\n[%s] %s\n" "$1" "$2"
}

parse_json_field() {
  local field="$1"
  node -e '
    const field = process.argv[1];
    const chunks = [];
    process.stdin.on("data", (chunk) => chunks.push(chunk));
    process.stdin.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      const data = JSON.parse(raw);
      const value = field.split(".").reduce((acc, key) => acc?.[key], data);
      if (value === undefined || value === null) {
        process.exit(2);
      }
      if (typeof value === "object") {
        process.stdout.write(JSON.stringify(value));
        return;
      }
      process.stdout.write(String(value));
    });
  ' "$field"
}

assert_http_code() {
  local actual="$1"
  local expected="$2"
  local label="$3"
  if [[ "$actual" != "$expected" ]]; then
    echo "Unexpected HTTP status for $label: expected $expected, got $actual" >&2
    exit 1
  fi
}

request_json() {
  local method="$1"
  local url="$2"
  local body="${3:-}"
  local auth_token="${4:-}"
  local body_file="$TMPDIR/body.json"
  local status_file="$TMPDIR/status.txt"

  local curl_args=(
    -sS
    -o "$body_file"
    -w "%{http_code}"
    -X "$method"
    "$url"
    -H "Content-Type: application/json"
  )

  if [[ -n "$auth_token" ]]; then
    curl_args+=(-H "Authorization: Bearer $auth_token")
  fi

  if [[ -n "$body" ]]; then
    curl_args+=(--data "$body")
  fi

  curl "${curl_args[@]}" > "$status_file"

  cat "$status_file"
  echo
  cat "$body_file"
}

require_cmd curl
require_cmd node

if ! curl -fsS "$BASE_URL/jobs" >/dev/null 2>&1; then
  cat <<EOF >&2
Backend is not reachable at $BASE_URL.
Start it first, for example:

  cd $WORKDIR
  export NVM_DIR="\$HOME/.nvm"
  . "\$NVM_DIR/nvm.sh"
  node dist/src/app.js
EOF
  exit 1
fi

ai_probe_status="$(
  curl -sS -o /dev/null -w "%{http_code}" \
    -X POST "$AI_SERVICE_URL" \
    -H "Content-Type: application/json" \
    --data '{"resume_path":"/tmp/does-not-exist.pdf","job":{"title":"ping","description":"ping","requirements":[],"benefits":[]}}'
)"
if [[ "$ai_probe_status" == "000" ]]; then
  cat <<EOF >&2
AI service is not reachable at $AI_SERVICE_URL.
Start it first, for example:

  cd /Users/dungkimhuynh/Desktop/ISM/Project_ISM_Recruitment_Assistant/ai\ python
  python3 main.py
EOF
  exit 1
fi

print_step "0" "Prepare HR account in database"
(
  cd "$WORKDIR"
  node <<'NODE'
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const { Client } = require("pg");

function loadEnv(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

(async () => {
  loadEnv(path.join(process.cwd(), ".env"));
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DIRECT_URL or DATABASE_URL is required in backend/.env");
  }

  const client = new Client({ connectionString });
  await client.connect();

  const hash = await bcrypt.hash(process.env.HR_PASSWORD || "123456", 10);
  const email = process.env.HR_EMAIL || "hr@example.com";
  const fullName = process.env.HR_NAME || "HR Tester";

  await client.query(
    `
      INSERT INTO public."user"
        ("Password", "FullName", "Email", "Role", "IsVerified", "CreatedBy", "UpdatedBy", "UpdatedDate")
      VALUES
        ($1, $2, $3, 'hr', true, 1, 1, NOW())
      ON CONFLICT ("Email")
      DO UPDATE SET
        "Password" = EXCLUDED."Password",
        "FullName" = EXCLUDED."FullName",
        "Role" = EXCLUDED."Role",
        "IsVerified" = EXCLUDED."IsVerified",
        "UpdatedBy" = EXCLUDED."UpdatedBy",
        "UpdatedDate" = NOW()
    `,
    [hash, fullName, email],
  );

  await client.end();
  console.log(JSON.stringify({ email, fullName, role: "HR" }));
})().catch(async (err) => {
  console.error(err);
  process.exit(1);
});
NODE
)

print_step "1" "HR login"
hr_login_response="$(request_json "POST" "$BASE_URL/auth/login" "{\"email\":\"$HR_EMAIL\",\"password\":\"$HR_PASSWORD\"}")"
hr_status="$(printf '%s' "$hr_login_response" | head -n 1)"
hr_body="$(printf '%s' "$hr_login_response" | tail -n +2)"
assert_http_code "$hr_status" "200" "HR login"
printf '%s\n' "$hr_body"
HR_TOKEN="$(printf '%s' "$hr_body" | parse_json_field "data.token")"
echo "HR token prefix: ${HR_TOKEN:0:24}"

print_step "2" "Create job as HR"
job_payload='{
  "companyName": "Luminary Systems",
  "title": "Senior Product Designer",
  "description": "Lead the evolution of our recruitment intelligence platform and turn complex AI workflows into intuitive product experiences.",
  "location": "Remote / San Francisco",
  "workMode": "remote",
  "employmentType": "full-time",
  "salaryMin": 120000,
  "salaryMax": 160000,
  "deadline": "2026-05-31T23:59:59.000Z",
  "requirements": [
    "5+ years of product design experience in SaaS or AI platforms",
    "Strong Figma and prototyping skills",
    "Comfort collaborating closely with engineering and data teams"
  ],
  "benefits": [
    "Full Health and Vision",
    "Unlimited PTO",
    "$5k Learning Budget"
  ],
  "status": "open"
}'
job_create_response="$(request_json "POST" "$BASE_URL/jobs" "$job_payload" "$HR_TOKEN")"
job_status="$(printf '%s' "$job_create_response" | head -n 1)"
job_body="$(printf '%s' "$job_create_response" | tail -n +2)"
assert_http_code "$job_status" "201" "create job"
printf '%s\n' "$job_body"
JOB_ID="$(printf '%s' "$job_body" | parse_json_field "data.jobId")"
echo "Created job ID: $JOB_ID"

print_step "3" "Public can list and view open jobs"
jobs_list_response="$(request_json "GET" "$BASE_URL/jobs")"
jobs_list_status="$(printf '%s' "$jobs_list_response" | head -n 1)"
jobs_list_body="$(printf '%s' "$jobs_list_response" | tail -n +2)"
assert_http_code "$jobs_list_status" "200" "public job list"
printf '%s\n' "$jobs_list_body"

job_detail_response="$(request_json "GET" "$BASE_URL/jobs/$JOB_ID")"
job_detail_status="$(printf '%s' "$job_detail_response" | head -n 1)"
job_detail_body="$(printf '%s' "$job_detail_response" | tail -n +2)"
assert_http_code "$job_detail_status" "200" "public job detail"
printf '%s\n' "$job_detail_body"

print_step "4" "Candidate register"
CANDIDATE_EMAIL="candidate$(date +%s)@example.com"
CANDIDATE_PASSWORD="123456"
candidate_register_response="$(request_json "POST" "$BASE_URL/auth/register" "{\"email\":\"$CANDIDATE_EMAIL\",\"password\":\"$CANDIDATE_PASSWORD\",\"fullName\":\"Apply Candidate\"}")"
candidate_register_status="$(printf '%s' "$candidate_register_response" | head -n 1)"
candidate_register_body="$(printf '%s' "$candidate_register_response" | tail -n +2)"
assert_http_code "$candidate_register_status" "201" "candidate register"
printf '%s\n' "$candidate_register_body"
echo "Candidate email: $CANDIDATE_EMAIL"

print_step "5" "Read verification code from Redis and verify candidate email"
VERIFY_CODE="$(
  cd "$WORKDIR"
  CANDIDATE_EMAIL="$CANDIDATE_EMAIL" node <<'NODE'
const fs = require("fs");
const path = require("path");
const Redis = require("ioredis");

function loadEnv(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

(async () => {
  loadEnv(path.join(process.cwd(), ".env"));
  const redis = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379");
  const email = process.env.CANDIDATE_EMAIL;
  const code = await redis.get(`verify:${email}`);
  await redis.quit();
  if (!code) {
    process.exit(2);
  }
  process.stdout.write(code);
})().catch(async (err) => {
  console.error(err);
  process.exit(1);
});
NODE
)"
echo "Verification code: $VERIFY_CODE"

candidate_verify_response="$(request_json "POST" "$BASE_URL/auth/verify-email" "{\"email\":\"$CANDIDATE_EMAIL\",\"code\":\"$VERIFY_CODE\"}")"
candidate_verify_status="$(printf '%s' "$candidate_verify_response" | head -n 1)"
candidate_verify_body="$(printf '%s' "$candidate_verify_response" | tail -n +2)"
assert_http_code "$candidate_verify_status" "200" "candidate verify email"
printf '%s\n' "$candidate_verify_body"

print_step "6" "Candidate login"
candidate_login_response="$(request_json "POST" "$BASE_URL/auth/login" "{\"email\":\"$CANDIDATE_EMAIL\",\"password\":\"$CANDIDATE_PASSWORD\"}")"
candidate_login_status="$(printf '%s' "$candidate_login_response" | head -n 1)"
candidate_login_body="$(printf '%s' "$candidate_login_response" | tail -n +2)"
assert_http_code "$candidate_login_status" "200" "candidate login"
printf '%s\n' "$candidate_login_body"
CANDIDATE_TOKEN="$(printf '%s' "$candidate_login_body" | parse_json_field "data.token")"
echo "Candidate token prefix: ${CANDIDATE_TOKEN:0:24}"

print_step "7" "Candidate applies to created job"
RESUME_FILE="$TMPDIR/test-resume.pdf"
cat > "$RESUME_FILE" <<'PDF'
%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Count 1 /Kids [3 0 R] >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 132 >>
stream
BT /F1 12 Tf 72 72 Td (Senior Product Designer Figma SaaS AI product design remote full-time) Tj ET
endstream
endobj
trailer
<< /Root 1 0 R >>
%%EOF
PDF

application_body_file="$TMPDIR/application.json"
application_status="$(curl -sS -o "$application_body_file" -w "%{http_code}" \
  -X POST "$BASE_URL/applications" \
  -H "Authorization: Bearer $CANDIDATE_TOKEN" \
  -F "jobId=$JOB_ID" \
  -F "coverLetter=I can help build this backend flow." \
  -F "resume=@$RESUME_FILE;type=application/pdf")"
assert_http_code "$application_status" "201" "candidate apply"
cat "$application_body_file"
APPLICATION_ID="$(cat "$application_body_file" | parse_json_field "data.applicationId")"
APPLICATION_AI_STATUS="$(cat "$application_body_file" | parse_json_field "data.aiStatus")"
APPLICATION_MATCHING_SCORE="$(cat "$application_body_file" | parse_json_field "data.matchingScore")"
APPLICATION_CONFIDENCE_SCORE="$(cat "$application_body_file" | parse_json_field "data.confidenceScore")"
echo
echo "Created application ID: $APPLICATION_ID"
echo "AI status: $APPLICATION_AI_STATUS"
echo "Matching score: $APPLICATION_MATCHING_SCORE"
echo "Confidence score: $APPLICATION_CONFIDENCE_SCORE"

if [[ "$APPLICATION_AI_STATUS" != "completed" ]]; then
  echo "AI scoring did not complete successfully. Status: $APPLICATION_AI_STATUS" >&2
  exit 1
fi

print_step "8" "Candidate can view own applications"
candidate_apps_response="$(request_json "GET" "$BASE_URL/applications" "" "$CANDIDATE_TOKEN")"
candidate_apps_status="$(printf '%s' "$candidate_apps_response" | head -n 1)"
candidate_apps_body="$(printf '%s' "$candidate_apps_response" | tail -n +2)"
assert_http_code "$candidate_apps_status" "200" "candidate applications list"
printf '%s\n' "$candidate_apps_body"

print_step "9" "HR can view AI-scored applications in dashboard"
dashboard_response="$(request_json "GET" "$BASE_URL/dashboard/applications?page=1&limit=10&aiStatus=completed&sortBy=matchingScore&sortOrder=desc" "" "$HR_TOKEN")"
dashboard_status="$(printf '%s' "$dashboard_response" | head -n 1)"
dashboard_body="$(printf '%s' "$dashboard_response" | tail -n +2)"
assert_http_code "$dashboard_status" "200" "HR dashboard applications"
printf '%s\n' "$dashboard_body"

detail_response="$(request_json "GET" "$BASE_URL/dashboard/applications/$APPLICATION_ID" "" "$HR_TOKEN")"
detail_status="$(printf '%s' "$detail_response" | head -n 1)"
detail_body="$(printf '%s' "$detail_response" | tail -n +2)"
assert_http_code "$detail_status" "200" "HR dashboard application detail"
printf '%s\n' "$detail_body"

print_step "10" "HR accepts the application"
accept_payload='{"interviewDate":"2026-06-01 09:00 AM","interviewLocation":"Zoom Meeting"}'
accept_response="$(request_json "PATCH" "$BASE_URL/dashboard/applications/$APPLICATION_ID/accept" "$accept_payload" "$HR_TOKEN")"
accept_status="$(printf '%s' "$accept_response" | head -n 1)"
accept_body="$(printf '%s' "$accept_response" | tail -n +2)"
assert_http_code "$accept_status" "200" "HR accept application"
printf '%s\n' "$accept_body"

print_step "Done" "End-to-end flow passed"
cat <<EOF
Summary:
- HR email: $HR_EMAIL
- Candidate email: $CANDIDATE_EMAIL
- Job ID: $JOB_ID
- Application ID: $APPLICATION_ID
- AI status: $APPLICATION_AI_STATUS
- Matching score: $APPLICATION_MATCHING_SCORE
- Confidence score: $APPLICATION_CONFIDENCE_SCORE
- Base URL: $BASE_URL
EOF
