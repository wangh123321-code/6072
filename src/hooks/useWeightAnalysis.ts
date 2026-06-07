import { useMemo } from 'react';
import { getWeightRange, getGrowthCurvePoints } from '../utils/breedData';
import { getAge } from '../utils/dateUtils';
import type { Cat, WeightRecord } from '../types';

export interface WeightAnalysis {
  currentWeight: number | null;
  weightTrend: 'increasing' | 'decreasing' | 'stable' | null;
  weightChange: number | null;
  isInRange: boolean;
  currentRange: { min: number; max: number };
  percentile: number;
  growthData: { age: number; min: number; max: number }[];
  weightHistory: { date: string; weight: number; ageMonths: number }[];
}

export function useWeightAnalysis(cat: Cat | null, weightRecords: WeightRecord[]): WeightAnalysis {
  return useMemo(() => {
    if (!cat || weightRecords.length === 0) {
      return {
        currentWeight: null,
        weightTrend: null,
        weightChange: null,
        isInRange: true,
        currentRange: { min: 0, max: 0 },
        percentile: 50,
        growthData: [],
        weightHistory: [],
      };
    }

    const age = getAge(cat.birthday);
    const ageMonths = age.years * 12 + age.months;
    const currentRange = getWeightRange(cat.breed, cat.gender, ageMonths);
    const growthData = getGrowthCurvePoints(cat.breed, cat.gender, Math.max(ageMonths + 6, 36));

    const sortedRecords = [...weightRecords].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const weightHistory = sortedRecords.map((r) => {
      const recordAge = getAge(cat.birthday);
      const recordDate = new Date(r.date);
      const birthDate = new Date(cat.birthday);
      const recordAgeMonths = 
        (recordDate.getFullYear() - birthDate.getFullYear()) * 12 +
        (recordDate.getMonth() - birthDate.getMonth());
      return {
        date: r.date,
        weight: r.weight,
        ageMonths: Math.max(0, recordAgeMonths),
      };
    });

    const currentWeight = sortedRecords[sortedRecords.length - 1]?.weight || null;
    const previousWeight = sortedRecords[sortedRecords.length - 2]?.weight || null;

    let weightTrend: WeightAnalysis['weightTrend'] = null;
    let weightChange: number | null = null;

    if (currentWeight !== null && previousWeight !== null) {
      weightChange = currentWeight - previousWeight;
      if (Math.abs(weightChange) < 0.05) {
        weightTrend = 'stable';
      } else if (weightChange > 0) {
        weightTrend = 'increasing';
      } else {
        weightTrend = 'decreasing';
      }
    }

    let isInRange = true;
    let percentile = 50;

    if (currentWeight !== null) {
      isInRange = currentWeight >= currentRange.min && currentWeight <= currentRange.max;
      const rangeSpan = currentRange.max - currentRange.min;
      percentile = Math.min(100, Math.max(0, ((currentWeight - currentRange.min) / rangeSpan) * 100));
    }

    return {
      currentWeight,
      weightTrend,
      weightChange,
      isInRange,
      currentRange,
      percentile,
      growthData,
      weightHistory,
    };
  }, [cat, weightRecords]);
}
