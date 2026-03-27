# MediNexus API Documentation

**Base URL:** `https://medinexus-dad0.onrender.com/api`

**Authentication:** JWT Bearer Token (include in `Authorization: Bearer <token>` header for protected endpoints)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Providers (Hospitals & Doctors)](#providers)
3. [Health Records](#health-records)
4. [Consents](#consents)
5. [Audit Logs](#audit-logs)
6. [Data Models](#data-models)

---

## Authentication

### 1. Patient Registration

**Endpoint:** `POST /accounts/patient/register/`  
**Auth Required:** No  
**Description:** Register a new patient account. NIN should be verified first using NIN verification endpoint. OTP is automatically sent to email upon successful registration.

**Request Body:**
```json
{
  "email": "patient@example.com",
  "password": "securePassword123",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "08012345678",
  "nin": "12345678901",
  "date_of_birth": "1990-01-15",
  "blood_group": "O+",
  "genotype": "AA",
  "allergies": "Penicillin, Peanuts",
  "emergency_contact": "08098765432"
}
```

**Blood Group Options:** `A+`, `A-`, `B+`, `B-`, `O+`, `O-`, `AB+`, `AB-`, `UNKNOWN`  
**Genotype Options:** `AA`, `AS`, `SS`, `AC`, `SC`, `UNKNOWN`

**Response (201 Created):**
```json
{
  "message": "Registration successful. Please check your email for the verification code.",
  "email": "patient@example.com",
  "nin_verified": true
}
```

**Error Responses:**
- `400`: Validation error (invalid data)
- `502`: Email delivery failed (registration rolled back)

---

### 2. Login

**Endpoint:** `POST /accounts/login/`  
**Auth Required:** No  
**Description:** Authenticate user and receive JWT tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user_type": "PATIENT",
  "email": "user@example.com",
  "email_verified": true
}
```

**User Types:** `PATIENT`, `PROVIDER`, `ADMIN`

---

### 3. Resend OTP

**Endpoint:** `POST /accounts/otp/send/`  
**Auth Required:** No  
**Description:** Manually resend OTP to email if original expired or not received.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "A 6-digit OTP has been sent to user@example.com. It expires in 10 minutes."
}
```

---

### 4. Verify OTP

**Endpoint:** `POST /accounts/otp/verify/`  
**Auth Required:** No  
**Description:** Verify OTP code and receive JWT tokens. Sets `email_verified` to true.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp_code": "123456"
}
```

**Response (200 OK):**
```json
{
  "message": "Email verified successfully",
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user_type": "PATIENT",
  "email": "user@example.com"
}
```

---

### 5. Refresh Token

**Endpoint:** `POST /accounts/token/refresh/`  
**Auth Required:** No  
**Description:** Get new access token using refresh token.

**Request Body:**
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 6. Get Interswitch Access Token

**Endpoint:** `POST /accounts/nin/interswitch/auth/`  
**Auth Required:** No  
**Description:** Get OAuth2 access token from Interswitch for NIN verification.

**Response (200 OK):**
```json
{
  "success": true,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI..."
}
```

---

### 7. Get NIN Details (Auto-complete Registration)

**Endpoint:** `POST /accounts/nin/full-details/`  
**Auth Required:** No  
**Description:** Retrieve full identity information for a NIN from Interswitch API.

**Request Body:**
```json
{
  "nin": "12345678901",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI..."
}
```

**Mock NIPs (Development):**
- `12345678901` - Test User (DOB: 1990-01-01)
- `10000000001` - John Doe (DOB: 1985-06-15)
- `10000000002` - Jane Doe (DOB: 1992-03-22)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1985-06-15",
    "gender": "M",
    "phoneNumber": "08012345678"
  }
}
```

---

## Providers

### 8. List Hospitals

**Endpoint:** `GET /providers/hospitals/`  
**Auth Required:** No  
**Description:** Get list of all active hospitals with doctor counts.

**Response (200 OK):**
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Lagos University Teaching Hospital",
    "hospital_code": "LUTH001",
    "address": "Idi-Araba, Surulere, Lagos",
    "contact_phone": "01-7747000",
    "email": "info@luth.ng",
    "doctor_count": 45
  }
]
```

---

### 9. Get Hospital Details

**Endpoint:** `GET /providers/hospitals/{hospital_id}/`  
**Auth Required:** No

**Response (200 OK):**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "Lagos University Teaching Hospital",
  "hospital_code": "LUTH001",
  "address": "Idi-Araba, Surulere, Lagos",
  "contact_phone": "01-7747000",
  "email": "info@luth.ng",
  "is_active": true,
  "created_at": "2026-01-15T10:30:00Z"
}
```

---

### 10. Register Hospital (Admin Only)

**Endpoint:** `POST /providers/hospitals/register/`  
**Auth Required:** Yes (Admin)  
**Description:** Create a new hospital record. `hospital_code` must be unique.

**Request Body:**
```json
{
  "name": "Lagos General Hospital",
  "hospital_code": "LGH001",
  "address": "1 Marina Road, Lagos Island",
  "contact_phone": "01-2630000",
  "email": "admin@lgh.ng"
}
```

**Response (201 Created):**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "Lagos General Hospital",
  "hospital_code": "LGH001",
  "address": "1 Marina Road, Lagos Island",
  "contact_phone": "01-2630000",
  "email": "admin@lgh.ng",
  "is_active": true,
  "created_at": "2026-03-27T14:00:00Z"
}
```

---

### 11. Register Doctor

**Endpoint:** `POST /providers/doctors/register/`  
**Auth Required:** No  
**Description:** Register a new doctor account (user_type = PROVIDER). `license_number` must be unique.

**Request Body:**
```json
{
  "email": "dr.obi@luth.ng",
  "password": "securePassword123",
  "first_name": "Emeka",
  "last_name": "Obi",
  "phone_number": "08012345678",
  "hospital_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "license_number": "MDCN-123456",
  "specialty": "CARDIOLOGY"
}
```

**Specialty Options:**  
`GENERAL_PRACTICE`, `CARDIOLOGY`, `DERMATOLOGY`, `ENDOCRINOLOGY`, `GASTROENTEROLOGY`, `NEUROLOGY`, `OBSTETRICS`, `ONCOLOGY`, `OPHTHALMOLOGY`, `ORTHOPAEDICS`, `PAEDIATRICS`, `PSYCHIATRY`, `RADIOLOGY`, `SURGERY`, `UROLOGY`, `OTHER`

**Response (201 Created):**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "full_name": "Dr. Emeka Obi",
  "email": "dr.obi@luth.ng",
  "hospital": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Lagos University Teaching Hospital",
    "hospital_code": "LUTH001",
    "address": "Idi-Araba, Surulere, Lagos",
    "contact_phone": "01-7747000",
    "email": "info@luth.ng",
    "doctor_count": 46
  },
  "license_number": "MDCN-123456",
  "specialty": "CARDIOLOGY",
  "is_verified": false,
  "created_at": "2026-03-27T14:30:00Z"
}
```

