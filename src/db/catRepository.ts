import { getDB, generateId } from './index';
import type { Cat, CatInput } from '../types';

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
};
