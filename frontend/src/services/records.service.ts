import { client } from '#/configs/axios';
import { ENDPOINTS } from '#/ENDPOINTS';
import type { 
  HealthRecord, 
  HealthRecordDetail, 
  HealthRecordApproveRequest,
  RecordType 
} from '#/types/api.types';

// ============================================================================
// RECORDS SERVICE
// ============================================================================

export const recordsService = {
  /**
   * Get all records for the authenticated patient
   * Backend filters by authenticated user automatically
   */
  getMyRecords: async (): Promise<HealthRecordDetail[]> => {
    const response = await client.get<HealthRecordDetail[]>(ENDPOINTS.RECORDS.LIST);
    return response.data;
  },

  /**
   * Get pending records awaiting patient approval
   * Filter records where is_approved is false and no is_rejected field exists
   */
  getPendingRecords: async (): Promise<HealthRecordDetail[]> => {
    const allRecords = await recordsService.getMyRecords();
    // Backend doesn't have is_rejected field, so pending = not approved
    return allRecords.filter(record => !record.is_approved);
  },

  /**
   * Get records by status (approved, pending, all)
   * Note: Backend doesn't support is_rejected field
   */
  getRecordsByStatus: async (status: 'all' | 'approved' | 'pending' | 'rejected'): Promise<HealthRecordDetail[]> => {
    const allRecords = await recordsService.getMyRecords();
    
    switch (status) {
      case 'approved':
        return allRecords.filter(record => record.is_approved);
      case 'pending':
        return allRecords.filter(record => !record.is_approved);
      case 'rejected':
        // Backend doesn't support rejected status, return empty array
        return [];
      default:
        return allRecords;
    }
  },

  /**
   * Get a single record by ID
   */
  getRecordById: async (id: string): Promise<HealthRecordDetail | null> => {
    try {
      const response = await client.get<HealthRecordDetail>(ENDPOINTS.RECORDS.RECORD_DETAIL(id));
      return response.data;
    } catch (error) {
      // If individual endpoint doesn't exist, fallback to getting from all records
      const allRecords = await recordsService.getMyRecords();
      return allRecords.find(record => record.id === id) || null;
    }
  },

  /**
   * Approve a pending health record with OTP
   */
  approveRecord: async (recordId: string, otpCode: string): Promise<void> => {
    const request: HealthRecordApproveRequest = { otp_code: otpCode };
    await client.post(ENDPOINTS.RECORDS.APPROVE(recordId), request);
  },

  /**
   * Reject a pending health record
   * Note: Backend doesn't support rejection, so this will throw an error
   */
  rejectRecord: async (recordId: string, reason?: string): Promise<void> => {
    throw new Error('Record rejection is not supported by the backend API');
  },

  /**
   * Get record statistics for dashboard
   */
  getRecordStats: async () => {
    const allRecords = await recordsService.getMyRecords();
    
    return {
      total: allRecords.length,
      approved: allRecords.filter(r => r.is_approved).length,
      pending: allRecords.filter(r => !r.is_approved).length,
      rejected: 0 // Backend doesn't support rejected status
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
    LAB_TEST: 'Lab Test',
    VACCINATION: 'Vaccination',
    CONSULTATION: 'Consultation'
  };
  
  return typeMap[type] || type;
}

/**
 * Get badge variant for record type
 */
export function getRecordTypeBadgeVariant(type: RecordType): string {
  const variantMap: Record<RecordType, string> = {
    LAB_TEST: 'approved',
    VACCINATION: 'active',
    CONSULTATION: 'pending'
  };
  
  return variantMap[type] || 'inactive';
}

/**
 * Get status badge variant for record status
 * Note: Backend doesn't support is_rejected field
 */
export function getRecordStatusBadgeVariant(record: HealthRecordDetail): string {
  if (record.is_approved) return 'approved';
  return 'pending'; // Only pending and approved states available
}

/**
 * Get human-readable status text
 * Note: Backend doesn't support is_rejected field
 */
export function getRecordStatusText(record: HealthRecordDetail): string {
  if (record.is_approved) return 'Approved';
  return 'Pending Approval';
}