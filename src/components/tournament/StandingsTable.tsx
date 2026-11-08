import type { Tournament, TournamentMatch } from '../../types';
import { standings } from '../../lib/tournament';
import { usePlayerLookup } from './shared';

interface StandingsTableProps {
  t: Tournament;
  matches: TournamentMatch[];
  ids: string[];
  title?: string;
  status?: string;
  highlightActive?: boolean;
  qualified?: number; // nombre de qualifiés à mettre en valeur (bande rouge)
  showDraws?: boolean;
}

export function StandingsTable({ t, matches, ids, title, status, highlightActive, qualified = 0, showDraws }: StandingsTableProps) {
  const lookup = usePlayerLookup(t);
  const rows = standings(matches, ids);
  return (
    <div className={`rounded-[20px] bg-goat-navy-light p-4 pb-2 ${highlightActive ? 'border-2 border-goat-red' : 'border border-white/15'}`}>
      {(title || status) && (
        <div className="flex items-baseline justify-between gap-2 mb-1">
          {title && <h3 className="font-display text-3xl leading-none">{title}</h3>}
          {status && (
            <span className={`text-[11px] font-extrabold tracking-[0.1em] ${highlightActive ? 'bg-goat-red px-2 py-0.5 rounded-md' : 'text-goat-mist-dim'}`}>
              {status}
            </span>
          )}
        </div>
      )}
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-[10px] font-extrabold tracking-[0.1em] text-goat-mist-dim">
            <th className="text-left py-2 pl-1 w-8">#</th>
            <th className="text-left py-2">JOUEUR</th>
            <th className="py-2">J</th>
            <th className="py-2">V</th>
            {showDraws && <th className="py-2">N</th>}
            <th className="py-2">D</th>
            <th className="py-2">+/-</th>
            <th className="py-2">PTS</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const p = lookup(r.id);
            const q = i < qualified;
            return (
              <tr key={r.id} className={`border-t border-white/10 text-center ${q || i < 3 ? '' : 'text-goat-mist'}`}>
                <td className={`text-left py-2.5 pl-1 ${q ? 'border-l-4 border-goat-red' : ''}`}>
                  <span
                    className={`inline-flex w-5 h-5 rounded-md items-center justify-center text-[11px] font-extrabold ml-1 ${
                      i === 0 ? 'bg-goat-red text-white' : i < 3 ? 'bg-white text-goat-navy' : ''
                    }`}
                  >
                    {i + 1}
                  </span>
                </td>
                <td className="text-left py-2.5 font-bold truncate max-w-[140px]">{p ? `${p.prenom} ${p.nom}` : '—'}</td>
                <td>{r.joues}</td>
                <td>{r.victoires}</td>
                {showDraws && <td>{r.nuls}</td>}
                <td>{r.defaites}</td>
                <td>{r.ecart > 0 ? `+${r.ecart}` : r.ecart}</td>
                <td className="font-display text-xl">{r.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
