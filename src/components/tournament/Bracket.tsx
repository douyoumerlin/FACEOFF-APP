import { useState } from 'react';
import type { Tournament, TournamentMatch } from '../../types';
import { PlayerAvatar } from '../PlayerAvatar';
import { roundName } from '../../lib/tournament';
import { Crown, MatchCard, usePlayerLookup } from './shared';

interface BracketProps {
  t: Tournament;
  phase: 'elimination' | 'finale';
  nextId?: string;
  /** Textes des places encore inconnues au 1er tour (ex. « 1er poule A »). */
  firstRoundPlaceholders?: [string, string][];
}

function useRounds(t: Tournament, phase: 'elimination' | 'finale') {
  const matches = t.matches.filter((m) => m.phase === phase);
  const count = Math.max(0, ...matches.map((m) => m.round + 1));
  return Array.from({ length: count }, (_, r) => matches.filter((m) => m.round === r).sort((a, b) => a.index - b.index));
}

function placeholdersFor(round: number, m: TournamentMatch, first?: [string, string][]): [string, string] {
  if (round === 0 && first?.[m.index]) return first[m.index];
  if (round === 0) return ['À déterminer', 'À déterminer'];
  return [`Vainqueur match ${m.index * 2 + 1}`, `Vainqueur match ${m.index * 2 + 2}`];
}

function ChampionSlot({ t }: { t: Tournament }) {
  const lookup = usePlayerLookup(t);
  const champion = lookup(t.championId);
  return (
    <div className="w-[210px] rounded-[20px] bg-gradient-to-b from-goat-navy-light to-goat-navy border border-white/15 py-6 flex flex-col items-center gap-2.5">
      <Crown className="w-14 h-11" />
      {champion ? (
        <>
          <PlayerAvatar player={champion} size="lg" className="ring-4 ring-goat-red" />
          <span className="font-display text-3xl leading-none text-center px-3">{champion.prenom} {champion.nom}</span>
        </>
      ) : (
        <>
          <span className="w-20 h-20 rounded-full border-[3px] border-dashed border-white/30 flex items-center justify-center font-display text-4xl text-goat-mist-dim">?</span>
          <span className="text-xs font-bold tracking-[0.14em] text-goat-mist-dim">À DÉCOUVRIR</span>
        </>
      )}
    </div>
  );
}

/**
 * Tableau complet (grand écran) : une colonne par tour, reliées par des traits.
 * Chaque colonne partage la hauteur à parts égales, ce qui aligne naturellement
 * chaque match entre les deux matchs qui l'alimentent.
 */
export function BracketTree({ t, phase, nextId, firstRoundPlaceholders }: BracketProps) {
  const rounds = useRounds(t, phase);
  const firstCount = rounds[0]?.length ?? 1;
  const height = Math.max(firstCount * 152, 380);

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-8 min-w-max">
        {rounds.map((matches, r) => (
          <div key={r} className="w-[230px] flex flex-col">
            <h3 className="h-6 text-[11px] font-extrabold tracking-[0.18em] text-goat-mist-dim uppercase">
              {roundName(matches.length, r)}
            </h3>
            <div className="flex flex-col" style={{ height }}>
              {Array.from({ length: Math.ceil(matches.length / 2) }, (_, pair) => {
                const duo = matches.slice(pair * 2, pair * 2 + 2);
                const last = r === rounds.length - 1;
                return (
                  <div key={pair} className={`relative flex-1 flex flex-col ${!last && duo.length === 2 ? 'bracket-pair' : ''}`}>
                    {duo.map((m) => (
                      <div key={m.id} className={`relative flex-1 flex items-center ${r > 0 ? 'bracket-in' : ''} ${last ? 'bracket-out' : ''}`}>
                        <MatchCard t={t} m={m} isNext={m.id === nextId} placeholders={placeholdersFor(r, m, firstRoundPlaceholders)} />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div className="flex flex-col">
          <h3 className="h-6 text-[11px] font-extrabold tracking-[0.18em] text-goat-mist-dim">CHAMPION</h3>
          <div className="flex items-center" style={{ height }}>
            <ChampionSlot t={t} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Version téléphone : un onglet par tour, matchs en liste. */
export function BracketTabs({ t, phase, nextId, firstRoundPlaceholders }: BracketProps) {
  const rounds = useRounds(t, phase);
  const current = rounds.findIndex((ms) => ms.some((m) => !m.played));
  const [tab, setTab] = useState(current === -1 ? Math.max(0, rounds.length - 1) : current);
  const matches = rounds[tab] ?? [];

  return (
    <div className="flex flex-col gap-3">
      <div role="tablist" className="flex gap-1.5 p-1 rounded-[14px] bg-goat-navy-deep overflow-x-auto">
        {rounds.map((ms, r) => {
          const done = ms.every((m) => m.played);
          return (
            <button
              key={r}
              role="tab"
              aria-selected={tab === r}
              onClick={() => setTab(r)}
              className={`flex-1 min-w-[84px] h-10 px-2 rounded-[10px] text-[13px] whitespace-nowrap transition-colors ${
                tab === r ? 'bg-goat-red text-white font-extrabold' : 'text-goat-mist-dim font-bold hover:text-white'
              }`}
            >
              {roundName(ms.length, r).replace(' de finale', '')}
              {done ? ' ✓' : ''}
            </button>
          );
        })}
      </div>
      {matches.map((m) => (
        <MatchCard key={m.id} t={t} m={m} isNext={m.id === nextId} placeholders={placeholdersFor(tab, m, firstRoundPlaceholders)} />
      ))}
      {tab === rounds.length - 1 && t.championId && (
        <div className="flex justify-center pt-2">
          <ChampionSlot t={t} />
        </div>
      )}
    </div>
  );
}
