import { motion } from 'framer-motion';

export default function FilterChip({ label, selected, onClick, index = 0 }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      whileHover={{ y: -2, boxShadow: '0 4px 16px rgba(217,105,74,0.12)' }}
      whileTap={{ scale: 0.95 }}
      className={`
        px-4 py-2 rounded-[999px] text-sm font-medium
        border transition-colors cursor-pointer select-none
        ${
          selected
            ? 'bg-primary text-white border-primary'
            : 'bg-surface text-heading border-border hover:border-primary'
        }
      `}
    >
      {selected && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.3 }}
        />
      )}
      {label}
    </motion.button>
  );
}
