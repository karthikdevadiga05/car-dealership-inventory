import { useEffect, useRef, useState } from 'react';

const CUSTOMER = {
  eyebrow: 'Showroom',
  lead: 'Find the car that fits your',
  words: ['family', 'budget', 'weekend', 'adventure'],
  subtitle: 'Compare models, filter by price and buy straight from live stock.',
};

const ADMIN = {
  eyebrow: 'Inventory control',
  lead: 'Keep your showroom',
  words: ['stocked', 'organized', 'moving'],
  subtitle: 'Add vehicles, update prices and restock the cars that sell fastest.',
};

const COLORS = [
  { name: 'Sky', value: '#38bdf8' },
  { name: 'Amber', value: '#fbbf24' },
  { name: 'Mint', value: '#34d399' },
  { name: 'Rose', value: '#fb7185' },
  { name: 'Pearl', value: '#e2e8f0' },
];

const STREAKS = [
  { top: '18%', width: 80, delay: '0s' },
  { top: '38%', width: 120, delay: '0.5s' },
  { top: '58%', width: 60, delay: '1s' },
];

// Self-contained animation styles, so no other CSS file needs to change.
const CSS = `
.ay-hero { --mx: 0; --my: 0; }
.ay-car { transform: translate3d(calc(var(--mx) * 24px), calc(var(--my) * 12px), 0) rotate(calc(var(--mx) * 4deg)); transition: transform 0.25s ease-out; }
.ay-par-a { transform: translate3d(calc(var(--mx) * -40px), calc(var(--my) * -24px), 0); transition: transform 0.4s ease-out; }
.ay-par-b { transform: translate3d(calc(var(--mx) * 30px), calc(var(--my) * 20px), 0); transition: transform 0.4s ease-out; }
.ay-float { animation: ay-float 7s ease-in-out infinite; }
.ay-bob { animation: ay-bob 0.9s ease-in-out infinite; }
.ay-hop { animation: ay-hop 0.55s cubic-bezier(0.3, 0.7, 0.4, 1); }
.ay-wheel { transform-box: fill-box; transform-origin: center; animation: ay-spin 0.7s linear infinite; }
.ay-body { transition: fill 0.35s ease; }
.ay-road { background-color: rgba(15, 23, 42, 0.35); background-image: linear-gradient(90deg, rgba(255, 255, 255, 0.65) 50%, transparent 50%); background-size: 44px 2px; background-repeat: repeat-x; background-position: 0 50%; animation: ay-road 0.5s linear infinite; }
.ay-streak { opacity: 0; animation: ay-streak 1.5s linear infinite; }
.ay-rise { animation: ay-rise 0.7s ease-out both; }
.ay-word { animation: ay-word 0.45s ease-out both; }
.ay-nudge { display: inline-block; animation: ay-nudge 1.4s ease-in-out infinite; }
@keyframes ay-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-16px); } }
@keyframes ay-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
@keyframes ay-hop { 0%, 100% { transform: translateY(0); } 40% { transform: translateY(-22px) rotate(-2deg); } }
@keyframes ay-spin { to { transform: rotate(360deg); } }
@keyframes ay-road { to { background-position: -44px 50%; } }
@keyframes ay-streak { 0% { transform: translateX(0); opacity: 0; } 15% { opacity: 0.75; } 100% { transform: translateX(-380px); opacity: 0; } }
@keyframes ay-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes ay-word { from { opacity: 0; transform: translateY(0.35em); } to { opacity: 1; transform: none; } }
@keyframes ay-nudge { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(3px); } }
@media (prefers-reduced-motion: reduce) {
  .ay-hero *, .ay-hero *::before { animation: none !important; transition: none !important; }
}
`;

function Wheel({ cx }) {
  return (
    <g transform={`translate(${cx} 72)`}>
      <circle r="14" fill="#1e293b" stroke="#f8fafc" strokeWidth="2" />
      <g className="ay-wheel">
        <path
          d="M0 -9V9M-9 0H9M-6.4 -6.4L6.4 6.4M6.4 -6.4L-6.4 6.4"
          stroke="#cbd5e1"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </g>
      <circle r="3.5" fill="#f8fafc" />
    </g>
  );
}

