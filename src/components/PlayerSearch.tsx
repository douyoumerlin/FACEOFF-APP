import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Player } from '../types';
import { usePlayersStore } from '../store/playersStore';
import { PlayerAvatar } from './PlayerAvatar';

interface PlayerSearchProps {
  onSelect: (player: Player) => void;
  excluded?: string[];
  placeholder?: string;
}

export function PlayerSearch({ onSelect, excluded = [], placeholder = 'Rechercher un joueur...' }: PlayerSearchProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const players = usePlayersStore((s) => s.players);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = players.filter((p: Player) => {
    if (excluded.includes(p.id)) return false;
    const q = query.toLowerCase();
    return (
      p.nom.toLowerCase().includes(q) ||
      p.prenom.toLowerCase().includes(q) ||
      (p.surnom?.toLowerCase().includes(q) ?? false)
    );
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(player: Player) {
    onSelect(player);
    setQuery('');
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full bg-goat-dark border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-goat-orange transition-colors"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 glass rounded-xl overflow-hidden max-h-64 overflow-y-auto"
          >
            {filtered.map((player: Player) => (
              <button
                key={player.id}
                onClick={() => handleSelect(player)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
              >
                <PlayerAvatar player={player} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">
                    {player.prenom} {player.nom}
                  </p>
                  {player.surnom && (
                    <p className="text-xs text-goat-orange truncate">{player.surnom}</p>
                  )}
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0">{player.categorie}</span>
              </button>
            ))}
          </motion.div>
        )}
        {open && query && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute z-50 w-full mt-2 glass rounded-xl px-4 py-3 text-gray-500 text-sm"
          >
            Aucun joueur trouvé
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
