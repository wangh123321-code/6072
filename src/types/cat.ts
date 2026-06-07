export interface Cat {
  id: string;
  name: string;
  breed: string;
  birthday: string;
  gender: 'male' | 'female';
  avatar: string;
  createdAt: string;
  updatedAt: string;
}

export type CatInput = Omit<Cat, 'id' | 'createdAt' | 'updatedAt'>;

export const BREED_OPTIONS = [
  '英国短毛猫',
  '美国短毛猫',
  '布偶猫',
  '暹罗猫',
  '波斯猫',
  '缅因猫',
  '苏格兰折耳猫',
  '俄罗斯蓝猫',
  '孟加拉豹猫',
  '中华田园猫',
  '其他',
] as const;

export type BreedType = typeof BREED_OPTIONS[number];
