import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, ArrowLeft, Edit2, Trash2, X, Check } from 'lucide-react';
import { usePlayersStore } from '../store/playersStore';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Player, Category } from '../types';

const emptyForm = {
  nom: '',
  prenom: '',
  surnom: '',
  numero: '',
  categorie: 'Pro' as Category,
  photo: '',
};

export default function Players() {
  const navigate = useNavigate();
  const { players, addPlayer, updatePlayer, deletePlayer } = usePlayersStore();
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = players.filter((p) => {
    const q = query.toLowerCase();
    return (
      p.nom.toLowerCase().includes(q) ||
      p.prenom.toLowerCase().includes(q) ||
      (p.surnom?.toLowerCase().includes(q) ?? false)
    );
  });

  function openAdd() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(p: Player) {
    setForm({
      nom: p.nom,
      prenom: p.prenom,
      surnom: p.surnom ?? '',
      numero: p.numero ?? '',
      categorie: p.categorie,
      photo: p.photo ?? '',
    });
    setEditingId(p.id);
    setShowForm(true);
  }

  function handleSubmit() {
    if (!form.nom.trim() || !form.prenom.trim()) return;
    if (editingId) {
      updatePlayer(editingId, form);
    } else {
      addPlayer(form);
    }
    setShowForm(false);
  }

  function handleDelete() {
    if (deleteId) deletePlayer(deleteId);
    setDeleteId(null);
  }

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
          <h1 className="font-display text-3xl leading-none tracking-wide text-white flex-1">Joueurs</h1>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-goat-red text-white font-bold text-sm hover:bg-goat-red-light transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-goat-mist-dim" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par nom, prénom ou surnom..."
            className="w-full bg-goat-navy-deep border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-goat-mist-dim focus:outline-none focus:border-goat-red transition-colors"
          />
        </div>

        {/* Count */}
        <p className="text-goat-mist-dim text-sm">{filtered.length} joueur{filtered.length !== 1 ? 's' : ''}</p>

        {/* Players list */}
        <motion.div layout className="space-y-3">
          <AnimatePresence>
            {filtered.map((player) => (
              <motion.div
                key={player.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass rounded-xl p-4 flex items-center gap-4"
              >
                <PlayerAvatar player={player} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white">
                    {player.prenom} {player.nom}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {player.surnom && (
                      <span className="text-goat-red-soft text-xs font-medium">{player.surnom}</span>
                    )}
                    {player.surnom && player.numero && <span className="text-goat-mist-dim text-xs">·</span>}
                    {player.numero && (
                      <span className="text-goat-mist-dim text-xs">#{player.numero}</span>
                    )}
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold flex-shrink-0 ${
                  player.categorie === 'Pro'
                    ? 'bg-goat-red/20 text-goat-red-soft'
                    : 'bg-white/10 text-goat-mist'
                }`}>
                  {player.categorie}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(player)}
                    className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-goat-mist" />
                  </button>
                  <button
                    onClick={() => setDeleteId(player.id)}
                    className="w-9 h-9 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-goat-mist-dim">
              <p className="text-lg font-semibold">Aucun joueur</p>
              <p className="text-sm mt-1">Ajoutez des joueurs pour commencer</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowForm(false)}
            />
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative glass rounded-2xl p-6 w-full max-w-md space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-3xl leading-none tracking-wide text-white">
                  {editingId ? 'Modifier' : 'Nouveau joueur'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-goat-mist-dim hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-goat-mist-dim mb-1 block">Prénom *</label>
                  <input
                    value={form.prenom}
                    onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                    className="w-full bg-goat-navy-deep border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-goat-red transition-colors"
                    placeholder="Prénom"
                  />
                </div>
                <div>
                  <label className="text-xs text-goat-mist-dim mb-1 block">Nom *</label>
                  <input
                    value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    className="w-full bg-goat-navy-deep border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-goat-red transition-colors"
                    placeholder="Nom"
                  />
                </div>
                <div>
                  <label className="text-xs text-goat-mist-dim mb-1 block">Surnom</label>
                  <input
                    value={form.surnom}
                    onChange={(e) => setForm({ ...form, surnom: e.target.value })}
                    className="w-full bg-goat-navy-deep border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-goat-red transition-colors"
                    placeholder="Surnom"
                  />
                </div>
                <div>
                  <label className="text-xs text-goat-mist-dim mb-1 block">Numéro</label>
                  <input
                    value={form.numero}
                    onChange={(e) => setForm({ ...form, numero: e.target.value })}
                    className="w-full bg-goat-navy-deep border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-goat-red transition-colors"
                    placeholder="#23"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-goat-mist-dim mb-2 block">Catégorie</label>
                <div className="flex gap-3">
                  {(['Pro', 'Amateur'] as Category[]).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setForm({ ...form, categorie: cat })}
                      className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
                        form.categorie === cat
                          ? 'bg-goat-red text-white'
                          : 'bg-white/5 text-goat-mist hover:bg-white/10'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-goat-mist-dim mb-1 block">URL Photo</label>
                <input
                  value={form.photo}
                  onChange={(e) => setForm({ ...form, photo: e.target.value })}
                  className="w-full bg-goat-navy-deep border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-goat-red transition-colors"
                  placeholder="https://..."
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!form.nom.trim() || !form.prenom.trim()}
                className="w-full py-4 rounded-xl bg-goat-red text-white font-black text-lg disabled:opacity-40 hover:bg-goat-red-light transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                {editingId ? 'Enregistrer' : 'Ajouter'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteId}
        title="Supprimer ce joueur ?"
        description="Cette action est irréversible."
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        destructive
      />
    </div>
  );
}
