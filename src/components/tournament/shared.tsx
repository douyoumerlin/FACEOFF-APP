import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import type { Player, Tournament, TournamentMatch } from '../../types';
import { PlayerAvatar } from '../PlayerAvatar';
import { useMatchStore } from '../../store/matchStore';
import { useLivePlayersMap } from '../../hooks/useLivePlayer';
import { isKnockout, matchLabel } from '../../lib/tournament';

export function Crown({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 24 20" fill="#E01B1B" stroke="#FFFFFF" strokeWidth="1" strokeLinejoin="round">
      <path d="M2 6l5 4 5-8 5 8 5-4-2 12H4z" />
    </svg>
  );
}

/** Retrouve un joueur du tournoi : fiche à jour (avec photo) sinon la copie du tournoi. */
export function usePlayerLookup(t: Tournament): (id: string | null | undefined) => Player | null {
  const live = useLivePlayersMap();
  const byId = new Map(t.players.map((p) => [p.id, p]));
  return (id) => {
    if (!id) return null;
    return live.get(id) ?? (byId.get(id) as Player | undefined) ?? null;
  };
}

/** Lance un match du tournoi sur l'écran FaceOff. */
export function useLaunchMatch(t: Tournament) {
  const navigate = useNavigate();
  const setCurrentMatch = useMatchStore((s) => s.setCurrentMatch);
  const lookup = usePlayerLookup(t);
  return (m: TournamentMatch) => {
    const joueur1 = lookup(m.p1);
    const joueur2 = lookup(m.p2);
    if (!joueur1 || !joueur2) return;
    setCurrentMatch({
      joueur1,
      joueur2,
      score1: 0,
      score2: 0,
      faute1: 0,
      faute2: 0,
      temps: t.temps,
      date: new Date().toISOString(),
      tournoi: { tournamentId: t.id, tMatchId: m.id, label: matchLabel(t, m), knockout: isKnockout(m) },
    });
    navigate('/faceoff');
  };
}

function Row({ player, score, state, placeholder }: {
  player: Player | null;
  score?: number;
  state: 'winner' | 'loser' | 'neutral';
  placeholder: string;
}) {
  const winner = state === 'winner';
  return (
    <div
      className={`flex-1 flex items-center gap-2.5 px-3 min-w-0 ${winner ? 'border-l-4 border-goat-red' : 'pl-4'} ${
        state === 'loser' ? 'text-goat-mist-dim' : ''
      }`}
    >
      {player ? (
        <PlayerAvatar player={player} size="sm" className="!w-7 !h-7 !text-[10px]" />
      ) : (
        <span className="w-7 h-7 rounded-full border-2 border-dashed border-white/25 flex-shrink-0" />
      )}
      <span className={`flex-1 truncate text-sm ${player ? (winner || state === 'neutral' ? 'font-bold' : '') : 'text-goat-mist-dim'}`}>
        {player ? `${player.prenom} ${player.nom}` : placeholder}
      </span>
      {score !== undefined && <span className="font-display text-2xl leading-none tabular-nums">{score}</span>}
    </div>
  );
}

