import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Match } from '../types';
import { nanoid } from '../lib/utils';

interface MatchState {
  matches: Match[];
  currentMatch: Partial<Match> | null;
  setCurrentMatch: (match: Partial<Match> | null) => void;
  saveMatch: (match: Omit<Match, 'id'>) => Match;
  deleteMatch: (id: string) => void;
}

export const useMatchStore = create<MatchState>()(
  persist(
    (set) => ({
      matches: [],
      currentMatch: null,
      setCurrentMatch: (match) => set({ currentMatch: match }),
      saveMatch: (matchData) => {
        const match: Match = { ...matchData, id: nanoid() };
        set((state) => ({ matches: [match, ...state.matches] }));
        return match;
      },
      deleteMatch: (id) =>
        set((state) => ({ matches: state.matches.filter((m) => m.id !== id) })),
    }),
    { name: 'goat225-matches' }
  )
);
