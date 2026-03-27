import type { ConsentLog } from '#/types/api.types';

// ============================================================================
// MOCK CONSENTS DATA
// ============================================================================

export const mockConsents: ConsentLog[] = [
  // Active Consents
  {
    id: '660e8400-e29b-41d4-a716-446655440001',
    hospital_name: 'Lagos University Teaching Hospital',
    doctor_email: 'adebayo.ogundimu@luth.edu.ng',
    granted_at: '2026-03-20T08:00:00Z',
    expires_at: '2026-03-27T08:00:00Z', // Expires in 1 day from "now" (March 26)
    is_revoked: false,
    is_active: true
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440002',
    hospital_name: 'National Hospital Abuja',
    doctor_email: 'fatima.ibrahim@nationalhospital.gov.ng',
    granted_at: '2026-03-18T10:30:00Z',
    expires_at: '2026-04-01T10:30:00Z', // Expires in 6 days
    is_revoked: false,
    is_active: true
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440003',
    hospital_name: 'University College Hospital Ibadan',
    doctor_email: null, // Hospital-wide consent, no specific doctor
    granted_at: '2026-03-15T14:15:00Z',
    expires_at: '2026-04-14T14:15:00Z', // Expires in 19 days (30-day consent)
    is_revoked: false,
    is_active: true
  },

  // Expired Consents
  {
    id: '660e8400-e29b-41d4-a716-446655440004',
    hospital_name: 'Eko Hospital',
    doctor_email: 'chinedu.okoro@ekohospital.com',
    granted_at: '2026-02-20T09:00:00Z',
    expires_at: '2026-02-27T09:00:00Z', // Expired last month
    is_revoked: false,
    is_active: false
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440005',
    hospital_name: 'St. Nicholas Hospital',
    doctor_email: 'amina.hassan@stnicholas.ng',
    granted_at: '2026-02-10T16:45:00Z',
    expires_at: '2026-02-17T16:45:00Z', // Expired last month
    is_revoked: false,
    is_active: false
  },

  // Revoked Consents
  {
    id: '660e8400-e29b-41d4-a716-446655440006',
    hospital_name: 'Lagos State University Teaching Hospital',
    doctor_email: 'tunde.adeyemi@lasuth.lg.gov.ng',
    granted_at: '2026-03-10T11:20:00Z',
    expires_at: '2026-04-10T11:20:00Z', // Would have been active, but revoked
    is_revoked: true,
    is_active: false
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440007',
    hospital_name: 'Federal Medical Centre Abuja',
    doctor_email: null, // Hospital-wide consent
    granted_at: '2026-02-28T13:30:00Z',
    expires_at: '2026-03-28T13:30:00Z', // Would expire in 2 days, but revoked
    is_revoked: true,
    is_active: false
  }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getMockConsentsByStatus(status: 'all' | 'active' | 'expired' | 'revoked'): ConsentLog[] {
  const now = new Date('2026-03-26T00:00:00Z'); // Mock "current" date for hackathon
  
  switch (status) {
    case 'active':
      return mockConsents.filter(consent => 
        !consent.is_revoked && new Date(consent.expires_at) > now
      );
    case 'expired':
      return mockConsents.filter(consent => 
        !consent.is_revoked && new Date(consent.expires_at) <= now
      );
    case 'revoked':
      return mockConsents.filter(consent => consent.is_revoked);
    default:
      return mockConsents;
  }
}

export function getMockConsentById(id: string): ConsentLog | undefined {
  return mockConsents.find(consent => consent.id === id);
}

export function getMockConsentStats() {
  const now = new Date('2026-03-26T00:00:00Z');
  
  return {
    total: mockConsents.length,
    active: getMockConsentsByStatus('active').length,
    expired: getMockConsentsByStatus('expired').length,
    revoked: getMockConsentsByStatus('revoked').length,
    expiringSoon: mockConsents.filter(consent => {
      if (consent.is_revoked) return false;
      const expiresAt = new Date(consent.expires_at);
      const hoursUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
      return hoursUntilExpiry > 0 && hoursUntilExpiry <= 24; // Expires within 24 hours
    }).length
  };
}

// Calculate time left until expiry in human-readable format
export function getTimeLeft(expiresAt: string): string {
  const now = new Date('2026-03-26T00:00:00Z'); // Mock current time
  const expires = new Date(expiresAt);
  const diffMs = expires.getTime() - now.getTime();
  
  if (diffMs <= 0) {
    return 'Expired';
  }
  
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffDays > 0) {
    return diffDays === 1 ? '1 day' : `${diffDays} days`;
  } else if (diffHours > 0) {
    return diffHours === 1 ? '1 hour' : `${diffHours} hours`;
  } else {
    return diffMinutes === 1 ? '1 minute' : `${diffMinutes} minutes`;
  }
}

// Check if consent is expiring soon (within 24 hours)
export function isExpiringSoon(expiresAt: string): boolean {
  const now = new Date('2026-03-26T00:00:00Z');
  const expires = new Date(expiresAt);
  const hoursUntilExpiry = (expires.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntilExpiry > 0 && hoursUntilExpiry <= 24;
}