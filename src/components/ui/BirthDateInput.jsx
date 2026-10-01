export default function BirthDateInput({ value, onChange }) {
  const [year = '', month = '', day = ''] = value.split('-');
  const today = new Date();
  const latestYear = today.getFullYear() - 18;
  const days = new Date(Number(year) || 2000, Number(month) || 1, 0).getDate();
  const update = (part, next) => {
    const parts = { year, month, day, [part]: next };
    if (parts.day && parts.month) {
      const max = new Date(Number(parts.year) || 2000, Number(parts.month), 0).getDate();
      parts.day = String(Math.min(Number(parts.day), max)).padStart(2, '0');
    }
    onChange({ target: { value: `${parts.year}-${parts.month}-${parts.day}` } });
  };
  return <fieldset className="min-w-0">
    <legend className="mb-1.5 text-xs font-semibold text-heading/85">Date of birth</legend>
    <div className="grid grid-cols-[1fr_1.3fr_1.2fr] gap-2">
      <select aria-label="Birth day" value={day} onChange={(e) => update('day', e.target.value)} required className="min-w-0 w-full !px-2"><option value="">Day</option>{Array.from({ length: days }, (_, i) => <option key={i} value={String(i + 1).padStart(2, '0')}>{i + 1}</option>)}</select>
      <select aria-label="Birth month" value={month} onChange={(e) => update('month', e.target.value)} required className="min-w-0 w-full !px-2"><option value="">Month</option>{Array.from({ length: 12 }, (_, i) => <option key={i} value={String(i + 1).padStart(2, '0')}>{new Date(2000, i).toLocaleString('en', { month: 'short' })}</option>)}</select>
      <select aria-label="Birth year" value={year} onChange={(e) => update('year', e.target.value)} required className="min-w-0 w-full !px-2"><option value="">Year</option>{Array.from({ length: 82 }, (_, i) => <option key={i} value={latestYear - i}>{latestYear - i}</option>)}</select>
    </div>
    <p className="mt-1.5 text-xs text-muted">You must be at least 18 years old.</p>
  </fieldset>;
}
