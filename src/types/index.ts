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
  tournoi?: TournamentMatchRef;
}

/* ---------- Tournois ---------- */

export type TournamentFormat = 'elimination' | 'poules' | 'championnat';

/** Lien entre un match joué et sa place dans un tournoi. */
export interface TournamentMatchRef {
  tournamentId: string;
  tMatchId: string;
  label: string; // ex. « Demi-finale 1 », « Poule A · Journée 2 »
  knockout: boolean; // true = un vainqueur est obligatoire (pas de match nul)
}

export type TournamentPhase = 'elimination' | 'poule' | 'finale' | 'championnat';

export interface TournamentMatch {
  id: string;
  phase: TournamentPhase;
  round: number; // élimination / phase finale : n° de tour (0 = premier tour) ; poules / championnat : n° de journée
  index: number; // position dans le tour
  group?: string; // « A », « B » pour les poules
  p1: string | null; // id joueur, null = place pas encore connue
  p2: string | null;
  bye?: boolean; // qualifié d'office (pas d'adversaire)
  played: boolean;
  score1?: number;
  score2?: number;
  winner?: string | null; // id du vainqueur, null = match nul
  matchId?: string; // id du match enregistré dans l'historique
}

/** Copie légère d'un joueur (sans photo) pour garder le tableau lisible même si le joueur est supprimé. */
export type PlayerSnapshot = Pick<Player, 'id' | 'prenom' | 'nom' | 'surnom' | 'categorie'>;

export interface Tournament {
  id: string;
  nom: string;
  format: TournamentFormat;
  temps: number; // durée des matchs (secondes)
  players: PlayerSnapshot[];
  groups?: Record<string, string[]>; // poules : groupe → ids joueurs
  matches: TournamentMatch[];
  createdAt: string;
  championId: string | null;
  finishedAt?: string;
}

export interface Settings {
  defaultTime: number; // seconds
  soundEnabled: boolean;
  animationsEnabled: boolean;
  fullscreenEnabled: boolean;
}