/** Carte d'un match dans un tableau (2 lignes : joueur 1, joueur 2). */
export function MatchCard({ t, m, isNext, placeholders = ['À déterminer', 'À déterminer'], className = '' }: {
  t: Tournament;
  m: TournamentMatch;
  isNext?: boolean;
  placeholders?: [string, string];
  className?: string;
}) {
  const lookup = usePlayerLookup(t);
  const launch = useLaunchMatch(t);
  const p1 = lookup(m.p1);
  const p2 = lookup(m.p2);
  const state = (id: string | null): 'winner' | 'loser' | 'neutral' =>
    !m.played || m.winner === null ? 'neutral' : m.winner === id ? 'winner' : 'loser';
  const ready = !m.played && p1 && p2;

  if (m.bye) {
    return (
      <div className={`w-full rounded-[14px] bg-goat-navy-light/60 border border-white/10 overflow-hidden flex flex-col h-[64px] ${className}`}>
        <Row player={p1} state="winner" placeholder="" />
        <span className="px-4 pb-2 text-[11px] font-bold tracking-wider text-goat-mist-dim">QUALIFIÉ D'OFFICE</span>
      </div>
    );
  }

  return (
    <div
      className={`w-full rounded-[14px] overflow-hidden flex flex-col ${
        isNext
          ? 'bg-goat-navy-light border-2 border-goat-red shadow-[0_0_0_5px_rgba(224,27,27,0.18)]'
          : ready
          ? 'bg-goat-navy-light border border-white/20'
          : m.played
          ? 'bg-goat-navy-light border border-white/15'
          : 'border-2 border-dashed border-white/20'
      } ${className}`}
    >
      {isNext && (
        <div className="h-6 flex items-center px-3 bg-goat-red text-[10px] font-extrabold tracking-[0.14em]">PROCHAIN MATCH</div>
      )}
      <div className="h-[42px] flex"><Row player={p1} score={m.played ? m.score1 : undefined} state={state(m.p1)} placeholder={placeholders[0]} /></div>
      <div className="h-px bg-white/10" />
      <div className="h-[42px] flex"><Row player={p2} score={m.played ? m.score2 : undefined} state={state(m.p2)} placeholder={placeholders[1]} /></div>
      {ready && (
        <button
          onClick={() => launch(m)}
          className={`h-8 flex items-center justify-center gap-1.5 font-display text-lg tracking-wider transition-colors ${
            isNext ? 'bg-white text-goat-navy hover:bg-goat-mist' : 'border-t border-white/10 hover:bg-white/10'
          }`}
        >
          <Play className="w-3.5 h-3.5" fill="currentColor" />
          Lancer ce match
        </button>
      )}
    </div>
  );
}

/** Liste des matchs prêts à jouer (poules, championnat). */
export function UpcomingList({ t, matches, title }: { t: Tournament; matches: TournamentMatch[]; title: string }) {
  const lookup = usePlayerLookup(t);
  const launch = useLaunchMatch(t);
  if (!matches.length) return null;
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-[11px] font-extrabold tracking-[0.14em] text-goat-mist-dim">{title}</h2>
      {matches.map((m, i) => {
        const p1 = lookup(m.p1);
        const p2 = lookup(m.p2);
        return (
          <div
            key={m.id}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-[14px] bg-goat-navy-light ${
              i === 0 ? 'border-2 border-goat-red' : 'border border-white/15'
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-goat-mist-dim">{matchLabel(t, m)}</p>
              <p className="font-bold text-sm truncate">
                {p1?.prenom} {p1?.nom} <span className="text-goat-mist-dim font-medium">vs</span> {p2?.prenom} {p2?.nom}
              </p>
            </div>
            <button
              onClick={() => launch(m)}
              className={`h-9 px-3.5 rounded-lg font-bold text-sm flex-shrink-0 transition-colors ${
                i === 0 ? 'bg-goat-red text-white hover:bg-goat-red-light' : 'bg-white text-goat-navy hover:bg-goat-mist'
              }`}
            >
              Lancer
            </button>
          </div>
        );
      })}
    </section>
  );
}

/** Bandeau du champion, une fois le tournoi terminé. */
export function ChampionBanner({ t }: { t: Tournament }) {
  const lookup = usePlayerLookup(t);
  const champion = lookup(t.championId);
  if (!champion) return null;
  return (
    <div className="rounded-[22px] bg-goat-red p-5 flex items-center gap-4 shadow-xl shadow-black/25">
      <div className="relative flex-shrink-0">
        <Crown className="absolute -top-5 left-1/2 -translate-x-1/2 w-9 h-7 z-10" />
        <PlayerAvatar player={champion} size="lg" className="ring-4 ring-white" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-extrabold tracking-[0.2em]">CHAMPION DU TOURNOI</p>
        <p className="font-display text-4xl md:text-5xl leading-none truncate">
          {champion.prenom} {champion.nom}
        </p>
      </div>
    </div>
  );
}
