import React, { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { TrendingUp, TrendingDown, Minus, Plus, Scale } from 'lucide-react';
import { useCatStore, useHealthStore } from '@/store';
import { useWeightAnalysis } from '@/hooks/useWeightAnalysis';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { formatDate, formatDateCN } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';
import type { WeightRecordInput } from '@/types';

export const WeightChart: React.FC = () => {
  const { currentCat, cats } = useCatStore();
  const { weightRecords, addWeightRecord, isLoading } = useHealthStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [dateInput, setDateInput] = useState(formatDate(new Date()));
  const [sourceInput, setSourceInput] = useState('');

  const analysis = useWeightAnalysis(currentCat || null, weightRecords);

  const chartOption = useMemo(() => {
    const { weightHistory, growthData, currentRange } = analysis;

    const actualData = weightHistory.map((r) => [r.ageMonths, r.weight]);
    const minBoundary = growthData.map((g) => [g.age, g.min]);
    const maxBoundary = growthData.map((g) => [g.age, g.max]);

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#FFE4CC',
        borderWidth: 1,
        textStyle: {
          color: '#333',
          fontSize: 12,
        },
        formatter: (params: any) => {
          const age = params[0]?.value[0];
          let html = `<div style="font-weight: 600; margin-bottom: 8px;">${age}个月龄</div>`;
          
          params.forEach((p: any) => {
            if (p.seriesName === '实际体重') {
              const record = weightHistory.find((r) => r.ageMonths === p.value[0]);
              html += `<div style="display: flex; align-items: center; gap: 8px; margin: 4px 0;">
                <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${p.color};"></span>
                <span>${p.seriesName}: <strong>${p.value[1]} kg</strong></span>
              </div>`;
              if (record) {
                html += `<div style="font-size: 11px; color: #999; margin-left: 18px;">${formatDateCN(record.date)}</div>`;
              }
            }
          });
          
          if (currentRange.min > 0) {
            html += `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee; font-size: 11px; color: #666;">
              正常范围: ${currentRange.min.toFixed(1)} - ${currentRange.max.toFixed(1)} kg
            </div>`;
          }
          
          return html;
        },
      },
      legend: {
        data: ['实际体重', '同品种正常范围'],
        top: 10,
        textStyle: {
          fontSize: 12,
          color: '#666',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: 50,
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        name: '月龄',
        nameTextStyle: {
          fontSize: 12,
          color: '#999',
        },
        axisLabel: {
          fontSize: 11,
          color: '#666',
          formatter: '{value}月',
        },
        axisLine: {
          lineStyle: {
            color: '#E5E7EB',
          },
        },
        splitLine: {
          lineStyle: {
            color: '#F3F4F6',
            type: 'dashed',
          },
        },
      },
      yAxis: {
        type: 'value',
        name: '体重 (kg)',
        nameTextStyle: {
          fontSize: 12,
          color: '#999',
        },
        axisLabel: {
          fontSize: 11,
          color: '#666',
          formatter: '{value}',
        },
        axisLine: {
          lineStyle: {
            color: '#E5E7EB',
          },
        },
        splitLine: {
          lineStyle: {
            color: '#F3F4F6',
            type: 'dashed',
          },
        },
        min: (value: any) => Math.max(0, value.min - 1),
      },
      series: [
        {
          name: '同品种正常范围',
          type: 'line',
          data: maxBoundary,
          lineStyle: {
            opacity: 0,
          },
          stack: 'confidence-band',
          symbol: 'none',
        },
        {
          name: '同品种正常范围',
          type: 'line',
          data: minBoundary,
          lineStyle: {
            opacity: 0,
          },
          stack: 'confidence-band',
          symbol: 'none',
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(124, 179, 66, 0.3)' },
                { offset: 1, color: 'rgba(124, 179, 66, 0.1)' },
              ],
            },
          },
        },
        {
          name: '正常范围上限',
          type: 'line',
          data: maxBoundary,
          lineStyle: {
            color: '#7CB342',
            type: 'dashed',
            width: 1,
            opacity: 0.6,
          },
          symbol: 'none',
          tooltip: {
            show: false,
          },
        },
        {
          name: '正常范围下限',
          type: 'line',
          data: minBoundary,
          lineStyle: {
            color: '#7CB342',
            type: 'dashed',
            width: 1,
            opacity: 0.6,
          },
          symbol: 'none',
          tooltip: {
            show: false,
          },
        },
        {
          name: '实际体重',
          type: 'line',
          data: actualData,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            color: '#FF8C42',
            width: 3,
          },
          itemStyle: {
            color: '#FF8C42',
            borderColor: '#fff',
            borderWidth: 2,
          },
          emphasis: {
            itemStyle: {
              symbolSize: 12,
              shadowBlur: 10,
              shadowColor: 'rgba(255, 140, 66, 0.5)',
            },
          },
        },
      ],
    };
  }, [analysis]);

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCat || !weightInput) return;

    const weightRecord: WeightRecordInput = {
      catId: currentCat.id,
      date: dateInput,
      weight: parseFloat(weightInput),
      source: sourceInput || '手动录入',
    };

    await addWeightRecord(weightRecord);
    setIsAddModalOpen(false);
    setWeightInput('');
    setDateInput(formatDate(new Date()));
    setSourceInput('');
  };

  const getTrendIcon = () => {
    switch (analysis.weightTrend) {
      case 'increasing':
        return <TrendingUp className="w-5 h-5 text-success-500" />;
      case 'decreasing':
        return <TrendingDown className="w-5 h-5 text-danger-500" />;
      default:
        return <Minus className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTrendText = () => {
    switch (analysis.weightTrend) {
      case 'increasing':
        return '体重上升';
      case 'decreasing':
        return '体重下降';
      default:
        return '体重稳定';
    }
  };

  const getTrendColor = () => {
    if (!analysis.isInRange) return 'text-danger-500';
    switch (analysis.weightTrend) {
      case 'increasing':
        return 'text-success-500';
      case 'decreasing':
        return 'text-danger-500';
      default:
        return 'text-gray-500';
    }
  };

  const getPercentileColor = () => {
    if (analysis.percentile < 10 || analysis.percentile > 90) return 'text-danger-500';
    if (analysis.percentile < 25 || analysis.percentile > 75) return 'text-warning-500';
    return 'text-success-500';
  };

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full" />
        </div>
      </Card>
    );
  }

  if (!currentCat) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <Scale className="w-12 h-12 mb-2 opacity-50" />
          <p>请先选择一只猫咪</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary-500" />
            体重变化曲线
          </CardTitle>
          <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4" />
            记录体重
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-card p-4">
            <div className="text-sm text-primary-600 mb-1">当前体重</div>
            <div className="text-2xl font-bold text-primary-700">
              {analysis.currentWeight !== null ? `${analysis.currentWeight.toFixed(1)} kg` : '--'}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-card p-4">
            <div className="text-sm text-gray-600 mb-1">趋势</div>
            <div className={cn('flex items-center gap-2 text-lg font-semibold', getTrendColor())}>
              {getTrendIcon()}
              {getTrendText()}
              {analysis.weightChange !== null && (
                <span className="text-sm font-normal">
                  ({analysis.weightChange > 0 ? '+' : ''}{analysis.weightChange.toFixed(2)} kg)
                </span>
              )}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-success-50 to-success-100 rounded-card p-4">
            <div className="text-sm text-success-600 mb-1">正常范围</div>
            <div className="text-lg font-bold text-success-700">
              {analysis.currentRange.min > 0 
                ? `${analysis.currentRange.min.toFixed(1)} - ${analysis.currentRange.max.toFixed(1)} kg`
                : '--'}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-warm-50 to-warm-100 rounded-card p-4">
            <div className="text-sm text-warm-600 mb-1">百分位</div>
            <div className={cn('text-2xl font-bold', getPercentileColor())}>
              {analysis.currentWeight !== null ? `${Math.round(analysis.percentile)}%` : '--'}
            </div>
          </div>
        </div>

        <div className="h-80">
          {analysis.weightHistory.length > 0 ? (
            <ReactECharts 
              option={chartOption} 
              style={{ height: '100%', width: '100%' }}
              opts={{ renderer: 'canvas' }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Scale className="w-12 h-12 mb-2 opacity-50" />
              <p>还没有体重记录</p>
              <p className="text-sm">点击上方按钮记录第一次体重</p>
            </div>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <p>💡 小贴士：绿色阴影区域为{currentCat.breed}同品种{currentCat.gender === 'male' ? '公猫' : '母猫'}的正常体重范围。</p>
          {!analysis.isInRange && analysis.currentWeight !== null && (
            <p className="text-danger-500 mt-1">
              ⚠️ 当前体重超出正常范围，建议咨询兽医调整饮食或检查健康状况。
            </p>
          )}
        </div>
      </CardContent>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="记录体重"
        size="md"
      >
        <form onSubmit={handleAddWeight} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="日期"
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              required
            />
            <Input
              label="体重 (kg)"
              type="number"
              step="0.01"
              min="0.1"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              placeholder="例如：4.5"
              required
            />
          </div>
          
          <Input
            label="数据来源"
            value={sourceInput}
            onChange={(e) => setSourceInput(e.target.value)}
            placeholder="例如：宠物医院、家用体重秤"
          />

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
              保存
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};
