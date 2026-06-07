import { useMemo } from 'react';
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
    const MEDICAL_ADVICE: Record<string, string> = {
      '白细胞计数 (WBC)': '白细胞计数持续异常可能提示感染或炎症，建议尽快带猫咪去医院做进一步检查，排查感染源。',
      '红细胞计数 (RBC)': '红细胞计数持续异常可能提示贫血或脱水，建议检查猫咪饮食情况，必要时进行血液生化检查。',
      '血红蛋白 (HGB)': '血红蛋白持续偏低可能是贫血的表现，建议补充铁剂并排查出血原因。',
      '血小板计数 (PLT)': '血小板计数持续异常可能影响凝血功能，建议避免猫咪剧烈运动，及时就医检查。',
      '谷丙转氨酶 (ALT)': '谷丙转氨酶持续升高可能提示肝脏损伤，建议立即停止可能伤肝的药物，进行肝脏超声检查。',
      '谷草转氨酶 (AST)': '谷草转氨酶持续异常可能与肝脏或心脏问题相关，建议做心电图和肝脏功能全面检查。',
      '碱性磷酸酶 (ALP)': '碱性磷酸酶持续升高可能与胆道疾病相关，建议进行腹部超声检查。',
      '总胆红素 (TBIL)': '总胆红素持续升高可能出现黄疸症状，建议检查肝胆功能。',
      '白蛋白 (ALB)': '白蛋白持续降低可能提示营养不良或肝脏疾病，建议调整饮食并检查肝脏。',
      '血糖 (GLU)': '血糖持续异常可能提示糖尿病风险，建议监测血糖并控制饮食。',
      '尿素氮 (BUN)': '尿素氮持续升高可能提示肾脏问题，建议增加饮水并进行肾功能检查。',
      '肌酐 (CREA)': '肌酐持续升高是肾脏损伤的重要指标，建议立即就医进行肾功能全面检查。',
      '总胆固醇 (CHOL)': '胆固醇持续偏高可能增加心血管疾病风险，建议调整饮食结构。',
      '甘油三酯 (TRIG)': '甘油三酯持续偏高可能与胰腺炎风险相关，建议低脂饮食。',
    };

    const getMedicalAdvice = (indicator: string): string => {
      return MEDICAL_ADVICE[indicator] || `${indicator}连续三次超出正常范围，建议尽快带猫咪到宠物医院进行全面检查。`;
    };

    const grouped: Record<string, LabResult[]> = {};

    for (const result of labResults) {
      if (!grouped[result.indicator]) {
        grouped[result.indicator] = [];
      }
      grouped[result.indicator].push(result);
    }

    const abnormal: AbnormalIndicator[] = [];

    for (const [indicator, records] of Object.entries(grouped)) {
      const sorted = [...records].sort((a, b) => {
        const dateA = healthRecords.find(r => r.id === a.recordId)?.date || '';
        const dateB = healthRecords.find(r => r.id === b.recordId)?.date || '';
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      });

      let consecutiveCount = 0;
      let abnormalRecords: LabResult[] = [];

      for (let i = sorted.length - 1; i >= 0; i--) {
        const r = sorted[i];
        if (r.value < r.minRange || r.value > r.maxRange) {
          consecutiveCount++;
          abnormalRecords.unshift(r);
          if (consecutiveCount >= 3) {
            abnormal.push({
              indicator,
              consecutiveCount,
              latestRecords: abnormalRecords.slice(-3),
              suggestion: getMedicalAdvice(indicator),
              severity: consecutiveCount >= 5 ? 'danger' : 'warning',
            });
            break;
          }
        } else {
          consecutiveCount = 0;
          abnormalRecords = [];
        }
      }
    }

    const sortedAbnormal = abnormal.sort((a, b) => {
      if (a.severity !== b.severity) return a.severity === 'danger' ? -1 : 1;
      return b.consecutiveCount - a.consecutiveCount;
    });

    return {
      abnormalIndicators: sortedAbnormal,
      totalAlerts: sortedAbnormal.length,
      criticalAlerts: sortedAbnormal.filter(a => a.severity === 'danger').length,
      warningAlerts: sortedAbnormal.filter(a => a.severity === 'warning').length,
    };
  }, [labResults, healthRecords]);
}
