import type {
  Player,
  PlayerSnapshot,
  Tournament,
  TournamentFormat,
  TournamentMatch,
  TournamentPhase,
} from '../types';
import { nanoid } from './utils';

/* -------------------------------------------------------------------------- */
/*  Règles des trois formats                                                  */
/* -------------------------------------------------------------------------- */

export const FORMATS: Record<TournamentFormat, { lettre: string; nom: string; description: string; min: number; max: number }> = {
  elimination: {
    lettre: 'A',
    nom: 'Élimination directe',
    description: "Le perdant sort. Arbre jusqu'à la finale.",
    min: 2,
    max: 32,
  },
  poules: {
    lettre: 'B',
    nom: 'Poules + phase finale',
    description: 'Une ou deux poules, les 2 premiers passent en phase finale.',
    min: 4,
    max: 16,
  },
  championnat: {
    lettre: 'C',
    nom: 'Championnat',
    description: 'Tout le monde se rencontre. Classement aux points.',
    min: 3,
    max: 12,
  },
};

/** Points au classement : victoire 3, nul 1, défaite 0. */
export const POINTS = { victoire: 3, nul: 1, defaite: 0 };

/* -------------------------------------------------------------------------- */
/*  Outils                                                                    */
/* -------------------------------------------------------------------------- */

export function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function snapshot(p: Player): PlayerSnapshot {
  return { id: p.id, prenom: p.prenom, nom: p.nom, surnom: p.surnom, categorie: p.categorie };
}

const BYE = '__exempt__';

/** Calendrier « tous contre tous » (méthode du cercle) : une liste de journées. */
export function roundRobin(ids: string[]): [string, string][][] {
  const list = [...ids];
  if (list.length % 2) list.push(BYE);
  const n = list.length;
  const rounds: [string, string][][] = [];
  for (let r = 0; r < n - 1; r++) {
    const pairs: [string, string][] = [];
    for (let i = 0; i < n / 2; i++) {
      const a = list[i];
      const b = list[n - 1 - i];
      if (a !== BYE && b !== BYE) pairs.push(r % 2 ? [b, a] : [a, b]);
    }
    rounds.push(pairs);
    list.splice(1, 0, list.pop()!);
  }
  return rounds;
}

function emptyMatch(phase: TournamentPhase, round: number, index: number, extra: Partial<TournamentMatch> = {}): TournamentMatch {
  return { id: nanoid(), phase, round, index, p1: null, p2: null, played: false, ...extra };
}

/**
 * Arbre à élimination directe. Si le nombre de joueurs n'est pas une puissance de 2,
 * certains joueurs sont qualifiés d'office au 1er tour (exempts), répartis dans tout l'arbre.
 */
function buildBracket(ids: (string | null)[], phase: 'elimination' | 'finale'): TournamentMatch[] {
  const n = Math.max(ids.length, 2);
  const size = 2 ** Math.ceil(Math.log2(n));
  const firstRound = size / 2;
  const byes = size - ids.length;
  const byeAt = new Set<number>();
  for (let k = 0; k < byes; k++) byeAt.add(Math.floor((k * firstRound) / byes));

  const matches: TournamentMatch[] = [];
  let next = 0;
  for (let i = 0; i < firstRound; i++) {
    if (byeAt.has(i)) {
      matches.push(emptyMatch(phase, 0, i, { p1: ids[next++] ?? null, bye: true }));
    } else {
      matches.push(emptyMatch(phase, 0, i, { p1: ids[next++] ?? null, p2: ids[next++] ?? null }));
    }
  }
  const rounds = Math.log2(size);
  for (let r = 1; r < rounds; r++) {
    for (let i = 0; i < size / 2 ** (r + 1); i++) matches.push(emptyMatch(phase, r, i));
  }
  return matches;
}

/* -------------------------------------------------------------------------- */
/*  Création                                                                  */
/* -------------------------------------------------------------------------- */

