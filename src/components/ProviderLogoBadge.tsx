import { Sparkles } from 'lucide-react';

type ProviderLogoBadgeSize = 'sm' | 'md' | 'lg';

interface ProviderLogoBadgeProps {
  src?: string;
  alt: string;
  size?: ProviderLogoBadgeSize;
}

const SIZE_CLASSES: Record<ProviderLogoBadgeSize, { wrapper: string; image: string; fallback: number }> = {
  sm: { wrapper: 'h-9 w-9 rounded-xl', image: 'h-[18px] w-[18px]', fallback: 14 },
  md: { wrapper: 'h-10 w-10 rounded-xl', image: 'h-5 w-5', fallback: 16 },
  lg: { wrapper: 'h-12 w-12 rounded-2xl', image: 'h-6 w-6', fallback: 18 },
};

export const ProviderLogoBadge = ({ src, alt, size = 'md' }: ProviderLogoBadgeProps) => {
  const config = SIZE_CLASSES[size];

  return (
    <div className={`app-logo-badge ${config.wrapper}`}>
      {src ? (
        <img src={src} className={`${config.image} object-contain`} alt={alt} />
      ) : (
        <Sparkles size={config.fallback} strokeWidth={2.4} />
      )}
    </div>
  );
};
