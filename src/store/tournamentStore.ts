import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Tournament } from '../types';
import { applyResult, type MatchResult } from '../lib/tournament';

interface TournamentState {
  tournaments: Tournament[];
  addTournament: (t: Tournament) => void;
  recordResult: (tournamentId: string, tMatchId: string, result: MatchResult) => void;
  deleteTournament: (id: string) => void;
}

export const useTournamentStore = create<TournamentState>()(
  persist(
    (set) => ({
      tournaments: [],
      addTournament: (t) => set((s) => ({ tournaments: [t, ...s.tournaments] })),
      recordResult: (tournamentId, tMatchId, result) =>
        set((s) => ({
          tournaments: s.tournaments.map((t) => (t.id === tournamentId ? applyResult(t, tMatchId, result) : t)),
        })),
      deleteTournament: (id) => set((s) => ({ tournaments: s.tournaments.filter((t) => t.id !== id) })),
    }),
    { name: 'goat225-tournaments' }
  )
);
