export interface BreedWeightRange {
  male: { min: number; max: number };
  female: { min: number; max: number };
  growthCurve: { ageMonths: number; weight: number }[];
}

export const BREED_WEIGHT_REFERENCE: Record<string, BreedWeightRange> = {
  '英国短毛猫': {
    male: { min: 4.1, max: 7.7 },
    female: { min: 3.2, max: 5.4 },
    growthCurve: [
      { ageMonths: 0, weight: 0.1 },
      { ageMonths: 1, weight: 0.6 },
      { ageMonths: 2, weight: 1.2 },
      { ageMonths: 3, weight: 1.8 },
      { ageMonths: 4, weight: 2.4 },
      { ageMonths: 5, weight: 3.0 },
      { ageMonths: 6, weight: 3.5 },
      { ageMonths: 8, weight: 4.0 },
      { ageMonths: 10, weight: 4.3 },
      { ageMonths: 12, weight: 4.5 },
      { ageMonths: 18, weight: 4.8 },
      { ageMonths: 24, weight: 5.0 },
    ],
  },
  '美国短毛猫': {
    male: { min: 3.6, max: 6.8 },
    female: { min: 2.7, max: 4.5 },
    growthCurve: [
      { ageMonths: 0, weight: 0.1 },
      { ageMonths: 1, weight: 0.5 },
      { ageMonths: 2, weight: 1.0 },
      { ageMonths: 3, weight: 1.6 },
      { ageMonths: 4, weight: 2.1 },
      { ageMonths: 5, weight: 2.6 },
      { ageMonths: 6, weight: 3.0 },
      { ageMonths: 8, weight: 3.5 },
      { ageMonths: 10, weight: 3.8 },
      { ageMonths: 12, weight: 4.0 },
      { ageMonths: 18, weight: 4.2 },
      { ageMonths: 24, weight: 4.3 },
    ],
  },
  '布偶猫': {
    male: { min: 5.9, max: 9.1 },
    female: { min: 3.6, max: 6.8 },
    growthCurve: [
      { ageMonths: 0, weight: 0.1 },
      { ageMonths: 1, weight: 0.7 },
      { ageMonths: 2, weight: 1.4 },
      { ageMonths: 3, weight: 2.1 },
      { ageMonths: 4, weight: 2.8 },
      { ageMonths: 5, weight: 3.5 },
      { ageMonths: 6, weight: 4.2 },
      { ageMonths: 8, weight: 5.0 },
      { ageMonths: 10, weight: 5.6 },
      { ageMonths: 12, weight: 6.0 },
      { ageMonths: 18, weight: 6.5 },
      { ageMonths: 24, weight: 6.8 },
    ],
  },
  '暹罗猫': {
    male: { min: 3.6, max: 5.4 },
    female: { min: 2.7, max: 4.1 },
    growthCurve: [
      { ageMonths: 0, weight: 0.08 },
      { ageMonths: 1, weight: 0.45 },
      { ageMonths: 2, weight: 0.9 },
      { ageMonths: 3, weight: 1.4 },
      { ageMonths: 4, weight: 1.8 },
      { ageMonths: 5, weight: 2.2 },
      { ageMonths: 6, weight: 2.6 },
      { ageMonths: 8, weight: 3.0 },
      { ageMonths: 10, weight: 3.3 },
      { ageMonths: 12, weight: 3.5 },
      { ageMonths: 18, weight: 3.8 },
      { ageMonths: 24, weight: 4.0 },
    ],
  },
  '波斯猫': {
    male: { min: 3.6, max: 5.4 },
    female: { min: 3.2, max: 4.5 },
    growthCurve: [
      { ageMonths: 0, weight: 0.09 },
      { ageMonths: 1, weight: 0.5 },
      { ageMonths: 2, weight: 1.0 },
      { ageMonths: 3, weight: 1.5 },
      { ageMonths: 4, weight: 2.0 },
      { ageMonths: 5, weight: 2.4 },
      { ageMonths: 6, weight: 2.8 },
      { ageMonths: 8, weight: 3.2 },
      { ageMonths: 10, weight: 3.5 },
      { ageMonths: 12, weight: 3.8 },
      { ageMonths: 18, weight: 4.0 },
      { ageMonths: 24, weight: 4.2 },
    ],
  },
  '缅因猫': {
    male: { min: 5.9, max: 11.3 },
    female: { min: 3.6, max: 8.2 },
    growthCurve: [
      { ageMonths: 0, weight: 0.12 },
      { ageMonths: 1, weight: 0.8 },
      { ageMonths: 2, weight: 1.6 },
      { ageMonths: 3, weight: 2.5 },
      { ageMonths: 4, weight: 3.4 },
      { ageMonths: 5, weight: 4.3 },
      { ageMonths: 6, weight: 5.2 },
      { ageMonths: 8, weight: 6.2 },
      { ageMonths: 10, weight: 7.0 },
      { ageMonths: 12, weight: 7.5 },
      { ageMonths: 18, weight: 8.0 },
      { ageMonths: 24, weight: 8.5 },
    ],
  },
  '苏格兰折耳猫': {
    male: { min: 4.1, max: 6.0 },
    female: { min: 2.7, max: 4.1 },
    growthCurve: [
      { ageMonths: 0, weight: 0.09 },
      { ageMonths: 1, weight: 0.55 },
      { ageMonths: 2, weight: 1.1 },
      { ageMonths: 3, weight: 1.7 },
      { ageMonths: 4, weight: 2.2 },
      { ageMonths: 5, weight: 2.7 },
      { ageMonths: 6, weight: 3.1 },
      { ageMonths: 8, weight: 3.5 },
      { ageMonths: 10, weight: 3.8 },
      { ageMonths: 12, weight: 4.0 },
      { ageMonths: 18, weight: 4.3 },
      { ageMonths: 24, weight: 4.5 },
    ],
  },
  '俄罗斯蓝猫': {
    male: { min: 4.1, max: 5.4 },
    female: { min: 2.7, max: 4.1 },
    growthCurve: [
      { ageMonths: 0, weight: 0.08 },
      { ageMonths: 1, weight: 0.5 },
      { ageMonths: 2, weight: 1.0 },
      { ageMonths: 3, weight: 1.5 },
      { ageMonths: 4, weight: 2.0 },
      { ageMonths: 5, weight: 2.4 },
      { ageMonths: 6, weight: 2.8 },
      { ageMonths: 8, weight: 3.2 },
      { ageMonths: 10, weight: 3.5 },
      { ageMonths: 12, weight: 3.8 },
      { ageMonths: 18, weight: 4.0 },
      { ageMonths: 24, weight: 4.2 },
    ],
  },
  '孟加拉豹猫': {
    male: { min: 4.5, max: 6.8 },
    female: { min: 3.6, max: 5.4 },
    growthCurve: [
      { ageMonths: 0, weight: 0.1 },
      { ageMonths: 1, weight: 0.6 },
      { ageMonths: 2, weight: 1.2 },
      { ageMonths: 3, weight: 1.9 },
      { ageMonths: 4, weight: 2.5 },
      { ageMonths: 5, weight: 3.1 },
      { ageMonths: 6, weight: 3.6 },
      { ageMonths: 8, weight: 4.1 },
      { ageMonths: 10, weight: 4.5 },
      { ageMonths: 12, weight: 4.8 },
      { ageMonths: 18, weight: 5.0 },
      { ageMonths: 24, weight: 5.2 },
    ],
  },
  '中华田园猫': {
    male: { min: 3.6, max: 5.4 },
    female: { min: 2.7, max: 4.5 },
    growthCurve: [
      { ageMonths: 0, weight: 0.08 },
      { ageMonths: 1, weight: 0.5 },
      { ageMonths: 2, weight: 1.0 },
      { ageMonths: 3, weight: 1.5 },
      { ageMonths: 4, weight: 2.0 },
      { ageMonths: 5, weight: 2.4 },
      { ageMonths: 6, weight: 2.8 },
      { ageMonths: 8, weight: 3.2 },
      { ageMonths: 10, weight: 3.5 },
      { ageMonths: 12, weight: 3.8 },
      { ageMonths: 18, weight: 4.0 },
      { ageMonths: 24, weight: 4.2 },
    ],
  },
  '其他': {
    male: { min: 3.6, max: 6.0 },
    female: { min: 2.7, max: 4.5 },
    growthCurve: [
      { ageMonths: 0, weight: 0.09 },
      { ageMonths: 1, weight: 0.55 },
      { ageMonths: 2, weight: 1.1 },
      { ageMonths: 3, weight: 1.6 },
      { ageMonths: 4, weight: 2.1 },
      { ageMonths: 5, weight: 2.5 },
      { ageMonths: 6, weight: 2.9 },
      { ageMonths: 8, weight: 3.3 },
      { ageMonths: 10, weight: 3.6 },
      { ageMonths: 12, weight: 3.9 },
      { ageMonths: 18, weight: 4.1 },
      { ageMonths: 24, weight: 4.3 },
    ],
  },
};

