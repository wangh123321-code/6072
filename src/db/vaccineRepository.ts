import { getDB, generateId } from './index';
import type { VaccineRecord, VaccineRecordInput } from '../types';

export const vaccineRepository = {
  async getByCatId(catId: string): Promise<VaccineRecord[]> {
    const db = await getDB();
    return db.getAllFromIndex('vaccineRecords', 'by-catId', catId);
  },

  async add(record: VaccineRecordInput): Promise<VaccineRecord> {
    const db = await getDB();
    const newRecord: VaccineRecord = {
      ...record,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    await db.add('vaccineRecords', newRecord);
    return newRecord;
  },

  async update(id: string, data: Partial<VaccineRecord>): Promise<VaccineRecord | undefined> {
    const db = await getDB();
    const existing = await db.get('vaccineRecords', id);
    if (!existing) return undefined;
    
    const updated: VaccineRecord = { ...existing, ...data };
    await db.put('vaccineRecords', updated);
    return updated;
  },

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('vaccineRecords', id);
  },

  async getUpcoming(catId: string, days: number = 30): Promise<VaccineRecord[]> {
    const records = await this.getByCatId(catId);
    const now = new Date();
    const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return records
      .filter(r => r.nextDate && new Date(r.nextDate) <= cutoff && new Date(r.nextDate) >= now)
      .sort((a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime());
  },
};
