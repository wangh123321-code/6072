import { useMemo } from 'react';
import { detectAbnormalIndicators } from '../utils/alertDetection';
import type { AbnormalIndicator, LabResult, HealthRecord } from '../types';

export function useAlertDetection(
  labResults: LabResult[],
  healthRecords: HealthRecord[]
): {
  abnormalIndicators: AbnormalIndicator[];
  totalAlerts: number;
  criticalAlerts: number;
  warningAlerts: number;
} {
  return useMemo(() => {
    const abnormalIndicators = detectAbnormalIndicators(labResults, healthRecords);
    
    return {
      abnormalIndicators,
      totalAlerts: abnormalIndicators.length,
      criticalAlerts: abnormalIndicators.filter(a => a.severity === 'danger').length,
      warningAlerts: abnormalIndicators.filter(a => a.severity === 'warning').length,
    };
  }, [labResults, healthRecords]);
}
