import { motion } from 'framer-motion';

export default function Card({ children, className = '', hover = true, onClick, ...props }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={
        hover
          ? { y: -4, boxShadow: '0 8px 32px rgba(217,105,74,0.15)' }
          : {}
      }
      whileTap={onClick ? { scale: 0.98 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`
        bg-surface rounded-[20px] p-6
        shadow-[0_4px_16px_rgba(217,105,74,0.1)]
        border border-border
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}
