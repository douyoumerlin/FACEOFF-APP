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

function ScoreButton({ onClick, children, variant = 'plus' }: {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'plus' | 'minus';
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      onClick={onClick}
      className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl transition-colors ${
        variant === 'plus'
          ? 'bg-goat-orange text-goat-black hover:bg-goat-orange-light'
          : 'bg-white/10 text-gray-400 hover:bg-white/15'
      }`}
    >
      {children}
    </motion.button>
  );
}

function ScoreDisplay({ score, animate }: { score: number; animate: boolean }) {
  return (
    <motion.div
      key={score}
      initial={animate ? { scale: 1.5, color: '#FF6A00' } : false}
      animate={{ scale: 1, color: '#FFFFFF' }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className="text-7xl sm:text-8xl font-black text-white leading-none"
    >
      {score}
    </motion.div>
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
      ? 'text-red-500 timer-red'
      : timeLeft <= 30
      ? 'text-goat-orange timer-orange'
      : 'text-white';

  const j1 = currentMatch?.joueur1;
  const j2 = currentMatch?.joueur2;

  if (!j1 || !j2) return null;

  return (
    <div className="min-h-screen bg-goat-black flex flex-col select-none">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-goat-orange/5 rounded-full blur-3xl" />
      </div>

      <div className="relative flex-1 flex flex-col px-4 py-6 gap-6 max-w-5xl mx-auto w-full">
        {/* Timer section */}
        <div className="flex flex-col items-center gap-4">
          <motion.div
            className={`font-black tracking-tighter leading-none text-center ${timerColor}`}
            style={{ fontSize: 'clamp(4rem, 18vw, 9rem)' }}
          >
            {formatTime(timeLeft)}
          </motion.div>

          {/* Timer controls */}
          <div className="flex gap-4">
            {!running ? (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setRunning(true)}
                disabled={timeLeft === 0}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-goat-orange text-goat-black font-black text-lg hover:bg-goat-orange-light transition-colors disabled:opacity-40 shadow-lg shadow-goat-orange/30"
              >
                <Play className="w-5 h-5" fill="currentColor" />
                START
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setRunning(false)}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-yellow-500 text-black font-black text-lg hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-500/20"
              >
                <Pause className="w-5 h-5" fill="currentColor" />
                PAUSE
              </motion.button>
            )}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl glass text-gray-400 font-bold hover:bg-white/10 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              RESET
            </motion.button>
          </div>
        </div>

        {/* VS + Player cards */}
        <div className="flex items-stretch gap-2 sm:gap-4 flex-1">
          {/* Player 1 card */}
          <div className="flex-1 glass rounded-2xl p-4 flex flex-col items-center gap-4">
            <PlayerAvatar player={j1} size="lg" />
            <div className="text-center">
              <p className="font-black text-white text-lg leading-tight">{j1.prenom}</p>
              <p className="font-black text-white text-lg leading-tight">{j1.nom}</p>
              {j1.surnom && <p className="text-goat-orange text-xs mt-0.5">{j1.surnom}</p>}
            </div>

            {/* Score */}
            <ScoreDisplay score={score1} animate={animScore1} />
            <div className="flex gap-2">
              <ScoreButton onClick={() => changeScore(1, -1)} variant="minus"><Minus className="w-5 h-5" /></ScoreButton>
              <ScoreButton onClick={() => changeScore(1, 1)}>+1</ScoreButton>
              <ScoreButton onClick={() => changeScore(1, 2)}>+2</ScoreButton>
            </div>

            {/* Fautes */}
            <div className="w-full glass-orange rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-goat-orange" />
                <span className="text-xs text-gray-400 font-semibold">FAUTES</span>
                <span className="text-white font-black text-lg">{faute1}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => changeFaute(1, -1)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/15 flex items-center justify-center transition-colors"
                >
                  <Minus className="w-3 h-3 text-gray-400" />
                </button>
                <button
                  onClick={() => changeFaute(1, 1)}
                  className="w-8 h-8 rounded-lg bg-goat-orange/20 hover:bg-goat-orange/30 flex items-center justify-center transition-colors"
                >
                  <Plus className="w-3 h-3 text-goat-orange" />
                </button>
              </div>
            </div>
          </div>

          {/* VS */}
          <div className="flex flex-col items-center justify-center px-1">
            <span className="text-2xl sm:text-4xl font-black text-gradient">VS</span>
          </div>

          {/* Player 2 card */}
          <div className="flex-1 glass rounded-2xl p-4 flex flex-col items-center gap-4">
            <PlayerAvatar player={j2} size="lg" />
            <div className="text-center">
              <p className="font-black text-white text-lg leading-tight">{j2.prenom}</p>
              <p className="font-black text-white text-lg leading-tight">{j2.nom}</p>
              {j2.surnom && <p className="text-goat-orange text-xs mt-0.5">{j2.surnom}</p>}
            </div>

            {/* Score */}
            <ScoreDisplay score={score2} animate={animScore2} />
            <div className="flex gap-2">
              <ScoreButton onClick={() => changeScore(2, -1)} variant="minus"><Minus className="w-5 h-5" /></ScoreButton>
              <ScoreButton onClick={() => changeScore(2, 1)}>+1</ScoreButton>
              <ScoreButton onClick={() => changeScore(2, 2)}>+2</ScoreButton>
            </div>

            {/* Fautes */}
            <div className="w-full glass-orange rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-goat-orange" />
                <span className="text-xs text-gray-400 font-semibold">FAUTES</span>
                <span className="text-white font-black text-lg">{faute2}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => changeFaute(2, -1)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/15 flex items-center justify-center transition-colors"
                >
                  <Minus className="w-3 h-3 text-gray-400" />
                </button>
                <button
                  onClick={() => changeFaute(2, 1)}
                  className="w-8 h-8 rounded-lg bg-goat-orange/20 hover:bg-goat-orange/30 flex items-center justify-center transition-colors"
                >
                  <Plus className="w-3 h-3 text-goat-orange" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* End button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleEndMatch}
          className="w-full py-5 rounded-2xl border-2 border-red-500/40 text-red-400 font-black text-lg hover:bg-red-500/10 transition-colors"
        >
          TERMINER LE MATCH
        </motion.button>
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
          <p className="text-sm text-gray-400 mb-3">Sélectionner le vainqueur :</p>
          {[j1, j2].map((p, i) => (
            <button
              key={p.id}
              onClick={() => setSelectedWinner(p)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl transition-colors ${
                selectedWinner?.id === p.id
                  ? 'bg-goat-orange/20 border border-goat-orange'
                  : 'bg-white/5 border border-transparent hover:bg-white/10'
              }`}
            >
              <PlayerAvatar player={p} size="sm" />
              <div className="flex-1 text-left">
                <p className="font-bold text-white">{p.prenom} {p.nom}</p>
                <p className="text-sm text-gray-400">{i === 0 ? score1 : score2} pts</p>
              </div>
              {selectedWinner?.id === p.id && (
                <span className="text-goat-orange text-xs font-bold">VAINQUEUR</span>
              )}
            </button>
          ))}
          {score1 === score2 && (
            <button
              onClick={() => setSelectedWinner(null)}
              className={`w-full p-3 rounded-xl text-sm transition-colors ${
                selectedWinner === null
                  ? 'bg-gray-500/20 border border-gray-500'
                  : 'bg-white/5 border border-transparent hover:bg-white/10'
              } text-gray-400`}
            >
              Match nul
            </button>
          )}
        </div>
      </ConfirmDialog>
    </div>
  );
}
