import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Volume2, Zap, Maximize } from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';
import logoFondSombre from '../assets/brand/logo-fond-sombre.png';

const TIME_OPTIONS = [
  { label: '3 min', seconds: 180 },
  { label: '5 min', seconds: 300 },
  { label: '7 min', seconds: 420 },
  { label: '10 min', seconds: 600 },
];

interface ToggleRowProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

function ToggleRow({ icon, label, description, value, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-white/5 last:border-0">
      <div className="w-10 h-10 rounded-xl bg-goat-red/10 flex items-center justify-center text-goat-red-soft flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-white">{label}</p>
        <p className="text-xs text-goat-mist-dim mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
          value ? 'bg-goat-red' : 'bg-white/10'
        }`}
      >
        <motion.span
          animate={{ x: value ? 24 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
        />
      </button>
    </div>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const { defaultTime, soundEnabled, animationsEnabled, fullscreenEnabled, update } = useSettingsStore();

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      update({ fullscreenEnabled: true });
    } else {
      document.exitFullscreen().catch(() => {});
      update({ fullscreenEnabled: false });
    }
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
          <h1 className="font-display text-3xl leading-none tracking-wide text-white">Paramètres</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Default time */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-goat-red/10 flex items-center justify-center text-goat-red-soft">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-white">Durée par défaut</p>
              <p className="text-xs text-goat-mist-dim">Temps affiché lors d'un nouveau match</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {TIME_OPTIONS.map((opt) => (
              <button
                key={opt.seconds}
                onClick={() => update({ defaultTime: opt.seconds })}
                className={`py-3 rounded-xl font-bold text-sm transition-colors ${
                  defaultTime === opt.seconds
                    ? 'bg-goat-red text-white'
                    : 'bg-white/5 text-goat-mist hover:bg-white/10'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="glass rounded-2xl px-5">
          <ToggleRow
            icon={<Volume2 className="w-5 h-5" />}
            label="Son"
            description="Activer les effets sonores"
            value={soundEnabled}
            onChange={(v) => update({ soundEnabled: v })}
          />
          <ToggleRow
            icon={<Zap className="w-5 h-5" />}
            label="Animations"
            description="Transitions et micro-interactions"
            value={animationsEnabled}
            onChange={(v) => update({ animationsEnabled: v })}
          />
          <ToggleRow
            icon={<Maximize className="w-5 h-5" />}
            label="Plein écran"
            description="Passer en mode plein écran"
            value={fullscreenEnabled}
            onChange={toggleFullscreen}
          />
        </div>

        {/* App info */}
        <div className="glass rounded-2xl p-5 flex flex-col items-center text-center gap-1">
          <img src={logoFondSombre} alt="Logo GOAT225" className="w-14 h-14 object-contain mb-1" />
          <p className="font-display text-3xl leading-none text-white">FACE<span className="text-goat-red">OFF</span></p>
          <p className="text-goat-mist text-sm">v1.0.0 · by GOAT225</p>
          <p className="text-goat-mist-dim text-xs">Données stockées localement</p>
        </div>
      </div>
    </div>
  );
}
