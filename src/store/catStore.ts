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
  refreshCurrentCat: () => void;
}

const getCurrentCatFromState = (state: Partial<CatState>): Cat | null => {
  if (!state.cats || !state.currentCatId) return null;
  return state.cats.find((c) => c.id === state.currentCatId) || null;
};

export const useCatStore = create<CatState>((set, get) => ({
  cats: [],
  currentCatId: null,
  currentCat: null,
  isLoading: false,
  error: null,
  isInitialized: false,

  refreshCurrentCat: () => {
    const state = get();
    set({ currentCat: getCurrentCatFromState(state) });
  },

  fetchCats: async () => {
    set({ isLoading: true, error: null });
    try {
      const cats = await catRepository.getAll();
      const currentCatId = cats.length > 0 ? cats[0].id : null;
      const currentCat = cats.find((c) => c.id === currentCatId) || null;
      set({ 
        cats, 
        currentCatId,
        currentCat,
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
      set((state) => {
        const newCats = [...state.cats, newCat];
        return {
          cats: newCats,
          currentCatId: newCat.id,
          currentCat: newCat,
          isLoading: false,
        };
      });
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
        set((state) => {
          const newCats = state.cats.map((c) => (c.id === id ? updated : c));
          const newCurrentCat = state.currentCatId === id ? updated : state.currentCat;
          return {
            cats: newCats,
            currentCat: newCurrentCat,
            isLoading: false,
          };
        });
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
        const newCurrentCatId = newCats.length > 0 ? newCats[0].id : null;
        const newCurrentCat = newCats.find((c) => c.id === newCurrentCatId) || null;
        return {
          cats: newCats,
          currentCatId: newCurrentCatId,
          currentCat: newCurrentCat,
          isLoading: false,
        };
      });
    } catch (error) {
      logError(error, 'deleteCat');
      set({ error: '删除猫咪失败', isLoading: false });
    }
  },

  setCurrentCat: (id: string) => {
    set((state) => {
      const newCurrentCat = state.cats.find((c) => c.id === id) || null;
      return {
        currentCatId: id,
        currentCat: newCurrentCat,
      };
    });
  },

  initializeData: async () => {
    if (get().isInitialized) return;
    
    set({ isLoading: true, error: null });
    try {
      const cats = await catRepository.getAll();
      
      if (cats.length === 0) {
        await seedMockData();
        const seededCats = await catRepository.getAll();
        const currentCatId = seededCats.length > 0 ? seededCats[0].id : null;
        const currentCat = seededCats.find((c) => c.id === currentCatId) || null;
        set({
          cats: seededCats,
          currentCatId,
          currentCat,
          isLoading: false,
          isInitialized: true,
        });
      } else {
        const currentCatId = cats.length > 0 ? cats[0].id : null;
        const currentCat = cats.find((c) => c.id === currentCatId) || null;
        set({
          cats,
          currentCatId,
          currentCat,
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

export const useCurrentCat = () => useCatStore((state) => state.currentCat);
export const useCurrentCatId = () => useCatStore((state) => state.currentCatId);
export const useCats = () => useCatStore((state) => state.cats);
