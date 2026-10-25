/** AutoYard logo: a rounded badge with a car silhouette, plus the wordmark. */
export default function Logo({ light = false }) {
  const badge = light ? 'fill-white' : 'fill-indigo-700 dark:fill-indigo-500';
  const car = light ? 'fill-indigo-900' : 'fill-white';
  const gap = light ? 'stroke-white' : 'stroke-indigo-700 dark:stroke-indigo-500';
  const word = light ? 'text-white' : 'text-indigo-900 dark:text-indigo-100';

  return (
    <span className="inline-flex items-center gap-2.5">
      <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden="true">
        <rect width="40" height="40" rx="10" className={badge} />
        <path
          d="M7 26 L9.5 19 Q10.5 17 13 16.5 L17 15.5 Q19 12 22 12 L27 12 Q30 12.5 31.5 15.5 L33 17 Q34.5 18 34.5 21 L34.5 26 Z"
          className={car}
        />
        <circle cx="14" cy="26.5" r="3.6" strokeWidth="1.6" className={`${car} ${gap}`} />
        <circle cx="28" cy="26.5" r="3.6" strokeWidth="1.6" className={`${car} ${gap}`} />
      </svg>
      <span className={`text-xl font-bold tracking-tight ${word}`}>AutoYard</span>
    </span>
  );
}