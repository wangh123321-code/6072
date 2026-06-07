import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, User, FileText, Upload, Sparkles, Trash2, Pill, Droplets } from 'lucide-react';
import { useHealthStore } from '@/store';
import { Button } from '@/components/common/Button';
import { extractTextFromPdf } from '@/services/ocrService';
import { recordRepository } from '@/db/recordRepository';
import { formatDateCN } from '@/utils/dateUtils';
import { RECORD_TYPE_LABELS, RECORD_TYPE_COLORS } from '@/types';
import type { LabResult, Prescription } from '@/types';
import { cn } from '@/lib/utils';

export const TimelineDetailPanel: React.FC = () => {
  const { selectedRecordId, healthRecords, labResults, selectRecord, deleteRecord, updateOcrText } = useHealthStore();
  const [labData, setLabData] = useState<LabResult[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showOcrText, setShowOcrText] = useState(false);

  const selectedRecord = healthRecords.find(r => r.id === selectedRecordId);

  useEffect(() => {
    if (selectedRecordId) {
      Promise.all([
        recordRepository.getLabResultsByRecordId(selectedRecordId),
        recordRepository.getPrescriptionsByRecordId(selectedRecordId),
      ]).then(([lab, rx]) => {
        setLabData(lab);
        setPrescriptions(rx);
      });
    } else {
      setLabData([]);
      setPrescriptions([]);
    }
  }, [selectedRecordId]);

  if (!selectedRecord) return null;

  const color = RECORD_TYPE_COLORS[selectedRecord.type];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedRecordId) return;

    setIsUploading(true);
    try {
      const result = await extractTextFromPdf(file);
      if (result.success) {
        await updateOcrText(selectedRecordId, result.text);
      }
    } catch (error) {
      console.error('OCR failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRecordId) return;
    if (confirm('确定要删除这条记录吗？')) {
      await deleteRecord(selectedRecordId);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[480px] bg-white shadow-2xl z-40 animate-slide-in-right flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: color }}
            >
              {RECORD_TYPE_LABELS[selectedRecord.type]}
            </span>
          </div>
          <h3 className="text-xl font-display text-gray-800">{selectedRecord.title}</h3>
        </div>
        <button
          onClick={() => selectRecord(null)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-warm-50 rounded-xl">
            <Calendar className="w-5 h-5 text-primary-500" />
            <div>
              <div className="text-xs text-gray-500">日期</div>
              <div className="font-medium text-gray-800">{formatDateCN(selectedRecord.date)}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-warm-50 rounded-xl">
            <MapPin className="w-5 h-5 text-primary-500" />
            <div>
              <div className="text-xs text-gray-500">医院</div>
              <div className="font-medium text-gray-800">{selectedRecord.hospital || '-'}</div>
            </div>
          </div>
        </div>

        {selectedRecord.doctor && (
          <div className="flex items-center gap-3 p-3 bg-warm-50 rounded-xl">
            <User className="w-5 h-5 text-primary-500" />
            <div>
              <div className="text-xs text-gray-500">主治医生</div>
              <div className="font-medium text-gray-800">{selectedRecord.doctor}</div>
            </div>
          </div>
        )}

        {selectedRecord.description && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">诊断描述</h4>
            <p className="text-gray-600 bg-warm-50 rounded-xl p-4 leading-relaxed">
              {selectedRecord.description}
            </p>
          </div>
        )}

        {labData.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Droplets className="w-5 h-5 text-success-500" />
              <h4 className="text-sm font-medium text-gray-700">化验结果</h4>
            </div>
            <div className="space-y-2">
              {labData.map((result) => {
                const isAbnormal = result.status !== 'normal';
                return (
                  <div
                    key={result.id}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-xl border transition-colors',
                      isAbnormal
                        ? 'bg-danger-50 border-danger-200'
                        : 'bg-white border-gray-100'
                    )}
                  >
                    <div className="flex-1">
                      <div className={cn(
                        'text-sm font-medium',
                        isAbnormal ? 'text-danger-700' : 'text-gray-800'
                      )}>
                        {result.indicator}
                      </div>
                      <div className="text-xs text-gray-500">
                        参考范围: {result.minRange} - {result.maxRange} {result.unit}
                      </div>
                    </div>
                    <div className={cn(
                      'text-lg font-bold',
                      isAbnormal ? 'text-danger-500' : 'text-success-600'
                    )}>
                      {result.value}
                      <span className="text-sm font-normal ml-1">{result.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {prescriptions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Pill className="w-5 h-5 text-primary-500" />
              <h4 className="text-sm font-medium text-gray-700">处方</h4>
            </div>
            <div className="space-y-2">
              {prescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="p-4 bg-primary-50 rounded-xl border border-primary-100"
                >
                  <div className="font-medium text-gray-800 mb-2">{rx.medicine}</div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>剂量: {rx.dosage}</div>
                    <div>频次: {rx.frequency}</div>
                    <div className="col-span-2">疗程: {rx.duration}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedRecord.ocrText && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-500" />
                <h4 className="text-sm font-medium text-gray-700">OCR 识别结果</h4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOcrText(!showOcrText)}
              >
                {showOcrText ? '收起' : '展开'}
              </Button>
            </div>
            {showOcrText && (
              <pre className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 whitespace-pre-wrap font-mono max-h-60 overflow-y-auto">
                {selectedRecord.ocrText}
              </pre>
            )}
          </div>
        )}

        <div className="pt-4 border-t border-gray-100">
          <label className="block">
            <input
              type="file"
              accept=".pdf,image/*"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <Button
              variant="secondary"
              className="w-full justify-center gap-2"
              onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
              loading={isUploading}
            >
              <Upload className="w-4 h-4" />
              上传PDF报告并识别
            </Button>
          </label>
          {isUploading && (
            <div className="flex items-center gap-2 mt-2 text-sm text-primary-600">
              <Sparkles className="w-4 h-4 animate-spin" />
              正在进行OCR文字识别...
            </div>
          )}
        </div>
      </div>

      <div className="p-6 border-t border-gray-100">
        <Button
          variant="danger"
          className="w-full justify-center gap-2"
          onClick={handleDelete}
        >
          <Trash2 className="w-4 h-4" />
          删除记录
        </Button>
      </div>
    </div>
  );
};
