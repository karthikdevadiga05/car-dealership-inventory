import { useEffect } from 'react';

/** Accessible dialog shell: Escape or a click outside closes it. */
export default function Modal({ eyebrow, title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/60 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-line bg-surface p-6 shadow-2xl"
      >
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            {eyebrow}
          </p>
        )}
        <div className="mt-1 flex items-start justify-between gap-4">
          <h2 id="modal-title" className="text-2xl font-bold text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg px-2 py-1 text-ink hover:bg-sunken focus-visible:outline-2 focus-visible:outline-accent"
          >
            ✕
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}