import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Maximize, Minimize, Play } from 'lucide-react';
import { useTournamentStore } from '../store/tournamentStore';
import { PageHeader } from '../components/tournament/PageHeader';
import { BracketTabs, BracketTree } from '../components/tournament/Bracket';
import { StandingsTable } from '../components/tournament/StandingsTable';
import { ChampionBanner, UpcomingList, useLaunchMatch } from '../components/tournament/shared';
import { FORMATS, matchLabel, playableMatches, progressLabel } from '../lib/tournament';
import type { Tournament } from '../types';

/** Grand écran (≥ 768 px) : tableau complet. Téléphone : onglets par tour. */
function useIsWide() {
  const query = '(min-width: 768px)';
  const [wide, setWide] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setWide(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return wide;
}

function useFullscreen() {
  const [on, setOn] = useState(!!document.fullscreenElement);
  useEffect(() => {
    const onChange = () => setOn(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);
  const toggle = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else document.documentElement.requestFullscreen?.().catch(() => {});
  };
  return { on, toggle };
}

function EliminationView({ t, nextId }: { t: Tournament; nextId?: string }) {
  const wide = useIsWide();
  return wide ? <BracketTree t={t} phase="elimination" nextId={nextId} /> : <BracketTabs t={t} phase="elimination" nextId={nextId} />;
}

function PoulesView({ t, nextId }: { t: Tournament; nextId?: string }) {
  const wide = useIsWide();
  const groups = Object.entries(t.groups ?? {});
  const two = groups.length === 2;
  const finalPlaceholders: [string, string][] = two
    ? [['1er poule A', '2e poule B'], ['1er poule B', '2e poule A']]
    : [['1er de la poule', '2e de la poule']];
  const poulesNext = playableMatches(t).filter((m) => m.phase === 'poule');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 min-w-0">
        <div className={`grid gap-4 ${two ? 'md:grid-cols-2' : 'md:max-w-xl'}`}>
          {groups.map(([g, ids]) => {
            const ms = t.matches.filter((m) => m.phase === 'poule' && m.group === g);
            const left = ms.filter((m) => !m.played).length;
            return (
              <StandingsTable
                key={g}
                t={t}
                matches={ms}
                ids={ids}
                title={`Poule ${g}`}
                status={left ? `${left} MATCH${left > 1 ? 'S' : ''} RESTANT${left > 1 ? 'S' : ''}` : 'TERMINÉE'}
                highlightActive={left > 0 && ms.some((m) => m.id === nextId)}
                qualified={2}
                showDraws
              />
            );
          })}
        </div>
        <p className="text-xs text-goat-mist-dim flex items-center gap-2">
          <span className="w-3.5 h-3.5 border-l-4 border-goat-red" />
          Les 2 premiers de chaque poule vont en phase finale. Victoire 3 pts, nul 1 pt.
        </p>
        <UpcomingList t={t} matches={poulesNext} title="MATCHS DE POULE À JOUER" />
      </div>
      <div className="min-w-0 rounded-[22px] bg-goat-navy-deep p-4 md:p-6 flex flex-col gap-4">
        <h2 className="font-display text-3xl leading-none">Phase finale</h2>
        {wide ? (
          <BracketTree t={t} phase="finale" nextId={nextId} firstRoundPlaceholders={finalPlaceholders} />
        ) : (
          <BracketTabs t={t} phase="finale" nextId={nextId} firstRoundPlaceholders={finalPlaceholders} />
        )}
      </div>
    </div>
  );
}

function ChampionnatView({ t }: { t: Tournament }) {
  const ms = t.matches.filter((m) => m.phase === 'championnat');
  const journees = Math.max(...ms.map((m) => m.round)) + 1;
  const done = ms.filter((m) => m.played).length;
  const next = playableMatches(t);
  const journee = next[0]?.round;
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-[1.3] flex flex-col gap-3 min-w-0">
        <div className="h-1.5 rounded-full bg-goat-navy-deep overflow-hidden">
          <div className="h-full bg-goat-red transition-all" style={{ width: `${(done / ms.length) * 100}%` }} />
        </div>
        <StandingsTable t={t} matches={ms} ids={t.players.map((p) => p.id)} showDraws />
        <p className="text-xs text-goat-mist-dim">Victoire 3 pts · Nul 1 pt · À égalité : écart de points, puis points marqués.</p>
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        {journee !== undefined && (
          <UpcomingList
            t={t}
            matches={next.filter((m) => m.round === journee)}
            title={`JOURNÉE ${journee + 1} SUR ${journees}`}
          />
        )}
        {journee !== undefined && next.some((m) => m.round !== journee) && (
          <UpcomingList t={t} matches={next.filter((m) => m.round !== journee)} title="JOURNÉES SUIVANTES" />
        )}
      </div>
    </div>
  );
}

export default function TournamentView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const t = useTournamentStore((s) => s.tournaments.find((x) => x.id === id));
  const fullscreen = useFullscreen();

  useEffect(() => {
    if (!t) navigate('/tournois', { replace: true });
  }, [t, navigate]);

  // Les hooks doivent être appelés avant tout retour anticipé.
  const launch = useLaunchMatch(t ?? ({ players: [], matches: [] } as unknown as Tournament));
  if (!t) return null;

  const next = playableMatches(t)[0];
  const meta = `${FORMATS[t.format].nom} · ${t.players.length} joueurs · ${progressLabel(t)}`;

  return (
    <div className="min-h-screen bg-goat-navy grain">
      <PageHeader title={t.nom} subtitle={meta} back="/tournois" wide>
        <button
          onClick={fullscreen.toggle}
          className="hidden md:flex h-10 px-4 rounded-xl border border-white/25 text-sm font-bold items-center gap-2 hover:bg-white/10 transition-colors"
        >
          {fullscreen.on ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          {fullscreen.on ? 'Quitter la projection' : 'Mode projection'}
        </button>
        {next && (
          <button
            onClick={() => launch(next)}
            className="flex-1 sm:flex-none h-10 px-4 rounded-xl bg-goat-red text-white font-display text-xl tracking-wide flex items-center justify-center gap-2 hover:bg-goat-red-light transition-colors"
          >
            <Play className="w-4 h-4" fill="currentColor" />
            Jouer : {matchLabel(t, next)}
          </button>
        )}
      </PageHeader>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col gap-6">
        {t.championId && <ChampionBanner t={t} />}
        {t.format === 'elimination' && <EliminationView t={t} nextId={next?.id} />}
        {t.format === 'poules' && <PoulesView t={t} nextId={next?.id} />}
        {t.format === 'championnat' && <ChampionnatView t={t} />}
        {t.format === 'elimination' && (
          <p className="text-xs text-goat-mist-dim">
            Le tableau se met à jour tout seul : à la fin d'un match, le vainqueur avance au tour suivant.
          </p>
        )}
      </main>
    </div>
  );
}
