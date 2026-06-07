import React, { useMemo } from 'react';
import { AlertTriangle, AlertCircle, TrendingUp, TrendingDown, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { useCatStore, useHealthStore } from '@/store';
import { useAlertDetection } from '@/hooks/useAlertDetection';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { formatDateCN } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';
import type { AbnormalIndicator } from '@/types';

const AlertItem: React.FC<{
  indicator: AbnormalIndicator;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ indicator, isExpanded, onToggle }) => {
  const isDanger = indicator.severity === 'danger';
  const latestRecords = indicator.latestRecords;
  const latestValue = latestRecords[latestRecords.length - 1]?.value;
  const latestMin = latestRecords[latestRecords.length - 1]?.minRange;
  const latestMax = latestRecords[latestRecords.length - 1]?.maxRange;
  const unit = latestRecords[latestRecords.length - 1]?.unit;
  const isHigh = latestValue !== undefined && latestMax !== undefined && latestValue > latestMax;
  const isLow = latestValue !== undefined && latestMin !== undefined && latestValue < latestMin;

  return (
    <div
      className={cn(
        'rounded-card border transition-all duration-200 overflow-hidden',
        isDanger
          ? 'bg-danger-50 border-danger-200'
          : 'bg-warning-50 border-warning-200'
      )}
    >
      <button
        onClick={onToggle}
        className={cn(
          'w-full p-4 flex items-start justify-between text-left transition-colors',
          isDanger ? 'hover:bg-danger-100/50' : 'hover:bg-warning-100/50'
        )}
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'p-2 rounded-lg flex-shrink-0',
              isDanger ? 'bg-danger-100' : 'bg-warning-100'
            )}
          >
            {isDanger ? (
              <AlertCircle className="w-5 h-5 text-danger-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-warning-600" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className={cn(
                'font-semibold',
                isDanger ? 'text-danger-800' : 'text-warning-800'
              )}>
                {indicator.indicator}
              </h4>
              <span className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium',
                isDanger
                  ? 'bg-danger-200 text-danger-800'
                  : 'bg-warning-200 text-warning-800'
              )}>
                连续{indicator.consecutiveCount}次异常
              </span>
            </div>
            <div className="mt-1 flex items-center gap-3 text-sm">
              <span className={cn(
                'font-semibold',
                isDanger ? 'text-danger-700' : 'text-warning-700'
              )}>
                {latestValue?.toFixed(1)} {unit}
              </span>
              <span className="text-gray-500">
                参考范围: {latestMin} - {latestMax} {unit}
              </span>
              {isHigh && (
                <span className="flex items-center gap-1 text-danger-600">
                  <TrendingUp className="w-3 h-3" />
                  偏高
                </span>
              )}
              {isLow && (
                <span className="flex items-center gap-1 text-danger-600">
                  <TrendingDown className="w-3 h-3" />
                  偏低
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronUp className={cn(
              'w-5 h-5 flex-shrink-0',
              isDanger ? 'text-danger-500' : 'text-warning-500'
            )} />
          ) : (
            <ChevronDown className={cn(
              'w-5 h-5 flex-shrink-0',
              isDanger ? 'text-danger-500' : 'text-warning-500'
            )} />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-200/50">
          <div className="pt-4">
            <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              历史检测记录
            </h5>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">日期</th>
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">数值</th>
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">参考范围</th>
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {latestRecords.map((record, idx) => {
                    const isRecordHigh = record.value > record.maxRange;
                    const isRecordLow = record.value < record.minRange;
                    const isAbnormal = isRecordHigh || isRecordLow;
                    const healthRecords = useHealthStore.getState().healthRecords;
                    const recordDate = healthRecords.find(r => r.id === record.recordId)?.date || '';

                    return (
                      <tr key={idx} className="border-b border-gray-100 last:border-0">
                        <td className="py-2 px-3 text-gray-600">
                          {formatDateCN(recordDate)}
                        </td>
                        <td className={cn(
                          'py-2 px-3 font-medium',
                          isAbnormal ? 'text-danger-600' : 'text-gray-700'
                        )}>
                          {record.value.toFixed(1)} {record.unit}
                        </td>
                        <td className="py-2 px-3 text-gray-500">
                          {record.minRange} - {record.maxRange} {record.unit}
                        </td>
                        <td className="py-2 px-3">
                          {isAbnormal ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-danger-100 text-danger-700">
                              {isRecordHigh ? '偏高' : '偏低'}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-700">
                              正常
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 p-4 bg-white rounded-card border border-gray-200">
            <h5 className="text-sm font-medium text-gray-700 mb-2">💡 就医建议</h5>
            <p className="text-sm text-gray-600 leading-relaxed">
              {indicator.suggestion}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export const AlertPanel: React.FC = () => {
  const currentCat = useCatStore((state) => state.currentCat);
  const { labResults, healthRecords, isLoading } = useHealthStore();
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const { abnormalIndicators, totalAlerts, criticalAlerts, warningAlerts } = useAlertDetection(labResults, healthRecords);

  const stats = useMemo(() => {
    return { 
      total: totalAlerts, 
      danger: criticalAlerts, 
      warning: warningAlerts 
    };
  }, [totalAlerts, criticalAlerts, warningAlerts]);

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
          <Activity className="w-12 h-12 mb-2 opacity-50" />
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
            <AlertTriangle className="w-5 h-5 text-primary-500" />
            异常指标预警
          </CardTitle>
          {stats.total > 0 && (
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-danger-500" />
                <span className="text-gray-600">危险: {stats.danger}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-warning-500" />
                <span className="text-gray-600">警告: {stats.warning}</span>
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {abnormalIndicators.length > 0 ? (
          <div className="space-y-4">
            {abnormalIndicators.map((indicator) => (
              <AlertItem
                key={indicator.indicator}
                indicator={indicator}
                isExpanded={expandedId === indicator.indicator}
                onToggle={() => setExpandedId(
                  expandedId === indicator.indicator ? null : indicator.indicator
                )}
              />
            ))}

            <div className="p-4 bg-danger-50 rounded-card border border-danger-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-danger-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-medium text-danger-800">重要提醒</h5>
                  <p className="text-sm text-danger-700 mt-1">
                    以上指标已连续多次超出正常范围，建议尽快带猫咪前往宠物医院进行全面检查。
                    就诊时可出示本系统中的历史记录，帮助兽医更准确地判断病情。
                  </p>
                  <Button
                    variant="danger"
                    size="sm"
                    className="mt-3"
                    onClick={() => {
                      setExpandedId(abnormalIndicators[0]?.indicator || null);
                    }}
                  >
                    查看详细建议
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success-100 flex items-center justify-center">
              <Activity className="w-8 h-8 text-success-500" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">指标正常</h4>
            <p className="text-gray-500">
              {labResults.length > 0
                ? '所有化验指标均在正常范围内，猫咪健康状况良好！'
                : '还没有化验记录，添加健康记录时可录入化验指标。'}
            </p>
            {labResults.length === 0 && (
              <p className="text-sm text-gray-400 mt-2">
                系统会在某项指标连续3次超出正常范围时自动发出预警。
              </p>
            )}
          </div>
        )}

        {abnormalIndicators.length === 0 && labResults.length > 0 && (
          <div className="mt-6 p-4 bg-success-50 rounded-card border border-success-200">
            <div className="flex items-start gap-3">
              <Activity className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-medium text-success-800">健康小贴士</h5>
                <ul className="text-sm text-success-700 mt-2 space-y-1">
                  <li>• 定期带猫咪进行体检，建议每半年一次</li>
                  <li>• 保持猫咪饮食均衡，避免过度肥胖</li>
                  <li>• 保证充足的饮水，预防泌尿系统疾病</li>
                  <li>• 注意观察猫咪的精神状态和排泄情况</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
