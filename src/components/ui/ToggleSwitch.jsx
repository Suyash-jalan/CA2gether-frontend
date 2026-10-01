import { motion } from 'framer-motion';

export default function ToggleSwitch({
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  id,
}) {
  const switchElement = (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label || 'Toggle switch'}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled && onChange) onChange(!checked);
      }}
      className={`
        relative inline-flex items-center shrink-0 w-[44px] h-[24px] rounded-full p-[2px]
        transition-colors duration-250 ease-in-out cursor-pointer select-none
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
        ${checked ? 'bg-primary' : 'bg-[#D6CEBF]'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <motion.span
        className="pointer-events-none block w-[20px] h-[20px] bg-white rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
        animate={{ x: checked ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
      />
    </button>
  );

  if (label || description) {
    return (
      <div
        onClick={() => {
          if (!disabled && onChange) onChange(!checked);
        }}
        className="flex items-center justify-between gap-4 py-3 cursor-pointer group select-none"
      >
        <div className="flex flex-col pr-2">
          {label && (
            <span className="text-sm font-medium text-heading group-hover:text-primary transition-colors">
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-muted mt-0.5 leading-relaxed">
              {description}
            </span>
          )}
        </div>
        {switchElement}
      </div>
    );
  }

  return switchElement;
}
