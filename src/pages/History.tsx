import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trash2, Trophy, Clock, Flag } from 'lucide-react';
import { useMatchStore } from '../store/matchStore';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { useLivePlayersMap } from '../hooks/useLivePlayer';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { formatDate, formatHour, formatTime } from '../lib/utils';

export default function History() {
  const navigate = useNavigate();
  const { matches, deleteMatch } = useMatchStore();
  const live = useLivePlayersMap();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-goat-navy">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-goat-navy/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-3xl leading-none tracking-wide text-white flex-1">Historique</h1>
          <span className="text-goat-mist-dim text-sm">{matches.length} match{matches.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {matches.length === 0 && (
          <div className="text-center py-24 text-goat-mist-dim">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-semibold">Aucun match</p>
            <p className="text-sm mt-1">Les matchs joués apparaîtront ici</p>
          </div>
        )}

        <AnimatePresence>
          {matches.map((match, index) => (
            <motion.div
              key={match.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.04 }}
              className="glass rounded-2xl p-5 space-y-4"
            >
              {/* Date & time */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-goat-red-soft text-xs font-semibold tracking-wider uppercase">
                    {formatDate(match.date)}
                  </span>
                  <span className="text-goat-mist-dim text-xs ml-2">{formatHour(match.date)}</span>
                </div>
                <button
                  onClick={() => setDeleteId(match.id)}
                  className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>

              {/* Scoreboard */}
              <div className="flex items-center gap-4">
                {/* Player 1 */}
                <div className={`flex-1 flex flex-col items-center gap-2 ${
                  match.vainqueur?.id === match.joueur1.id ? '' : 'opacity-60'
                }`}>
                  <PlayerAvatar player={live.get(match.joueur1.id) ?? match.joueur1} size="md" />
                  <p className="font-bold text-white text-sm text-center leading-tight">
                    {match.joueur1.prenom} {match.joueur1.nom}
                  </p>
                  <p className="text-4xl font-black text-white">{match.score1}</p>
                </div>

                {/* VS / Winner */}
                <div className="flex flex-col items-center gap-2">
                  <span className="text-2xl font-black text-gradient">VS</span>
                  {match.vainqueur ? (
                    <div className="flex items-center gap-1 text-goat-red-soft">
                      <Trophy className="w-3 h-3" />
                      <span className="text-xs font-bold">
                        {match.vainqueur.prenom}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-goat-mist-dim">Nul</span>
                  )}
                </div>

                {/* Player 2 */}
                <div className={`flex-1 flex flex-col items-center gap-2 ${
                  match.vainqueur?.id === match.joueur2.id ? '' : 'opacity-60'
                }`}>
                  <PlayerAvatar player={live.get(match.joueur2.id) ?? match.joueur2} size="md" />
                  <p className="font-bold text-white text-sm text-center leading-tight">
                    {match.joueur2.prenom} {match.joueur2.nom}
                  </p>
                  <p className="text-4xl font-black text-white">{match.score2}</p>
                </div>
              </div>

              {/* Match details */}
              <div className="flex items-center gap-4 pt-2 border-t border-white/5 text-xs text-goat-mist-dim">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(match.duree ?? 0)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Flag className="w-3 h-3" />
                  <span>{match.faute1 + match.faute2} faute{match.faute1 + match.faute2 !== 1 ? 's' : ''}</span>
                </div>
                <div className="ml-auto flex gap-3">
                  <span>F1: {match.faute1}</span>
                  <span>F2: {match.faute2}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Supprimer ce match ?"
        description="Cette action est irréversible."
        confirmLabel="Supprimer"
        onConfirm={() => { if (deleteId) deleteMatch(deleteId); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)}
        destructive
      />
    </div>
  );
}
