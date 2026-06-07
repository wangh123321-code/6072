import { create } from 'zustand';
import { recordRepository } from '../db/recordRepository';
import { vaccineRepository } from '../db/vaccineRepository';
import { logError } from '../utils/errorHandler';
import type { 
  HealthRecord, HealthRecordInput, 
  WeightRecord, WeightRecordInput,
  VaccineRecord, VaccineRecordInput,
  LabResult, LabResultInput,
  AbnormalIndicator
} from '../types';

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

function getMedicalAdvice(indicator: string): string {
  return MEDICAL_ADVICE[indicator] || `${indicator}连续三次超出正常范围，建议尽快带猫咪到宠物医院进行全面检查。`;
}

interface HealthState {
  healthRecords: HealthRecord[];
  weightRecords: WeightRecord[];
  vaccineRecords: VaccineRecord[];
  labResults: LabResult[];
  selectedRecordId: string | null;
  timelineScale: number;
  timelineOffset: number;
  isLoading: boolean;
  error: string | null;

  fetchRecords: (catId: string) => Promise<void>;
  addHealthRecord: (record: HealthRecordInput) => Promise<void>;
  addWeightRecord: (record: WeightRecordInput) => Promise<void>;
  addVaccineRecord: (record: VaccineRecordInput) => Promise<void>;
  addLabResults: (results: LabResultInput[]) => Promise<void>;
  updateOcrText: (recordId: string, text: string) => Promise<void>;
  deleteRecord: (recordId: string) => Promise<void>;
  selectRecord: (id: string | null) => void;
  setTimelineScale: (scale: number) => void;
  setTimelineOffset: (offset: number) => void;
  
  getSortedHealthRecords: () => HealthRecord[];
  getWeightTrend: () => { date: string; weight: number }[];
  getAbnormalIndicators: () => AbnormalIndicator[];
  getUpcomingVaccines: () => Promise<VaccineRecord[]>;
}

export const useHealthStore = create<HealthState>((set, get) => ({
  healthRecords: [],
  weightRecords: [],
  vaccineRecords: [],
  labResults: [],
  selectedRecordId: null,
  timelineScale: 1,
  timelineOffset: 0,
  isLoading: false,
  error: null,

  fetchRecords: async (catId: string) => {
    set({ isLoading: true, error: null, selectedRecordId: null });
    try {
      const [healthRecords, weightRecords, vaccineRecords] = await Promise.all([
        recordRepository.getHealthRecordsByCatId(catId),
        recordRepository.getWeightRecordsByCatId(catId),
        vaccineRepository.getByCatId(catId),
      ]);

      const labResults = await recordRepository.getLabResultsByCatId(catId, healthRecords);

      set({
        healthRecords,
        weightRecords,
        vaccineRecords,
        labResults,
        isLoading: false,
      });
    } catch (error) {
      logError(error, 'fetchRecords');
      set({ error: '加载健康记录失败', isLoading: false });
    }
  },

  addHealthRecord: async (record: HealthRecordInput) => {
    try {
      const newRecord = await recordRepository.addHealthRecord(record);
      set((state) => ({
        healthRecords: [...state.healthRecords, newRecord],
      }));
    } catch (error) {
      logError(error, 'addHealthRecord');
    }
  },

  addWeightRecord: async (record: WeightRecordInput) => {
    try {
      const newRecord = await recordRepository.addWeightRecord(record);
      set((state) => ({
        weightRecords: [...state.weightRecords, newRecord],
      }));
    } catch (error) {
      logError(error, 'addWeightRecord');
    }
  },

  addVaccineRecord: async (record: VaccineRecordInput) => {
    try {
      const newRecord = await vaccineRepository.add(record);
      set((state) => ({
        vaccineRecords: [...state.vaccineRecords, newRecord],
      }));
      
      await get().addHealthRecord({
        catId: record.catId,
        date: record.date,
        type: 'vaccine',
        hospital: record.hospital,
        doctor: '',
        title: `${record.name}接种`,
        description: `${record.name}接种完成，下次接种时间：${record.nextDate}`,
        pdfUrl: '',
        ocrText: '',
      });
    } catch (error) {
      logError(error, 'addVaccineRecord');
    }
  },

  addLabResults: async (results: LabResultInput[]) => {
    try {
      const newResults = await recordRepository.addLabResults(results);
      set((state) => ({
        labResults: [...state.labResults, ...newResults],
      }));
    } catch (error) {
      logError(error, 'addLabResults');
    }
  },

  updateOcrText: async (recordId: string, text: string) => {
    try {
      const updated = await recordRepository.updateHealthRecord(recordId, { ocrText: text });
      if (updated) {
        set((state) => ({
          healthRecords: state.healthRecords.map((r) =>
            r.id === recordId ? updated : r
          ),
        }));
      }
    } catch (error) {
      logError(error, 'updateOcrText');
    }
  },

  deleteRecord: async (recordId: string) => {
    try {
      await recordRepository.deleteHealthRecord(recordId);
      set((state) => ({
        healthRecords: state.healthRecords.filter((r) => r.id !== recordId),
        labResults: state.labResults.filter((r) => r.recordId !== recordId),
        selectedRecordId: state.selectedRecordId === recordId ? null : state.selectedRecordId,
      }));
    } catch (error) {
      logError(error, 'deleteRecord');
    }
  },

  selectRecord: (id: string | null) => {
    set({ selectedRecordId: id });
  },

  setTimelineScale: (scale: number) => {
    const clampedScale = Math.max(0.5, Math.min(3.0, scale));
    set({ timelineScale: clampedScale });
  },

  setTimelineOffset: (offset: number) => {
    set({ timelineOffset: offset });
  },

  getSortedHealthRecords: () => {
    return [...get().healthRecords].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },

  getWeightTrend: () => {
    return [...get().weightRecords]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((r) => ({ date: r.date, weight: r.weight }));
  },

  getAbnormalIndicators: (): AbnormalIndicator[] => {
    const { labResults } = get();
    const grouped: Record<string, LabResult[]> = {};

    for (const result of labResults) {
      if (!grouped[result.indicator]) {
        grouped[result.indicator] = [];
      }
      grouped[result.indicator].push(result);
    }

    const abnormal: AbnormalIndicator[] = [];

    for (const [indicator, records] of Object.entries(grouped)) {
      const sorted = [...records].sort(
        (a, b) => new Date(get().healthRecords.find(r => r.id === a.recordId)?.date || '').getTime() 
                  - new Date(get().healthRecords.find(r => r.id === b.recordId)?.date || '').getTime()
      );

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

    return abnormal.sort((a, b) => {
      if (a.severity !== b.severity) return a.severity === 'danger' ? -1 : 1;
      return b.consecutiveCount - a.consecutiveCount;
    });
  },

  getUpcomingVaccines: async () => {
    return vaccineRepository.getUpcoming(get().healthRecords[0]?.catId || '');
  },
}));
