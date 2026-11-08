import { useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, RotateCcw } from 'lucide-react';
import { useMatchStore } from '../store/matchStore';
import { useSettingsStore } from '../store/settingsStore';
import { Player } from '../types';
import { formatTime } from '../lib/utils';

const CONFETTI_COLORS = ['#E01B1B', '#FFFFFF', '#E01B1B', '#8EA0BF'];

function Confetti({ count = 40 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const r = ((i * 9301 + 49297) % 233280) / 233280;
        return {
          left: `${(i * 37) % 100}%`,
          color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          delay: `${(-r * 3.6).toFixed(2)}s`,
          duration: `${(3 + r * 1.8).toFixed(2)}s`,
        };
      }),
    [count]
  );
  return (
    <div aria-hidden className="fixed inset-0 z-20 pointer-events-none overflow-hidden">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti"
          style={{ left: p.left, backgroundColor: p.color, animationDelay: p.delay, animationDuration: p.duration }}
        />
      ))}
    </div>
  );
}

function Crown({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      viewBox="0 0 24 20"
      fill="#E01B1B"
      stroke="#FFFFFF"
      strokeWidth="1"
      strokeLinejoin="round"
    >
      <path d="M2 6l5 4 5-8 5 8 5-4-2 12H4z" />
    </svg>
  );
}

/** Photo du joueur en plein cadre, ou ses initiales en filigrane s'il n'en a pas. */
function PlayerPhoto({ player, className = '' }: { player: Player; className?: string }) {
  const initials = `${player.prenom[0] ?? ''}${player.nom[0] ?? ''}`.toUpperCase();
  return (
    <div className={`overflow-hidden bg-goat-navy-light ${className}`}>
      {player.photo ? (
        <img src={player.photo} alt="" className="w-full h-full object-cover object-top" />
      ) : (
        <div
          aria-hidden
          className="w-full h-full flex items-center justify-center font-display text-[min(55vw,360px)] leading-none text-white/10 select-none"
        >
          {initials}
        </div>
      )}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <span className="flex flex-col items-center">
      <span className="font-display text-2xl md:text-[32px] leading-none tabular-nums">{value}</span>
      <span className="text-[11px] md:text-xs text-goat-mist">{label}</span>
    </span>
  );
}

