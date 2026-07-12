import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Home } from 'lucide-react';
import { useMatchStore } from '../store/matchStore';
import { PlayerAvatar } from '../components/PlayerAvatar';

export default function Winner() {
  const navigate = useNavigate();
  const location = useLocation();
  const matches = useMatchStore((s) => s.matches);
  const matchId = location.state?.matchId;
  const match = matches.find((m) => m.id === matchId);
  const currentMatch = useMatchStore((s) => s.currentMatch);

  const winner = match?.vainqueur ?? currentMatch?.vainqueur ?? null;
  const score1 = match?.score1 ?? currentMatch?.score1 ?? 0;
  const score2 = match?.score2 ?? currentMatch?.score2 ?? 0;
  const j1 = match?.joueur1 ?? currentMatch?.joueur1;
  const j2 = match?.joueur2 ?? currentMatch?.joueur2;

  useEffect(() => {
    if (!j1 || !j2) navigate('/');
  }, []);

  if (!j1 || !j2) return null;

  const winnerScore = winner?.id === j1.id ? score1 : score2;

  return (
    <div className="min-h-screen bg-goat-black flex flex-col items-center justify-center relative overflow-hidden px-6">
      {/* Radial glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-goat-orange/15 rounded-full blur-3xl" />
      </div>

      {/* Confetti-like particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-goat-orange"
          initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            x: Math.cos((i / 12) * Math.PI * 2) * (150 + Math.random() * 100),
            y: Math.sin((i / 12) * Math.PI * 2) * (150 + Math.random() * 100),
            scale: [0, 1.5, 0],
          }}
          transition={{ delay: 0.3 + i * 0.05, duration: 1.5, ease: 'easeOut' }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="relative flex flex-col items-center gap-8 text-center z-10"
      >
        {winner ? (
          <>
            {/* Trophy */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-6xl"
            >
              🏆
            </motion.div>

            {/* Winner avatar */}
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 250, damping: 20, delay: 0.3 }}
            >
              <PlayerAvatar player={winner} size="xl" className="ring-4 ring-goat-orange ring-offset-4 ring-offset-goat-black" />
            </motion.div>

            {/* Name */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-goat-orange font-semibold tracking-[0.3em] uppercase text-sm mb-1">Vainqueur</p>
              <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
                {winner.prenom}
              </h1>
              <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
                {winner.nom}
              </h1>
              {winner.surnom && (
                <p className="text-goat-orange text-lg mt-1">{winner.surnom}</p>
              )}
            </motion.div>

            {/* Score */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, type: 'spring' }}
              className="glass-orange rounded-2xl px-10 py-5"
            >
              <p className="text-5xl font-black text-gradient">{winnerScore}</p>
              <p className="text-gray-400 text-sm mt-1">Points</p>
            </motion.div>

            {/* Final score */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-gray-500 text-sm"
            >
              Score final : {score1} — {score2}
            </motion.p>
          </>
        ) : (
          <>
            <div className="text-6xl">🤝</div>
            <h1 className="text-5xl font-black text-white">MATCH NUL</h1>
            <div className="glass rounded-2xl px-10 py-5">
              <p className="text-5xl font-black text-white">{score1} — {score2}</p>
            </div>
          </>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex flex-col sm:flex-row gap-4 w-full max-w-sm"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/new-match')}
            className="flex-1 py-4 rounded-xl bg-goat-orange text-goat-black font-bold flex items-center justify-center gap-2 hover:bg-goat-orange-light transition-colors"
          >
            <Flame className="w-5 h-5" />
            Nouveau Match
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/')}
            className="flex-1 py-4 rounded-xl glass text-white font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
          >
            <Home className="w-5 h-5" />
            Accueil
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
