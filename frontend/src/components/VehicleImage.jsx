import { useEffect, useState } from 'react';

function CarIllustration() {
  return (
    <svg viewBox="0 0 200 100" className="h-28 w-48" aria-hidden="true">
      <path
        d="M20 70 L30 52 Q34 46 42 44 L70 38 Q80 24 96 22 L128 22 Q142 24 150 38 L172 44 Q184 48 184 60 L184 70 Z"
        fill="currentColor"
      />
      <path d="M78 38 Q86 28 98 27 L126 27 Q136 28 142 38 Z" fill="#f8fafc" opacity="0.8" />
      <circle cx="56" cy="72" r="14" fill="#1e293b" stroke="#f8fafc" strokeWidth="2" />
      <circle cx="56" cy="72" r="6" fill="#f8fafc" />
      <circle cx="148" cy="72" r="14" fill="#1e293b" stroke="#f8fafc" strokeWidth="2" />
      <circle cx="148" cy="72" r="6" fill="#f8fafc" />
    </svg>
  );
}

/** Shows the vehicle photo when it loads; otherwise the default car illustration. */
export default function VehicleImage({
  src,
  alt,
  tint = 'bg-sunken text-muted',
  className = '',
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`w-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={`${alt} (no photo available)`}
      className={`flex items-center justify-center ${tint} ${className}`}
    >
      <CarIllustration />
    </div>
  );
}