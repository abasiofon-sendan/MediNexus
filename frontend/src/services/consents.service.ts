import { client } from '#/configs/axios';
import { ENDPOINTS } from '#/ENDPOINTS';
import type { 
  ConsentLog, 
  GrantConsentRequest, 
  RevokeConsentRequest,
  Hospital,
  Doctor 
} from '#/types/api.types';

import { getTimeLeft, isExpiringSoon, CONSENT_DURATION_PRESETS } from '#/lib/utils';

export const consentsService = {
  getMyConsents: async (): Promise<ConsentLog[]> => {
    const response = await client.get<ConsentLog[]>(ENDPOINTS.CONSENTS.MY_CONSENTS);
    return response.data;
  },

  getConsentsByStatus: async (status: 'all' | 'active' | 'expired' | 'revoked'): Promise<ConsentLog[]> => {
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

  grantConsent: async (request: GrantConsentRequest): Promise<ConsentLog> => {
    const response = await client.post<ConsentLog>(ENDPOINTS.CONSENTS.GRANT, request);
    return response.data;
  },

  revokeConsent: async (consentId: string): Promise<void> => {
    const request: RevokeConsentRequest = { consent_id: consentId };
    await client.post(ENDPOINTS.CONSENTS.REVOKE, request);
  },

  getConsentStats: async () => {
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

export const hospitalsService = {
  getHospitals: async (): Promise<Hospital[]> => {
    const response = await client.get<Hospital[]>(ENDPOINTS.PROVIDERS.HOSPITALS);
    return response.data;
  },

  getDoctorsByHospital: async (hospitalId: string): Promise<Doctor[]> => {
    const response = await client.get<Doctor[]>(ENDPOINTS.PROVIDERS.DOCTOR_BY_HOSPITAL(hospitalId));
    return response.data;
  }
};

export function calculateTimeLeft(expiresAt: string): string {
  return getTimeLeft(expiresAt);
}

export function isConsentExpiringSoon(expiresAt: string): boolean {
  return isExpiringSoon(expiresAt);
}

export function getConsentStatusBadgeVariant(consent: ConsentLog): string {
  if (consent.is_revoked) return 'inactive';
  
  const now = new Date();
  const expiresAt = new Date(consent.expires_at);
  
  if (expiresAt <= now) return 'error';
  
  if (isConsentExpiringSoon(consent.expires_at)) return 'warning';
  
  return 'approved';
}

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

export function getConsentDurationPresets() {
  return CONSENT_DURATION_PRESETS;
}

export function formatConsentDescription(consent: ConsentLog): string {
  const hospitalName = consent.hospital_name;
  const doctorPart = consent.doctor_email ? ` (Dr. ${consent.doctor_email.split('@')[0]})` : ' (Hospital-wide access)';
  const timeLeft = consent.is_revoked ? 'Revoked' : 
    new Date(consent.expires_at) <= new Date() ? 'Expired' :
    `Expires ${calculateTimeLeft(consent.expires_at)}`;
  
  return `${hospitalName}${doctorPart} • ${timeLeft}`;
}
