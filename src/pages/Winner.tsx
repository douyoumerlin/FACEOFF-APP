import { useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, RotateCcw } from 'lucide-react';
import { useMatchStore } from '../store/matchStore';
import { useSettingsStore } from '../store/settingsStore';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { formatTime } from '../lib/utils';
import logoFondSombre from '../assets/brand/logo-fond-sombre.png';

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
    <div aria-hidden className="fixed inset-0 pointer-events-none overflow-hidden">
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

function Crown() {
  return (
    <svg
      aria-hidden
      className="crown-float relative z-10 -mb-2.5"
      width="56"
      height="44"
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

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-display text-3xl leading-none tabular-nums">{value}</span>
      <span className="text-xs font-medium text-goat-mist">{label}</span>
    </div>
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

  return (
    <div className="min-h-screen bg-goat-navy grain relative overflow-hidden flex flex-col items-center px-5 pt-14 pb-8">
      {animationsEnabled && winner && <Confetti />}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="relative z-10 w-full max-w-md flex flex-col items-center gap-5 text-center flex-1"
      >
        <img src={logoFondSombre} alt="Logo GOAT225" className="w-12 h-12 object-contain" />

        {winner ? (
          <>
            <p className="font-display text-[22px] tracking-[0.3em] bg-goat-red text-white px-3.5 pt-1 pb-0.5 rounded-md">
              Vainqueur
            </p>

            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 250, damping: 20, delay: 0.2 }}
              className="flex flex-col items-center"
            >
              <Crown />
              <PlayerAvatar
                player={winner}
                size="xl"
                className="w-36 h-36 text-5xl border-4 border-goat-red ring-pulse"
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <h1 className="font-display text-6xl leading-[0.9]">
                {winner.prenom} {winner.nom}
              </h1>
              <p className="text-sm font-semibold text-goat-mist mt-2">
                {winner.surnom ? `« ${winner.surnom} » · ` : ''}{winner.categorie}
              </p>
            </motion.div>
          </>
        ) : (
          <>
            <p className="font-display text-[22px] tracking-[0.3em] bg-white text-goat-navy px-3.5 pt-1 pb-0.5 rounded-md">
              Égalité
            </p>
            <h1 className="font-display text-7xl leading-[0.9] mt-4">Match nul</h1>
            <p className="text-sm font-semibold text-goat-mist">Personne ne lâche rien. Revanche ?</p>
          </>
        )}

        {/* Récapitulatif */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full rounded-[22px] border border-white/15 bg-goat-navy-light p-5 flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1 text-left">
              <span className="text-[13px] font-semibold text-goat-mist truncate max-w-[110px]">{j1.prenom}</span>
              <span className={`font-display text-6xl leading-[0.9] tabular-nums ${winner && !winnerIsJ1 ? 'text-goat-mist-dim' : 'text-white'}`}>
                {score1}
              </span>
            </div>
            <span className="text-xs font-extrabold tracking-[0.2em] bg-goat-red text-white px-2.5 py-1 rounded-md">FINAL</span>
            <div className="flex flex-col gap-1 items-end">
              <span className="text-[13px] font-semibold text-goat-mist truncate max-w-[110px]">{j2.prenom}</span>
              <span className={`font-display text-6xl leading-[0.9] tabular-nums ${winner && winnerIsJ1 ? 'text-goat-mist-dim' : 'text-white'}`}>
                {score2}
              </span>
            </div>
          </div>
          <div className="h-px bg-white/10" />
          <div className="grid grid-cols-3 gap-2">
            <Stat value={formatTime(duree)} label="Durée" />
            <Stat value={`+${Math.abs(score1 - score2)}`} label="Écart" />
            <Stat value={`${faute1} – ${faute2}`} label="Fautes" />
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="w-full flex flex-col gap-2.5 mt-auto pt-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={revanche}
            className="h-14 rounded-2xl bg-goat-red text-white font-display text-[26px] tracking-wider flex items-center justify-center gap-2.5 hover:bg-goat-red-light transition-colors"
          >
            <RotateCcw className="w-5 h-5" strokeWidth={2.5} />
            Prends ta revanche
          </motion.button>
          <div className="flex gap-2.5">
            <button
              onClick={() => navigate('/new-match')}
              className="flex-1 h-[52px] rounded-[14px] bg-white text-goat-navy font-bold flex items-center justify-center gap-2 hover:bg-goat-mist transition-colors"
            >
              Nouveau match
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 h-[52px] rounded-[14px] border border-white/30 text-white font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
            >
              <Home className="w-[18px] h-[18px]" />
              Accueil
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
