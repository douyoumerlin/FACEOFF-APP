import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Flag, Minus, Plus } from 'lucide-react';
import { useMatchStore } from '../store/matchStore';
import { useSettingsStore } from '../store/settingsStore';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Player } from '../types';
import { formatTime } from '../lib/utils';

type Side = 'red' | 'navy';

function ScoreButton({ onClick, children, label, variant = 'plus', side }: {
  onClick: () => void;
  children: React.ReactNode;
  label: string;
  variant?: 'plus' | 'minus';
  side: Side;
}) {
  const plus = side === 'red'
    ? 'bg-white text-goat-red hover:bg-goat-mist'
    : 'bg-white text-goat-navy hover:bg-goat-mist';
  const minus = side === 'red'
    ? 'bg-goat-navy/30 text-white hover:bg-goat-navy/45'
    : 'bg-white/10 text-white hover:bg-white/20';
  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      onClick={onClick}
      aria-label={label}
      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-display text-3xl transition-colors ${
        variant === 'plus' ? plus : minus
      }`}
    >
      {children}
    </motion.button>
  );
}

function ScoreDisplay({ score, animate, flashColor }: { score: number; animate: boolean; flashColor: string }) {
  return (
    <motion.div
      key={score}
      initial={animate ? { scale: 1.4, color: flashColor } : false}
      animate={{ scale: 1, color: '#FFFFFF' }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className="font-display tabular-nums leading-[0.85] text-white"
      style={{ fontSize: 'clamp(6rem, 22vw, 11rem)' }}
    >
      {score}
    </motion.div>
  );
}

function PlayerPanel({ player, side, score, faute, animate, onScore, onFaute }: {
  player: Player;
  side: Side;
  score: number;
  faute: number;
  animate: boolean;
  onScore: (delta: number) => void;
  onFaute: (delta: number) => void;
}) {
  const isRed = side === 'red';
  const name = `${player.prenom} ${player.nom}`;
  const initials = `${player.prenom[0] ?? ''}${player.nom[0] ?? ''}`.toUpperCase();
  // J1 : contenu à gauche sur téléphone, collé au VS (à droite) sur grand écran.
  // J2 : l'inverse. La photo occupe le côté opposé au texte.
  const align = isRed
    ? 'items-start text-left md:items-end md:text-right md:pr-16'
    : 'items-end text-right md:items-start md:text-left md:pl-16';

  return (
    <div
      className={`relative flex-1 min-h-[320px] overflow-hidden ${isRed ? 'bg-goat-red' : 'bg-goat-navy-light'}`}
    >
      {/* Photo plein cadre (ou initiales en filigrane sans photo) */}
      <div className={`absolute inset-y-0 ${isRed ? 'faceoff-photo-j1' : 'faceoff-photo-j2'}`}>
        {player.photo ? (
          <img src={player.photo} alt="" className="w-full h-full object-cover object-top" />
        ) : (
          <div aria-hidden className="w-full h-full flex items-center justify-center font-display text-[min(40vw,320px)] leading-none text-white/15 select-none">
            {initials}
          </div>
        )}
      </div>
      <div aria-hidden className={`absolute inset-0 ${isRed ? 'faceoff-veil-j1' : 'faceoff-veil-j2'}`} />

      {/* Nom, score, commandes */}
      <div className={`relative h-full flex flex-col justify-center gap-3 p-5 sm:p-8 ${align} ${isRed ? 'pb-14 md:pb-8' : 'pt-14 md:pt-8'}`}>
        <div>
          <p className="font-display text-[34px] md:text-5xl leading-[0.9] drop-shadow">{name}</p>
          <p className={`text-[11px] md:text-[13px] font-extrabold tracking-[0.14em] uppercase mt-1 ${isRed ? 'text-white' : 'text-goat-mist'}`}>
            {player.surnom ? `« ${player.surnom} » · ` : ''}{player.categorie}
          </p>
        </div>

        <ScoreDisplay score={score} animate={animate} flashColor={isRed ? '#12274A' : '#FF6B6B'} />

        <div className={`flex flex-wrap gap-2 items-center ${isRed ? 'md:flex-row-reverse' : ''}`}>
          <ScoreButton side={side} label={`Un point pour ${name}`} onClick={() => onScore(1)}>+1</ScoreButton>
          <ScoreButton side={side} label={`Deux points pour ${name}`} onClick={() => onScore(2)}>+2</ScoreButton>
          <ScoreButton side={side} label={`Trois points pour ${name}`} onClick={() => onScore(3)}>+3</ScoreButton>
          <ScoreButton side={side} variant="minus" label={`Retirer un point à ${name}`} onClick={() => onScore(-1)}>
            <Minus className="w-5 h-5" />
          </ScoreButton>
        </div>

        <div
          className={`rounded-xl pl-3 pr-1.5 py-1.5 flex items-center gap-3 backdrop-blur-sm ${
            isRed ? 'bg-goat-navy/35' : 'bg-white/15'
          }`}
        >
          <Flag className="w-4 h-4" />
          <span className="text-xs font-bold tracking-wider">FAUTES</span>
          <span className="font-display text-2xl leading-none tabular-nums">{faute}</span>
          <button
            onClick={() => onFaute(-1)}
            aria-label={`Retirer une faute à ${name}`}
            className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onFaute(1)}
            aria-label={`Faute pour ${name}`}
            className="w-8 h-8 rounded-lg bg-white text-goat-navy hover:bg-goat-mist flex items-center justify-center transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FaceOff() {
  const navigate = useNavigate();
  const { currentMatch, setCurrentMatch, saveMatch } = useMatchStore();
  useSettingsStore((s) => s.animationsEnabled);

  const [timeLeft, setTimeLeft] = useState(currentMatch?.temps ?? 300);
  const [running, setRunning] = useState(false);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [faute1, setFaute1] = useState(0);
  const [faute2, setFaute2] = useState(0);
  const [animScore1, setAnimScore1] = useState(false);
  const [animScore2, setAnimScore2] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<Player | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const elapsedRef = useRef<number>(0);

  useEffect(() => {
    if (!currentMatch?.joueur1) navigate('/new-match');
  }, []);

  useEffect(() => {
    if (running) {
      startTimeRef.current = Date.now() - elapsedRef.current * 1000;
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        elapsedRef.current = elapsed;
        const left = (currentMatch?.temps ?? 300) - elapsed;
        if (left <= 0) {
          setTimeLeft(0);
          setRunning(false);
          clearInterval(intervalRef.current!);
        } else {
          setTimeLeft(left);
        }
      }, 250);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  // Raccourcis clavier (version bureau) : ← point J1, → point J2, Espace chrono
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (showEnd) return;
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (e.code === 'ArrowLeft') { e.preventDefault(); changeScore(1, 1); }
      else if (e.code === 'ArrowRight') { e.preventDefault(); changeScore(2, 1); }
      else if (e.code === 'Space') {
        e.preventDefault();
        if (timeLeft > 0) setRunning((r) => !r);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showEnd, timeLeft]);

  function handleReset() {
    setRunning(false);
    setTimeLeft(currentMatch?.temps ?? 300);
    elapsedRef.current = 0;
  }

  function changeScore(player: 1 | 2, delta: number) {
    if (player === 1) {
      setScore1((s) => Math.max(0, s + delta));
      setAnimScore1(true);
      setTimeout(() => setAnimScore1(false), 350);
    } else {
      setScore2((s) => Math.max(0, s + delta));
      setAnimScore2(true);
      setTimeout(() => setAnimScore2(false), 350);
    }
  }

  function changeFaute(player: 1 | 2, delta: number) {
    if (player === 1) setFaute1((f) => Math.max(0, f + delta));
    else setFaute2((f) => Math.max(0, f + delta));
  }

  function handleEndMatch() {
    setRunning(false);
    // Auto-select winner if scores differ
    if (score1 !== score2) {
      setSelectedWinner(score1 > score2 ? currentMatch!.joueur1! : currentMatch!.joueur2!);
    } else {
      setSelectedWinner(null);
    }
    setShowEnd(true);
  }

  function confirmEnd() {
    if (!currentMatch?.joueur1 || !currentMatch?.joueur2) return;
    const duree = elapsedRef.current;
    const savedMatch = saveMatch({
      joueur1: currentMatch.joueur1,
      joueur2: currentMatch.joueur2,
      score1,
      score2,
      faute1,
      faute2,
      temps: currentMatch.temps ?? 300,
      vainqueur: selectedWinner,
      date: currentMatch.date ?? new Date().toISOString(),
      duree,
    });
    setCurrentMatch({
      ...currentMatch,
      score1,
      score2,
      faute1,
      faute2,
      vainqueur: selectedWinner,
      duree,
    });
    navigate('/winner', { state: { matchId: savedMatch.id } });
  }

  const timerColor =
    timeLeft <= 10
      ? 'text-goat-red-soft timer-red'
      : timeLeft <= 30
      ? 'text-white timer-orange'
      : 'text-white';

  const j1 = currentMatch?.joueur1;
  const j2 = currentMatch?.joueur2;

  if (!j1 || !j2) return null;

  return (
    <div className="min-h-screen bg-goat-navy grain flex flex-col select-none">
      {/* Chrono */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 px-4 pt-6 pb-5">
        <div className="flex items-center gap-3 px-6 py-2 rounded-full bg-goat-navy-deep border border-white/20">
          <span
            aria-hidden
            className={`w-2.5 h-2.5 rounded-full ${running ? 'bg-goat-red animate-pulse' : 'bg-goat-mist-dim'}`}
          />
          <span
            className={`font-display tabular-nums leading-none tracking-wide ${timerColor}`}
            style={{ fontSize: 'clamp(3.5rem, 12vw, 6rem)' }}
          >
            {formatTime(timeLeft)}
          </span>
        </div>

        <div className="flex gap-3">
          {!running ? (
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setRunning(true)}
              disabled={timeLeft === 0}
              className="flex items-center gap-2 px-7 h-14 rounded-2xl bg-goat-red text-white font-display text-2xl tracking-wider hover:bg-goat-red-light transition-colors disabled:opacity-40 shadow-lg shadow-black/25"
            >
              <Play className="w-5 h-5" fill="currentColor" />
              {elapsedRef.current > 0 ? 'REPRENDRE' : "C'EST PARTI"}
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setRunning(false)}
              className="flex items-center gap-2 px-7 h-14 rounded-2xl bg-white text-goat-navy font-display text-2xl tracking-wider hover:bg-goat-mist transition-colors shadow-lg shadow-black/25"
            >
              <Pause className="w-5 h-5" fill="currentColor" />
              PAUSE
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleReset}
            aria-label="Réinitialiser le chrono"
            className="w-14 h-14 rounded-2xl border border-white/20 bg-goat-navy-light text-white flex items-center justify-center hover:bg-white/15 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Arène : les deux joueurs face à face */}
      <div className="relative flex-1 flex flex-col md:flex-row overflow-hidden">
        <PlayerPanel
          player={j1}
          side="red"
          score={score1}
          faute={faute1}
          animate={animScore1}
          onScore={(d) => changeScore(1, d)}
          onFaute={(d) => changeFaute(1, d)}
        />
        <PlayerPanel
          player={j2}
          side="navy"
          score={score2}
          faute={faute2}
          animate={animScore2}
          onScore={(d) => changeScore(2, d)}
          onFaute={(d) => changeFaute(2, d)}
        />

        {/* Ligne de séparation en diagonale + badge VS */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 w-[140%] h-1.5 -translate-x-1/2 -translate-y-1/2 -rotate-6 md:w-1.5 md:h-[140%] md:rotate-6 bg-white"
        />
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white border-4 border-goat-navy flex items-center justify-center shadow-xl shadow-black/35">
          <span className="font-display text-[38px] leading-none text-goat-navy mt-1">VS</span>
        </div>
      </div>

      {/* Fin de match */}
      <div className="px-4 py-5 flex flex-col items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleEndMatch}
          className="w-full max-w-md h-14 rounded-2xl border-2 border-white/30 text-white font-display text-2xl tracking-wider hover:bg-white/10 transition-colors"
        >
          TERMINER LE MATCH
        </motion.button>
        <p className="hidden md:block text-xs text-goat-mist-dim">
          Raccourcis : ← point {j1.prenom} · → point {j2.prenom} · Espace pour lancer ou mettre en pause
        </p>
      </div>

      {/* End match dialog */}
      <ConfirmDialog
        open={showEnd}
        title="Terminer le match ?"
        confirmLabel="Valider le vainqueur"
        cancelLabel="Continuer"
        onConfirm={confirmEnd}
        onCancel={() => setShowEnd(false)}
      >
        <div className="space-y-3 my-4">
          <p className="text-sm text-goat-mist mb-3">Sélectionne le vainqueur :</p>
          {[j1, j2].map((p, i) => (
            <button
              key={p.id}
              onClick={() => setSelectedWinner(p)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl transition-colors ${
                selectedWinner?.id === p.id
                  ? 'bg-goat-red/20 border border-goat-red'
                  : 'bg-white/5 border border-transparent hover:bg-white/10'
              }`}
            >
              <PlayerAvatar player={p} size="sm" />
              <div className="flex-1 text-left">
                <p className="font-bold text-white">{p.prenom} {p.nom}</p>
                <p className="text-sm text-goat-mist">{i === 0 ? score1 : score2} pts</p>
              </div>
              {selectedWinner?.id === p.id && (
                <span className="bg-goat-red text-white text-xs font-bold px-2 py-1 rounded-md">VAINQUEUR</span>
              )}
            </button>
          ))}
          {score1 === score2 && (
            <button
              onClick={() => setSelectedWinner(null)}
              className={`w-full p-3 rounded-xl text-sm transition-colors ${
                selectedWinner === null
                  ? 'bg-white/15 border border-white/40'
                  : 'bg-white/5 border border-transparent hover:bg-white/10'
              } text-goat-mist`}
            >
              Match nul
            </button>
          )}
        </div>
      </ConfirmDialog>
    </div>
  );
}
