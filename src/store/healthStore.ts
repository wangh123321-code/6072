import { create } from 'zustand';
import { recordRepository } from '../db/recordRepository';
import { vaccineRepository } from '../db/vaccineRepository';
import { logError } from '../utils/errorHandler';
import { detectAbnormalIndicators } from '../utils/alertDetection';
import type { 
  HealthRecord, HealthRecordInput, 
  WeightRecord, WeightRecordInput,
  VaccineRecord, VaccineRecordInput,
  LabResult, LabResultInput,
  AbnormalIndicator
} from '../types';

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
    const { labResults, healthRecords } = get();
    return detectAbnormalIndicators(labResults, healthRecords);
  },

  getUpcomingVaccines: async () => {
    return vaccineRepository.getUpcoming(get().healthRecords[0]?.catId || '');
  },
}));
