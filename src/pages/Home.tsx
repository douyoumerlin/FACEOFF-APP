import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Flame, Clock, Users, Settings } from 'lucide-react';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 28 } },
};

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-goat-black flex flex-col">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-goat-orange/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative flex flex-col items-center justify-center flex-1 px-6 py-12 gap-8"
      >
        {/* Logo & Title */}
        <motion.div variants={item} className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-goat-orange to-goat-orange-light flex items-center justify-center shadow-lg shadow-goat-orange/30">
            <Flame className="w-10 h-10 text-goat-black" strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <p className="text-goat-orange text-sm font-semibold tracking-[0.3em] uppercase">Referee App</p>
            <h1 className="text-5xl font-black text-white tracking-tight mt-1">GOAT225</h1>
          </div>
        </motion.div>

        {/* Main actions */}
        <motion.div variants={item} className="w-full max-w-sm flex flex-col gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/new-match')}
            className="w-full py-5 rounded-2xl bg-goat-orange text-goat-black font-black text-xl tracking-wide shadow-lg shadow-goat-orange/30 hover:bg-goat-orange-light transition-colors flex items-center justify-center gap-3"
          >
            <Flame className="w-6 h-6" strokeWidth={2.5} />
            NOUVEAU MATCH
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/history')}
            className="w-full py-5 rounded-2xl glass text-white font-bold text-xl tracking-wide hover:bg-white/8 transition-colors flex items-center justify-center gap-3"
          >
            <Clock className="w-6 h-6" />
            HISTORIQUE
          </motion.button>
        </motion.div>

        {/* Secondary actions */}
        <motion.div variants={item} className="w-full max-w-sm flex gap-3">
          <button
            onClick={() => navigate('/players')}
            className="flex-1 py-4 rounded-xl glass text-white font-semibold hover:bg-white/8 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Users className="w-5 h-5 text-goat-orange" />
            Joueurs
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="flex-1 py-4 rounded-xl glass text-white font-semibold hover:bg-white/8 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Settings className="w-5 h-5 text-goat-orange" />
            Paramètres
          </button>
        </motion.div>

        {/* Version */}
        <motion.p variants={item} className="text-gray-600 text-xs">
          v1.0.0 — GOAT225 Referee App
        </motion.p>
      </motion.div>
    </div>
  );
}
