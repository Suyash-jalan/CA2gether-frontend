import { motion } from 'framer-motion';
import Button from './Button';

export default function EmptyState({
  title,
  subtitle,
  description,
  icon: Icon,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  className = '',
  children,
}) {
  const supportingText = subtitle || description;

  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-12 sm:py-16 px-6 max-w-md mx-auto my-auto ${className}`}
    >
      {Icon && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5 shadow-[0_4px_16px_rgba(217,105,74,0.08)]"
        >
          <Icon size={32} />
        </motion.div>
      )}

      <motion.h3
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="font-serif text-2xl font-bold text-heading mb-2"
      >
        {title}
      </motion.h3>

      {supportingText && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="text-muted text-sm max-w-xs mb-6 leading-relaxed"
        >
          {supportingText}
        </motion.p>
      )}

      {(actionText || secondaryActionText || children) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {actionText && (
            <Button onClick={onAction} variant="primary">
              {actionText}
            </Button>
          )}
          {secondaryActionText && (
            <Button onClick={onSecondaryAction} variant="outline">
              {secondaryActionText}
            </Button>
          )}
          {children}
        </motion.div>
      )}
    </div>
  );
}
