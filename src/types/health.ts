export type RecordType = 'checkup' | 'vaccine' | 'prescription' | 'lab' | 'surgery' | 'other';

export interface HealthRecord {
  id: string;
  catId: string;
  date: string;
  type: RecordType;
  hospital: string;
  doctor: string;
  title: string;
  description: string;
  pdfUrl: string;
  ocrText: string;
  createdAt: string;
}

export interface WeightRecord {
  id: string;
  catId: string;
  date: string;
  weight: number;
  source: string;
  createdAt: string;
}

export interface VaccineRecord {
  id: string;
  catId: string;
  name: string;
  date: string;
  nextDate: string;
  hospital: string;
  batchNo: string;
  createdAt: string;
}

export interface LabResult {
  id: string;
  recordId: string;
  indicator: string;
  value: number;
  unit: string;
  minRange: number;
  maxRange: number;
  status: 'normal' | 'low' | 'high';
}

export interface Prescription {
  id: string;
  recordId: string;
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface AbnormalIndicator {
  indicator: string;
  consecutiveCount: number;
  latestRecords: LabResult[];
  suggestion: string;
  severity: 'warning' | 'danger';
}

export type HealthRecordInput = Omit<HealthRecord, 'id' | 'createdAt'>;
export type WeightRecordInput = Omit<WeightRecord, 'id' | 'createdAt'>;
export type VaccineRecordInput = Omit<VaccineRecord, 'id' | 'createdAt'>;
export type LabResultInput = Omit<LabResult, 'id'>;
export type PrescriptionInput = Omit<Prescription, 'id'>;

export const RECORD_TYPE_LABELS: Record<RecordType, string> = {
  checkup: '常规检查',
  vaccine: '疫苗接种',
  prescription: '处方单',
  lab: '化验报告',
  surgery: '手术记录',
  other: '其他',
};

export const RECORD_TYPE_COLORS: Record<RecordType, string> = {
  checkup: '#7CB342',
  vaccine: '#42A5F5',
  prescription: '#FF8C42',
  lab: '#AB47BC',
  surgery: '#EF5350',
  other: '#78909C',
};

export const COMMON_INDICATORS = [
  { name: '白细胞计数 (WBC)', unit: '×10^9/L', min: 5.5, max: 19.5 },
  { name: '红细胞计数 (RBC)', unit: '×10^12/L', min: 5.0, max: 10.0 },
  { name: '血红蛋白 (HGB)', unit: 'g/L', min: 80, max: 150 },
  { name: '红细胞压积 (HCT)', unit: '%', min: 25, max: 45 },
  { name: '血小板计数 (PLT)', unit: '×10^9/L', min: 100, max: 500 },
  { name: '谷丙转氨酶 (ALT)', unit: 'U/L', min: 10, max: 100 },
  { name: '谷草转氨酶 (AST)', unit: 'U/L', min: 10, max: 50 },
  { name: '碱性磷酸酶 (ALP)', unit: 'U/L', min: 10, max: 80 },
  { name: '总胆红素 (TBIL)', unit: 'μmol/L', min: 2, max: 15 },
  { name: '白蛋白 (ALB)', unit: 'g/L', min: 25, max: 40 },
  { name: '球蛋白 (GLOB)', unit: 'g/L', min: 20, max: 45 },
  { name: '血糖 (GLU)', unit: 'mmol/L', min: 3.5, max: 6.5 },
  { name: '尿素氮 (BUN)', unit: 'mmol/L', min: 3.0, max: 9.0 },
  { name: '肌酐 (CREA)', unit: 'μmol/L', min: 60, max: 180 },
  { name: '总胆固醇 (CHOL)', unit: 'mmol/L', min: 2.5, max: 5.5 },
  { name: '甘油三酯 (TRIG)', unit: 'mmol/L', min: 0.3, max: 1.5 },
];
