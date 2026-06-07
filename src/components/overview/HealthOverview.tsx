import React, { useMemo } from 'react';
import { Cat, Calendar, Scale, Activity, Syringe, FileText, Wifi, WifiOff } from 'lucide-react';
import { useCatStore, useHealthStore } from '@/store';
import { useWeightAnalysis } from '@/hooks/useWeightAnalysis';
import { useAlertDetection } from '@/hooks/useAlertDetection';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { formatAge, formatDateCN, getDaysDiff } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'gray';
}> = ({ icon, label, value, subValue, color = 'gray' }) => {
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-600',
    success: 'bg-success-100 text-success-600',
    warning: 'bg-warning-100 text-warning-600',
    danger: 'bg-danger-100 text-danger-600',
    gray: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="bg-white rounded-card shadow-card p-4 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5">
      <div className="flex items-start gap-3">
        <div className={cn('p-2.5 rounded-lg flex-shrink-0', colorClasses[color])}>
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-sm text-gray-500 mb-0.5">{label}</div>
          <div className="text-xl font-bold text-gray-800 truncate">{value}</div>
          {subValue && (
            <div className="text-xs text-gray-400 mt-0.5 truncate">{subValue}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export const HealthOverview: React.FC = () => {
  const { currentCat } = useCatStore();
  const { weightRecords, healthRecords, vaccineRecords, labResults, isLoading } = useHealthStore();
  const isOnline = useOfflineStatus();
  const analysis = useWeightAnalysis(currentCat || null, weightRecords);
  const { abnormalIndicators, totalAlerts } = useAlertDetection(labResults, healthRecords);

  const stats = useMemo(() => {
    if (!currentCat) {
      return {
        age: '--',
        lastCheckup: '--',
        upcomingVaccine: '--',
        upcomingVaccineDays: null as number | null,
        recordCount: 0,
        vaccineCount: 0,
      };
    }

    const age = formatAge(currentCat.birthday);
    
    const sortedRecords = [...healthRecords].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const lastCheckup = sortedRecords[0]?.date 
      ? formatDateCN(sortedRecords[0].date) 
      : '暂无记录';

    const now = new Date();
    const upcomingVaccines = vaccineRecords
      .filter((r) => r.nextDate && new Date(r.nextDate) >= now)
      .sort((a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime());
    
    const nextVaccine = upcomingVaccines[0];
    const upcomingVaccine = nextVaccine 
      ? nextVaccine.name 
      : '暂无计划';
    const upcomingVaccineDays = nextVaccine 
      ? getDaysDiff(now, nextVaccine.nextDate) 
      : null;

    return {
      age,
      lastCheckup,
      upcomingVaccine,
      upcomingVaccineDays,
      recordCount: healthRecords.length,
      vaccineCount: vaccineRecords.length,
    };
  }, [currentCat, healthRecords, vaccineRecords]);

  const getWeightStatus = () => {
    if (analysis.currentWeight === null) {
      return { color: 'gray' as const, value: '-- kg', subValue: '暂无记录' };
    }
    const color = analysis.isInRange ? 'success' as const : 'warning' as const;
    return {
      color,
      value: `${analysis.currentWeight.toFixed(1)} kg`,
      subValue: analysis.isInRange ? '体重正常' : '超出正常范围',
    };
  };

  const weightStatus = getWeightStatus();

  const getAlertStatus = () => {
    if (totalAlerts === 0) {
      return { color: 'success' as const, value: '正常', subValue: '指标无异常' };
    }
    const hasDanger = abnormalIndicators.some((a) => a.severity === 'danger');
    return {
      color: hasDanger ? 'danger' as const : 'warning' as const,
      value: `${totalAlerts} 项异常`,
      subValue: hasDanger ? '需立即关注' : '建议就医检查',
    };
  };

  const alertStatus = getAlertStatus();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-card shadow-card p-4 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-6 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!currentCat) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
          <Cat className="w-12 h-12 mb-2 opacity-50" />
          <p>请先选择一只猫咪查看健康概览</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {currentCat.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{currentCat.name}</h2>
            <p className="text-sm text-gray-500">
              {currentCat.breed} · {currentCat.gender === 'male' ? '公猫' : '母猫'} · {stats.age}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm">
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4 text-success-500" />
              <span className="text-success-600">在线同步中</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-warning-500" />
              <span className="text-warning-600">离线模式</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          icon={<Cat className="w-5 h-5" />}
          label="猫咪年龄"
          value={stats.age}
          subValue={`${currentCat.breed}`}
          color="primary"
        />
        <StatCard
          icon={<Scale className="w-5 h-5" />}
          label="当前体重"
          value={weightStatus.value}
          subValue={weightStatus.subValue}
          color={weightStatus.color}
        />
        <StatCard
          icon={<Activity className="w-5 h-5" />}
          label="健康指标"
          value={alertStatus.value}
          subValue={alertStatus.subValue}
          color={alertStatus.color}
        />
        <StatCard
          icon={<Calendar className="w-5 h-5" />}
          label="最近体检"
          value={stats.lastCheckup}
          subValue={`共 ${stats.recordCount} 条记录`}
          color="gray"
        />
        <StatCard
          icon={<Syringe className="w-5 h-5" />}
          label="下次疫苗"
          value={stats.upcomingVaccine}
          subValue={
            stats.upcomingVaccineDays !== null
              ? `还有 ${stats.upcomingVaccineDays} 天`
              : `共 ${stats.vaccineCount} 次接种`
          }
          color={
            stats.upcomingVaccineDays !== null && stats.upcomingVaccineDays <= 7
              ? 'warning'
              : stats.upcomingVaccineDays !== null && stats.upcomingVaccineDays <= 0
              ? 'danger'
              : 'primary'
          }
        />
        <StatCard
          icon={<FileText className="w-5 h-5" />}
          label="化验报告"
          value={`${labResults.length} 项`}
          subValue="指标数据"
          color="gray"
        />
      </div>
    </div>
  );
};
