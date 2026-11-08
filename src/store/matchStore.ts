import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Match, Player } from '../types';
import { nanoid } from '../lib/utils';

interface MatchState {
  matches: Match[];
  currentMatch: Partial<Match> | null;
  setCurrentMatch: (match: Partial<Match> | null) => void;
  saveMatch: (match: Omit<Match, 'id'>) => Match;
  deleteMatch: (id: string) => void;
}

/**
 * L'historique ne garde pas les photos des joueurs (elles restent dans la fiche joueur
 * et sont retrouvées par l'id). Sans ça, chaque match recopierait deux photos et le
 * stockage local serait vite plein, surtout pendant un tournoi.
 */
function withoutPhoto(p: Player): Player;
function withoutPhoto(p: Player | null): Player | null;
function withoutPhoto(p: Player | null): Player | null {
  if (!p) return p;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { photo, ...rest } = p;
  return rest;
}

function lightMatch(m: Match): Match {
  return { ...m, joueur1: withoutPhoto(m.joueur1), joueur2: withoutPhoto(m.joueur2), vainqueur: withoutPhoto(m.vainqueur) };
}

export const useMatchStore = create<MatchState>()(
  persist(
    (set) => ({
      matches: [],
      currentMatch: null,
      setCurrentMatch: (match) => set({ currentMatch: match }),
      saveMatch: (matchData) => {
        const match: Match = lightMatch({ ...matchData, id: nanoid() });
        set((state) => ({ matches: [match, ...state.matches] }));
        return match;
      },
      deleteMatch: (id) =>
        set((state) => ({ matches: state.matches.filter((m) => m.id !== id) })),
    }),
    {
      name: 'goat225-matches',
      version: 1,
      // v0 → v1 : retire les photos recopiées dans l'historique.
      migrate: (persisted) => {
        const state = persisted as { matches?: Match[] } & Record<string, unknown>;
        return { ...state, matches: (state.matches ?? []).map(lightMatch) } as unknown as MatchState;
      },
    }
  )
);
