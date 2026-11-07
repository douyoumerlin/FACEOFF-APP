import { Player } from '../types';
import { cn } from '../lib/utils';

interface PlayerAvatarProps {
  player: Player;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  sm: 'w-10 h-10 text-sm',
  md: 'w-14 h-14 text-base',
  lg: 'w-20 h-20 text-xl',
  xl: 'w-28 h-28 text-2xl',
};

export function PlayerAvatar({ player, size = 'md', className }: PlayerAvatarProps) {
  const initials = `${player.prenom[0]}${player.nom[0]}`.toUpperCase();

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold flex-shrink-0 overflow-hidden',
        'bg-gradient-to-br from-goat-red to-goat-red-light text-white',
        sizes[size],
        className
      )}
    >
      {player.photo ? (
        <img
          src={player.photo}
          alt={`${player.prenom} ${player.nom}`}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