export function createTournament(params: {
  nom: string;
  format: TournamentFormat;
  players: Player[];
  temps: number;
  tirageAuSort: boolean;
}): Tournament {
  const ordered = params.tirageAuSort ? shuffle(params.players) : params.players;
  const ids = ordered.map((p) => p.id);
  let t: Tournament = {
    id: nanoid(),
    nom: params.nom.trim() || 'Tournoi',
    format: params.format,
    temps: params.temps,
    players: ordered.map(snapshot),
    matches: [],
    createdAt: new Date().toISOString(),
    championId: null,
  };

  if (params.format === 'elimination') {
    t.matches = buildBracket(ids, 'elimination');
    // Les exempts avancent tout de suite au tour suivant.
    for (const m of t.matches.filter((x) => x.bye)) {
      t = applyResult(t, m.id, { winner: m.p1, score1: undefined, score2: undefined });
    }
  } else if (params.format === 'poules') {
    const groupCount = ids.length >= 6 ? 2 : 1;
    const names = ['A', 'B'].slice(0, groupCount);
    const groups: Record<string, string[]> = Object.fromEntries(names.map((g) => [g, [] as string[]]));
    ids.forEach((id, i) => groups[names[i % groupCount]].push(id));
    t.groups = groups;
    for (const g of names) {
      roundRobin(groups[g]).forEach((pairs, journee) =>
        pairs.forEach(([a, b], index) => t.matches.push(emptyMatch('poule', journee, index, { group: g, p1: a, p2: b })))
      );
    }
    // Phase finale : demi-finales (2 poules) ou finale directe (1 poule).
    t.matches.push(...buildBracket(groupCount === 2 ? [null, null, null, null] : [null, null], 'finale'));
  } else {
    roundRobin(ids).forEach((pairs, journee) =>
      pairs.forEach(([a, b], index) => t.matches.push(emptyMatch('championnat', journee, index, { p1: a, p2: b })))
    );
  }
  return t;
}

/* -------------------------------------------------------------------------- */
/*  Classements                                                               */
/* -------------------------------------------------------------------------- */

export interface Standing {
  id: string;
  joues: number;
  victoires: number;
  nuls: number;
  defaites: number;
  marques: number;
  encaisses: number;
  ecart: number;
  points: number;
}

/** Classement : points, puis écart de points, puis points marqués. */
export function standings(matches: TournamentMatch[], ids: string[]): Standing[] {
  const table = new Map<string, Standing>(
    ids.map((id) => [id, { id, joues: 0, victoires: 0, nuls: 0, defaites: 0, marques: 0, encaisses: 0, ecart: 0, points: 0 }])
  );
  for (const m of matches) {
    if (!m.played || m.bye || !m.p1 || !m.p2) continue;
    const a = table.get(m.p1);
    const b = table.get(m.p2);
    if (!a || !b) continue;
    const s1 = m.score1 ?? 0;
    const s2 = m.score2 ?? 0;
    a.joues++; b.joues++;
    a.marques += s1; a.encaisses += s2;
    b.marques += s2; b.encaisses += s1;
    if (m.winner === null || m.winner === undefined) {
      a.nuls++; b.nuls++;
      a.points += POINTS.nul; b.points += POINTS.nul;
    } else if (m.winner === m.p1) {
      a.victoires++; b.defaites++;
      a.points += POINTS.victoire;
    } else {
      b.victoires++; a.defaites++;
      b.points += POINTS.victoire;
    }
  }
  const rows = [...table.values()];
  rows.forEach((r) => (r.ecart = r.marques - r.encaisses));
  return rows.sort((x, y) => y.points - x.points || y.ecart - x.ecart || y.marques - x.marques);
}

/* -------------------------------------------------------------------------- */
/*  Résultats et avancement automatique                                       */
/* -------------------------------------------------------------------------- */

export interface MatchResult {
  winner: string | null; // null = match nul (poules et championnat uniquement)
  score1?: number;
  score2?: number;
  matchId?: string;
}

