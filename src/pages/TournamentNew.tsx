import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Shuffle } from 'lucide-react';
import { usePlayersStore } from '../store/playersStore';
import { useSettingsStore } from '../store/settingsStore';
import { useTournamentStore } from '../store/tournamentStore';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { PageHeader } from '../components/tournament/PageHeader';
import { FORMATS, createTournament, roundName } from '../lib/tournament';
import type { TournamentFormat } from '../types';

const DURATIONS = [
  { label: '3 min', seconds: 180 },
  { label: '5 min', seconds: 300 },
  { label: '10 min', seconds: 600 },
  { label: '15 min', seconds: 900 },
];

function FormatIcon({ format, active }: { format: TournamentFormat; active: boolean }) {
  const stroke = active ? '#FFFFFF' : '#B8C4D9';
  if (format === 'elimination')
    return (
      <svg width="40" height="32" viewBox="0 0 40 32" fill="none" stroke={stroke} strokeWidth="2" aria-hidden>
        <path d="M2 4h8v8H2M2 20h8v8H2M10 8h8v16h-8M18 16h10M28 12h10v8H28" />
      </svg>
    );
  if (format === 'poules')
    return (
      <svg width="40" height="32" viewBox="0 0 40 32" fill="none" stroke={stroke} strokeWidth="2" aria-hidden>
        <rect x="2" y="3" width="14" height="11" rx="2" />
        <rect x="2" y="18" width="14" height="11" rx="2" />
        <path d="M16 8h6v16h-6M22 16h6" />
        <rect x="28" y="11" width="10" height="10" rx="2" />
      </svg>
    );
  return (
    <svg width="40" height="32" viewBox="0 0 40 32" fill="none" stroke={stroke} strokeWidth="2" aria-hidden>
      <rect x="2" y="3" width="36" height="26" rx="3" />
      <path d="M2 12h36M2 20h36M14 3v26" />
    </svg>
  );
}

