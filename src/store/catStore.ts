import { create } from 'zustand';
import { catRepository } from '../db/catRepository';
import { seedMockData } from '../utils/mockData';
import { logError } from '../utils/errorHandler';
import type { Cat, CatInput } from '../types';

interface CatState {
  cats: Cat[];
  currentCatId: string | null;
  currentCat: Cat | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  
  fetchCats: () => Promise<void>;
  addCat: (cat: CatInput) => Promise<void>;
  updateCat: (id: string, data: Partial<Cat>) => Promise<void>;
  deleteCat: (id: string) => Promise<void>;
  setCurrentCat: (id: string) => void;
  initializeData: () => Promise<void>;
}

export const useCatStore = create<CatState>((set, get) => ({
  cats: [],
  currentCatId: null,
  get currentCat() {
    const state = get();
    return state.cats.find((c) => c.id === state.currentCatId) || null;
  },
  isLoading: false,
  error: null,
  isInitialized: false,

  fetchCats: async () => {
    set({ isLoading: true, error: null });
    try {
      const cats = await catRepository.getAll();
      set({ 
        cats, 
        currentCatId: cats.length > 0 ? cats[0].id : null,
        isLoading: false 
      });
    } catch (error) {
      logError(error, 'fetchCats');
      set({ error: '加载猫咪列表失败', isLoading: false });
    }
  },

  addCat: async (cat: CatInput) => {
    set({ isLoading: true, error: null });
    try {
      const newCat = await catRepository.add(cat);
      set((state) => ({
        cats: [...state.cats, newCat],
        currentCatId: newCat.id,
        isLoading: false,
      }));
    } catch (error) {
      logError(error, 'addCat');
      set({ error: '添加猫咪失败', isLoading: false });
    }
  },

  updateCat: async (id: string, data: Partial<Cat>) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await catRepository.update(id, data);
      if (updated) {
        set((state) => ({
          cats: state.cats.map((c) => (c.id === id ? updated : c)),
          isLoading: false,
        }));
      }
    } catch (error) {
      logError(error, 'updateCat');
      set({ error: '更新猫咪信息失败', isLoading: false });
    }
  },

  deleteCat: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await catRepository.delete(id);
      set((state) => {
        const newCats = state.cats.filter((c) => c.id !== id);
        return {
          cats: newCats,
          currentCatId: newCats.length > 0 ? newCats[0].id : null,
          isLoading: false,
        };
      });
    } catch (error) {
      logError(error, 'deleteCat');
      set({ error: '删除猫咪失败', isLoading: false });
    }
  },

  setCurrentCat: (id: string) => {
    set({ currentCatId: id });
  },

  initializeData: async () => {
    if (get().isInitialized) return;
    
    set({ isLoading: true, error: null });
    try {
      const cats = await catRepository.getAll();
      
      if (cats.length === 0) {
        await seedMockData();
        const seededCats = await catRepository.getAll();
        set({
          cats: seededCats,
          currentCatId: seededCats.length > 0 ? seededCats[0].id : null,
          isLoading: false,
          isInitialized: true,
        });
      } else {
        set({
          cats,
          currentCatId: cats.length > 0 ? cats[0].id : null,
          isLoading: false,
          isInitialized: true,
        });
      }
    } catch (error) {
      logError(error, 'initializeData');
      set({ error: '初始化数据失败', isLoading: false });
    }
  },
}));
