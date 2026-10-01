import { motion } from 'framer-motion';

export default function IconButton({ icon: Icon, onClick, label, className = '', size = 20, ...props }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      whileHover={{ scale: 1.1, rotate: 8 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`
        p-2 rounded-full text-muted hover:text-primary
        hover:bg-primary/10 transition-colors cursor-pointer
        ${className}
      `}
      {...props}
    >
      <Icon size={size} />
    </motion.button>
  );
}
