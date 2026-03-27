import { client } from '#/configs/axios';
import { ENDPOINTS } from '#/ENDPOINTS';
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

// Mock data imports
import { 
  mockPatients, 
  mockPatientRecordsByNin, 
  mockDoctorStats,
  mockRecentlyCreatedRecords,
  mockDoctorAuditLogs
} from '#/mocks/doctor.mock';

// Environment flag to switch between mock and real API
const USE_MOCK_DATA = import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API;

// ============================================================================
// DOCTOR SERVICE
// ============================================================================

export const doctorService = {
  /**
   * Search patient records by NIN
   * Uses existing backend endpoint: GET /api/records/list/{nin}/
   */
  searchPatientRecordsByNin: async (nin: string): Promise<PatientSearchResult> => {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const records = mockPatientRecordsByNin[nin] || [];
      const patient = mockPatients.find(p => p.nin === nin);
      
      // Simulate consent check (in real API, 403 would be returned if no consent)
      const hasConsent = records.length > 0; // Mock: has records = has consent
      
      return {
        nin,
        records,
        consent: {
          hasConsent,
          expiresAt: hasConsent ? '2026-04-15T23:59:59Z' : undefined,
          hospitalName: hasConsent ? 'Lagos University Teaching Hospital' : undefined,
          doctorEmail: hasConsent ? 'doctor@example.com' : undefined,
          isExpiringSoon: false
        },
        patientInfo: patient
      };
    }
    
    try {
      // Real API call - will return 403 if no consent
      const response = await client.get<HealthRecordDetail[]>(
        ENDPOINTS.RECORDS.LIST_BY_NIN(nin)
      );
      
      return {
        nin,
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
          nin,
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
   * Uses existing backend endpoint: POST /api/records/create/
   */
  createPatientRecord: async (data: HealthRecordCreateRequest): Promise<HealthRecordDetail> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Create mock record
      const newRecord: HealthRecordDetail = {
        id: `mock-${Date.now()}`,
        title: data.title,
        record_type: data.record_type,
        hospital: 'Current Hospital', // Would come from doctor's hospital
        recorded_at: new Date().toISOString(),
        is_approved: false, // Always starts as pending
        is_rejected: false,
        content: data.content,
        doctor_name: 'Dr. Current User',
        patient_nin: data.patient_nin,
        created_at: new Date().toISOString()
      };
      
      return newRecord;
    }
    
    const response = await client.post<HealthRecordDetail>(
      ENDPOINTS.RECORDS.CREATE,
      data
    );
    return response.data;
  },

  /**
   * Get doctor dashboard statistics
   * TODO: Backend may need to add dedicated endpoint for doctor stats
   */
  getDoctorStats: async (): Promise<DoctorStats> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockDoctorStats;
    }
    
    // TODO: When backend adds doctor stats endpoint, use it
    // For now, calculate from audit logs (less efficient but works)
    try {
      const auditLogs = await doctorService.getRecentActivity(100);
      const today = new Date().toDateString();
      
      const todayLogs = auditLogs.filter(log => 
        new Date(log.timestamp).toDateString() === today
      );
      
      const readActions = todayLogs.filter(log => log.action === 'READ');
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
   * Uses existing endpoint: GET /api/audit/my-logs/
   */
  getRecentActivity: async (limit: number = 10): Promise<AuditLog[]> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return mockDoctorAuditLogs.slice(0, limit);
    }
    
    try {
      // TODO: Backend may need to add limit/pagination to audit endpoint
      const response = await client.get<AuditLog[]>(ENDPOINTS.AUDIT.MY_LOGS);
      return response.data.slice(0, limit);
    } catch (error) {
      console.error('Failed to fetch doctor activity:', error);
      return [];
    }
  },

  /**
   * Get recently accessed patients
   * Derived from audit logs - backend may add dedicated endpoint
   */
  getRecentlyAccessedPatients: async (limit: number = 10): Promise<RecentPatient[]> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 600));
      return mockPatients.slice(0, limit);
    }
    
    try {
      const auditLogs = await doctorService.getRecentActivity(100);
      
      // Group by patient and find most recent access
      const patientAccess = new Map<string, { timestamp: string; records: number }>();
      
      auditLogs
        .filter(log => log.action === 'READ')
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
          nin: 'Unknown', // Backend would need to provide NIN
          name: email.split('@')[0].replace('.', ' '), // Derive from email
          age: 0, // Would need patient lookup
          bloodGroup: 'UNKNOWN' as const,
          lastAccessed: data.timestamp,
          recordCount: data.records
        }))
        .sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to fetch recent patients:', error);
      return [];
    }
  },

  /**
   * Get records created by this doctor
   * TODO: Backend may need dedicated endpoint for doctor's created records
   */
  getMyCreatedRecords: async (limit: number = 10): Promise<HealthRecordDetail[]> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockRecentlyCreatedRecords.slice(0, limit);
    }
    
    // TODO: Backend needs endpoint to get records created by current doctor
    // For now, this would need to be derived from audit logs or separate endpoint
    throw new Error('Backend endpoint for doctor created records not yet implemented');
  },

  /**
   * Check if doctor has consent for specific patient
   * This is usually checked automatically in searchPatientRecordsByNin
   */
  checkPatientConsent: async (nin: string): Promise<ConsentCheckResult> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const hasConsent = mockPatientRecordsByNin[nin]?.length > 0;
      
      return {
        hasConsent,
        expiresAt: hasConsent ? '2026-04-15T23:59:59Z' : undefined,
        hospitalName: hasConsent ? 'Lagos University Teaching Hospital' : undefined,
        isExpiringSoon: false
      };
    }
    
    try {
      // Try to access records - if 403, no consent
      await client.get(ENDPOINTS.RECORDS.LIST_BY_NIN(nin));
      
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
 * Validate Nigerian NIN format (11 digits)
 */
export const validateNIN = (nin: string): boolean => {
  const cleanNin = nin.replace(/\D/g, ''); // Remove non-digits
  return cleanNin.length === 11;
};

/**
 * Format NIN for display (add dashes)
 */
export const formatNIN = (nin: string): string => {
  const cleanNin = nin.replace(/\D/g, '');
  if (cleanNin.length !== 11) return nin;
  
  return `${cleanNin.slice(0, 5)}-${cleanNin.slice(5, 8)}-${cleanNin.slice(8)}`;
};

/**
 * Obfuscate NIN for privacy (show only last 4 digits)
 */
export const obfuscateNIN = (nin: string): string => {
  const cleanNin = nin.replace(/\D/g, '');
  if (cleanNin.length !== 11) return '***-***-****';
  
  return `***-***-${cleanNin.slice(-4)}`;
};