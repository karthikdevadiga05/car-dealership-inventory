export const formatPrice = (n) =>
  n.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

/** Best name to greet a user with: their name, else the part of the email before @. */
export const displayName = (user) =>
  user?.name || user?.email?.split('@')[0] || 'there';

const focus =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

export const inputClass = `w-full rounded-lg border border-field bg-surface px-3 py-2 text-ink placeholder:text-muted ${focus}`;

export const primaryBtn = `rounded-lg bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60 ${focus}`;

export const secondaryBtn = `rounded-lg border border-field bg-surface px-4 py-2 font-semibold text-ink hover:bg-sunken ${focus}`;

export const linkBtn = `rounded font-semibold text-accent underline underline-offset-4 hover:text-accent-hover ${focus}`;
