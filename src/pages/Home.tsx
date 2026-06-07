import React, { useEffect } from 'react';
import { Cat, Heart } from 'lucide-react';
import { useCatStore, useHealthStore } from '@/store';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { CatSelector } from '@/components/cat-selector/CatSelector';
import { HealthOverview } from '@/components/overview/HealthOverview';
import { HealthTimeline } from '@/components/timeline/HealthTimeline';
import { WeightChart } from '@/components/weight-chart/WeightChart';
import { VaccineCalendar } from '@/components/vaccine-calendar/VaccineCalendar';
import { AlertPanel } from '@/components/alert-panel/AlertPanel';

export default function Home() {
  const { currentCatId, initializeData, isInitialized } = useCatStore();
  const { fetchRecords } = useHealthStore();

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  useEffect(() => {
    if (currentCatId && isInitialized) {
      fetchRecords(currentCatId);
    }
  }, [currentCatId, isInitialized, fetchRecords]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 via-white to-primary-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
                <Cat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-gray-800 flex items-center gap-2">
                  猫咪健康档案
                  <Heart className="w-4 h-4 text-danger-500 fill-danger-500" />
                </h1>
                <p className="text-xs text-gray-500">守护毛孩子的每一刻健康</p>
              </div>
            </div>
            <CatSelector />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <ErrorBoundary moduleName="健康概览">
            <HealthOverview />
          </ErrorBoundary>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <ErrorBoundary moduleName="健康时间轴">
                <HealthTimeline />
              </ErrorBoundary>

              <ErrorBoundary moduleName="体重曲线">
                <WeightChart />
              </ErrorBoundary>
            </div>

            <div className="space-y-6">
              <ErrorBoundary moduleName="疫苗日历">
                <VaccineCalendar />
              </ErrorBoundary>

              <ErrorBoundary moduleName="异常预警">
                <AlertPanel />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-100 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <Cat className="w-4 h-4" />
              <span>猫咪健康档案仪表盘 · 数据安全存储在本地</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span>数据存储：IndexedDB</span>
              <span>离线可用</span>
              <span>© 2025</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
