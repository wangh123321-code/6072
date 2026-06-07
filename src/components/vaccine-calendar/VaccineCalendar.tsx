import React, { useState, useMemo } from 'react';
import { Calendar, Plus, ChevronLeft, ChevronRight, Syringe, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useCatStore, useHealthStore } from '@/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { formatDate, formatDateCN, getMonthDays, getMonthFirstDay, getDaysDiff } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';
import type { VaccineRecordInput } from '@/types';

const VACCINE_TYPES = [
  '猫三联疫苗',
  '狂犬疫苗',
  '猫白血病疫苗',
  '猫传染性腹膜炎疫苗',
  '猫衣原体疫苗',
  '猫疱疹病毒疫苗',
  '猫杯状病毒疫苗',
  '其他',
];

const VACCINE_INTERVALS: Record<string, number> = {
  '猫三联疫苗': 365,
  '狂犬疫苗': 365,
  '猫白血病疫苗': 365,
  '猫传染性腹膜炎疫苗': 365,
  '猫衣原体疫苗': 365,
  '猫疱疹病毒疫苗': 365,
  '猫杯状病毒疫苗': 365,
  '其他': 365,
};

export const VaccineCalendar: React.FC = () => {
  const currentCat = useCatStore((state) => state.currentCat);
  const { vaccineRecords, addVaccineRecord, isLoading } = useHealthStore();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '猫三联疫苗',
    date: formatDate(new Date()),
    nextDate: '',
    hospital: '',
    batchNo: '',
  });

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    const firstDay = getMonthFirstDay(currentYear, currentMonth);
    const daysInMonth = getMonthDays(currentYear, currentMonth);

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  }, [currentYear, currentMonth]);

  const getDayVaccines = useMemo(() => {
    const dayMap: Record<string, { type: 'done' | 'upcoming' | 'overdue'; record: any }[]> = {};

    vaccineRecords.forEach((record) => {
      const dateStr = record.date;
      if (!dayMap[dateStr]) dayMap[dateStr] = [];
      dayMap[dateStr].push({ type: 'done', record });

      if (record.nextDate) {
        const nextDateStr = record.nextDate;
        const now = new Date();
        const nextDate = new Date(nextDateStr);
        const type = nextDate < now ? 'overdue' : 'upcoming';
        if (!dayMap[nextDateStr]) dayMap[nextDateStr] = [];
        dayMap[nextDateStr].push({ type, record });
      }
    });

    return dayMap;
  }, [vaccineRecords]);

  const upcomingVaccines = useMemo(() => {
    const now = new Date();
    return vaccineRecords
      .filter((r) => r.nextDate)
      .map((r) => ({
        ...r,
        daysUntil: getDaysDiff(now, r.nextDate),
        isOverdue: new Date(r.nextDate) < now,
      }))
      .sort((a, b) => {
        if (a.isOverdue && !b.isOverdue) return -1;
        if (!a.isOverdue && b.isOverdue) return 1;
        return new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime();
      })
      .slice(0, 5);
  }, [vaccineRecords]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const dateStr = formatDate(date);
    setSelectedDate(dateStr);
    setFormData({
      ...formData,
      date: dateStr,
      nextDate: formatDate(new Date(date.getTime() + 365 * 24 * 60 * 60 * 1000)),
    });
    setIsAddModalOpen(true);
  };

  const handleVaccineNameChange = (name: string) => {
    const interval = VACCINE_INTERVALS[name] || 365;
    const nextDate = new Date(new Date(formData.date).getTime() + interval * 24 * 60 * 60 * 1000);
    setFormData({
      ...formData,
      name,
      nextDate: formatDate(nextDate),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCat || !formData.name || !formData.date) return;

    const vaccineInput: VaccineRecordInput = {
      catId: currentCat.id,
      name: formData.name,
      date: formData.date,
      nextDate: formData.nextDate,
      hospital: formData.hospital,
      batchNo: formData.batchNo,
    };

    await addVaccineRecord(vaccineInput);
    setIsAddModalOpen(false);
    setFormData({
      name: '猫三联疫苗',
      date: formatDate(new Date()),
      nextDate: '',
      hospital: '',
      batchNo: '',
    });
    setSelectedDate(null);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const getDayStatus = (day: number) => {
    const dateStr = formatDate(new Date(currentYear, currentMonth, day));
    return getDayVaccines[dateStr] || [];
  };

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

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
          <Calendar className="w-12 h-12 mb-2 opacity-50" />
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
            <Syringe className="w-5 h-5 text-primary-500" />
            疫苗接种日历
          </CardTitle>
          <Button size="sm" onClick={() => {
            setFormData({
              name: '猫三联疫苗',
              date: formatDate(new Date()),
              nextDate: formatDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
              hospital: '',
              batchNo: '',
            });
            setIsAddModalOpen(true);
          }}>
            <Plus className="w-4 h-4" />
            添加疫苗
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handlePrevMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-lg font-semibold text-gray-800 min-w-[120px] text-center">
                  {currentYear}年{currentMonth + 1}月
                </span>
                <Button variant="ghost" size="sm" onClick={handleNextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleToday} className="text-sm">
                  今天
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day, idx) => (
                <div
                  key={day}
                  className={cn(
                    'text-center text-sm font-medium py-2',
                    idx === 0 || idx === 6 ? 'text-gray-400' : 'text-gray-600'
                  )}
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} className="aspect-square" />;
                }

                const dayStatus = getDayStatus(day);
                const hasDone = dayStatus.some((s) => s.type === 'done');
                const hasUpcoming = dayStatus.some((s) => s.type === 'upcoming');
                const hasOverdue = dayStatus.some((s) => s.type === 'overdue');

                return (
                  <button
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className={cn(
                      'aspect-square rounded-lg p-1 flex flex-col items-center justify-start transition-all duration-200 hover:bg-gray-50',
                      isToday(day) && 'bg-primary-50 ring-2 ring-primary-500 ring-offset-1',
                      hasOverdue && 'bg-danger-50'
                    )}
                  >
                    <span
                      className={cn(
                        'text-sm font-medium',
                        isToday(day) && 'text-primary-600',
                        hasOverdue && 'text-danger-600',
                        !isToday(day) && !hasOverdue && 'text-gray-700'
                      )}
                    >
                      {day}
                    </span>
                    <div className="flex gap-0.5 mt-1">
                      {hasDone && (
                        <div className="w-2 h-2 rounded-full bg-success-500" title="已接种" />
                      )}
                      {hasUpcoming && (
                        <div className="w-2 h-2 rounded-full bg-primary-500" title="待接种" />
                      )}
                      {hasOverdue && (
                        <div className="w-2 h-2 rounded-full bg-danger-500" title="已逾期" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success-500" />
                <span>已接种</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary-500" />
                <span>待接种</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-danger-500" />
                <span>已逾期</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning-500" />
              即将到期
            </h4>
            
            {upcomingVaccines.length > 0 ? (
              <div className="space-y-3">
                {upcomingVaccines.map((vaccine) => (
                  <div
                    key={vaccine.id}
                    className={cn(
                      'p-3 rounded-card border transition-all',
                      vaccine.isOverdue
                        ? 'bg-danger-50 border-danger-200'
                        : vaccine.daysUntil <= 7
                        ? 'bg-warning-50 border-warning-200'
                        : 'bg-gray-50 border-gray-200'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-gray-800">{vaccine.name}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          {vaccine.isOverdue ? (
                            <span className="text-danger-600">已逾期 {vaccine.daysUntil} 天</span>
                          ) : vaccine.daysUntil === 0 ? (
                            <span className="text-warning-600">今天到期</span>
                          ) : (
                            <span>还有 {vaccine.daysUntil} 天</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {formatDateCN(vaccine.nextDate)}
                        </div>
                      </div>
                      {vaccine.isOverdue ? (
                        <AlertTriangle className="w-5 h-5 text-danger-500 flex-shrink-0" />
                      ) : vaccine.daysUntil <= 7 ? (
                        <Clock className="w-5 h-5 text-warning-500 flex-shrink-0" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>暂无即将到期的疫苗</p>
              </div>
            )}

            <div className="p-4 bg-warm-50 rounded-card mt-6">
              <h5 className="font-medium text-warm-800 mb-2">💡 接种小贴士</h5>
              <ul className="text-sm text-warm-700 space-y-1">
                <li>• 猫咪出生后8-9周开始首次免疫</li>
                <li>• 基础免疫需连续接种3针，每针间隔21天</li>
                <li>• 成年后每年加强免疫一次</li>
                <li>• 接种前后一周避免洗澡和外出</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedDate(null);
        }}
        title="记录疫苗接种"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">疫苗类型</label>
            <select
              value={formData.name}
              onChange={(e) => handleVaccineNameChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-btn focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              {VACCINE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="接种日期"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
            <Input
              label="下次接种"
              type="date"
              value={formData.nextDate}
              onChange={(e) => setFormData({ ...formData, nextDate: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="接种医院"
              value={formData.hospital}
              onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
              placeholder="请输入医院名称"
            />
            <Input
              label="疫苗批号"
              value={formData.batchNo}
              onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
              placeholder="可选"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setIsAddModalOpen(false);
                setSelectedDate(null);
              }}
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