---

### 12. List Doctors

**Endpoint:** `GET /providers/doctors/`  
**Auth Required:** Yes  
**Query Parameters:**
- `hospital_id` (optional): UUID - Filter doctors by hospital

**Example:** `GET /providers/doctors/?hospital_id=3fa85f64-5717-4562-b3fc-2c963f66afa6`

**Response (200 OK):**
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "full_name": "Dr. Emeka Obi",
    "email": "dr.obi@luth.ng",
    "hospital": {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "Lagos University Teaching Hospital",
      "hospital_code": "LUTH001",
      "address": "Idi-Araba, Surulere, Lagos",
      "contact_phone": "01-7747000",
      "email": "info@luth.ng",
      "doctor_count": 46
    },
    "license_number": "MDCN-123456",
    "specialty": "CARDIOLOGY",
    "is_verified": true,
    "created_at": "2026-03-27T14:30:00Z"
  }
]
```

---

### 13. Get Doctor Details

**Endpoint:** `GET /providers/doctors/{doctor_id}/`  
**Auth Required:** Yes

**Response:** Same structure as single doctor object above.

---

## Health Records

### 14. List My Health Records

**Endpoint:** `GET /records/`  
**Auth Required:** Yes  
**Description:** 
- **Patients** see all records assigned to them
- **Doctors** see records they created
- **Admins** see all records

**Response (200 OK):**
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "doctor": "uuid-of-doctor",
    "doctor_name": "Dr. Emeka Obi",
    "patient": "uuid-of-patient",
    "patient_name": "John Doe",
    "patient_email": "john.doe@example.com",
    "record_type": "DIAGNOSIS",
    "title": "Annual Health Checkup",
    "description": "Patient presented with mild hypertension. Blood pressure: 140/90 mmHg. Recommended lifestyle modifications and follow-up in 3 months.",
    "is_approved": true,
    "approval_timestamp": "2026-03-20T15:30:00Z",
    "created_at": "2026-03-20T10:00:00Z",
    "updated_at": "2026-03-20T15:30:00Z"
  }
]
```

