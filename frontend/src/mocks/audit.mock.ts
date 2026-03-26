import type { AuditLog, AuditAction, ActorType } from '#/types/api.types';

// ============================================================================
// MOCK AUDIT LOGS DATA
// ============================================================================

export const mockAuditLogs: AuditLog[] = [
  // Recent activities (sorted by timestamp, newest first)
  {
    id: '770e8400-e29b-41d4-a716-446655440001',
    action: 'WRITE_REQUEST',
    actor_email: 'amina.hassan@stnicholas.ng',
    actor_type: 'PROVIDER',
    patient_email: 'patient@example.com',
    record: '550e8400-e29b-41d4-a716-446655440004',
    description: 'Dr. Amina Hassan created a new Chest X-Ray report and requested patient approval',
    nin_authorized: true,
    timestamp: '2026-03-25T16:20:00Z'
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440002',
    action: 'WRITE_REQUEST',
    actor_email: 'kemi.adeniran@uch.edu.ng',
    actor_type: 'PROVIDER',
    patient_email: 'patient@example.com',
    record: '550e8400-e29b-41d4-a716-446655440005',
    description: 'Dr. Kemi Adeniran created a diabetes follow-up report and requested patient approval',
    nin_authorized: true,
    timestamp: '2026-03-24T11:30:00Z'
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440003',
    action: 'WRITE_REJECTED',
    actor_email: 'patient@example.com',
    actor_type: 'PATIENT',
    patient_email: 'patient@example.com',
    record: '550e8400-e29b-41d4-a716-446655440006',
    description: 'Patient rejected the medical record due to incorrect patient information',
    nin_authorized: true,
    timestamp: '2026-03-22T14:45:00Z'
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440004',
    action: 'WRITE_REQUEST',
    actor_email: 'tunde.adeyemi@lasuth.lg.gov.ng',
    actor_type: 'PROVIDER',
    patient_email: 'patient@example.com',
    record: '550e8400-e29b-41d4-a716-446655440006',
    description: 'Dr. Tunde Adeyemi created a surgical record (appendectomy) and requested patient approval',
    nin_authorized: true,
    timestamp: '2026-03-22T13:15:00Z'
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440005',
    action: 'WRITE_APPROVED',
    actor_email: 'patient@example.com',
    actor_type: 'PATIENT',
    patient_email: 'patient@example.com',
    record: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Patient approved the Complete Blood Count (CBC) lab results',
    nin_authorized: true,
    timestamp: '2026-03-20T11:15:00Z'
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440006',
    action: 'READ',
    actor_email: 'adebayo.ogundimu@luth.edu.ng',
    actor_type: 'PROVIDER',
    patient_email: 'patient@example.com',
    record: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Dr. Adebayo Ogundimu accessed patient medical records for treatment planning',
    nin_authorized: true,
    timestamp: '2026-03-20T10:45:00Z'
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440007',
    action: 'CONSENT_GRANTED',
    actor_email: 'patient@example.com',
    actor_type: 'PATIENT',
    patient_email: 'patient@example.com',
    record: null,
    description: 'Patient granted access consent to Lagos University Teaching Hospital (Dr. Adebayo Ogundimu) for 7 days',
    nin_authorized: true,
    timestamp: '2026-03-20T08:00:00Z'
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440008',
    action: 'WRITE_APPROVED',
    actor_email: 'patient@example.com',
    actor_type: 'PATIENT',
    patient_email: 'patient@example.com',
    record: '550e8400-e29b-41d4-a716-446655440002',
    description: 'Patient approved the hypertension prescription from Dr. Fatima Ibrahim',
    nin_authorized: true,
    timestamp: '2026-03-18T15:30:00Z'
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440009',
    action: 'CONSENT_GRANTED',
    actor_email: 'patient@example.com',
    actor_type: 'PATIENT',
    patient_email: 'patient@example.com',
    record: null,
    description: 'Patient granted access consent to National Hospital Abuja (Dr. Fatima Ibrahim) for 14 days',
    nin_authorized: true,
    timestamp: '2026-03-18T10:30:00Z'
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440010',
    action: 'READ',
    actor_email: 'fatima.ibrahim@nationalhospital.gov.ng',
    actor_type: 'PROVIDER',
    patient_email: 'patient@example.com',
    record: '550e8400-e29b-41d4-a716-446655440002',
    description: 'Dr. Fatima Ibrahim accessed patient records for hypertension treatment follow-up',
    nin_authorized: true,
    timestamp: '2026-03-18T14:00:00Z'
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440011',
    action: 'WRITE_APPROVED',
    actor_email: 'patient@example.com',
    actor_type: 'PATIENT',
    patient_email: 'patient@example.com',
    record: '550e8400-e29b-41d4-a716-446655440003',
    description: 'Patient approved the diagnosis of acute upper respiratory infection',
    nin_authorized: true,
    timestamp: '2026-03-15T10:30:00Z'
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440012',
    action: 'CONSENT_GRANTED',
    actor_email: 'patient@example.com',
    actor_type: 'PATIENT',
    patient_email: 'patient@example.com',
    record: null,
    description: 'Patient granted hospital-wide access consent to University College Hospital Ibadan for 30 days',
    nin_authorized: true,
    timestamp: '2026-03-15T14:15:00Z'
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440013',
    action: 'READ',
    actor_email: 'chinedu.okoro@ekohospital.com',
    actor_type: 'PROVIDER',
    patient_email: 'patient@example.com',
    record: '550e8400-e29b-41d4-a716-446655440003',
    description: 'Dr. Chinedu Okoro accessed patient records during consultation for respiratory symptoms',
    nin_authorized: true,
    timestamp: '2026-03-15T09:30:00Z'
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440014',
    action: 'CONSENT_REVOKED',
    actor_email: 'patient@example.com',
    actor_type: 'PATIENT',
    patient_email: 'patient@example.com',
    record: null,
    description: 'Patient revoked access consent for Lagos State University Teaching Hospital',
    nin_authorized: true,
    timestamp: '2026-03-12T16:20:00Z'
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440015',
    action: 'CONSENT_REVOKED',
    actor_email: 'patient@example.com',
    actor_type: 'PATIENT',
    patient_email: 'patient@example.com',
    record: null,
    description: 'Patient revoked hospital-wide access consent for Federal Medical Centre Abuja',
    nin_authorized: true,
    timestamp: '2026-03-05T09:45:00Z'
  }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getMockAuditLogsByAction(action?: AuditAction): AuditLog[] {
  if (!action) return mockAuditLogs;
  return mockAuditLogs.filter(log => log.action === action);
}

export function getMockAuditLogsByActorType(actorType?: ActorType): AuditLog[] {
  if (!actorType) return mockAuditLogs;
  return mockAuditLogs.filter(log => log.actor_type === actorType);
}

export function getMockRecentAuditLogs(limit: number = 5): AuditLog[] {
  return mockAuditLogs
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

export function getMockAuditLogsByDateRange(startDate: string, endDate: string): AuditLog[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return mockAuditLogs.filter(log => {
    const logDate = new Date(log.timestamp);
    return logDate >= start && logDate <= end;
  });
}

export function getMockAuditStats() {
  const actionCounts = mockAuditLogs.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {} as Record<AuditAction, number>);

  const actorTypeCounts = mockAuditLogs.reduce((acc, log) => {
    acc[log.actor_type] = (acc[log.actor_type] || 0) + 1;
    return acc;
  }, {} as Record<ActorType, number>);

  return {
    total: mockAuditLogs.length,
    actionCounts,
    actorTypeCounts,
    recentActivityCount: getMockRecentAuditLogs(10).length
  };
}

// Get formatted relative time (e.g., "2 hours ago", "3 days ago")
export function getRelativeTime(timestamp: string): string {
  const now = new Date('2026-03-26T00:00:00Z'); // Mock current time for consistent demo
  const logTime = new Date(timestamp);
  const diffMs = now.getTime() - logTime.getTime();
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays > 0) {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  } else if (diffHours > 0) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  } else if (diffMinutes > 0) {
    return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
  } else {
    return 'Just now';
  }
}

// Get action display properties (color, icon, label)
export function getActionDisplayInfo(action: AuditAction) {
  const actionMap = {
    READ: {
      color: 'blue',
      icon: '👁️',
      label: 'Record Viewed',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200'
    },
    WRITE_REQUEST: {
      color: 'orange',
      icon: '📝',
      label: 'Record Created',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-200'
    },
    WRITE_APPROVED: {
      color: 'green',
      icon: '✅',
      label: 'Record Approved',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200'
    },
    WRITE_REJECTED: {
      color: 'red',
      icon: '❌',
      label: 'Record Rejected',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-200'
    },
    CONSENT_GRANTED: {
      color: 'teal',
      icon: '🔓',
      label: 'Consent Granted',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-700',
      borderColor: 'border-teal-200'
    },
    CONSENT_REVOKED: {
      color: 'gray',
      icon: '🔒',
      label: 'Consent Revoked',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-200'
    }
  };
  
  return actionMap[action] || actionMap.READ;
}