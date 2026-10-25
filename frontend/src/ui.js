export const formatPrice = (n) =>
  n.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

const focus =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700';

export const inputClass = `w-full rounded-lg border border-slate-500 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-500 ${focus}`;

export const primaryBtn = `rounded-lg bg-indigo-700 px-4 py-2 font-semibold text-white hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-60 ${focus}`;

export const secondaryBtn = `rounded-lg border border-slate-500 bg-white px-4 py-2 font-semibold text-slate-900 hover:bg-slate-50 ${focus}`;

export const linkBtn = `rounded font-semibold text-indigo-700 underline underline-offset-4 hover:text-indigo-900 ${focus}`;


/** Best name to greet a user with: their name, else the part of the email before @. */
export const displayName = (user) =>
  user?.name || user?.email?.split('@')[0] || 'there';