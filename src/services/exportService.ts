import { catRepository, type ExportData, type CatCompleteData } from '../db/catRepository';
import { logError } from '../utils/errorHandler';
import { RECORD_TYPE_LABELS } from '../types';
import type { Cat, HealthRecord, WeightRecord, VaccineRecord, LabResult, Prescription } from '../types';

export type ExportFormat = 'json' | 'csv';
export type ExportScope = 'current' | 'selected' | 'all';

export interface ExportOptions {
  format: ExportFormat;
  scope: ExportScope;
  selectedCatIds?: string[];
  includeWatermark?: boolean;
}

const EXPORT_VERSION = '1.0.0';
const WATERMARK_TEXT = '猫咪健康档案 - 仅用于个人备份，请勿商用';

const maskSensitiveData = (data: ExportData): ExportData => {
  const maskedCats = data.cats.map(catData => ({
    ...catData,
    healthRecords: catData.healthRecords.map(record => ({
      ...record,
      doctor: record.doctor ? record.doctor.replace(/./g, '*').slice(0, 1) + '医生' : '',
      hospital: record.hospital ? record.hospital.slice(0, 2) + '***' : '',
    })),
    vaccineRecords: catData.vaccineRecords.map(record => ({
      ...record,
      hospital: record.hospital ? record.hospital.slice(0, 2) + '***' : '',
      batchNo: record.batchNo ? record.batchNo.slice(0, 4) + '***' : '',
    })),
  }));

  return {
    ...data,
    cats: maskedCats,
  };
};

const addWatermarkToJson = (data: ExportData): ExportData & { _watermark: string; _exportInfo: string } => {
  return {
    ...data,
    _watermark: WATERMARK_TEXT,
    _exportInfo: `导出时间: ${new Date().toLocaleString('zh-CN')} | 版本: ${EXPORT_VERSION}`,
  };
};

const escapeCsvValue = (value: any): string => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const generateCsvContent = (data: ExportData, includeWatermark: boolean): string => {
  const lines: string[] = [];

  if (includeWatermark) {
    lines.push(`# ${WATERMARK_TEXT}`);
    lines.push(`# 导出时间: ${new Date().toLocaleString('zh-CN')}`);
    lines.push(`# 版本: ${EXPORT_VERSION}`);
    lines.push('');
  }

  lines.push('=== 猫咪基本信息 ===');
  lines.push(['猫咪ID', '姓名', '品种', '性别', '出生日期', '创建时间'].map(escapeCsvValue).join(','));
  data.cats.forEach(catData => {
    const cat = catData.cat;
    lines.push([
      cat.id,
      cat.name,
      cat.breed,
      cat.gender === 'male' ? '公猫' : '母猫',
      cat.birthday,
      cat.createdAt,
    ].map(escapeCsvValue).join(','));
  });
  lines.push('');

  lines.push('=== 健康记录 ===');
  lines.push(
    ['记录ID', '猫咪姓名', '日期', '类型', '医院', '医生', '标题', '描述'].map(escapeCsvValue).join(',')
  );
  data.cats.forEach(catData => {
    const catName = catData.cat.name;
    catData.healthRecords.forEach(record => {
      lines.push([
        record.id,
        catName,
        record.date,
        RECORD_TYPE_LABELS[record.type] || record.type,
        record.hospital,
        record.doctor,
        record.title,
        record.description,
      ].map(escapeCsvValue).join(','));
    });
  });
  lines.push('');

  lines.push('=== 体重记录 ===');
  lines.push(['记录ID', '猫咪姓名', '日期', '体重(kg)', '来源'].map(escapeCsvValue).join(','));
  data.cats.forEach(catData => {
    const catName = catData.cat.name;
    catData.weightRecords.forEach(record => {
      lines.push([
        record.id,
        catName,
        record.date,
        record.weight,
        record.source,
      ].map(escapeCsvValue).join(','));
    });
  });
  lines.push('');

  lines.push('=== 疫苗记录 ===');
  lines.push(
    ['记录ID', '猫咪姓名', '疫苗名称', '接种日期', '下次接种', '医院', '批号'].map(escapeCsvValue).join(',')
  );
  data.cats.forEach(catData => {
    const catName = catData.cat.name;
    catData.vaccineRecords.forEach(record => {
      lines.push([
        record.id,
        catName,
        record.name,
        record.date,
        record.nextDate,
        record.hospital,
        record.batchNo,
      ].map(escapeCsvValue).join(','));
    });
  });
  lines.push('');

  lines.push('=== 化验结果 ===');
  lines.push(
    ['结果ID', '记录ID', '猫咪姓名', '指标名称', '数值', '单位', '参考范围', '状态'].map(escapeCsvValue).join(',')
  );
  data.cats.forEach(catData => {
    const catName = catData.cat.name;
    catData.labResults.forEach(result => {
      const record = catData.healthRecords.find(r => r.id === result.recordId);
      lines.push([
        result.id,
        result.recordId,
        catName,
        result.indicator,
        result.value,
        result.unit,
        `${result.minRange}-${result.maxRange}`,
        result.status === 'normal' ? '正常' : result.status === 'low' ? '偏低' : '偏高',
      ].map(escapeCsvValue).join(','));
    });
  });
  lines.push('');

  lines.push('=== 处方记录 ===');
  lines.push(
    ['处方ID', '记录ID', '猫咪姓名', '药品名称', '剂量', '频率', '疗程'].map(escapeCsvValue).join(',')
  );
  data.cats.forEach(catData => {
    const catName = catData.cat.name;
    catData.prescriptions.forEach(rx => {
      lines.push([
        rx.id,
        rx.recordId,
        catName,
        rx.medicine,
        rx.dosage,
        rx.frequency,
        rx.duration,
      ].map(escapeCsvValue).join(','));
    });
  });

  return lines.join('\n');
};

