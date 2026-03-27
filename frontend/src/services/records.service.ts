import { client } from '#/configs/axios';
import { ENDPOINTS } from '#/ENDPOINTS';
import type { 
  HealthRecord, 
  HealthRecordDetail, 
  HealthRecordApproveRequest,
  RecordType 
} from '#/types/api.types';

// Mock data imports
import { 
  mockHealthRecords, 
  getMockRecordsByStatus, 
  getMockRecordById,
  getMockPendingRecords,
  getMockRecordStats 
} from '#/mocks/records.mock';

// Environment flag to switch between mock and real API
const USE_MOCK_DATA = import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API;

// ============================================================================
// RECORDS SERVICE
// ============================================================================

export const recordsService = {
  /**
   * Get all records for the authenticated patient
   * TODO: Replace with real API call to /records/my-records/ when backend is ready
   */
  getMyRecords: async (): Promise<HealthRecordDetail[]> => {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockHealthRecords;
    }
    
    // TODO: Uncomment when backend endpoint is available
    // const response = await client.get<HealthRecordDetail[]>(ENDPOINTS.RECORDS.MY_RECORDS);
    // return response.data;
    
    // Fallback: Use NIN-based endpoint (requires patient's own NIN)
    // This is temporary until backend adds /my-records/ endpoint
    throw new Error('Backend endpoint /records/my-records/ not yet implemented. Using mock data for now.');
  },

  /**
   * Get pending records awaiting patient approval
   * TODO: Replace with real API call to /records/my-pending-records/ when backend is ready
   */
  getPendingRecords: async (): Promise<HealthRecordDetail[]> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return getMockPendingRecords();
    }
    
    // TODO: Uncomment when backend endpoint is available
    // const response = await client.get<HealthRecordDetail[]>(ENDPOINTS.RECORDS.MY_PENDING_RECORDS);
    // return response.data;
    
    throw new Error('Backend endpoint /records/my-pending-records/ not yet implemented. Using mock data for now.');
  },

  /**
   * Get records by status (approved, pending, rejected, all)
   */
  getRecordsByStatus: async (status: 'all' | 'approved' | 'pending' | 'rejected'): Promise<HealthRecordDetail[]> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return getMockRecordsByStatus(status);
    }
    
    // When real API is available, this might be done with query parameters
    const allRecords = await recordsService.getMyRecords();
    
    switch (status) {
      case 'approved':
        return allRecords.filter(record => record.is_approved && !record.is_rejected);
      case 'pending':
        return allRecords.filter(record => !record.is_approved && !record.is_rejected);
      case 'rejected':
        return allRecords.filter(record => record.is_rejected);
      default:
        return allRecords;
    }
  },

  /**
   * Get a single record by ID
   */
  getRecordById: async (id: string): Promise<HealthRecordDetail | null> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return getMockRecordById(id) || null;
    }
    
    // TODO: Add backend endpoint for single record fetch
    // const response = await client.get<HealthRecordDetail>(`/records/${id}/`);
    // return response.data;
    
    // Fallback: Get from all records
    const allRecords = await recordsService.getMyRecords();
    return allRecords.find(record => record.id === id) || null;
  },

  /**
   * Approve a pending health record with OTP
   */
  approveRecord: async (recordId: string, otpCode: string): Promise<void> => {
    const request: HealthRecordApproveRequest = { otp_code: otpCode };
    
    if (USE_MOCK_DATA) {
      // Simulate API delay and validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate OTP validation (accept any 6-digit code for demo)
      if (otpCode.length !== 6 || !/^\d+$/.test(otpCode)) {
        throw new Error('Invalid OTP code. Please enter a 6-digit code.');
      }
      
      // Simulate success (in real app, this would update the record status)
      console.log(`Record ${recordId} approved with OTP ${otpCode}`);
      return;
    }
    
    // Real API call
    await client.post(ENDPOINTS.RECORDS.APPROVE(recordId), request);
  },

  /**
   * Reject a pending health record
   */
  rejectRecord: async (recordId: string, reason?: string): Promise<void> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log(`Record ${recordId} rejected. Reason: ${reason || 'No reason provided'}`);
      return;
    }
    
    // Real API call (backend doesn't seem to accept reason parameter)
    await client.post(ENDPOINTS.RECORDS.REJECT(recordId));
  },

  /**
   * Get record statistics for dashboard
   */
  getRecordStats: async () => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return getMockRecordStats();
    }
    
    // Calculate stats from actual records
    const allRecords = await recordsService.getMyRecords();
    
    return {
      total: allRecords.length,
      approved: allRecords.filter(r => r.is_approved && !r.is_rejected).length,
      pending: allRecords.filter(r => !r.is_approved && !r.is_rejected).length,
      rejected: allRecords.filter(r => r.is_rejected).length
    };
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get display name for record type
 */
export function getRecordTypeDisplay(type: RecordType): string {
  const typeMap: Record<RecordType, string> = {
    DIAGNOSIS: 'Diagnosis',
    PRESCRIPTION: 'Prescription',
    LAB_RESULT: 'Lab Result',
    IMAGING: 'Imaging',
    SURGERY: 'Surgery',
    OTHER: 'Other'
  };
  
  return typeMap[type] || type;
}

/**
 * Get badge variant for record type
 */
export function getRecordTypeBadgeVariant(type: RecordType): string {
  const variantMap: Record<RecordType, string> = {
    DIAGNOSIS: 'active',
    PRESCRIPTION: 'pending', 
    LAB_RESULT: 'approved',
    IMAGING: 'processing',
    SURGERY: 'error',
    OTHER: 'inactive'
  };
  
  return variantMap[type] || 'inactive';
}

/**
 * Get status badge variant for record status
 */
export function getRecordStatusBadgeVariant(record: HealthRecordDetail): string {
  if (record.is_rejected) return 'error';
  if (record.is_approved) return 'approved';
  return 'pending'; // Pending approval
}

/**
 * Get human-readable status text
 */
export function getRecordStatusText(record: HealthRecordDetail): string {
  if (record.is_rejected) return 'Rejected';
  if (record.is_approved) return 'Approved';
  return 'Pending Approval';
}