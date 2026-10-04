import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Zone } from '../types';

export interface FilterState {
  floor?: string;
  zone: Zone[];
  hasPower?: boolean;
  hasPc?: boolean;
}

interface Feature1ContextType {
  filters: FilterState;
  setFilters: (f: FilterState) => void;
}

const Feature1Context = createContext<Feature1ContextType | undefined>(undefined);

export function Feature1Provider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>({ zone: [] });

  return (
    <Feature1Context.Provider value={{ filters, setFilters }}>
      {children}
    </Feature1Context.Provider>
  );
}

export function useFeature1() {
  const context = useContext(Feature1Context);
  if (!context) throw new Error("useFeature1 must be used within Feature1Provider");
  return context;
}
