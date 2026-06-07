import React, { useState, useEffect } from 'react';
import { X, Download, FileJson, FileSpreadsheet, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Input';
import { exportService, type ExportFormat, type ExportScope } from '@/services/exportService';
import { useCatStore } from '@/store';
import { cn } from '@/lib/utils';
import type { Cat } from '@/types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ExportPreview {
  catCount: number;
  recordCount: number;
  dataSize: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { cats, currentCatId } = useCatStore();
  const [format, setFormat] = useState<ExportFormat>('json');
  const [scope, setScope] = useState<ExportScope>('current');
  const [isExporting, setIsExporting] = useState(false);
  const [preview, setPreview] = useState<ExportPreview | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationInput, setVerificationInput] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const currentCat = cats.find(c => c.id === currentCatId);
  const verificationText = scope === 'all' ? '导出全部' : currentCat ? `导出${currentCat.name}` : '导出';

  useEffect(() => {
    if (isOpen) {
      setFormat('json');
      setScope('current');
      setIsExporting(false);
      setPreview(null);
      setExportSuccess(false);
      setError(null);
      setVerificationInput('');
      setIsVerified(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchPreview = async () => {
      if (!isOpen) return;
      
      setIsLoadingPreview(true);
      setPreview(null);
      setError(null);

      try {
        const catIds = scope === 'current' && currentCatId ? [currentCatId] : undefined;
        const previewData = await exportService.getExportPreview(catIds);
        setPreview(previewData);
      } catch (err) {
        setError('获取导出预览失败，请重试');
      } finally {
        setIsLoadingPreview(false);
      }
    };

    fetchPreview();
  }, [isOpen, scope, currentCatId]);

  useEffect(() => {
    setIsVerified(verificationInput === verificationText);
  }, [verificationInput, verificationText]);

  const handleExport = async () => {
    if (!isVerified) return;

    setIsExporting(true);
    setError(null);
    setExportSuccess(false);

    try {
      await exportService.exportData({
        format,
        scope,
        selectedCatIds: currentCatId ? [currentCatId] : undefined,
        includeWatermark: true,
      });

      setExportSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    if (!isExporting) {
      onClose();
    }
  };

  const formatOptions = exportService.getSupportedFormats();
  const scopeOptions = exportService.getExportScopes();

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="数据导出备份"
      size="md"
    >
      {exportSuccess ? (
        <div className="flex flex-col items-center py-8">
          <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-success-500" />
          </div>
          <h3 className="text-xl font-display text-gray-800 mb-2">导出成功！</h3>
          <p className="text-gray-500">数据文件已下载到您的设备</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-warning-50 border border-warning-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-800 mb-1">导出前请确认</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 导出数据包含所选猫咪的所有健康记录</li>
                  <li>• 敏感信息（医院、医生姓名等）已脱敏处理</li>
                  <li>• 导出文件包含版本水印，仅供个人备份使用</li>
                  <li>• 请妥善保管导出文件，避免数据泄露</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                导出范围
              </label>
              <div className="grid grid-cols-2 gap-3">
                {scopeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setScope(option.value)}
                    className={cn(
                      'px-4 py-3 rounded-xl border-2 transition-all text-left',
                      scope === option.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    )}
                  >
                    <div className="font-medium">{option.label}</div>
                    {option.value === 'current' && currentCat && (
                      <div className="text-xs text-gray-500 mt-1">
                        {currentCat.name}
                      </div>
                    )}
                    {option.value === 'all' && (
                      <div className="text-xs text-gray-500 mt-1">
                        共 {cats.length} 只猫咪
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                导出格式
              </label>
              <div className="grid grid-cols-2 gap-3">
                {formatOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormat(option.value)}
                    className={cn(
                      'px-4 py-3 rounded-xl border-2 transition-all text-left',
                      format === option.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {option.value === 'json' ? (
                        <FileJson className="w-4 h-4" />
                      ) : (
                        <FileSpreadsheet className="w-4 h-4" />
                      )}
                      <span className="font-medium">{option.label}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {option.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {preview && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-medium text-gray-700 mb-3">导出预览</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary-600">
                    {preview.catCount}
                  </div>
                  <div className="text-xs text-gray-500">猫咪档案</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary-600">
                    {preview.recordCount}
                  </div>
                  <div className="text-xs text-gray-500">数据记录</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary-600">
                    {preview.dataSize}
                  </div>
                  <div className="text-xs text-gray-500">文件大小</div>
                </div>
              </div>
            </div>
          )}

          {isLoadingPreview && (
            <div className="bg-gray-50 rounded-xl p-4 text-center text-gray-500">
              正在加载预览...
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              操作验证
            </label>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-3">
                为确保您了解此操作，请输入下方文字进行验证：
              </p>
              <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 mb-3 font-mono text-sm text-primary-600 text-center">
                {verificationText}
              </div>
              <input
                type="text"
                value={verificationInput}
                onChange={(e) => setVerificationInput(e.target.value)}
                placeholder={`请输入：${verificationText}`}
                className={cn(
                  'w-full px-4 py-2.5 rounded-xl border transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
                  isVerified
                    ? 'border-success-300 bg-success-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
                disabled={isExporting}
              />
              {verificationInput && !isVerified && (
                <p className="text-xs text-danger-500 mt-1">
                  输入内容不匹配，请重新输入
                </p>
              )}
              {isVerified && (
                <p className="text-xs text-success-500 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  验证通过
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-danger-50 border border-danger-200 rounded-xl p-3 text-sm text-danger-600">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={handleClose}
              disabled={isExporting}
            >
              取消
            </Button>
            <Button
              type="button"
              className="flex-1 gap-2"
              onClick={handleExport}
              disabled={!isVerified || isExporting || isLoadingPreview}
              loading={isExporting}
            >
              <Download className="w-4 h-4" />
              {isExporting ? '导出中...' : '确认导出'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
