'use client';
export default function Stars({ value, onChange, label, max = 5, size = 26 }) {
  return (
    <div role="radiogroup" aria-label={label} style={{ display: 'flex' }}>
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n}점`} onClick={() => onChange(n)}
          style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', fontSize: size, lineHeight: 1.2, color: n <= value ? '#e6b800' : 'var(--line)' }}>★</button>
      ))}
    </div>
  );
}