export default function Winner() {
  const navigate = useNavigate();
  const location = useLocation();
  const matches = useMatchStore((s) => s.matches);
  const matchId = location.state?.matchId;
  const match = matches.find((m) => m.id === matchId);
  const currentMatch = useMatchStore((s) => s.currentMatch);
  const setCurrentMatch = useMatchStore((s) => s.setCurrentMatch);
  const animationsEnabled = useSettingsStore((s) => s.animationsEnabled);

  const winner = match?.vainqueur ?? currentMatch?.vainqueur ?? null;
  const score1 = match?.score1 ?? currentMatch?.score1 ?? 0;
  const score2 = match?.score2 ?? currentMatch?.score2 ?? 0;
  const faute1 = match?.faute1 ?? currentMatch?.faute1 ?? 0;
  const faute2 = match?.faute2 ?? currentMatch?.faute2 ?? 0;
  const duree = match?.duree ?? currentMatch?.duree ?? 0;
  const j1 = match?.joueur1 ?? currentMatch?.joueur1;
  const j2 = match?.joueur2 ?? currentMatch?.joueur2;

  useEffect(() => {
    if (!j1 || !j2) navigate('/');
  }, []);

  if (!j1 || !j2) return null;

  function revanche() {
    if (!j1 || !j2) return;
    setCurrentMatch({
      joueur1: j1,
      joueur2: j2,
      temps: match?.temps ?? currentMatch?.temps ?? 300,
      date: new Date().toISOString(),
    });
    navigate('/faceoff');
  }

  const winnerIsJ1 = winner?.id === j1.id;
  const loser = winner ? (winnerIsJ1 ? j2 : j1) : null;
  const winScore = winnerIsJ1 ? score1 : score2;
  const loseScore = winnerIsJ1 ? score2 : score1;
  const winFautes = winnerIsJ1 ? faute1 : faute2;
  const loseFautes = winnerIsJ1 ? faute2 : faute1;

  return (
    <div className="min-h-screen bg-goat-navy relative overflow-hidden flex flex-col md:flex-row">
      {animationsEnabled && winner && <Confetti />}

      {/* Photo : haut de l'écran sur téléphone, moitié gauche sur grand écran */}
      <div className="absolute inset-x-0 top-0 h-[66vh] md:inset-y-0 md:right-auto md:h-auto md:w-[53%]">
        {winner ? (
          <PlayerPhoto player={winner} className="w-full h-full" />
        ) : (
          <div className="w-full h-full flex">
            <PlayerPhoto player={j1} className="flex-1 h-full" />
            <div className="w-1.5 bg-white" />
            <PlayerPhoto player={j2} className="flex-1 h-full" />
          </div>
        )}
      </div>
      <div aria-hidden className="absolute inset-0 winner-veil" />

      {/* Contenu */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24 }}
        className="relative z-10 w-full min-h-screen flex flex-col px-5 pt-12 pb-7 md:ml-auto md:w-[47%] md:max-w-[620px] md:min-h-0 md:h-screen md:justify-center md:pr-16 md:pl-4 md:py-12"
      >
        <div className="flex items-center justify-between">
          <span className="font-display text-[22px] md:text-[26px] tracking-wide">
            FACE<span className="text-goat-red">OFF</span>
          </span>
          <span
            className={`font-display text-xl md:text-[22px] tracking-[0.3em] px-3 pt-1 pb-0.5 rounded-md ${
              winner ? 'bg-goat-red text-white' : 'bg-white text-goat-navy'
            }`}
          >
            {winner ? 'Vainqueur' : 'Égalité'}
          </span>
        </div>

        <div className="mt-auto md:mt-10 flex flex-col gap-4">
          {winner ? (
            <>
              <div className="flex items-end gap-3">
                <Crown className="crown-float w-12 h-10 md:w-16 md:h-12 flex-shrink-0 mb-2 md:mb-4" />
                <h1 className="font-display text-[clamp(3.5rem,18vw,4.75rem)] md:text-[112px] leading-[0.85] break-words">
                  {winner.prenom} {winner.nom}
                </h1>
              </div>
              <p className="-mt-1 text-[13px] md:text-[15px] font-bold tracking-[0.14em] uppercase text-goat-mist">
                {winner.surnom ? `« ${winner.surnom} » · ` : ''}{winner.categorie}
                <span className="hidden md:inline normal-case tracking-normal"> · contre {loser!.prenom} {loser!.nom}</span>
              </p>
            </>
          ) : (
            <>
              <h1 className="font-display text-7xl md:text-[112px] leading-[0.85]">Match nul</h1>
              <p className="-mt-1 text-sm font-semibold text-goat-mist">
                {j1.prenom} et {j2.prenom} ne lâchent rien. Revanche ?
              </p>
            </>
          )}

          {/* Score et statistiques */}
          <div className="rounded-[20px] md:rounded-[22px] bg-goat-navy-light border border-white/15 px-[18px] py-4 md:px-6 md:py-5 flex items-center justify-between gap-4">
            <span className="font-display text-[54px] md:text-[80px] leading-[0.85] tabular-nums whitespace-nowrap">
              {winner ? winScore : score1}
              <span className="text-goat-mist-dim"> – {winner ? loseScore : score2}</span>
            </span>
            <span className="flex gap-4 md:gap-6">
              <Stat value={formatTime(duree)} label="Durée" />
              <Stat value={`${winner ? winFautes : faute1} – ${winner ? loseFautes : faute2}`} label="Fautes" />
            </span>
          </div>
          {winner && (
            <p className="-mt-2 text-xs text-goat-mist md:hidden">
              contre <strong className="text-white">{loser!.prenom} {loser!.nom}</strong>
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col md:flex-row gap-2.5 md:gap-3 mt-1 md:mt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={revanche}
              className="h-14 md:h-[60px] md:flex-[1.5] md:min-w-0 rounded-2xl bg-goat-red text-white font-display text-[26px] md:text-[24px] tracking-wider whitespace-nowrap px-4 flex items-center justify-center gap-2.5 hover:bg-goat-red-light transition-colors"
            >
              <RotateCcw className="w-5 h-5 md:hidden lg:block" strokeWidth={2.5} />
              Prends ta revanche
            </motion.button>
            <div className="flex gap-2.5 md:contents">
              <button
                onClick={() => navigate('/new-match')}
                className="flex-1 min-w-0 h-[50px] md:h-[60px] rounded-[14px] md:rounded-2xl bg-white text-goat-navy font-bold whitespace-nowrap px-3 md:text-sm hover:bg-goat-mist transition-colors"
              >
                Nouveau match
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 min-w-0 md:flex-[0.8] h-[50px] md:h-[60px] rounded-[14px] md:rounded-2xl border border-white/30 text-white font-bold flex items-center justify-center gap-2 px-3 hover:bg-white/10 transition-colors"
              >
                <Home className="w-[18px] h-[18px]" />
                Accueil
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
