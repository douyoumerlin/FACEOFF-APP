import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ArrowUpRight, Clock, Settings, Users } from 'lucide-react';
import { useMatchStore } from '../store/matchStore';
import { usePlayersStore } from '../store/playersStore';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { formatDate } from '../lib/utils';
import logoFondSombre from '../assets/brand/logo-fond-sombre.png';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 28 } },
};

const tile =
  'rounded-[22px] border border-white/15 bg-goat-navy-light text-white text-left transition hover:-translate-y-0.5 hover:border-white/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white';

export default function Home() {
  const navigate = useNavigate();
  const matches = useMatchStore((s) => s.matches);
  const playersCount = usePlayersStore((s) => s.players.length);
  const lastMatch = matches[0];

  return (
    <div className="min-h-screen bg-goat-navy grain flex flex-col">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative w-full max-w-md md:max-w-3xl mx-auto flex flex-col flex-1 px-5 pt-12 pb-7 gap-6"
      >
        {/* En-tête */}
        <motion.header variants={item} className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <img src={logoFondSombre} alt="Logo GOAT225" className="w-14 h-14 object-contain" />
            <div className="flex flex-col">
              <span className="font-display text-[32px] leading-[0.9] tracking-wide">
                FACE<span className="text-goat-red">OFF</span>
              </span>
              <span className="text-[11px] font-bold tracking-[0.24em] uppercase text-goat-mist mt-1">
                by GOAT225
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('/settings')}
            aria-label="Paramètres"
            className="w-11 h-11 rounded-xl border border-white/20 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </motion.header>

        {/* Accroche */}
        <motion.div variants={item}>
          <p className="text-sm font-medium text-goat-mist">Prêt pour ton prochain duel ?</p>
          <h1 className="font-display text-[52px] leading-[0.9] mt-1.5">
            Arbitre.
            <br />
            <span className="text-goat-red">Tranche.</span>
          </h1>
        </motion.div>

        {/* Grille de tuiles */}
        <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1 content-start">
          <button
            onClick={() => navigate('/new-match')}
            className="col-span-2 md:row-span-2 relative overflow-hidden h-44 md:h-auto md:min-h-[316px] rounded-[22px] bg-goat-red text-white p-5 flex flex-col justify-between text-left shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:bg-goat-red-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <span aria-hidden className="absolute -right-7 -top-5 font-display text-[200px] leading-none text-white/10 select-none">
              1V1
            </span>
            <span className="relative flex items-center justify-between">
              <span className="text-xs font-extrabold tracking-[0.2em] uppercase">1 contre 1</span>
              <span className="w-11 h-11 rounded-full bg-white text-goat-red flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5" strokeWidth={2.5} />
              </span>
            </span>
            <span className="relative font-display text-5xl leading-[0.88]">
              Lancer
              <br />
              un match
            </span>
          </button>

          <button onClick={() => navigate('/history')} className={`${tile} col-span-2 p-5 flex flex-col gap-3.5`}>
            <span className="flex items-center justify-between w-full">
              <span className="text-xs font-bold tracking-[0.16em] uppercase text-goat-mist">Dernier match</span>
              {lastMatch && <span className="text-xs font-medium text-goat-mist">{formatDate(lastMatch.date)}</span>}
            </span>
            {lastMatch ? (
              <span className="flex items-center justify-between w-full gap-2">
                <span className="flex items-center gap-2.5 min-w-0">
                  <PlayerAvatar player={lastMatch.joueur1} size="sm" />
                  <span className="font-bold text-sm truncate">{lastMatch.joueur1.prenom}</span>
                </span>
                <span className="font-display text-[34px] leading-none tabular-nums flex-shrink-0">
                  {lastMatch.score1}
                  <span className="text-goat-mist-dim"> : </span>
                  {lastMatch.score2}
                </span>
                <span className="flex items-center gap-2.5 min-w-0 justify-end">
                  <span className="font-semibold text-sm text-goat-mist truncate">{lastMatch.joueur2.prenom}</span>
                  <PlayerAvatar player={lastMatch.joueur2} size="sm" />
                </span>
              </span>
            ) : (
              <span className="text-sm text-goat-mist">Aucun match pour l'instant. Lance le premier !</span>
            )}
          </button>

          <button onClick={() => navigate('/players')} className={`${tile} p-[18px] min-h-[150px] flex flex-col justify-between`}>
            <span className="w-10 h-10 rounded-[10px] bg-white text-goat-navy flex items-center justify-center">
              <Users className="w-5 h-5" />
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="font-display text-[38px] leading-none tabular-nums">{playersCount}</span>
              <span className="text-sm font-semibold text-goat-mist">Joueurs</span>
            </span>
          </button>

          <button onClick={() => navigate('/history')} className={`${tile} p-[18px] min-h-[150px] flex flex-col justify-between`}>
            <span className="w-10 h-10 rounded-[10px] bg-white text-goat-navy flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="font-display text-[38px] leading-none tabular-nums">{matches.length}</span>
              <span className="text-sm font-semibold text-goat-mist">Matchs joués</span>
            </span>
          </button>
        </motion.div>

        <motion.p variants={item} className="text-center text-xs font-medium text-goat-mist-dim">
          FaceOff v1.0.0 · by GOAT225
        </motion.p>
      </motion.div>
    </div>
  );
}
