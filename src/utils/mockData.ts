import type { Cat, HealthRecord, WeightRecord, VaccineRecord, LabResult, Prescription } from '../types';
import { generateId } from '../db';

export function createMockData(): {
  cats: Cat[];
  healthRecords: HealthRecord[];
  weightRecords: WeightRecord[];
  vaccineRecords: VaccineRecord[];
  labResults: LabResult[];
  prescriptions: Prescription[];
} {
  const now = new Date();
  const cat1Id = generateId();
  const cat2Id = generateId();
  const cat3Id = generateId();
  const cat4Id = generateId();
  const cat5Id = generateId();

  const cats: Cat[] = [
    {
      id: cat1Id,
      name: '橘子',
      breed: '英国短毛猫',
      birthday: '2022-03-15',
      gender: 'male',
      avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20orange%20british%20shorthair%20cat%20portrait%20round%20face%20big%20eyes&image_size=square',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: cat2Id,
      name: '雪球',
      breed: '布偶猫',
      birthday: '2023-06-20',
      gender: 'female',
      avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20white%20ragdoll%20cat%20portrait%20blue%20eyes%20fluffy&image_size=square',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: cat3Id,
      name: '煤球',
      breed: '中华田园猫',
      birthday: '2021-11-05',
      gender: 'male',
      avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20black%20chinese%20garden%20cat%20portrait%20yellow%20eyes&image_size=square',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: cat4Id,
      name: '布丁',
      breed: '美国短毛猫',
      birthday: '2024-01-10',
      gender: 'female',
      avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20brown%20american%20shorthair%20cat%20tabby%20portrait&image_size=square',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: cat5Id,
      name: '奶茶',
      breed: '暹罗猫',
      birthday: '2023-09-18',
      gender: 'female',
      avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20siamese%20cat%20portrait%20blue%20eyes&image_size=square',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
  ];

  const healthRecords: HealthRecord[] = [];
  const weightRecords: WeightRecord[] = [];
  const vaccineRecords: VaccineRecord[] = [];
  const labResults: LabResult[] = [];
  const prescriptions: Prescription[] = [];

  const baseDate1 = new Date('2024-01-15');
  for (let i = 0; i < 12; i++) {
    const date = new Date(baseDate1);
    date.setMonth(date.getMonth() + i);
    
    const weight = 3.5 + i * 0.15 + (Math.random() - 0.5) * 0.2;
    weightRecords.push({
      id: generateId(),
      catId: cat1Id,
      date: date.toISOString().split('T')[0],
      weight: Math.round(weight * 10) / 10,
      source: i % 3 === 0 ? '医院体检' : '家用体重秤',
      createdAt: now.toISOString(),
    });
  }

  const baseDate2 = new Date('2023-09-01');
  for (let i = 0; i < 10; i++) {
    const date = new Date(baseDate2);
    date.setMonth(date.getMonth() + i);
    
    const weight = 1.5 + i * 0.35 + (Math.random() - 0.5) * 0.3;
    weightRecords.push({
      id: generateId(),
      catId: cat2Id,
      date: date.toISOString().split('T')[0],
      weight: Math.round(weight * 10) / 10,
      source: i % 2 === 0 ? '医院体检' : '家用体重秤',
      createdAt: now.toISOString(),
    });
  }

  const checkupDates1 = ['2024-03-15', '2024-06-20', '2024-09-18', '2025-01-10'];
  checkupDates1.forEach((date, idx) => {
    const recordId = generateId();
    healthRecords.push({
      id: recordId,
      catId: cat1Id,
      date,
      type: 'checkup',
      hospital: '爱宠宠物医院',
      doctor: idx % 2 === 0 ? '王医生' : '李医生',
      title: '常规体检',
      description: '年度常规健康检查，包含血常规和生化检查。',
      pdfUrl: '',
      ocrText: '',
      createdAt: now.toISOString(),
    });

    const indicators = [
      { name: '白细胞计数 (WBC)', unit: '×10^9/L', min: 5.5, max: 19.5, base: 12 },
      { name: '红细胞计数 (RBC)', unit: '×10^12/L', min: 5.0, max: 10.0, base: 7.5 },
      { name: '血红蛋白 (HGB)', unit: 'g/L', min: 80, max: 150, base: 130 },
      { name: '红细胞压积 (HCT)', unit: '%', min: 25, max: 45, base: 38 },
      { name: '血小板计数 (PLT)', unit: '×10^9/L', min: 100, max: 500, base: 280 },
      { name: '谷丙转氨酶 (ALT)', unit: 'U/L', min: 10, max: 100, base: 45 },
      { name: '谷草转氨酶 (AST)', unit: 'U/L', min: 10, max: 50, base: 35 },
      { name: '血糖 (GLU)', unit: 'mmol/L', min: 3.5, max: 6.5, base: 5.2 },
      { name: '尿素氮 (BUN)', unit: 'mmol/L', min: 3.0, max: 9.0, base: 6.5 },
      { name: '肌酐 (CREA)', unit: 'μmol/L', min: 60, max: 180, base: 120 },
    ];

    indicators.forEach((ind) => {
      const anomalyFactor = idx >= 2 ? (ind.name.includes('谷丙') ? 1.8 : 1) : 1;
      const value = ind.base * anomalyFactor + (Math.random() - 0.5) * ind.base * 0.1;
      const status = value < ind.min ? 'low' : value > ind.max ? 'high' : 'normal';
      
      labResults.push({
        id: generateId(),
        recordId,
        indicator: ind.name,
        value: Math.round(value * 10) / 10,
        unit: ind.unit,
        minRange: ind.min,
        maxRange: ind.max,
        status,
      });
    });
  });

  const vaccineDates1 = [
    { date: '2024-03-15', nextDate: '2025-03-15', name: '猫三联疫苗' },
    { date: '2024-03-15', nextDate: '2025-03-15', name: '狂犬疫苗' },
    { date: '2024-09-20', nextDate: '2025-09-20', name: '体内外驱虫' },
  ];

  vaccineDates1.forEach((v) => {
    const recordId = generateId();
    healthRecords.push({
      id: recordId,
      catId: cat1Id,
      date: v.date,
      type: 'vaccine',
      hospital: '爱宠宠物医院',
      doctor: '李医生',
      title: `${v.name}接种`,
      description: `${v.name}接种完成，下次接种时间：${v.nextDate}`,
      pdfUrl: '',
      ocrText: '',
      createdAt: now.toISOString(),
    });

    vaccineRecords.push({
      id: generateId(),
      catId: cat1Id,
      name: v.name,
      date: v.date,
      nextDate: v.nextDate,
      hospital: '爱宠宠物医院',
      batchNo: `BATCH${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      createdAt: now.toISOString(),
    });
  });

  const rxRecordId = generateId();
  healthRecords.push({
    id: rxRecordId,
    catId: cat1Id,
    date: '2024-08-10',
    type: 'prescription',
    hospital: '爱宠宠物医院',
    doctor: '张医生',
    title: '肠胃炎处方',
    description: '诊断为肠胃炎，开具药物治疗。',
    pdfUrl: '',
    ocrText: '',
    createdAt: now.toISOString(),
  });

  prescriptions.push(
    {
      id: generateId(),
      recordId: rxRecordId,
      medicine: '益生菌',
      dosage: '每次1袋',
      frequency: '每日2次，饭后服用',
      duration: '7天',
    },
    {
      id: generateId(),
      recordId: rxRecordId,
      medicine: '奥美拉唑',
      dosage: '每次半片（10mg）',
      frequency: '每日1次，空腹服用',
      duration: '5天',
    }
  );

  const checkupDates2 = ['2023-12-01', '2024-03-10', '2024-06-15', '2024-09-20', '2025-01-05'];
  checkupDates2.forEach((date, idx) => {
    const recordId = generateId();
    healthRecords.push({
      id: recordId,
      catId: cat2Id,
      date,
      type: 'checkup',
      hospital: '萌宠宠物诊所',
      doctor: idx % 2 === 0 ? '陈医生' : '刘医生',
      title: '常规体检',
      description: '幼猫成长健康检查。',
      pdfUrl: '',
      ocrText: '',
      createdAt: now.toISOString(),
    });

    const indicators = [
      { name: '白细胞计数 (WBC)', unit: '×10^9/L', min: 5.5, max: 19.5, base: 10 },
      { name: '红细胞计数 (RBC)', unit: '×10^12/L', min: 5.0, max: 10.0, base: 6.5 },
      { name: '血红蛋白 (HGB)', unit: 'g/L', min: 80, max: 150, base: 110 },
      { name: '红细胞压积 (HCT)', unit: '%', min: 25, max: 45, base: 32 },
      { name: '血小板计数 (PLT)', unit: '×10^9/L', min: 100, max: 500, base: 250 },
      { name: '谷丙转氨酶 (ALT)', unit: 'U/L', min: 10, max: 100, base: 35 },
      { name: '血糖 (GLU)', unit: 'mmol/L', min: 3.5, max: 6.5, base: 4.8 },
      { name: '总胆固醇 (CHOL)', unit: 'mmol/L', min: 2.5, max: 5.5, base: 3.5 },
    ];

    indicators.forEach((ind) => {
      const value = ind.base + (Math.random() - 0.5) * ind.base * 0.15;
      const status = value < ind.min ? 'low' : value > ind.max ? 'high' : 'normal';
      
      labResults.push({
        id: generateId(),
        recordId,
        indicator: ind.name,
        value: Math.round(value * 10) / 10,
        unit: ind.unit,
        minRange: ind.min,
        maxRange: ind.max,
        status,
      });
    });
  });

  const baseDate3 = new Date('2022-03-01');
  for (let i = 0; i < 8; i++) {
    const date = new Date(baseDate3);
    date.setMonth(date.getMonth() + i);
    
    const weight = 4.0 + i * 0.1 + (Math.random() - 0.5) * 0.2;
    weightRecords.push({
      id: generateId(),
      catId: cat3Id,
      date: date.toISOString().split('T')[0],
      weight: Math.round(weight * 10) / 10,
      source: i % 2 === 0 ? '医院体检' : '家用体重秤',
      createdAt: now.toISOString(),
    });
  }

  const checkupDates3 = ['2023-06-15', '2023-12-20', '2024-06-10'];
  checkupDates3.forEach((date, idx) => {
    const recordId = generateId();
    healthRecords.push({
      id: recordId,
      catId: cat3Id,
      date,
      type: 'checkup',
      hospital: '爱宠宠物医院',
      doctor: '王医生',
      title: '常规体检',
      description: '年度健康检查。',
      pdfUrl: '',
      ocrText: '',
      createdAt: now.toISOString(),
    });

    const indicators3 = [
      { name: '白细胞计数 (WBC)', unit: '×10^9/L', min: 5.5, max: 19.5, base: 14 },
      { name: '红细胞计数 (RBC)', unit: '×10^12/L', min: 5.0, max: 10.0, base: 8.0 },
      { name: '血红蛋白 (HGB)', unit: 'g/L', min: 80, max: 150, base: 140 },
      { name: '血小板计数 (PLT)', unit: '×10^9/L', min: 100, max: 500, base: 320 },
    ];

    indicators3.forEach((ind) => {
      const value = ind.base + (Math.random() - 0.5) * ind.base * 0.1;
      const status = value < ind.min ? 'low' : value > ind.max ? 'high' : 'normal';
      
      labResults.push({
        id: generateId(),
        recordId,
        indicator: ind.name,
        value: Math.round(value * 10) / 10,
        unit: ind.unit,
        minRange: ind.min,
        maxRange: ind.max,
        status,
      });
    });
  });

  const vaccineDates3 = [
    { date: '2023-06-15', nextDate: '2024-06-15', name: '猫三联疫苗' },
    { date: '2023-06-15', nextDate: '2024-06-15', name: '狂犬疫苗' },
  ];
  vaccineDates3.forEach((v) => {
    vaccineRecords.push({
      id: generateId(),
      catId: cat3Id,
      name: v.name,
      date: v.date,
      nextDate: v.nextDate,
      hospital: '爱宠宠物医院',
      batchNo: `BATCH${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      createdAt: now.toISOString(),
    });
  });

  const baseDate4 = new Date('2024-03-01');
  for (let i = 0; i < 5; i++) {
    const date = new Date(baseDate4);
    date.setMonth(date.getMonth() + i);
    
    const weight = 1.2 + i * 0.3 + (Math.random() - 0.5) * 0.15;
    weightRecords.push({
      id: generateId(),
      catId: cat4Id,
      date: date.toISOString().split('T')[0],
      weight: Math.round(weight * 10) / 10,
      source: '家用体重秤',
      createdAt: now.toISOString(),
    });
  }

  const checkupDates4 = ['2024-04-10', '2024-07-15'];
  checkupDates4.forEach((date, idx) => {
    const recordId = generateId();
    healthRecords.push({
      id: recordId,
      catId: cat4Id,
      date,
      type: 'checkup',
      hospital: '萌宠宠物诊所',
      doctor: '陈医生',
      title: '幼猫体检',
      description: '幼猫成长发育检查。',
      pdfUrl: '',
      ocrText: '',
      createdAt: now.toISOString(),
    });

    const indicators4 = [
      { name: '白细胞计数 (WBC)', unit: '×10^9/L', min: 5.5, max: 19.5, base: 11 },
      { name: '红细胞计数 (RBC)', unit: '×10^12/L', min: 5.0, max: 10.0, base: 6.0 },
      { name: '血红蛋白 (HGB)', unit: 'g/L', min: 80, max: 150, base: 100 },
    ];

    indicators4.forEach((ind) => {
      const value = ind.base + (Math.random() - 0.5) * ind.base * 0.12;
      const status = value < ind.min ? 'low' : value > ind.max ? 'high' : 'normal';
      
      labResults.push({
        id: generateId(),
        recordId,
        indicator: ind.name,
        value: Math.round(value * 10) / 10,
        unit: ind.unit,
        minRange: ind.min,
        maxRange: ind.max,
        status,
      });
    });
  });

  const vaccineDates4 = [
    { date: '2024-04-10', nextDate: '2025-04-10', name: '猫三联疫苗' },
    { date: '2024-04-10', nextDate: '2025-04-10', name: '狂犬疫苗' },
    { date: '2024-07-15', nextDate: '2024-10-15', name: '体内外驱虫' },
  ];
  vaccineDates4.forEach((v) => {
    vaccineRecords.push({
      id: generateId(),
      catId: cat4Id,
      name: v.name,
      date: v.date,
      nextDate: v.nextDate,
      hospital: '萌宠宠物诊所',
      batchNo: `BATCH${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      createdAt: now.toISOString(),
    });
  });

  const baseDate5 = new Date('2023-12-01');
  for (let i = 0; i < 7; i++) {
    const date = new Date(baseDate5);
    date.setMonth(date.getMonth() + i);
    
    const weight = 2.0 + i * 0.25 + (Math.random() - 0.5) * 0.1;
    weightRecords.push({
      id: generateId(),
      catId: cat5Id,
      date: date.toISOString().split('T')[0],
      weight: Math.round(weight * 10) / 10,
      source: i % 3 === 0 ? '医院体检' : '家用体重秤',
      createdAt: now.toISOString(),
    });
  }

  const checkupDates5 = ['2024-03-20', '2024-06-25'];
  checkupDates5.forEach((date, idx) => {
    const recordId = generateId();
    healthRecords.push({
      id: recordId,
      catId: cat5Id,
      date,
      type: 'checkup',
      hospital: '爱宠宠物医院',
      doctor: '李医生',
      title: '常规体检',
      description: '暹罗猫健康检查。',
      pdfUrl: '',
      ocrText: '',
      createdAt: now.toISOString(),
    });

    const indicators5 = [
      { name: '白细胞计数 (WBC)', unit: '×10^9/L', min: 5.5, max: 19.5, base: 10.5 },
      { name: '红细胞计数 (RBC)', unit: '×10^12/L', min: 5.0, max: 10.0, base: 7.0 },
      { name: '血红蛋白 (HGB)', unit: 'g/L', min: 80, max: 150, base: 120 },
      { name: '血小板计数 (PLT)', unit: '×10^9/L', min: 100, max: 500, base: 300 },
      { name: '谷丙转氨酶 (ALT)', unit: 'U/L', min: 10, max: 100, base: 40 },
    ];

    indicators5.forEach((ind) => {
      const value = ind.base + (Math.random() - 0.5) * ind.base * 0.1;
      const status = value < ind.min ? 'low' : value > ind.max ? 'high' : 'normal';
      
      labResults.push({
        id: generateId(),
        recordId,
        indicator: ind.name,
        value: Math.round(value * 10) / 10,
        unit: ind.unit,
        minRange: ind.min,
        maxRange: ind.max,
        status,
      });
    });
  });

  const vaccineDates5 = [
    { date: '2024-03-20', nextDate: '2025-03-20', name: '猫三联疫苗' },
    { date: '2024-03-20', nextDate: '2025-03-20', name: '狂犬疫苗' },
  ];
  vaccineDates5.forEach((v) => {
    vaccineRecords.push({
      id: generateId(),
      catId: cat5Id,
      name: v.name,
      date: v.date,
      nextDate: v.nextDate,
      hospital: '爱宠宠物医院',
      batchNo: `BATCH${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      createdAt: now.toISOString(),
    });
  });

  return { cats, healthRecords, weightRecords, vaccineRecords, labResults, prescriptions };
}

export async function seedMockData(): Promise<void> {
  const { getDB } = await import('../db');
  const { cats, healthRecords, weightRecords, vaccineRecords, labResults, prescriptions } = createMockData();
  
  const db = await getDB();
  const tx = db.transaction(
    ['cats', 'healthRecords', 'weightRecords', 'vaccineRecords', 'labResults', 'prescriptions'],
    'readwrite'
  );
  
  for (const cat of cats) await tx.objectStore('cats').put(cat);
  for (const record of healthRecords) await tx.objectStore('healthRecords').put(record);
  for (const record of weightRecords) await tx.objectStore('weightRecords').put(record);
  for (const record of vaccineRecords) await tx.objectStore('vaccineRecords').put(record);
  for (const result of labResults) await tx.objectStore('labResults').put(result);
  for (const rx of prescriptions) await tx.objectStore('prescriptions').put(rx);
  
  await tx.done;
}