**Record Types:** `DIAGNOSIS`, `PRESCRIPTION`, `LAB_TEST`, `VACCINATION`, `CONSULTATION`, `OTHER`

---

### 15. Get Single Health Record

**Endpoint:** `GET /records/{record_id}/`  
**Auth Required:** Yes  
**Description:** View details of specific record. Automatically creates VIEW audit log.

**Response:** Same structure as single record object above.

---

### 16. Create Health Record (Doctor)

**Endpoint:** `POST /records/create_record/`  
**Auth Required:** Yes (PROVIDER only)  
**Description:** Doctor creates a new health record for a patient. Automatically sends OTP to patient's email for approval.

**Request Body:**
```json
{
  "patient_email": "patient@example.com",
  "record_type": "PRESCRIPTION",
  "title": "Prescription for Hypertension",
  "description": "Amlodipine 5mg - Take 1 tablet daily in the morning.\nLifestyle: Reduce salt intake, regular exercise 30 min/day."
}
```

**Response (201 Created):**
```json
{
  "message": "Record created successfully. OTP sent to patient.",
  "record": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "doctor": "uuid-of-doctor",
    "doctor_name": "Dr. Emeka Obi",
    "patient": "uuid-of-patient",
    "patient_name": "John Doe",
    "patient_email": "patient@example.com",
    "record_type": "PRESCRIPTION",
    "title": "Prescription for Hypertension",
    "description": "Amlodipine 5mg - Take 1 tablet daily...",
    "is_approved": false,
    "approval_timestamp": null,
    "created_at": "2026-03-27T15:00:00Z",
    "updated_at": "2026-03-27T15:00:00Z"
  },
  "otp_id": "uuid-of-otp-token"
}
```

**Error Responses:**
- `403`: Only healthcare providers can create records
- `400`: Patient email not found or validation error

---

### 17. Approve Health Record (Patient)

**Endpoint:** `POST /records/{record_id}/approve/`  
**Auth Required:** Yes (PATIENT only)  
**Description:** Patient approves a record using OTP sent to their email.

**Request Body:**
```json
{
  "otp_code": "123456"
}
```

**Response (200 OK):**
```json
{
  "message": "Record approved successfully",
  "record": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "doctor": "uuid-of-doctor",
    "doctor_name": "Dr. Emeka Obi",
    "patient": "uuid-of-patient",
    "patient_name": "John Doe",
    "patient_email": "patient@example.com",
    "record_type": "PRESCRIPTION",
    "title": "Prescription for Hypertension",
    "description": "Amlodipine 5mg - Take 1 tablet daily...",
    "is_approved": true,
    "approval_timestamp": "2026-03-27T15:05:00Z",
    "created_at": "2026-03-27T15:00:00Z",
    "updated_at": "2026-03-27T15:05:00Z"
  }
}
```

**Error Responses:**
- `403`: You can only approve records assigned to you
- `400`: Record already approved or invalid/expired OTP

---

### 18. Get Pending Records (Patient)

**Endpoint:** `GET /records/pending/`  
**Auth Required:** Yes (PATIENT only)  
**Description:** Get all health records awaiting patient approval.

