import { motion } from 'framer-motion';

export default function SegmentedTabs({
  tabs = [],
  activeTab,
  onChange,
  className = '',
}) {
  return (
    <div
      role="tablist"
      className={`inline-flex max-w-full items-center gap-1 p-1 bg-surface/60 rounded-full border border-border/80 ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const Icon = tab.icon;

        return (
          <motion.button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              relative min-w-0 min-h-11 flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium
              cursor-pointer transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
              leading-normal select-none
              ${isActive ? 'text-white font-semibold' : 'text-muted hover:text-heading bg-transparent'}
            `}
            style={{ overflow: 'visible' }}
          >
            {isActive && (
              <motion.div
                layoutId="segmented-tab-active"
                className="absolute inset-0 bg-primary rounded-full shadow-[0_2px_8px_rgba(217,105,74,0.25)] -z-0"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
              {Icon && <Icon size={17} className="shrink-0" />}
              <span className="leading-tight pb-0.5">{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`ml-0.5 text-xs px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-border text-muted'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
