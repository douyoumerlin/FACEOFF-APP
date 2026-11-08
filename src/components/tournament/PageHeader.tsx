import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function PageHeader({ title, subtitle, back, children, wide }: {
  title: string;
  subtitle?: string;
  back: string;
  children?: React.ReactNode;
  wide?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <div className="sticky top-0 z-20 bg-goat-navy/85 backdrop-blur-md border-b border-white/10">
      <div className={`${wide ? 'max-w-7xl' : 'max-w-2xl'} mx-auto px-4 md:px-8 py-4 flex flex-wrap items-center gap-x-4 gap-y-3`}>
        <button
          onClick={() => navigate(back)}
          aria-label="Retour"
          className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-white/10 transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-3xl leading-none tracking-wide truncate">{title}</h1>
          {subtitle && <p className="text-xs text-goat-mist mt-1 truncate">{subtitle}</p>}
        </div>
        {children && <div className="flex flex-wrap gap-2 w-full sm:w-auto">{children}</div>}
      </div>
    </div>
  );
}
