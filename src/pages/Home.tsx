import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Cat, Heart, Download, Settings } from 'lucide-react';
import { useCatStore, useHealthStore } from '@/store';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { CatSelector } from '@/components/cat-selector/CatSelector';
import { ExportModal } from '@/components/export/ExportModal';
import { HealthOverview } from '@/components/overview/HealthOverview';
import { HealthTimeline } from '@/components/timeline/HealthTimeline';
import { WeightChart } from '@/components/weight-chart/WeightChart';
import { VaccineCalendar } from '@/components/vaccine-calendar/VaccineCalendar';
import { AlertPanel } from '@/components/alert-panel/AlertPanel';
import { Button } from '@/components/common/Button';
import { cn } from '@/lib/utils';

export default function Home() {
  const currentCatId = useCatStore((state) => state.currentCatId);
  const isInitialized = useCatStore((state) => state.isInitialized);
  const isLoading = useHealthStore((state) => state.isLoading);
  const initializeData = useCatStore((state) => state.initializeData);
  const fetchRecords = useHealthStore((state) => state.fetchRecords);
  
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const lastFetchTimeRef = useRef<Map<string, number>>(new Map());
  const CACHE_DURATION = 5000;

  const fetchRecordsWithCache = useCallback(async (catId: string) => {
    const now = Date.now();
    const lastFetch = lastFetchTimeRef.current.get(catId) || 0;
    
    if (now - lastFetch < CACHE_DURATION) {
      return;
    }

    const startTime = performance.now();
    await fetchRecords(catId);
    const endTime = performance.now();
    
    if (endTime - startTime > 500) {
      console.warn(`数据加载耗时 ${(endTime - startTime).toFixed(0)}ms，超过500ms目标`);
    }
    
    lastFetchTimeRef.current.set(catId, now);
  }, [fetchRecords]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  useEffect(() => {
    if (currentCatId && isInitialized) {
      fetchRecordsWithCache(currentCatId);
    }
  }, [currentCatId, isInitialized, fetchRecordsWithCache]);

  const handleCatChange = useCallback((catId: string) => {
    fetchRecordsWithCache(catId);
  }, [fetchRecordsWithCache]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 via-white to-primary-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
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
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-2"
                  onClick={() => setShowMenu(!showMenu)}
                  aria-label="更多操作"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">更多</span>
                </Button>
                
                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 bg-white rounded-card shadow-xl z-20 overflow-hidden min-w-[160px]">
                      <button
                        onClick={() => {
                          setIsExportModalOpen(true);
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-warm-50 transition-colors text-left"
                      >
                        <Download className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">数据导出备份</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
              
              <CatSelector onCatChange={handleCatChange} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
                <span className="text-sm text-gray-500">正在加载猫咪数据...</span>
              </div>
            </div>
          )}
          
          <div className={cn('space-y-10 transition-opacity duration-200', isLoading && 'opacity-50')}>
            <ErrorBoundary moduleName="健康概览">
              <HealthOverview />
            </ErrorBoundary>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 space-y-8">
                <ErrorBoundary moduleName="健康时间轴">
                  <HealthTimeline />
                </ErrorBoundary>

                <ErrorBoundary moduleName="体重曲线">
                  <WeightChart />
                </ErrorBoundary>
              </div>

              <div className="space-y-8">
                <ErrorBoundary moduleName="疫苗日历">
                  <VaccineCalendar />
                </ErrorBoundary>

                <ErrorBoundary moduleName="异常预警">
                  <AlertPanel />
                </ErrorBoundary>
              </div>
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

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}