/** Enregistre un résultat et fait avancer le tournoi (vainqueur au tour suivant, qualifiés, champion). */
export function applyResult(t: Tournament, tMatchId: string, result: MatchResult): Tournament {
  const matches = t.matches.map((m) => ({ ...m }));
  const m = matches.find((x) => x.id === tMatchId);
  if (!m) return t;
  Object.assign(m, { played: true, winner: result.winner, score1: result.score1, score2: result.score2, matchId: result.matchId });
  let next: Tournament = { ...t, matches };

  if (m.phase === 'elimination' || m.phase === 'finale') {
    const following = matches.find((x) => x.phase === m.phase && x.round === m.round + 1 && x.index === Math.floor(m.index / 2));
    if (following) {
      if (m.index % 2 === 0) following.p1 = result.winner;
      else following.p2 = result.winner;
    } else if (result.winner) {
      next = { ...next, championId: result.winner, finishedAt: new Date().toISOString() };
    }
  }

  if (m.phase === 'poule' && m.group && next.groups) {
    const groupMatches = matches.filter((x) => x.phase === 'poule' && x.group === m.group);
    if (groupMatches.every((x) => x.played)) {
      const [first, second] = standings(groupMatches, next.groups[m.group]);
      const finals = matches.filter((x) => x.phase === 'finale' && x.round === 0);
      if (Object.keys(next.groups).length === 2) {
        // Demi 1 : 1er A – 2e B · Demi 2 : 1er B – 2e A
        if (m.group === 'A') {
          finals[0].p1 = first?.id ?? null;
          finals[1].p2 = second?.id ?? null;
        } else {
          finals[1].p1 = first?.id ?? null;
          finals[0].p2 = second?.id ?? null;
        }
      } else {
        finals[0].p1 = first?.id ?? null;
        finals[0].p2 = second?.id ?? null;
      }
    }
  }

  if (m.phase === 'championnat' && matches.every((x) => x.played)) {
    const [leader] = standings(matches, t.players.map((p) => p.id));
    next = { ...next, championId: leader?.id ?? null, finishedAt: new Date().toISOString() };
  }

  return next;
}

/* -------------------------------------------------------------------------- */
/*  Lecture du tableau                                                        */
/* -------------------------------------------------------------------------- */

const PHASE_ORDER: Record<TournamentPhase, number> = { poule: 0, championnat: 0, elimination: 1, finale: 2 };

export function isPlayable(m: TournamentMatch): boolean {
  return !m.played && !!m.p1 && !!m.p2;
}

/** Les matchs prêts à être joués, dans l'ordre conseillé. */
export function playableMatches(t: Tournament): TournamentMatch[] {
  return t.matches
    .filter(isPlayable)
    .sort((a, b) => PHASE_ORDER[a.phase] - PHASE_ORDER[b.phase] || a.round - b.round || a.index - b.index || (a.group ?? '').localeCompare(b.group ?? ''));
}

export function roundCount(t: Tournament, phase: 'elimination' | 'finale'): number {
  return Math.max(0, ...t.matches.filter((m) => m.phase === phase).map((m) => m.round + 1));
}

/** Nom d'un tour d'élimination selon le nombre de matchs qu'il contient. */
export function roundName(matchesInRound: number, round: number): string {
  if (matchesInRound === 1) return 'Finale';
  if (matchesInRound === 2) return 'Demi-finales';
  if (matchesInRound === 4) return 'Quarts de finale';
  if (matchesInRound === 8) return 'Huitièmes de finale';
  if (matchesInRound === 16) return 'Seizièmes de finale';
  return `Tour ${round + 1}`;
}

export function matchLabel(t: Tournament, m: TournamentMatch): string {
  if (m.phase === 'poule') return `Poule ${m.group} · Journée ${m.round + 1}`;
  if (m.phase === 'championnat') return `Journée ${m.round + 1}`;
  const inRound = t.matches.filter((x) => x.phase === m.phase && x.round === m.round).length;
  if (inRound === 1) return 'Finale';
  const name = roundName(inRound, m.round);
  const singular = name === 'Demi-finales' ? 'Demi-finale' : name === 'Quarts de finale' ? 'Quart de finale' : name.replace(/s de finale$/, 'e de finale');
  return `${singular} ${m.index + 1}`;
}

export function isKnockout(m: TournamentMatch): boolean {
  return m.phase === 'elimination' || m.phase === 'finale';
}

/** Où en est le tournoi, en une phrase. */
export function progressLabel(t: Tournament): string {
  if (t.championId) return 'Terminé';
  const real = t.matches.filter((m) => !m.bye);
  const done = real.filter((m) => m.played).length;
  const next = playableMatches(t)[0];
  const count = `${done} match${done > 1 ? 's' : ''} joué${done > 1 ? 's' : ''} sur ${real.length}`;
  if (!next) return count;
  return `${matchLabel(t, next)} · ${count}`;
}
