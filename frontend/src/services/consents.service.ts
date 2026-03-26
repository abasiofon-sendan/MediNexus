import { client } from '#/configs/axios';
import { ENDPOINTS } from '#/ENDPOINTS';
import type { 
  ConsentLog, 
  GrantConsentRequest, 
  RevokeConsentRequest,
  Hospital,
  Doctor 
} from '#/types/api.types';

// Mock data imports
import { 
  mockConsents,
  getMockConsentsByStatus,
  getMockConsentById,
  getMockConsentStats,
  getTimeLeft,
  isExpiringSoon
} from '#/mocks/consents.mock';
import { 
  mockHospitals,
  mockDoctors,
  getMockDoctorsByHospital,
  getMockHospitalsWithDoctorCount,
  CONSENT_DURATION_PRESETS 
} from '#/mocks/hospitals.mock';

// Environment flag to switch between mock and real API
const USE_MOCK_DATA = import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API;

// ============================================================================
// CONSENTS SERVICE
// ============================================================================

export const consentsService = {
  /**
   * Get all consents for the authenticated patient
   * TODO: Replace with real API call to /consents/my-consents/ when backend is ready
   */
  getMyConsents: async (): Promise<ConsentLog[]> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return mockConsents;
    }
    
    // TODO: Uncomment when backend endpoint is available
    // const response = await client.get<ConsentLog[]>(ENDPOINTS.CONSENTS.MY_CONSENTS);
    // return response.data;
    
    throw new Error('Backend endpoint /consents/my-consents/ not yet implemented. Using mock data for now.');
  },

  /**
   * Get consents by status (active, expired, revoked, all)
   */
  getConsentsByStatus: async (status: 'all' | 'active' | 'expired' | 'revoked'): Promise<ConsentLog[]> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return getMockConsentsByStatus(status);
    }
    
    const allConsents = await consentsService.getMyConsents();
    const now = new Date();
    
    switch (status) {
      case 'active':
        return allConsents.filter(consent => 
          !consent.is_revoked && new Date(consent.expires_at) > now
        );
      case 'expired':
        return allConsents.filter(consent => 
          !consent.is_revoked && new Date(consent.expires_at) <= now
        );
      case 'revoked':
        return allConsents.filter(consent => consent.is_revoked);
      default:
        return allConsents;
    }
  },

  /**
   * Grant consent to a hospital/doctor
   */
  grantConsent: async (request: GrantConsentRequest): Promise<ConsentLog> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find hospital for mock response
      const hospital = mockHospitals.find(h => h.id === request.hospital_id);
      const doctor = request.doctor_id ? mockDoctors.find(d => d.id === request.doctor_id) : null;
      
      if (!hospital) {
        throw new Error('Hospital not found');
      }
      
      // Create mock consent response
      const newConsent: ConsentLog = {
        id: `consent-${Date.now()}`,
        hospital_name: hospital.name,
        doctor_email: doctor?.email || null,
        granted_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + request.expires_in_hours * 60 * 60 * 1000).toISOString(),
        is_revoked: false,
        is_active: true
      };
      
      return newConsent;
    }
    
    // Real API call
    const response = await client.post<ConsentLog>(ENDPOINTS.CONSENTS.GRANT, request);
    return response.data;
  },

  /**
   * Revoke an existing consent
   */
  revokeConsent: async (consentId: string): Promise<void> => {
    const request: RevokeConsentRequest = { consent_id: consentId };
    
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const consent = getMockConsentById(consentId);
      if (!consent) {
        throw new Error('Consent not found');
      }
      
      if (consent.is_revoked) {
        throw new Error('Consent is already revoked');
      }
      
      console.log(`Consent ${consentId} revoked successfully`);
      return;
    }
    
    // Real API call
    await client.post(ENDPOINTS.CONSENTS.REVOKE, request);
  },

  /**
   * Get consent statistics for dashboard
   */
  getConsentStats: async () => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return getMockConsentStats();
    }
    
    const allConsents = await consentsService.getMyConsents();
    const now = new Date();
    
    const active = allConsents.filter(consent => 
      !consent.is_revoked && new Date(consent.expires_at) > now
    );
    
    const expiringSoon = active.filter(consent => {
      const expiresAt = new Date(consent.expires_at);
      const hoursUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
      return hoursUntilExpiry <= 24;
    });
    
    return {
      total: allConsents.length,
      active: active.length,
      expired: allConsents.filter(consent => 
        !consent.is_revoked && new Date(consent.expires_at) <= now
      ).length,
      revoked: allConsents.filter(consent => consent.is_revoked).length,
      expiringSoon: expiringSoon.length
    };
  }
};

// ============================================================================
// HOSPITALS & DOCTORS SERVICE (for consent granting)
// ============================================================================

export const hospitalsService = {
  /**
   * Get all hospitals (already implemented in auth.service.ts but extended here)
   */
  getHospitals: async (): Promise<Hospital[]> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return getMockHospitalsWithDoctorCount();
    }
    
    // Use existing endpoint
    const response = await client.get<Hospital[]>(ENDPOINTS.PROVIDERS.HOSPITALS);
    return response.data;
  },

  /**
   * Get doctors by hospital ID
   */
  getDoctorsByHospital: async (hospitalId: string): Promise<Doctor[]> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 250));
      return getMockDoctorsByHospital(hospitalId);
    }
    
    const response = await client.get<Doctor[]>(ENDPOINTS.PROVIDERS.DOCTOR_BY_HOSPITAL(hospitalId));
    return response.data;
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate time left until consent expires
 */
export function calculateTimeLeft(expiresAt: string): string {
  return getTimeLeft(expiresAt);
}

/**
 * Check if consent is expiring soon (within 24 hours)
 */
export function isConsentExpiringSoon(expiresAt: string): boolean {
  return isExpiringSoon(expiresAt);
}

/**
 * Get consent status badge variant
 */
export function getConsentStatusBadgeVariant(consent: ConsentLog): string {
  if (consent.is_revoked) return 'inactive';
  
  const now = new Date();
  const expiresAt = new Date(consent.expires_at);
  
  if (expiresAt <= now) return 'error'; // Expired
  
  if (isConsentExpiringSoon(consent.expires_at)) return 'warning'; // Expiring soon
  
  return 'approved'; // Active
}

/**
 * Get human-readable consent status
 */
export function getConsentStatusText(consent: ConsentLog): string {
  if (consent.is_revoked) return 'Revoked';
  
  const now = new Date();
  const expiresAt = new Date(consent.expires_at);
  
  if (expiresAt <= now) return 'Expired';
  
  if (isConsentExpiringSoon(consent.expires_at)) {
    return `Expires ${calculateTimeLeft(consent.expires_at)}`;
  }
  
  return 'Active';
}

/**
 * Get consent duration presets for form
 */
export function getConsentDurationPresets() {
  return CONSENT_DURATION_PRESETS;
}

/**
 * Format consent description for display
 */
export function formatConsentDescription(consent: ConsentLog): string {
  const hospitalName = consent.hospital_name;
  const doctorPart = consent.doctor_email ? ` (Dr. ${consent.doctor_email.split('@')[0]})` : ' (Hospital-wide access)';
  const timeLeft = consent.is_revoked ? 'Revoked' : 
    new Date(consent.expires_at) <= new Date() ? 'Expired' :
    `Expires ${calculateTimeLeft(consent.expires_at)}`;
  
  return `${hospitalName}${doctorPart} • ${timeLeft}`;
}