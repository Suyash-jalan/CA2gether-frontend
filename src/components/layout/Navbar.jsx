import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import {
  HiSparkles, HiChatBubbleLeftRight, HiUserGroup, HiUser,
  HiBell, HiArrowRightOnRectangle, HiShieldCheck, HiHeart,
  HiNewspaper,
} from 'react-icons/hi2';
import { useAuth } from '../../hooks/useAuth';
import { notificationService } from '../../services/notificationService';

const navItems = [
  { to: '/discover', icon: HiSparkles, label: 'Discover' },
  { to: '/matches', icon: HiHeart, label: 'Matches' },
  { to: '/chat', icon: HiChatBubbleLeftRight, label: 'Chat' },
  { to: '/lounge', icon: HiUserGroup, label: 'Lounge' },
  { to: '/news', icon: HiNewspaper, label: 'News' },
  { to: '/profile', icon: HiUser, label: 'Profile' },
];

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);
  const [showNotifDot, setShowNotifDot] = useState(false);
  const prevUnread = useRef(0);

  // Don't render app navbar on public pages (Landing, Login, Signup)
  const isPublicPage = ['/', '/login', '/signup'].includes(location.pathname);

  useEffect(() => {
    if (!user || isPublicPage) return;
    const fetchUnread = async () => {
      try {
        const { data } = await notificationService.getNotifications({ unreadOnly: 'true', limit: 1 });
        setUnread(data.unreadCount || 0);
        if (data.unreadCount > prevUnread.current) {
          setShowNotifDot(true);
        }
        prevUnread.current = data.unreadCount || 0;
      } catch { /* ignore */ }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user, isPublicPage]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user || isPublicPage) return null;

  return (
    <>
      {/* ── Desktop top bar ──────────────────────────────────── */}
      <header className="sticky top-0 left-0 right-0 z-50 bg-[#FAF3EC]/95 backdrop-blur-md border-b border-border shadow-[0_2px_8px_rgba(217,105,74,0.06)]">
        <div className="max-w-[1100px] mx-auto w-full flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
          {/* Brand Logo aligned with page container */}
          <NavLink
            to="/"
            className="shrink-0 font-serif text-xl lg:text-2xl font-bold text-primary no-underline hover:no-underline tracking-tight flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
          >
            CA2gether
          </NavLink>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-3" aria-label="Main Navigation">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className="no-underline hover:no-underline rounded-full">
                {({ isActive }) => (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative isolate flex items-center gap-2 px-2.5 lg:px-3.5 py-3 rounded-full text-sm font-medium transition-colors ${
                      isActive ? 'text-primary font-semibold' : 'text-muted hover:text-heading'
                    }`}
                  >
                    <item.icon size={18} className="shrink-0" />
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute inset-0 bg-primary/10 rounded-full -z-10"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                  </motion.div>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right Action Icons with 16px gap, tooltips, and aria-labels */}
          <div className="flex items-center gap-1 lg:gap-2 shrink-0 [&>button]:min-h-11 [&>button]:min-w-11 [&>button]:flex [&>button]:items-center [&>button]:justify-center">
            {/* Notification Bell */}
            <motion.button
              type="button"
              aria-label="Notifications"
              title="Notifications"
              onClick={() => { navigate('/notifications'); setShowNotifDot(false); }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              animate={showNotifDot ? { rotate: [-8, 8, -5, 5, 0] } : {}}
              transition={showNotifDot ? { duration: 0.5 } : {}}
              onAnimationComplete={() => setShowNotifDot(false)}
              className="relative p-2 text-muted hover:text-primary transition-colors cursor-pointer rounded-full hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <HiBell size={20} />
              <AnimatePresence>
                {unread > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.15, 1] }}
                    exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none shadow-sm"
                  >
                    {unread > 9 ? '9+' : unread}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {isAdmin && (
              <motion.button
                type="button"
                aria-label="Admin panel"
                title="Admin Panel"
                onClick={() => navigate('/admin')}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                className="p-2 text-muted hover:text-success transition-colors cursor-pointer rounded-full hover:bg-success/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success"
              >
                <HiShieldCheck size={20} />
              </motion.button>
            )}

            {/* Logout */}
            <motion.button
              type="button"
              aria-label="Sign out"
              title="Sign Out"
              onClick={handleLogout}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="p-2 text-muted hover:text-error transition-colors cursor-pointer rounded-full hover:bg-error/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error"
            >
              <HiArrowRightOnRectangle size={20} />
            </motion.button>
          </div>
        </div>
      </header>

      {/* ── Mobile bottom tab bar ─────────────────────────────── */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FAF3EC]/95 backdrop-blur-md border-t border-border shadow-[0_-2px_10px_rgba(217,105,74,0.06)] pb-[env(safe-area-inset-bottom)]"
      >
        <div className="max-w-[1100px] mx-auto flex items-center justify-around py-1.5 px-2">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className="no-underline flex-1 focus-visible:outline-none">
              {({ isActive }) => (
                <motion.div
                  whileTap={{ scale: 0.94 }}
                  className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl relative transition-colors ${
                    isActive ? 'text-primary font-semibold' : 'text-muted'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-indicator"
                      className="absolute -top-1.5 w-6 h-0.5 bg-primary rounded-full"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </motion.div>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
