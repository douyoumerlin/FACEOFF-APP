import { useRef, useState } from 'react';
import { Camera, ImagePlus, Loader2, Trash2, UserRound } from 'lucide-react';
import { preparePlayerPhoto } from '../lib/image';

interface PhotoPickerProps {
  value: string;
  onChange: (photo: string) => void;
}

export function PhotoPicker({ value, onChange }: PhotoPickerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onChange(await preparePlayerPhoto(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'utiliser cette photo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        aria-label={value ? 'Changer la photo' : 'Ajouter une photo'}
        className="relative w-24 h-[120px] flex-shrink-0 rounded-2xl overflow-hidden bg-goat-navy-deep border-2 border-dashed border-white/25 hover:border-white/50 transition-colors flex items-center justify-center"
      >
        {value ? (
          <img src={value} alt="Photo du joueur" className="w-full h-full object-cover" />
        ) : (
          <UserRound className="w-10 h-10 text-goat-mist-dim" />
        )}
        {busy && (
          <span className="absolute inset-0 bg-goat-navy/70 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin" />
          </span>
        )}
      </button>

      <div className="flex flex-col gap-2 min-w-0 flex-1">
        <p className="text-xs text-goat-mist-dim">Photo du joueur</p>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="h-10 px-3 rounded-xl bg-white text-goat-navy font-semibold text-sm flex items-center justify-center gap-2 hover:bg-goat-mist transition-colors disabled:opacity-50"
        >
          <ImagePlus className="w-4 h-4" />
          {value ? 'Changer la photo' : 'Choisir une photo'}
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            disabled={busy}
            className="flex-1 h-10 px-3 rounded-xl bg-white/10 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white/15 transition-colors disabled:opacity-50"
          >
            <Camera className="w-4 h-4" />
            Caméra
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              aria-label="Retirer la photo"
              className="w-10 h-10 rounded-xl bg-white/10 text-goat-red-soft flex items-center justify-center hover:bg-white/15 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
        {error && <p className="text-xs text-goat-red-soft">{error}</p>}
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {/* Sur téléphone, ouvre directement l'appareil photo ; sur PC, ouvre le sélecteur de fichiers. */}
      <input ref={cameraRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleFile} />
    </div>
  );
}
