import { client } from '#/configs/axios';
import { ENDPOINTS } from '#/ENDPOINTS';
import type { AuditLog, AuditAction, ActorType } from '#/types/api.types';

// Mock data imports
import { 
  mockAuditLogs,
  getMockAuditLogsByAction,
  getMockAuditLogsByActorType,
  getMockRecentAuditLogs,
  getMockAuditLogsByDateRange,
  getMockAuditStats,
  getRelativeTime,
  getActionDisplayInfo
} from '#/mocks/audit.mock';

// Environment flag to switch between mock and real API
const USE_MOCK_DATA = import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API;

// ============================================================================
// AUDIT SERVICE
// ============================================================================

export const auditService = {
  /**
   * Get all audit logs for the authenticated user
   */
  getMyAuditLogs: async (): Promise<AuditLog[]> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return mockAuditLogs.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    }
    
    // Real API call
    const response = await client.get<AuditLog[]>(ENDPOINTS.AUDIT.MY_LOGS);
    return response.data;
  },

  /**
   * Get recent audit logs (for dashboard activity feed)
   */
  getRecentActivity: async (limit: number = 5): Promise<AuditLog[]> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return getMockRecentAuditLogs(limit);
    }
    
    const allLogs = await auditService.getMyAuditLogs();
    return allLogs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  },

  /**
   * Filter audit logs by action type
   */
  getAuditLogsByAction: async (action?: AuditAction): Promise<AuditLog[]> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 350));
      return getMockAuditLogsByAction(action);
    }
    
    const allLogs = await auditService.getMyAuditLogs();
    return action ? allLogs.filter(log => log.action === action) : allLogs;
  },

  /**
   * Filter audit logs by actor type
   */
  getAuditLogsByActorType: async (actorType?: ActorType): Promise<AuditLog[]> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 350));
      return getMockAuditLogsByActorType(actorType);
    }
    
    const allLogs = await auditService.getMyAuditLogs();
    return actorType ? allLogs.filter(log => log.actor_type === actorType) : allLogs;
  },

  /**
   * Filter audit logs by date range
   */
  getAuditLogsByDateRange: async (startDate: string, endDate: string): Promise<AuditLog[]> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return getMockAuditLogsByDateRange(startDate, endDate);
    }
    
    const allLogs = await auditService.getMyAuditLogs();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return allLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= start && logDate <= end;
    });
  },

  /**
   * Search audit logs by description or actor email
   */
  searchAuditLogs: async (query: string): Promise<AuditLog[]> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockAuditLogs.filter(log => 
        log.description.toLowerCase().includes(query.toLowerCase()) ||
        log.actor_email.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    const allLogs = await auditService.getMyAuditLogs();
    return allLogs.filter(log => 
      log.description.toLowerCase().includes(query.toLowerCase()) ||
      log.actor_email.toLowerCase().includes(query.toLowerCase())
    );
  },

  /**
   * Get audit log statistics for dashboard
   */
  getAuditStats: async () => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 250));
      return getMockAuditStats();
    }
    
    const allLogs = await auditService.getMyAuditLogs();
    
    // Count by action type
    const actionCounts = allLogs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<AuditAction, number>);

    // Count by actor type
    const actorTypeCounts = allLogs.reduce((acc, log) => {
      acc[log.actor_type] = (acc[log.actor_type] || 0) + 1;
      return acc;
    }, {} as Record<ActorType, number>);

    // Recent activity (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentActivityCount = allLogs.filter(log => 
      new Date(log.timestamp) >= weekAgo
    ).length;

    return {
      total: allLogs.length,
      actionCounts,
      actorTypeCounts,
      recentActivityCount
    };
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format audit log timestamp to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(timestamp: string): string {
  return getRelativeTime(timestamp);
}

/**
 * Get display information for audit action (color, icon, label)
 */
export function getAuditActionDisplay(action: AuditAction) {
  return getActionDisplayInfo(action);
}

/**
 * Format audit log for display in activity feed
 */
export function formatAuditLogForDisplay(log: AuditLog) {
  const actionInfo = getActionDisplayInfo(log.action);
  const relativeTime = getRelativeTime(log.timestamp);
  
  // Extract actor name from email (e.g., "john.doe@hospital.com" -> "John Doe")
  const actorName = log.actor_email.split('@')[0]
    .split('.')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
  
  return {
    ...log,
    actionInfo,
    relativeTime,
    actorName,
    isPatientAction: log.actor_type === 'PATIENT'
  };
}

/**
 * Get audit log filters for UI
 */
export function getAuditLogFilters() {
  return {
    actions: [
      { value: 'READ', label: 'Record Viewed', color: 'blue' },
      { value: 'WRITE_REQUEST', label: 'Record Created', color: 'orange' },
      { value: 'WRITE_APPROVED', label: 'Record Approved', color: 'green' },
      { value: 'WRITE_REJECTED', label: 'Record Rejected', color: 'red' },
      { value: 'CONSENT_GRANTED', label: 'Consent Granted', color: 'teal' },
      { value: 'CONSENT_REVOKED', label: 'Consent Revoked', color: 'gray' }
    ] as const,
    actorTypes: [
      { value: 'PATIENT', label: 'Patient', color: 'blue' },
      { value: 'PROVIDER', label: 'Healthcare Provider', color: 'green' },
      { value: 'ADMIN', label: 'Administrator', color: 'purple' }
    ] as const
  };
}

/**
 * Export audit logs to CSV format
 */
export function exportAuditLogsToCSV(logs: AuditLog[]): string {
  const headers = [
    'Timestamp',
    'Action',
    'Actor Email',
    'Actor Type',
    'Description',
    'Record ID',
    'NIN Authorized'
  ];
  
  const rows = logs.map(log => [
    new Date(log.timestamp).toLocaleString(),
    log.action,
    log.actor_email,
    log.actor_type,
    log.description,
    log.record || 'N/A',
    log.nin_authorized ? 'Yes' : 'No'
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
  
  return csvContent;
}

/**
 * Download audit logs as CSV file
 */
export function downloadAuditLogsCSV(logs: AuditLog[], filename: string = 'audit-logs.csv') {
  const csvContent = exportAuditLogsToCSV(logs);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}