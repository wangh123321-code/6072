import React, { useState, useMemo, useRef, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Plus, Upload } from 'lucide-react';
import { useHealthStore, useCatStore } from '@/store';
import { useTimelineDrag } from '@/hooks/useTimelineDrag';
import { TimelineNode } from './TimelineNode';
import { TimelineDetailPanel } from './TimelineDetailPanel';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Input, Select, Textarea } from '@/components/common/Input';
import { formatDate, formatDateCN } from '@/utils/dateUtils';
import { RECORD_TYPE_LABELS } from '@/types';
import type { RecordType, HealthRecordInput, LabResultInput } from '@/types';
import { COMMON_INDICATORS } from '@/types';
import { cn } from '@/lib/utils';

export const HealthTimeline: React.FC = () => {
  const { currentCatId } = useCatStore();
  const { 
    healthRecords, 
    selectedRecordId, 
    selectRecord,
    addHealthRecord,
    addLabResults,
    timelineScale,
    setTimelineScale,
    timelineOffset,
    setTimelineOffset,
    isLoading,
  } = useHealthStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: formatDate(new Date()),
    type: 'checkup' as RecordType,
    hospital: '',
    doctor: '',
    title: '',
    description: '',
  });
  const [labEntries, setLabEntries] = useState<{ indicator: string; value: string }[]>([]);

  const sortedRecords = useMemo(() => {
    return [...healthRecords].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [healthRecords]);

  const { minDate, maxDate, dateRange } = useMemo(() => {
    if (sortedRecords.length === 0) {
      const now = new Date();
      const yearAgo = new Date();
      yearAgo.setFullYear(now.getFullYear() - 1);
      return { minDate: yearAgo, maxDate: now, dateRange: 365 * 24 * 60 * 60 * 1000 };
    }
    const min = new Date(sortedRecords[0].date);
    const max = new Date(sortedRecords[sortedRecords.length - 1].date);
    const padding = (max.getTime() - min.getTime()) * 0.1 || 30 * 24 * 60 * 60 * 1000;
    min.setTime(min.getTime() - padding);
    max.setTime(max.getTime() + padding);
    return { minDate: min, maxDate: max, dateRange: max.getTime() - min.getTime() };
  }, [sortedRecords]);

  const getPosition = useCallback((date: string) => {
    const time = new Date(date).getTime();
    return ((time - minDate.getTime()) / dateRange) * 100;
  }, [minDate, dateRange]);

  const {
    scale,
    offset,
    isDragging,
    handleWheel,
    handleMouseDown,
    setScale,
    setOffset,
  } = useTimelineDrag({
    minScale: 0.5,
    maxScale: 3.0,
    scaleStep: 0.1,
    onScaleChange: setTimelineScale,
    onOffsetChange: setTimelineOffset,
  });

  React.useEffect(() => {
    setScale(timelineScale);
    setOffset(timelineOffset);
  }, [timelineScale, timelineOffset, setScale, setOffset]);

  const handleAddLabEntry = () => {
    setLabEntries([...labEntries, { indicator: COMMON_INDICATORS[0].name, value: '' }]);
  };

  const handleRemoveLabEntry = (index: number) => {
    setLabEntries(labEntries.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCatId || !formData.title) return;

    const recordInput: HealthRecordInput = {
      ...formData,
      catId: currentCatId,
      pdfUrl: '',
      ocrText: '',
    };

    await addHealthRecord(recordInput);

    if (labEntries.filter(e => e.value).length > 0) {
      const newRecord = (await useHealthStore.getState().healthRecords).slice(-1)[0];
      if (newRecord) {
        const labResults: LabResultInput[] = labEntries
          .filter(e => e.value)
          .map(e => {
            const indicatorInfo = COMMON_INDICATORS.find(i => i.name === e.indicator);
            const value = parseFloat(e.value);
            const status = value < indicatorInfo!.min 
              ? 'low' 
              : value > indicatorInfo!.max 
                ? 'high' 
                : 'normal';
            return {
              recordId: newRecord.id,
              indicator: e.indicator,
              value,
              unit: indicatorInfo!.unit,
              minRange: indicatorInfo!.min,
              maxRange: indicatorInfo!.max,
              status,
            };
          });
        await addLabResults(labResults);
      }
    }

    setIsAddModalOpen(false);
    setLabEntries([]);
    setFormData({
      date: formatDate(new Date()),
      type: 'checkup',
      hospital: '',
      doctor: '',
      title: '',
      description: '',
    });
  };

  const yearMarkers = useMemo(() => {
    const markers = [];
    const startYear = minDate.getFullYear();
    const endYear = maxDate.getFullYear();
    for (let year = startYear; year <= endYear; year++) {
      for (let month = 0; month < 12; month += 3) {
        const date = new Date(year, month, 1);
        if (date >= minDate && date <= maxDate) {
          markers.push({
            date,
            label: `${year}年${month + 1}月`,
            isYear: month === 0,
          });
        }
      }
    }
    return markers;
  }, [minDate, maxDate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full" />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display text-gray-800">健康时间轴</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setScale(Math.max(0.5, scale - 0.1))}
            title="缩小"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-500 w-16 text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setScale(Math.min(3.0, scale + 0.1))}
            title="放大"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setScale(1);
              setOffset(0);
            }}
            title="重置视图"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="gap-2"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            添加记录
          </Button>
        </div>
      </div>

      <div className="text-sm text-gray-500 mb-4">
        提示：使用鼠标拖拽平移，滚轮缩放，Ctrl +/- 快捷键缩放，Ctrl + 0 重置视图
      </div>

      <div
        className={cn(
          'relative bg-white rounded-card shadow-card overflow-hidden',
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        )}
        style={{ height: '200px' }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
      >
        <div
          className="absolute inset-0 transition-transform duration-75"
          style={{
            transform: `translateX(${offset}px) scaleX(${scale})`,
            transformOrigin: 'left center',
          }}
        >
          <div className="absolute left-0 right-0" style={{ top: '50%', height: '3px' }}>
            <div className="h-full bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200" />
          </div>

          {yearMarkers.map((marker, idx) => {
            const position = ((marker.date.getTime() - minDate.getTime()) / dateRange) * 100;
            return (
              <div
                key={idx}
                className="absolute"
                style={{ left: `${position}%`, top: marker.isYear ? '25%' : '40%' }}
              >
                <div
                  className={cn(
                    'absolute bg-gray-300',
                    marker.isYear ? 'w-0.5 h-8' : 'w-0.5 h-4'
                  )}
                  style={{ left: '50%', transform: 'translateX(-50%)', top: '100%' }}
                />
                <div
                  className={cn(
                    'absolute text-xs text-gray-500 whitespace-nowrap',
                    marker.isYear ? 'font-medium text-gray-700' : ''
                  )}
                  style={{ left: '50%', transform: 'translateX(-50%)', top: marker.isYear ? '5%' : '10%' }}
                >
                  {marker.isYear ? marker.label : `${marker.date.getMonth() + 1}月`}
                </div>
              </div>
            );
          })}

          {sortedRecords.map((record) => (
            <TimelineNode
              key={record.id}
              record={record}
              isSelected={selectedRecordId === record.id}
              position={getPosition(record.date)}
              onClick={() => selectRecord(record.id)}
            />
          ))}
        </div>

        {sortedRecords.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <Upload className="w-12 h-12 mb-2 opacity-50" />
            <p>还没有健康记录</p>
            <p className="text-sm">点击上方按钮添加第一条记录</p>
          </div>
        )}
      </div>

      <TimelineDetailPanel />

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="添加健康记录"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="日期"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
            <Select
              label="类型"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as RecordType })}
              options={Object.entries(RECORD_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
            />
          </div>

          <Input
            label="记录标题"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="例如：年度体检、肠胃炎复诊等"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="医院名称"
              value={formData.hospital}
              onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
              placeholder="请输入医院名称"
            />
            <Input
              label="主治医生"
              value={formData.doctor}
              onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
              placeholder="请输入医生姓名"
            />
          </div>

          <Textarea
            label="诊断描述"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="请输入诊断结果和医嘱"
            rows={3}
          />

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">化验指标（可选）</label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAddLabEntry}
              >
                + 添加指标
              </Button>
            </div>
            <div className="space-y-2">
              {labEntries.map((entry, idx) => (
                <div key={idx} className="flex gap-2">
                  <Select
                    value={entry.indicator}
                    onChange={(e) => {
                      const newEntries = [...labEntries];
                      newEntries[idx].indicator = e.target.value;
                      setLabEntries(newEntries);
                    }}
                    options={COMMON_INDICATORS.map(i => ({ value: i.name, label: i.name }))}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    step="0.1"
                    value={entry.value}
                    onChange={(e) => {
                      const newEntries = [...labEntries];
                      newEntries[idx].value = e.target.value;
                      setLabEntries(newEntries);
                    }}
                    placeholder="数值"
                    className="w-32"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveLabEntry(idx)}
                    className="text-danger-500"
                  >
                    删除
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setIsAddModalOpen(false)}
            >
              取消
            </Button>
            <Button type="submit" className="flex-1">
              保存记录
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