const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const generateFilename = (format: ExportFormat, scope: ExportScope): string => {
  const dateStr = new Date().toISOString().split('T')[0];
  const scopeStr = scope === 'current' ? '当前猫咪' : scope === 'all' ? '全部猫咪' : '选中猫咪';
  return `猫咪健康档案_${scopeStr}_${dateStr}.${format}`;
};

export const exportService = {
  async exportData(options: ExportOptions): Promise<void> {
    try {
      const { format, scope, selectedCatIds, includeWatermark = true } = options;

      let catIdsToExport: string[] | undefined;

      switch (scope) {
        case 'current':
          const currentCatId = selectedCatIds?.[0];
          if (!currentCatId) {
            throw new Error('未选择当前猫咪');
          }
          catIdsToExport = [currentCatId];
          break;
        case 'selected':
          if (!selectedCatIds || selectedCatIds.length === 0) {
            throw new Error('请选择要导出的猫咪');
          }
          catIdsToExport = selectedCatIds;
          break;
        case 'all':
        default:
          catIdsToExport = undefined;
          break;
      }

      let exportData = await catRepository.getExportData(catIdsToExport);

      if (exportData.cats.length === 0) {
        throw new Error('没有可导出的数据');
      }

      exportData = maskSensitiveData(exportData);

      if (format === 'json') {
        const dataToExport = includeWatermark ? addWatermarkToJson(exportData) : exportData;
        const jsonContent = JSON.stringify(dataToExport, null, 2);
        const filename = generateFilename('json', scope);
        downloadFile(jsonContent, filename, 'application/json');
      } else if (format === 'csv') {
        const csvContent = generateCsvContent(exportData, includeWatermark);
        const filename = generateFilename('csv', scope);
        downloadFile('\uFEFF' + csvContent, filename, 'text/csv;charset=utf-8');
      }
    } catch (error) {
      logError(error, 'exportData');
      throw error;
    }
  },

  async getExportPreview(catIds?: string[]): Promise<{
    catCount: number;
    recordCount: number;
    dataSize: string;
  }> {
    try {
      const data = await catRepository.getExportData(catIds);
      const recordCount = data.cats.reduce((sum, cat) =>
        sum + cat.healthRecords.length +
        cat.weightRecords.length +
        cat.vaccineRecords.length +
        cat.labResults.length +
        cat.prescriptions.length,
        0
      );
      const jsonStr = JSON.stringify(data);
      const bytes = new Blob([jsonStr]).size;
      const dataSize = bytes < 1024 ? `${bytes} B` :
        bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` :
        `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

      return {
        catCount: data.cats.length,
        recordCount,
        dataSize,
      };
    } catch (error) {
      logError(error, 'getExportPreview');
      throw error;
    }
  },

  getSupportedFormats(): { value: ExportFormat; label: string; description: string }[] {
    return [
      { value: 'json', label: 'JSON 格式', description: '完整数据结构，适合备份和导入' },
      { value: 'csv', label: 'CSV 格式', description: '表格格式，适合用 Excel 打开' },
    ];
  },

  getExportScopes(): { value: ExportScope; label: string }[] {
    return [
      { value: 'current', label: '仅导出当前猫咪' },
      { value: 'all', label: '导出全部猫咪' },
    ];
  },
};