export function getWeightRange(breed: string, gender: 'male' | 'female', ageMonths: number): { min: number; max: number } {
  const breedData = BREED_WEIGHT_REFERENCE[breed] || BREED_WEIGHT_REFERENCE['其他'];
  const baseRange = breedData[gender];
  
  if (ageMonths >= 24) {
    return baseRange;
  }
  
  const curve = breedData.growthCurve;
  let lowerIdx = 0;
  let upperIdx = curve.length - 1;
  
  for (let i = 0; i < curve.length - 1; i++) {
    if (curve[i].ageMonths <= ageMonths && curve[i + 1].ageMonths >= ageMonths) {
      lowerIdx = i;
      upperIdx = i + 1;
      break;
    }
  }
  
  const lower = curve[lowerIdx];
  const upper = curve[upperIdx];
  const ratio = (ageMonths - lower.ageMonths) / (upper.ageMonths - lower.ageMonths);
  const interpolatedWeight = lower.weight + (upper.weight - lower.weight) * ratio;
  
  const rangeFactor = (baseRange.max - baseRange.min) / baseRange.max * 0.3;
  return {
    min: interpolatedWeight * (1 - rangeFactor),
    max: interpolatedWeight * (1 + rangeFactor),
  };
}

export function getGrowthCurvePoints(breed: string, gender: 'male' | 'female', maxAgeMonths: number = 36): { age: number; min: number; max: number }[] {
  const breedData = BREED_WEIGHT_REFERENCE[breed] || BREED_WEIGHT_REFERENCE['其他'];
  const points: { age: number; min: number; max: number }[] = [];
  
  for (let age = 0; age <= maxAgeMonths; age += 1) {
    const range = getWeightRange(breed, gender, age);
    points.push({ age, min: range.min, max: range.max });
  }
  
  return points;
}
