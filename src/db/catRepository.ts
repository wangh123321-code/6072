import { getDB, generateId } from './index';
import type { Cat, CatInput, HealthRecord, WeightRecord, VaccineRecord, LabResult, Prescription } from '../types';

export interface CatCompleteData {
  cat: Cat;
  healthRecords: HealthRecord[];
  weightRecords: WeightRecord[];
  vaccineRecords: VaccineRecord[];
  labResults: LabResult[];
  prescriptions: Prescription[];
}

export interface ExportData {
  version: string;
  exportedAt: string;
  cats: CatCompleteData[];
}

export const catRepository = {
  async getAll(): Promise<Cat[]> {
    const db = await getDB();
    return db.getAll('cats');
  },

  async getById(id: string): Promise<Cat | undefined> {
    const db = await getDB();
    return db.get('cats', id);
  },

  async add(cat: CatInput): Promise<Cat> {
    const db = await getDB();
    const now = new Date().toISOString();
    const newCat: Cat = {
      ...cat,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    await db.add('cats', newCat);
    return newCat;
  },

  async update(id: string, data: Partial<Cat>): Promise<Cat | undefined> {
    const db = await getDB();
    const existing = await db.get('cats', id);
    if (!existing) return undefined;
    
    const updated: Cat = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await db.put('cats', updated);
    return updated;
  },

  async delete(id: string): Promise<void> {
    const db = await getDB();
    const tx = db.transaction(['cats', 'healthRecords', 'weightRecords', 'vaccineRecords', 'labResults', 'prescriptions'], 'readwrite');
    
    await tx.objectStore('cats').delete(id);
    
    const healthRecords = await tx.objectStore('healthRecords').index('by-catId').getAll(id);
    for (const record of healthRecords) {
      await tx.objectStore('healthRecords').delete(record.id);
      await tx.objectStore('labResults').index('by-recordId').getAll(record.id).then(ids => 
        Promise.all(ids.map(r => tx.objectStore('labResults').delete(r.id)))
      );
      await tx.objectStore('prescriptions').index('by-recordId').getAll(record.id).then(ids => 
        Promise.all(ids.map(r => tx.objectStore('prescriptions').delete(r.id)))
      );
    }
    
    const weightRecords = await tx.objectStore('weightRecords').index('by-catId').getAll(id);
    for (const record of weightRecords) {
      await tx.objectStore('weightRecords').delete(record.id);
    }
    
    const vaccineRecords = await tx.objectStore('vaccineRecords').index('by-catId').getAll(id);
    for (const record of vaccineRecords) {
      await tx.objectStore('vaccineRecords').delete(record.id);
    }
    
    await tx.done;
  },

  async getCompleteCatData(catId: string): Promise<CatCompleteData | null> {
    const db = await getDB();
    
    const cat = await db.get('cats', catId);
    if (!cat) return null;

    const [healthRecords, weightRecords, vaccineRecords] = await Promise.all([
      db.getAllFromIndex('healthRecords', 'by-catId', catId),
      db.getAllFromIndex('weightRecords', 'by-catId', catId),
      db.getAllFromIndex('vaccineRecords', 'by-catId', catId),
    ]);

    const recordIds = healthRecords.map(r => r.id);
    const labResults: LabResult[] = [];
    const prescriptions: Prescription[] = [];

    for (const recordId of recordIds) {
      const [recordLabResults, recordPrescriptions] = await Promise.all([
        db.getAllFromIndex('labResults', 'by-recordId', recordId),
        db.getAllFromIndex('prescriptions', 'by-recordId', recordId),
      ]);
      labResults.push(...recordLabResults);
      prescriptions.push(...recordPrescriptions);
    }

    return {
      cat,
      healthRecords,
      weightRecords,
      vaccineRecords,
      labResults,
      prescriptions,
    };
  },

  async getAllCompleteData(): Promise<CatCompleteData[]> {
    const cats = await this.getAll();
    const completeData: CatCompleteData[] = [];

    for (const cat of cats) {
      const data = await this.getCompleteCatData(cat.id);
      if (data) {
        completeData.push(data);
      }
    }

    return completeData;
  },

  async getExportData(catIds?: string[]): Promise<ExportData> {
    let catsData: CatCompleteData[];

    if (catIds && catIds.length > 0) {
      catsData = [];
      for (const id of catIds) {
        const data = await this.getCompleteCatData(id);
        if (data) {
          catsData.push(data);
        }
      }
    } else {
      catsData = await this.getAllCompleteData();
    }

    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      cats: catsData,
    };
  },
};
