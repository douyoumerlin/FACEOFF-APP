import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Plus, Trash2, Trophy } from 'lucide-react';
import { useTournamentStore } from '../store/tournamentStore';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PageHeader } from '../components/tournament/PageHeader';
import { Crown } from '../components/tournament/shared';
import { FORMATS, progressLabel } from '../lib/tournament';
import { formatDate } from '../lib/utils';
import type { Tournament } from '../types';

function TournamentRow({ t, onDelete }: { t: Tournament; onDelete: () => void }) {
  const navigate = useNavigate();
  const champion = t.players.find((p) => p.id === t.championId);
  return (
    <div className="flex items-center gap-3 rounded-[18px] bg-goat-navy-light border border-white/15 p-4">
      <button onClick={() => navigate(`/tournois/${t.id}`)} className="flex-1 min-w-0 flex items-center gap-3 text-left">
        <span className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${t.championId ? 'bg-white' : 'bg-goat-red'}`}>
          {t.championId ? <Crown className="w-7 h-6" /> : <Trophy className="w-5 h-5" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-2xl leading-none truncate">{t.nom}</span>
          <span className="block text-xs text-goat-mist mt-1 truncate">
            {FORMATS[t.format].nom} · {t.players.length} joueurs · {formatDate(t.createdAt)}
          </span>
          <span className={`block text-xs font-bold mt-0.5 truncate ${t.championId ? 'text-white' : 'text-goat-red-soft'}`}>
            {champion ? `Champion : ${champion.prenom} ${champion.nom}` : progressLabel(t)}
          </span>
        </span>
        <ChevronRight className="w-5 h-5 text-goat-mist-dim flex-shrink-0" />
      </button>
      <button
        onClick={onDelete}
        aria-label={`Supprimer le tournoi ${t.nom}`}
        className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 text-goat-red-soft flex items-center justify-center flex-shrink-0"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function Tournaments() {
  const navigate = useNavigate();
  const { tournaments, deleteTournament } = useTournamentStore();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const enCours = tournaments.filter((t) => !t.championId);
  const termines = tournaments.filter((t) => t.championId);

  return (
    <div className="min-h-screen bg-goat-navy grain">
      <PageHeader title="Tournois" subtitle="Élimination directe, poules ou championnat" back="/">
        <button
          onClick={() => navigate('/tournois/nouveau')}
          className="h-10 px-4 rounded-xl bg-goat-red text-white font-bold text-sm flex items-center gap-2 hover:bg-goat-red-light transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouveau tournoi
        </button>
      </PageHeader>

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">
        {tournaments.length === 0 && (
          <div className="text-center py-16 flex flex-col items-center gap-4">
            <Crown className="w-16 h-12" />
            <p className="font-display text-4xl leading-none">Aucun tournoi</p>
            <p className="text-sm text-goat-mist max-w-xs">
              Choisis un format, coche les joueurs : FaceOff crée le tableau et le met à jour après chaque match.
            </p>
            <button
              onClick={() => navigate('/tournois/nouveau')}
              className="h-14 px-8 rounded-2xl bg-goat-red text-white font-display text-2xl tracking-wider hover:bg-goat-red-light transition-colors"
            >
              Créer un tournoi
            </button>
          </div>
        )}

        {enCours.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-[11px] font-extrabold tracking-[0.14em] text-goat-mist-dim">EN COURS</h2>
            {enCours.map((t) => <TournamentRow key={t.id} t={t} onDelete={() => setDeleteId(t.id)} />)}
          </section>
        )}
        {termines.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-[11px] font-extrabold tracking-[0.14em] text-goat-mist-dim">TERMINÉS</h2>
            {termines.map((t) => <TournamentRow key={t.id} t={t} onDelete={() => setDeleteId(t.id)} />)}
          </section>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Supprimer ce tournoi ?"
        description="Le tableau sera supprimé. Les matchs déjà joués restent dans l'historique."
        confirmLabel="Supprimer"
        destructive
        onConfirm={() => {
          if (deleteId) deleteTournament(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