**Response (200 OK):**
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "doctor": "uuid-of-doctor",
    "doctor_name": "Dr. Emeka Obi",
    "record_type": "LAB_TEST",
    "title": "Blood Test Results",
    "description": "Complete Blood Count (CBC) results...",
    "is_approved": false,
    "created_at": "2026-03-27T14:00:00Z"
  }
]
```

---

### 19. Get Record Audit Trail

**Endpoint:** `GET /records/{record_id}/audit-trail/`  
**Auth Required:** Yes (PATIENT - record owner only)  
**Description:** Get complete audit trail for a specific health record (creation, OTP events, approvals, views).

**Response (200 OK):**
```json
{
  "record_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "record_title": "Prescription for Hypertension",
  "audit_trail": [
    {
      "id": "audit-log-uuid-1",
      "user": "doctor-uuid",
      "user_name": "Dr. Emeka Obi",
      "user_email": "dr.obi@luth.ng",
      "user_type": "PROVIDER",
      "action": "CREATE",
      "timestamp": "2026-03-27T15:00:00Z",
      "description": "Record created: Prescription for Hypertension",
      "metadata": {
        "record_type": "PRESCRIPTION",
        "patient_id": "patient-uuid"
      }
    },
    {
      "id": "audit-log-uuid-2",
      "user": "doctor-uuid",
      "user_name": "Dr. Emeka Obi",
      "user_email": "dr.obi@luth.ng",
      "user_type": "PROVIDER",
      "action": "OTP_SENT",
      "timestamp": "2026-03-27T15:00:01Z",
      "description": "OTP sent to patient@example.com",
      "metadata": {}
    },
    {
      "id": "audit-log-uuid-3",
      "user": "patient-uuid",
      "user_name": "John Doe",
      "user_email": "patient@example.com",
      "user_type": "PATIENT",
      "action": "APPROVE",
      "timestamp": "2026-03-27T15:05:00Z",
      "description": "Record approved by patient",
      "metadata": {
        "used_otp_id": "otp-uuid"
      }
    },
    {
      "id": "audit-log-uuid-4",
      "user": "patient-uuid",
      "user_name": "John Doe",
      "user_email": "patient@example.com",
      "user_type": "PATIENT",
      "action": "VIEW",
      "timestamp": "2026-03-27T16:00:00Z",
      "description": "Record accessed by patient",
      "metadata": {}
    }
  ]
}
```

**Audit Action Types:** `CREATE`, `VIEW`, `APPROVE`, `REJECT`, `UPDATE`, `DELETE`, `OTP_SENT`, `OTP_VERIFIED`

---

## Consents

### 20. Grant Consent

**Endpoint:** `POST /consents/grant/`  
**Auth Required:** Yes (PATIENT only)  
**Description:** Grant a hospital (and optionally a specific doctor) access to your approved health records. Consent expires after specified hours.

**Request Body:**
```json
{
  "hospital_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "doctor_id": "doctor-uuid-optional",
  "expires_in_hours": 168
}
```

**Note:** 
- `doctor_id` is optional. If omitted, consent applies to entire hospital.
- `expires_in_hours` must be between 1 and 720 (30 days max)

**Response (201 Created):**
```json
{
  "id": "consent-uuid",
  "hospital_name": "Lagos University Teaching Hospital",
  "doctor_email": "dr.obi@luth.ng",
  "granted_at": "2026-03-27T15:00:00Z",
  "expires_at": "2026-04-03T15:00:00Z",
  "is_revoked": false,
  "is_active": true
}
```

**Error Responses:**
- `400`: Validation error
- `404`: Hospital or doctor not found

---

### 21. Revoke Consent

**Endpoint:** `POST /consents/revoke/`  
**Auth Required:** Yes (PATIENT only)  
**Description:** Revoke a previously granted consent. Consent must belong to authenticated patient.

**Request Body:**
```json
{
  "consent_id": "consent-uuid"
}
```

**Response (200 OK):**
```json
{
  "message": "Consent revoked successfully."
}
```

**Error Responses:**
- `404`: Consent not found
- `400`: Consent already revoked

---

## Audit Logs

**Note:** The backend has audit logging functionality but no direct `/api/audit/` endpoints are currently exposed. Audit logs are accessible via the record audit trail endpoint (`GET /records/{record_id}/audit-trail/`).

---

## Data Models

### User
```typescript
{
  id: string; // UUID
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  nin: string | null; // 11 digits
  user_type: "PATIENT" | "PROVIDER" | "ADMIN";
  email_verified: boolean;
  nin_verified: boolean;
  is_active: boolean;
  created_at: string; // ISO 8601 datetime
}
```

### PatientProfile (extends User)
```typescript
{
  user: string; // UUID reference to User
  date_of_birth: string | null; // YYYY-MM-DD
  blood_group: "A+" | "A-" | "B+" | "B-" | "O+" | "O-" | "AB+" | "AB-" | "UNKNOWN";
  genotype: "AA" | "AS" | "SS" | "AC" | "SC" | "UNKNOWN";
  allergies: string; // Comma-separated
  emergency_contact: string;
}
```

### Hospital
```typescript
{
  id: string; // UUID
  name: string;
  hospital_code: string; // Unique identifier
  address: string;
  contact_phone: string;
  email: string;
  is_active: boolean;
  doctor_count?: number; // In list view
  created_at: string; // ISO 8601 datetime
}
```

### DoctorProfile (extends User)
```typescript
{
  id: string; // UUID
  user: string; // UUID reference to User
  full_name: string; // Read-only computed field
  email: string; // Read-only from User
  hospital: Hospital;
  license_number: string; // Unique
  specialty: Specialty;
  is_verified: boolean;
  created_at: string; // ISO 8601 datetime
}
```

### HealthRecord
```typescript
{
  id: string; // UUID
  doctor: string; // UUID reference
  doctor_name: string; // Read-only computed
  patient: string; // UUID reference
  patient_name: string; // Read-only computed
  patient_email: string; // Read-only
  record_type: "DIAGNOSIS" | "PRESCRIPTION" | "LAB_TEST" | "VACCINATION" | "CONSULTATION" | "OTHER";
  title: string;
  description: string; // Full record content
  is_approved: boolean;
  approval_timestamp: string | null; // ISO 8601 datetime
  created_at: string; // ISO 8601 datetime
  updated_at: string; // ISO 8601 datetime
}
```

### ConsentLog
```typescript
{
  id: string; // UUID
  hospital_name: string; // Read-only computed
  doctor_email: string | null; // Read-only computed (null if hospital-wide)
  granted_at: string; // ISO 8601 datetime
  expires_at: string; // ISO 8601 datetime
  is_revoked: boolean;
  is_active: boolean; // Computed: not revoked AND not expired
}
```

### AuditLog
```typescript
{
  id: string; // UUID
  user: string; // UUID reference
  user_name: string; // Read-only computed
  user_email: string; // Read-only
  user_type: "PATIENT" | "PROVIDER" | "ADMIN";
  action: "CREATE" | "VIEW" | "APPROVE" | "REJECT" | "UPDATE" | "DELETE" | "OTP_SENT" | "OTP_VERIFIED";
  timestamp: string; // ISO 8601 datetime
  description: string;
  metadata: Record<string, any>; // Additional context data
}
```

---

## Error Response Format

All error responses follow this structure:

```json
{
  "error": "Error message describing what went wrong",
  "details": "Additional error details (optional)"
}
```

**Common HTTP Status Codes:**
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Validation error or invalid data
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Authenticated but not authorized for this action
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error
- `502 Bad Gateway` - External service error (e.g., email delivery failed)

---

## Rate Limiting & Best Practices

1. **Store JWT tokens securely** (httpOnly cookies or secure storage)
2. **Refresh tokens before expiry** - Access tokens expire after 5 minutes, refresh tokens after 24 hours
3. **OTP codes expire after 10 minutes** - Request new OTP if expired
4. **Use batch requests** where possible to reduce API calls
5. **Handle 401 errors** - Automatically refresh token or redirect to login
6. **Implement retry logic** with exponential backoff for failed requests
7. **Validate data client-side** before sending to reduce 400 errors

---

## Development vs Production

**Mock Mode (Development):**
- NIN verification uses mock data (NIPs: `12345678901`, `10000000001`, `10000000002`)
- OTP codes are logged in console (not sent via email)
- No rate limiting enforced

**Production:**
- Real Interswitch API integration for NIN verification
- Email OTPs sent via SMTP
- Rate limiting enforced
- HTTPS required for all requests

---

**Last Updated:** March 27, 2026  
**API Version:** 1.0.0

For issues or questions, contact: support@medinexus.com
