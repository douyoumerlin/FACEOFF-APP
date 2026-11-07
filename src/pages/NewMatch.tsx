import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Flame, X } from 'lucide-react';
import { PlayerSearch } from '../components/PlayerSearch';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { useMatchStore } from '../store/matchStore';
import { useSettingsStore } from '../store/settingsStore';
import { Player } from '../types';

const TIME_OPTIONS = [
  { label: '3 min', seconds: 180 },
  { label: '5 min', seconds: 300 },
  { label: '7 min', seconds: 420 },
  { label: '10 min', seconds: 600 },
];

export default function NewMatch() {
  const navigate = useNavigate();
  const { setCurrentMatch } = useMatchStore();
  const defaultTime = useSettingsStore((s) => s.defaultTime);

  const [player1, setPlayer1] = useState<Player | null>(null);
  const [player2, setPlayer2] = useState<Player | null>(null);
  const [time, setTime] = useState(defaultTime);
  const [customTime, setCustomTime] = useState('');

  const canStart = !!player1 && !!player2;

  function handleStart() {
    if (!player1 || !player2) return;
    setCurrentMatch({
      joueur1: player1,
      joueur2: player2,
      score1: 0,
      score2: 0,
      faute1: 0,
      faute2: 0,
      temps: time,
      date: new Date().toISOString(),
    });
    navigate('/faceoff');
  }

  return (
    <div className="min-h-screen bg-goat-navy">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-goat-red/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-10 bg-goat-navy/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-3xl leading-none tracking-wide text-white flex-1">Nouveau Match</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Players selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Player 1 */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-goat-mist-dim tracking-widest uppercase">Joueur 1</p>
            <PlayerSearch
              onSelect={setPlayer1}
              excluded={player2 ? [player2.id] : []}
              placeholder="Sélectionner joueur 1..."
            />
            <AnimatePresence mode="wait">
              {player1 ? (
                <motion.div
                  key={player1.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  className="glass-orange rounded-2xl p-5 flex items-center gap-4"
                >
                  <PlayerAvatar player={player1} size="lg" />
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-xl text-white leading-tight">
                      {player1.prenom}
                    </p>
                    <p className="font-black text-xl text-white leading-tight">
                      {player1.nom}
                    </p>
                    {player1.surnom && (
                      <p className="text-goat-red-soft text-sm mt-1">{player1.surnom}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setPlayer1(null)}
                    className="text-goat-mist-dim hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="empty1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass rounded-2xl p-5 h-24 flex items-center justify-center border-2 border-dashed border-white/10"
                >
                  <p className="text-goat-mist-dim text-sm">Aucun joueur sélectionné</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* VS divider on mobile */}
          <div className="sm:hidden flex items-center justify-center">
            <span className="text-3xl font-black text-gradient">VS</span>
          </div>

          {/* Player 2 */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-goat-mist-dim tracking-widest uppercase">Joueur 2</p>
            <PlayerSearch
              onSelect={setPlayer2}
              excluded={player1 ? [player1.id] : []}
              placeholder="Sélectionner joueur 2..."
            />
            <AnimatePresence mode="wait">
              {player2 ? (
                <motion.div
                  key={player2.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  className="glass-orange rounded-2xl p-5 flex items-center gap-4"
                >
                  <PlayerAvatar player={player2} size="lg" />
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-xl text-white leading-tight">
                      {player2.prenom}
                    </p>
                    <p className="font-black text-xl text-white leading-tight">
                      {player2.nom}
                    </p>
                    {player2.surnom && (
                      <p className="text-goat-red-soft text-sm mt-1">{player2.surnom}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setPlayer2(null)}
                    className="text-goat-mist-dim hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="empty2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass rounded-2xl p-5 h-24 flex items-center justify-center border-2 border-dashed border-white/10"
                >
                  <p className="text-goat-mist-dim text-sm">Aucun joueur sélectionné</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* VS on desktop */}
        <div className="hidden sm:flex items-center justify-center -mt-4">
          <span className="text-4xl font-black text-gradient">VS</span>
        </div>

        {/* Time settings */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <p className="text-sm font-semibold text-goat-mist tracking-widest uppercase">Durée du match</p>
          <div className="grid grid-cols-4 gap-3">
            {TIME_OPTIONS.map((opt) => (
              <button
                key={opt.seconds}
                onClick={() => { setTime(opt.seconds); setCustomTime(''); }}
                className={`py-3 rounded-xl font-bold transition-colors ${
                  time === opt.seconds && !customTime
                    ? 'bg-goat-red text-white'
                    : 'bg-white/5 text-goat-mist hover:bg-white/10'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={customTime}
              onChange={(e) => {
                setCustomTime(e.target.value);
                const mins = parseInt(e.target.value);
                if (!isNaN(mins) && mins > 0) setTime(mins * 60);
              }}
              placeholder="Durée personnalisée (minutes)"
              className="flex-1 bg-goat-navy-deep border border-white/10 rounded-xl px-4 py-3 text-white placeholder-goat-mist-dim focus:outline-none focus:border-goat-red transition-colors"
            />
          </div>
        </div>

        {/* Start button */}
        <AnimatePresence>
          {canStart && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleStart}
                className="w-full py-6 rounded-2xl bg-goat-red text-white font-black text-2xl tracking-wide shadow-xl shadow-goat-red/30 hover:bg-goat-red-light transition-colors flex items-center justify-center gap-3"
              >
                <Flame className="w-7 h-7" strokeWidth={2.5} />
                COMMENCER LE FACE OFF
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
