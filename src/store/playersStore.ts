import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Player, Category } from '../types';
import { nanoid } from '../lib/utils';

interface PlayersState {
  players: Player[];
  addPlayer: (player: Omit<Player, 'id'>) => void;
  updatePlayer: (id: string, updates: Partial<Omit<Player, 'id'>>) => void;
  deletePlayer: (id: string) => void;
}

export const usePlayersStore = create<PlayersState>()(
  persist(
    (set) => ({
      players: [
        { id: nanoid(), nom: 'Jordan', prenom: 'Michael', surnom: 'Air', numero: '23', categorie: 'Pro' as Category },
        { id: nanoid(), nom: 'James', prenom: 'LeBron', surnom: 'King', numero: '6', categorie: 'Pro' as Category },
        { id: nanoid(), nom: 'Bryant', prenom: 'Kobe', surnom: 'Mamba', numero: '24', categorie: 'Pro' as Category },
      ],
      addPlayer: (player) =>
        set((state) => ({ players: [...state.players, { ...player, id: nanoid() }] })),
      updatePlayer: (id, updates) =>
        set((state) => ({
          players: state.players.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),
      deletePlayer: (id) =>
        set((state) => ({ players: state.players.filter((p) => p.id !== id) })),
    }),
    { name: 'goat225-players' }
  )
);