/** Animated, interactive banner at the top of the dashboard (customer and admin wording). */
export default function Hero({ isAdmin = false }) {
  const copy = isAdmin ? ADMIN : CUSTOMER;
  const heroRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [color, setColor] = useState(COLORS[0].value);

  // Swap the highlighted word every couple of seconds.
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % copy.words.length), 2400);
    return () => clearInterval(id);
  }, [copy]);

  // The car and background glows lean towards the pointer.
  const onMove = (e) => {
    const el = heroRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    el.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  };
  const onLeave = () => {
    const el = heroRef.current;
    if (!el) return;
    el.style.setProperty('--mx', '0');
    el.style.setProperty('--my', '0');
  };

  const explore = () => {
    const target = document.getElementById('inventory') ?? heroRef.current?.nextElementSibling;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    target?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

  const word = copy.words[index % copy.words.length];

  return (
    <section
      ref={heroRef}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="ay-hero relative isolate overflow-hidden rounded-2xl px-5 py-8 text-white sm:rounded-3xl sm:px-8 sm:py-10 lg:px-12 lg:py-12"
      style={{ background: 'linear-gradient(120deg, #2e2a84 0%, #3a36a6 55%, #2f6fe0 100%)' }}
    >
      <style>{CSS}</style>

      {/* soft glows in the background */}
      <div aria-hidden="true" className="ay-par-a pointer-events-none absolute -left-16 -top-20 h-64 w-64">
        <div className="ay-float h-full w-full rounded-full bg-sky-400/30 blur-3xl" />
      </div>
      <div aria-hidden="true" className="ay-par-b pointer-events-none absolute -bottom-24 right-0 h-72 w-72">
        <div
          className="ay-float h-full w-full rounded-full bg-violet-400/30 blur-3xl"
          style={{ animationDelay: '-3s' }}
        />
      </div>

      <div className="relative z-10 grid items-center gap-8 lg:grid-cols-2">
        {/* text */}
        <div>
          <p
            className="ay-rise text-xs font-semibold uppercase tracking-widest text-indigo-200"
            style={{ animationDelay: '0s' }}
          >
            {copy.eyebrow}
          </p>
          <h1
            className="ay-rise mt-2 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl"
            style={{ animationDelay: '0.08s' }}
          >
            {copy.lead}{' '}
            <span className="inline-block">
              <span className="sr-only">{copy.words[0]}</span>
              <span key={word} aria-hidden="true" className="ay-word inline-block text-sky-300">
                {word}
              </span>
            </span>
            .
          </h1>
          <p
            className="ay-rise mt-3 max-w-md text-indigo-100"
            style={{ animationDelay: '0.16s' }}
          >
            {copy.subtitle}
          </p>
          <button
            type="button"
            onClick={explore}
            className="ay-rise mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-semibold text-indigo-800 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            style={{ animationDelay: '0.24s' }}
          >
            {isAdmin ? 'Go to inventory' : 'Explore cars'} <span aria-hidden="true" className="ay-nudge">↓</span>
          </button>
        </div>

        {/* animated scene */}
        <div>
          <div className="relative mx-auto w-full max-w-md overflow-x-clip">
            {STREAKS.map((s) => (
              <span
                key={s.top}
                aria-hidden="true"
                className="ay-streak absolute left-full h-[2px] rounded-full bg-white/60"
                style={{ top: s.top, width: s.width, animationDelay: s.delay }}
              />
            ))}

            <div className="ay-car relative z-10 mx-auto w-[85%]">
              <div className="ay-bob">
                   <div className="block w-full">
                    <svg viewBox="0 12 200 80" className="block h-auto w-full drop-shadow-2xl" aria-hidden="true">
                      <ellipse cx="100" cy="88" rx="74" ry="3.5" fill="rgba(2, 6, 23, 0.35)" />
                      <path
                        className="ay-body"
                        fill={color}
                        d="M20 70 L30 52 Q34 46 42 44 L70 38 Q80 24 96 22 L128 22 Q142 24 150 38 L172 44 Q184 48 184 60 L184 70 Z"
                      />
                      <path d="M78 38 Q86 28 98 27 L126 27 Q136 28 142 38 Z" fill="#f8fafc" opacity="0.85" />
                      <path d="M34 55 L172 51" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="179" cy="55" r="3.2" fill="#fef08a" />
                      <circle cx="23" cy="60" r="2.6" fill="#f87171" />
                      <Wheel cx={56} />
                      <Wheel cx={148} />
                    </svg>
                    </div>
              </div>
            </div>

            <div aria-hidden="true" className="ay-road relative -mt-[2.5%] h-3 rounded-full" />
          </div>

          <div className="mt-5 flex items-center justify-center gap-3">
            <span className="text-sm text-indigo-200">Paint it</span>
            <div role="group" aria-label="Car paint" className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  aria-label={`Paint it ${c.name}`}
                  aria-pressed={color === c.value}
                  onClick={() => setColor(c.value)}
                  className={`h-7 w-7 rounded-full border-2 transition hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                    color === c.value ? 'scale-110 border-white' : 'border-white/30'
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-indigo-200">Move your cursor over the banner </p>
        </div>
      </div>
    </section>
  );
}