export default function TournamentNew() {
  const navigate = useNavigate();
  const players = usePlayersStore((s) => s.players);
  const defaultTime = useSettingsStore((s) => s.defaultTime);
  const addTournament = useTournamentStore((s) => s.addTournament);

  const [nom, setNom] = useState('');
  const [format, setFormat] = useState<TournamentFormat>('elimination');
  const [selected, setSelected] = useState<string[]>(() => players.map((p) => p.id));
  const [tirage, setTirage] = useState(true);
  const [temps, setTemps] = useState(DURATIONS.some((d) => d.seconds === defaultTime) ? defaultTime : 300);

  const rules = FORMATS[format];
  const chosen = players.filter((p) => selected.includes(p.id));
  const tooFew = chosen.length < rules.min;
  const tooMany = chosen.length > rules.max;

  // Aperçu de la structure, calculé avec le vrai générateur (sans tirage au sort).
  const apercu = useMemo(() => {
    if (tooFew || tooMany) return null;
    const t = createTournament({ nom: '', format, players: chosen, temps, tirageAuSort: false });
    const real = t.matches.filter((m) => !m.bye).length;
    if (format === 'elimination') {
      const rounds = Math.max(...t.matches.map((m) => m.round)) + 1;
      const names = Array.from({ length: rounds }, (_, r) => {
        const n = t.matches.filter((m) => m.round === r).length;
        return roundName(n, r).replace(' de finale', '').toLowerCase();
      });
      const byes = t.matches.filter((m) => m.bye).length;
      return `${real} matchs : ${names.join(', ')}${byes ? ` · ${byes} joueur${byes > 1 ? 's' : ''} qualifié${byes > 1 ? 's' : ''} d'office au 1er tour` : ''}`;
    }
    if (format === 'poules') {
      const groups = Object.values(t.groups ?? {});
      const poules = groups.length === 2 ? `2 poules (${groups[0].length} et ${groups[1].length})` : `1 poule de ${groups[0].length}`;
      const suite = groups.length === 2 ? 'demi-finales puis finale' : 'finale entre les 2 premiers';
      return `${real} matchs : ${poules}, ${suite}`;
    }
    const journees = Math.max(...t.matches.map((m) => m.round)) + 1;
    return `${real} matchs en ${journees} journées`;
  }, [format, chosen, temps, tooFew, tooMany]);

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  function lancer() {
    if (tooFew || tooMany) return;
    const t = createTournament({ nom: nom || `Tournoi du ${new Date().toLocaleDateString('fr-FR')}`, format, players: chosen, temps, tirageAuSort: tirage });
    addTournament(t);
    navigate(`/tournois/${t.id}`, { replace: true });
  }

  return (
    <div className="min-h-screen bg-goat-navy grain">
      <PageHeader title="Nouveau tournoi" back="/tournois" />

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6 pb-32">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="nom-tournoi" className="text-xs text-goat-mist">Nom du tournoi</label>
          <input
            id="nom-tournoi"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder={`Tournoi du ${new Date().toLocaleDateString('fr-FR')}`}
            className="h-12 rounded-xl border border-white/15 bg-goat-navy-deep px-4 text-white placeholder-goat-mist-dim focus:outline-none focus:border-goat-red"
          />
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-xs text-goat-mist mb-1.5">Format</legend>
          {(Object.keys(FORMATS) as TournamentFormat[]).map((f) => {
            const active = format === f;
            return (
              <button
                key={f}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setFormat(f)}
                className={`flex items-center gap-3 p-3 rounded-[14px] text-left transition-colors ${
                  active ? 'border-2 border-goat-red bg-goat-red/15' : 'border border-white/15 bg-goat-navy-light hover:border-white/35'
                }`}
              >
                <FormatIcon format={f} active={active} />
                <span className="flex-1 min-w-0">
                  <span className="block font-extrabold text-sm">{FORMATS[f].lettre} · {FORMATS[f].nom}</span>
                  <span className="block text-xs text-goat-mist">{FORMATS[f].description}</span>
                </span>
                <span
                  className={`w-5 h-5 rounded-full flex-shrink-0 ${active ? 'bg-goat-red border-[3px] border-white' : 'border-2 border-white/40'}`}
                />
              </button>
            );
          })}
        </fieldset>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-goat-mist">Joueurs</span>
            <span className="flex items-center gap-3 text-xs">
              <button onClick={() => setSelected(players.map((p) => p.id))} className="text-goat-mist hover:text-white underline-offset-2 hover:underline">Tous</button>
              <button onClick={() => setSelected([])} className="text-goat-mist hover:text-white underline-offset-2 hover:underline">Aucun</button>
              <span className="font-bold">{chosen.length} sélectionné{chosen.length > 1 ? 's' : ''}</span>
            </span>
          </div>
          {players.length === 0 ? (
            <button onClick={() => navigate('/players')} className="rounded-[14px] border-2 border-dashed border-white/25 p-5 text-sm text-goat-mist hover:text-white">
              Aucun joueur pour l'instant. Ajoute des joueurs d'abord.
            </button>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-x-2 gap-y-3">
              {players.map((p) => {
                const on = selected.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    onClick={() => toggle(p.id)}
                    className="flex flex-col items-center gap-1.5 min-w-0"
                  >
                    <span className="relative">
                      <PlayerAvatar player={p} size="md" className={on ? 'ring-2 ring-goat-red' : 'opacity-40'} />
                      {on && (
                        <span className="absolute -right-1 -bottom-1 w-5 h-5 rounded-full bg-goat-red border-2 border-goat-navy flex items-center justify-center">
                          <Check className="w-3 h-3" strokeWidth={4} />
                        </span>
                      )}
                    </span>
                    <span className={`text-[11px] font-semibold truncate max-w-full ${on ? '' : 'text-goat-mist-dim'}`}>{p.prenom}</span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="grid sm:grid-cols-2 gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={tirage}
            onClick={() => setTirage((v) => !v)}
            className="flex items-center justify-between gap-3 px-4 h-14 rounded-[14px] bg-goat-navy-light text-sm font-semibold"
          >
            <span className="flex items-center gap-2"><Shuffle className="w-4 h-4" />Tirage au sort</span>
            <span className={`w-10 h-6 rounded-full relative transition-colors ${tirage ? 'bg-goat-red' : 'bg-white/15'}`}>
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${tirage ? 'right-1' : 'left-1'}`} />
            </span>
          </button>
          <div className="flex items-center gap-1.5 p-1.5 rounded-[14px] bg-goat-navy-light">
            {DURATIONS.map((d) => (
              <button
                key={d.seconds}
                onClick={() => setTemps(d.seconds)}
                className={`flex-1 h-11 rounded-[10px] text-sm font-bold transition-colors ${
                  temps === d.seconds ? 'bg-goat-red text-white' : 'text-goat-mist hover:text-white'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-goat-navy/90 backdrop-blur-md border-t border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex flex-col gap-2">
          <p className={`text-xs text-center ${tooFew || tooMany ? 'text-goat-red-soft' : 'text-goat-mist'}`}>
            {tooFew
              ? `Il faut au moins ${rules.min} joueurs pour ce format.`
              : tooMany
              ? `Maximum ${rules.max} joueurs pour ce format.`
              : apercu}
          </p>
          <button
            onClick={lancer}
            disabled={tooFew || tooMany}
            className="h-14 rounded-2xl bg-goat-red text-white font-display text-[26px] tracking-wider hover:bg-goat-red-light transition-colors disabled:opacity-40"
          >
            Lancer le tournoi
          </button>
        </div>
      </div>
    </div>
  );
}
