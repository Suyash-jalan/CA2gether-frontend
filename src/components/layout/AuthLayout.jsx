import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiArrowLeft, HiSparkles } from 'react-icons/hi2';
import PageTransition from './PageTransition';

export default function AuthLayout({
  children,
  title,
  subtitle,
  activeTab = 'login', // 'login' | 'signup'
  maxWidth = 'max-w-[480px]',
}) {
  const isLogin = activeTab === 'login';

  return (
    <PageTransition>
      <div
        className="min-h-screen bg-background relative overflow-x-hidden flex flex-col justify-between items-center px-4 sm:px-6 py-6 sm:py-10"
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        {/* Ambient Warm Gradient Orbs */}
        <div
          aria-hidden="true"
          className="fixed -top-36 -left-36 w-[34rem] h-[34rem] rounded-full pointer-events-none opacity-40 blur-[110px]"
          style={{ background: 'radial-gradient(circle, rgba(217,105,74,0.3) 0%, transparent 70%)' }}
        />
        <div
          aria-hidden="true"
          className="fixed -bottom-36 -right-36 w-[38rem] h-[38rem] rounded-full pointer-events-none opacity-35 blur-[130px]"
          style={{ background: 'radial-gradient(circle, rgba(217,140,123,0.35) 0%, transparent 70%)' }}
        />

        {/* Top Header Bar */}
        <header className="w-full max-w-4xl flex items-center justify-between mb-6 z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-muted hover:text-primary transition-colors no-underline group"
          >
            <span
              className="w-8 h-8 rounded-full bg-surface border border-border group-hover:border-primary/50 flex items-center justify-center transition-colors shadow-xs"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <HiArrowLeft size={14} className="text-muted group-hover:text-primary transition-transform group-hover:-translate-x-0.5" />
            </span>
            <span>Back to home</span>
          </Link>

          <div aria-hidden="true" className="w-8" />
        </header>

        {/* Center Main Card & Brand Identity */}
        <main className={`w-full ${maxWidth} z-10 my-auto flex flex-col items-center`}>
          {/* Brand Logo & Title Header */}
          <div className="text-center mb-8 flex flex-col items-center">
            <Link to="/" className="inline-flex flex-col items-center gap-3 no-underline group">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                  boxShadow: '0 8px 24px rgba(217, 105, 74, 0.25)',
                }}
              >
                <span className="font-serif font-black text-2xl tracking-tight text-white">CA</span>
              </div>
              <div>
                <h1
                  className="font-serif text-3xl font-bold tracking-tight mb-1 transition-colors"
                  style={{ color: 'var(--color-heading)', fontFamily: 'var(--font-serif)' }}
                >
                  CA2gether
                </h1>
                <p className="text-xs font-semibold text-muted uppercase tracking-widest flex items-center justify-center gap-1.5">
                  <HiSparkles size={13} className="text-primary" />
                  <span>Chartered Accountants Network</span>
                </p>
              </div>
            </Link>
          </div>

          {/* Form Card Container */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-full rounded-[24px] sm:rounded-[28px] border shadow-lg"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              boxShadow: '0 12px 40px rgba(217, 105, 74, 0.08), 0 2px 6px rgba(0,0,0,0.02)',
              padding: 'clamp(24px, 4vw, 36px)',
            }}
          >
            {/* Segmented Tab Switcher */}
            <div className="flex justify-center mb-7">
              <div
                className="inline-flex p-1 rounded-full border w-full max-w-xs shadow-inner"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <Link
                  to="/login"
                  className="flex-1 py-2 text-center text-xs sm:text-sm font-semibold rounded-full transition-all duration-200 no-underline"
                  style={{
                    backgroundColor: isLogin ? 'var(--color-surface)' : 'transparent',
                    color: isLogin ? 'var(--color-primary)' : 'var(--color-muted)',
                    boxShadow: isLogin ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                    fontWeight: isLogin ? 700 : 500,
                  }}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="flex-1 py-2 text-center text-xs sm:text-sm font-semibold rounded-full transition-all duration-200 no-underline"
                  style={{
                    backgroundColor: !isLogin ? 'var(--color-surface)' : 'transparent',
                    color: !isLogin ? 'var(--color-primary)' : 'var(--color-muted)',
                    boxShadow: !isLogin ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                    fontWeight: !isLogin ? 700 : 500,
                  }}
                >
                  Create Account
                </Link>
              </div>
            </div>

            {/* Header titles inside card */}
            <div className="mb-6 text-center">
              <h2
                className="font-serif text-2xl sm:text-[1.65rem] font-bold tracking-tight mb-1.5"
                style={{ color: 'var(--color-heading)', fontFamily: 'var(--font-serif)' }}
              >
                {title}
              </h2>
              {subtitle && (
                <p className="text-muted text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Form Slot */}
            {children}
          </motion.div>
        </main>

        {/* Bottom Trust Badge */}
        <footer className="w-full max-w-md text-center mt-8 z-10">
          <p className="text-xs text-muted/80">
            🔒 256-bit encrypted • Credentials protected • Strictly confidential
          </p>
        </footer>
      </div>
    </PageTransition>
  );
}
