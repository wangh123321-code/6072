import { getDB, generateId } from './index';
import type { 
  HealthRecord, HealthRecordInput, 
  WeightRecord, WeightRecordInput,
  LabResult, LabResultInput,
  Prescription, PrescriptionInput
} from '../types';

export const recordRepository = {
  async getHealthRecordsByCatId(catId: string): Promise<HealthRecord[]> {
    const db = await getDB();
    return db.getAllFromIndex('healthRecords', 'by-catId', catId);
  },

  async addHealthRecord(record: HealthRecordInput): Promise<HealthRecord> {
    const db = await getDB();
    const newRecord: HealthRecord = {
      ...record,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    await db.add('healthRecords', newRecord);
    return newRecord;
  },

  async updateHealthRecord(id: string, data: Partial<HealthRecord>): Promise<HealthRecord | undefined> {
    const db = await getDB();
    const existing = await db.get('healthRecords', id);
    if (!existing) return undefined;
    
    const updated: HealthRecord = { ...existing, ...data };
    await db.put('healthRecords', updated);
    return updated;
  },

  async deleteHealthRecord(id: string): Promise<void> {
    const db = await getDB();
    const tx = db.transaction(['healthRecords', 'labResults', 'prescriptions'], 'readwrite');
    
    await tx.objectStore('healthRecords').delete(id);
    
    const labResults = await tx.objectStore('labResults').index('by-recordId').getAll(id);
    for (const result of labResults) {
      await tx.objectStore('labResults').delete(result.id);
    }
    
    const prescriptions = await tx.objectStore('prescriptions').index('by-recordId').getAll(id);
    for (const rx of prescriptions) {
      await tx.objectStore('prescriptions').delete(rx.id);
    }
    
    await tx.done;
  },

  async getWeightRecordsByCatId(catId: string): Promise<WeightRecord[]> {
    const db = await getDB();
    return db.getAllFromIndex('weightRecords', 'by-catId', catId);
  },

  async addWeightRecord(record: WeightRecordInput): Promise<WeightRecord> {
    const db = await getDB();
    const newRecord: WeightRecord = {
      ...record,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    await db.add('weightRecords', newRecord);
    return newRecord;
  },

  async getLabResultsByRecordId(recordId: string): Promise<LabResult[]> {
    const db = await getDB();
    return db.getAllFromIndex('labResults', 'by-recordId', recordId);
  },

  async getLabResultsByCatId(catId: string, healthRecords: HealthRecord[]): Promise<LabResult[]> {
    const db = await getDB();
    const allResults: LabResult[] = [];
    
    for (const record of healthRecords) {
      const results = await db.getAllFromIndex('labResults', 'by-recordId', record.id);
      allResults.push(...results);
    }
    
    return allResults;
  },

  async addLabResults(results: LabResultInput[]): Promise<LabResult[]> {
    const db = await getDB();
    const tx = db.transaction('labResults', 'readwrite');
    const newResults: LabResult[] = [];
    
    for (const result of results) {
      const newResult: LabResult = {
        ...result,
        id: generateId(),
      };
      await tx.store.add(newResult);
      newResults.push(newResult);
    }
    
    await tx.done;
    return newResults;
  },

  async getPrescriptionsByRecordId(recordId: string): Promise<Prescription[]> {
    const db = await getDB();
    return db.getAllFromIndex('prescriptions', 'by-recordId', recordId);
  },

  async addPrescriptions(prescriptions: PrescriptionInput[]): Promise<Prescription[]> {
    const db = await getDB();
    const tx = db.transaction('prescriptions', 'readwrite');
    const newPrescriptions: Prescription[] = [];
    
    for (const rx of prescriptions) {
      const newRx: Prescription = {
        ...rx,
        id: generateId(),
      };
      await tx.store.add(newRx);
      newPrescriptions.push(newRx);
    }
    
    await tx.done;
    return newPrescriptions;
  },
};
