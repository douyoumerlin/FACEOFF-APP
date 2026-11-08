import { usePlayersStore } from '../store/playersStore';
import type { Player, PlayerSnapshot } from '../types';

/**
 * Renvoie la fiche à jour d'un joueur (avec sa photo) à partir d'une copie
 * enregistrée dans un match ou un tournoi. Si le joueur a été supprimé,
 * la copie est utilisée telle quelle.
 */
export function useLivePlayer<T extends PlayerSnapshot | null | undefined>(p: T): T extends null | undefined ? T : Player {
  const live = usePlayersStore((s) => (p ? s.players.find((x) => x.id === p.id) : undefined));
  return (live ?? p) as T extends null | undefined ? T : Player;
}

/** Version « liste » : retrouve plusieurs joueurs d'un coup. */
export function useLivePlayersMap(): Map<string, Player> {
  const players = usePlayersStore((s) => s.players);
  return new Map(players.map((p) => [p.id, p]));
}
