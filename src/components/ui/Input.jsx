export default function Input({
  label,
  error,
  helperText,
  icon: Icon,
  rightElement,
  className = '',
  id,
  style,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-heading/85 mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none flex items-center justify-center z-10">
            {typeof Icon === 'function' ? <Icon size={18} /> : Icon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full bg-white transition-all duration-200 ${
            error
              ? '!border-[var(--color-error)] focus:!ring-[var(--color-error)]/20'
              : 'hover:border-primary/50'
          }`}
          style={{
            backgroundColor: '#FFFFFF',
            paddingLeft: Icon ? '40px' : '15px',
            paddingRight: rightElement ? '42px' : '15px',
            ...style,
          }}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center z-10">
            {rightElement}
          </div>
        )}
      </div>
      {error ? (
        <p className="text-xs text-[var(--color-error)] font-medium mt-1.5 flex items-center gap-1">
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-xs text-muted mt-1.5">{helperText}</p>
      ) : null}
    </div>
  );
}
