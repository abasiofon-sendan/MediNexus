import { client } from '#/configs/axios';
import { ENDPOINTS } from '#/ENDPOINTS';
import { auditService } from './audit.service';
import type { 
  HealthRecordDetail,
  HealthRecordCreateRequest,
  AuditLog,
  DoctorStats,
  RecentPatient,
  ConsentCheckResult,
  PatientSearchResult,
  DoctorActivitySummary
} from '#/types/api.types';

// ============================================================================
// DOCTOR SERVICE
// ============================================================================

export const doctorService = {
  /**
   * Search patient records by email
   * Uses backend endpoint: GET /api/records/patient/{patient_email}/
   */
  searchPatientRecordsByEmail: async (email: string): Promise<PatientSearchResult> => {
    try {
      // Real API call - will return 403 if no consent
      const response = await client.get<HealthRecordDetail[]>(
        ENDPOINTS.RECORDS.PATIENT_RECORDS(email)
      );
      
      return {
        email,
        records: response.data,
        consent: {
          hasConsent: true,
          // Note: Real API doesn't return consent details in this endpoint
          // Backend team may need to add consent info to response
        }
      };
    } catch (error: any) {
      if (error.response?.status === 403) {
        // No consent found
        return {
          email,
          records: [],
          consent: {
            hasConsent: false
          }
        };
      }
      throw error;
    }
  },

  /**
   * Create a new patient record
   * Uses backend endpoint: POST /api/records/create/
   * Note: Backend expects patient_email not patient_nin
   */
  createPatientRecord: async (data: HealthRecordCreateRequest): Promise<HealthRecordDetail> => {
    const response = await client.post<HealthRecordDetail>(
      ENDPOINTS.RECORDS.CREATE,
      {
        ...data,
        // Backend expects 'description' field, not 'content'
        description: data.content,
        content: undefined // Remove content field
      }
    );
    return response.data;
  },

  /**
   * Get doctor dashboard statistics
   * Calculate from audit logs since backend doesn't have dedicated endpoint
   */
  getDoctorStats: async (): Promise<DoctorStats> => {
    try {
      const auditLogs = await doctorService.getRecentActivity(100);
      const today = new Date().toDateString();
      
      const todayLogs = auditLogs.filter(log => 
        new Date(log.timestamp).toDateString() === today
      );
      
      const readActions = todayLogs.filter(log => log.action === 'read');
      const writeActions = auditLogs.filter(log => 
        log.action === 'WRITE_REQUEST' && log.actor_type === 'PROVIDER'
      );
      const pendingActions = writeActions.filter(log => 
        !auditLogs.some(approveLog => 
          approveLog.record === log.record && 
          (approveLog.action === 'WRITE_APPROVED' || approveLog.action === 'WRITE_REJECTED')
        )
      );
      
      return {
        patientsAccessedToday: new Set(readActions.map(log => log.patient_email)).size,
        recordsCreated: writeActions.length,
        pendingApprovals: pendingActions.length,
        recentActivities: auditLogs.length
      };
    } catch (error) {
      // Fallback if audit endpoint fails
      return {
        patientsAccessedToday: 0,
        recordsCreated: 0,
        pendingApprovals: 0,
        recentActivities: 0
      };
    }
  },

  /**
   * Get recent doctor activity from audit logs
   * Note: Backend endpoint /audit/my-logs/ may not exist, will handle gracefully
   */
  getRecentActivity: async (limit: number = 10): Promise<AuditLog[]> => {
    try {
      // Note: Backend may not have this endpoint implemented yet
      const response = await client.get<AuditLog[]>(ENDPOINTS.AUDIT.MY_LOGS);
      return response.data.slice(0, limit);
    } catch (error) {
      console.warn('Audit logs endpoint not available:', error);
      return [];
    }
  },

  /**
   * Get recently accessed patients
   * Derived from audit logs - backend may add dedicated endpoint
   */
  getRecentlyAccessedPatients: async (limit: number = 10): Promise<RecentPatient[]> => {
    try {
      const auditLogs = await doctorService.getRecentActivity(100);
      
      // Group by patient and find most recent access
      const patientAccess = new Map<string, { timestamp: string; records: number }>();
      
      auditLogs
        .filter(log => log.action === 'read')
        .forEach(log => {
          const existing = patientAccess.get(log.patient_email);
          if (!existing || new Date(log.timestamp) > new Date(existing.timestamp)) {
            patientAccess.set(log.patient_email, {
              timestamp: log.timestamp,
              records: (existing?.records || 0) + 1
            });
          }
        });
      
      // Convert to RecentPatient format
      // Note: Real implementation would need patient name lookup
      return Array.from(patientAccess.entries())
        .map(([email, data]) => ({
          email,
          name: email.split('@')[0].replace('.', ' '), // Derive from email
          age: 0, // Would need patient lookup
          bloodGroup: 'UNKNOWN' as const,
          lastAccessed: data.timestamp,
          recordCount: data.records
        }))
        .sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime())
        .slice(0, limit);
    } catch (error) {
      console.warn('Failed to fetch recent patients:', error);
      return [];
    }
  },

  /**
   * Get records created by this doctor
   * Note: Backend doesn't have dedicated endpoint for doctor's created records
   */
  getMyCreatedRecords: async (limit: number = 10): Promise<HealthRecordDetail[]> => {
    // Backend doesn't have endpoint to get records created by current doctor
    // This would need to be derived from audit logs or a separate endpoint
    console.warn('Backend endpoint for doctor created records not yet implemented');
    return [];
  },

  /**
   * Check if doctor has consent for specific patient by email
   * This is usually checked automatically in searchPatientRecordsByEmail
   */
  checkPatientConsent: async (email: string): Promise<ConsentCheckResult> => {
    try {
      // Try to access records - if 403, no consent
      await client.get(ENDPOINTS.RECORDS.PATIENT_RECORDS(email));
      
      return {
        hasConsent: true
        // Note: Backend doesn't return consent details in this endpoint
      };
    } catch (error: any) {
      if (error.response?.status === 403) {
        return {
          hasConsent: false
        };
      }
      throw error;
    }
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Obfuscate email for privacy (show only first 2 chars and domain)
 */
export const obfuscateEmail = (email: string): string => {
  if (!email.includes('@')) return '***@***.***';
  
  const [username, domain] = email.split('@');
  if (username.length <= 2) return `${username}@${domain}`;
  
  return `${username.slice(0, 2)}***@${domain}`;
};