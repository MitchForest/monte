export const cx = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(' ');

export const mergeClass = (base: string, additions?: string) => (additions ? `${base} ${additions}` : base);
