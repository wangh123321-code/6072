import { openDB, IDBPDatabase } from 'idb';
import type { Cat, HealthRecord, WeightRecord, VaccineRecord, LabResult, Prescription } from '../types';

const DB_NAME = 'catHealthDB';
const DB_VERSION = 1;

interface CatHealthDBSchema {
  cats: {
    key: string;
    value: Cat;
    indexes: { 'by-name': string };
  };
  healthRecords: {
    key: string;
    value: HealthRecord;
    indexes: { 'by-catId': string; 'by-date': string };
  };
  weightRecords: {
    key: string;
    value: WeightRecord;
    indexes: { 'by-catId': string; 'by-date': string };
  };
  vaccineRecords: {
    key: string;
    value: VaccineRecord;
    indexes: { 'by-catId': string; 'by-date': string };
  };
  labResults: {
    key: string;
    value: LabResult;
    indexes: { 'by-recordId': string; 'by-indicator': string };
  };
  prescriptions: {
    key: string;
    value: Prescription;
    indexes: { 'by-recordId': string };
  };
}

export type CatHealthDB = IDBPDatabase<CatHealthDBSchema>;

let dbPromise: Promise<CatHealthDB> | null = null;

export function getDB(): Promise<CatHealthDB> {
  if (!dbPromise) {
    dbPromise = openDB<CatHealthDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('cats')) {
          const catStore = db.createObjectStore('cats', { keyPath: 'id' });
          catStore.createIndex('by-name', 'name', { unique: false });
        }

        if (!db.objectStoreNames.contains('healthRecords')) {
          const healthStore = db.createObjectStore('healthRecords', { keyPath: 'id' });
          healthStore.createIndex('by-catId', 'catId', { unique: false });
          healthStore.createIndex('by-date', 'date', { unique: false });
        }

        if (!db.objectStoreNames.contains('weightRecords')) {
          const weightStore = db.createObjectStore('weightRecords', { keyPath: 'id' });
          weightStore.createIndex('by-catId', 'catId', { unique: false });
          weightStore.createIndex('by-date', 'date', { unique: false });
        }

        if (!db.objectStoreNames.contains('vaccineRecords')) {
          const vaccineStore = db.createObjectStore('vaccineRecords', { keyPath: 'id' });
          vaccineStore.createIndex('by-catId', 'catId', { unique: false });
          vaccineStore.createIndex('by-date', 'date', { unique: false });
        }

        if (!db.objectStoreNames.contains('labResults')) {
          const labStore = db.createObjectStore('labResults', { keyPath: 'id' });
          labStore.createIndex('by-recordId', 'recordId', { unique: false });
          labStore.createIndex('by-indicator', 'indicator', { unique: false });
        }

        if (!db.objectStoreNames.contains('prescriptions')) {
          const rxStore = db.createObjectStore('prescriptions', { keyPath: 'id' });
          rxStore.createIndex('by-recordId', 'recordId', { unique: false });
        }
      },
    });
  }
  return dbPromise;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
