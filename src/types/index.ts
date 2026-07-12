export type Category = 'Pro' | 'Amateur';

export interface Player {
  id: string;
  nom: string;
  prenom: string;
  surnom?: string;
  numero?: string;
  categorie: Category;
  photo?: string;
}

export interface Match {
  id: string;
  joueur1: Player;
  joueur2: Player;
  score1: number;
  score2: number;
  faute1: number;
  faute2: number;
  temps: number; // seconds
  vainqueur: Player | null;
  date: string; // ISO
  duree: number; // seconds elapsed
}

export interface Settings {
  defaultTime: number; // seconds
  soundEnabled: boolean;
  animationsEnabled: boolean;
  fullscreenEnabled: boolean;
}
