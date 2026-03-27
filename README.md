# MediNexus

A health records system that uses the Nigerian National Identification Number (NIN) as a universal key to access patient health records across different healthcare providers.

## The Problem

When patients visit different hospitals or clinics, their health records are isolated. A doctor in Lagos has no way to know what medications a patient was prescribed in Abuja, or what allergies they have from a hospital in Port Harcourt. This leads to:

- Duplicate tests being ordered
- Dangerous drug interactions going unnoticed
- Patients having to repeatedly explain their medical history
- Critical medical information being unavailable in emergencies

## The Solution

MediNexus connects healthcare providers through a centralized system where:

- Patients own their data and give consent for doctors to access it
- Doctors can view a patient's complete medical history with permission
- Records are transferred securely using NIN as the identifier
- Patients approve or reject record additions to their file

## How It Works - Interswitch Integration

We use the Interswitch NIN verification API to:

1. Verify that the NIN provided during patient registration is valid
2. Retrieve the patient's basic identity details (name, date of birth, gender) from the national database
3. Use these details to create a verified patient profile

This ensures that patients are who they claim to be and eliminates fake identities in the healthcare system.

## Doctor Verification - MDCN

Ideally, doctors would be verified through the Medical and Dental Council of Nigeria (MDCN) portal to ensure only licensed medical practitioners can register. However, the MDCN verification API is not free and requires paid access. For now, doctor verification is done through:

- License number submission during registration
- Hospital association verification

This is a known limitation that should be addressed in future iterations when budget allows for MDCN API integration.

## Tech Stack

- **Frontend**: React with TypeScript, TanStack Query, Tailwind CSS
- **Backend**: Django REST Framework
- **Authentication**: JWT tokens
- **Identity Verification**: Interswitch NIN API

## Setup

### Prerequisites

- Node.js 18+
- Python 3.9+
- PostgreSQL (for local development)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on http://localhost:3000

For production build:

```bash
npm run build
```

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The backend runs on http://localhost:8000

## Environment Variables

### Frontend (.env)

```
VITE_API_BASE_URL=http://localhost:8000/api
```

### Backend

Configure your database and Interswitch API credentials in settings.py

## Contributors

- Abasiofon Sendan (Backend)
- Covenant Monday (Backend)
- Idighekere Udo (Frontend)
- Joshua Udom (PM and Researcher)
