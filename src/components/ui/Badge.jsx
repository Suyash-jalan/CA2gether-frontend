import { motion } from 'framer-motion';
import { HiCheckBadge, HiClock, HiXCircle } from 'react-icons/hi2';

const badgeConfig = {
  verified: {
    icon: HiCheckBadge,
    bg: 'bg-[#EBF5EA]',
    border: 'border-[#C3E4C0]',
    text: 'text-[#286333]',
    label: 'ICAI Verified',
  },
  pending: {
    icon: HiClock,
    bg: 'bg-[#FFF5E6]',
    border: 'border-[#FFE0B2]',
    text: 'text-[#8C5209]',
    label: 'Verification Pending',
  },
  rejected: {
    icon: HiXCircle,
    bg: 'bg-[#FDECEB]',
    border: 'border-[#F8BDBA]',
    text: 'text-[#A62721]',
    label: 'Verification Rejected',
  },
  neutral: {
    icon: HiCheckBadge,
    bg: 'bg-background',
    border: 'border-border',
    text: 'text-heading',
    label: 'Member detail',
  },
};

export default function Badge({ status = 'pending', text, className = '' }) {
  const config = badgeConfig[status] || badgeConfig.pending;
  const Icon = config.icon;
  const displayText = text || config.label;

  return (
    <motion.span
      className={`
        inline-flex items-center gap-1.5 px-3 py-1 rounded-full border
        text-xs font-semibold ${config.bg} ${config.border} ${config.text} shadow-2xs ${className}
      `}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="leading-tight">{displayText}</span>
    </motion.span>
  );
}
