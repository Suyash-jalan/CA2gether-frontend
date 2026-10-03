import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiHeart, HiChatBubbleLeftRight, HiUserGroup, HiAcademicCap, HiSparkles } from 'react-icons/hi2';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import PageTransition from '../components/layout/PageTransition';

const features = [
  { icon: HiHeart, title: 'CA Dating', desc: 'Find someone who truly understands your article-ship grind and exam season stress.' },
  { icon: HiAcademicCap, title: 'Exam Buddy', desc: 'Toggle Exam Buddy mode to find study partners, not dates — same level, same goals.' },
  { icon: HiChatBubbleLeftRight, title: 'Real-time Chat', desc: 'Match and chat instantly with CA-themed icebreaker prompts to break the silence.' },
  { icon: HiUserGroup, title: 'CA Lounge', desc: 'Join forum discussions, find local meet-ups, and network with fellow professionals.' },
];

const steps = [
  { num: '01', title: 'Sign Up', desc: 'Create your account with email and set up your CA profile.' },
  { num: '02', title: 'Verify ICAI', desc: 'Upload your ICAI registration document for verification.' },
  { num: '03', title: 'Discover', desc: 'Browse verified CA profiles filtered by city, stage, and specialization.' },
  { num: '04', title: 'Connect', desc: 'Match, chat, and build meaningful connections in the CA community.' },
];

const tags = ['CA Foundation', 'CA Inter', 'CA Final', 'Qualified CA', 'Articleship'];

export default function Landing() {
  const { user } = useAuth();

  return (
    <PageTransition>
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--color-background)',
          overflowX: 'hidden',
        }}
      >
        {/* ── Header / Navbar ──────────────────────────────────── */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            backgroundColor: 'rgba(250, 243, 236, 0.95)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--color-border)',
            boxShadow: '0 2px 8px rgba(217, 105, 74, 0.05)',
          }}
        >
          <nav
            style={{
              maxWidth: '1100px',
              marginInline: 'auto',
              paddingInline: 'clamp(16px, 3vw, 32px)',
              paddingBlock: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Link
              to="/"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.35rem, 2vw, 1.6rem)',
                fontWeight: 700,
                color: 'var(--color-primary)',
                textDecoration: 'none',
                letterSpacing: '-0.02em',
              }}
            >
              CA2gether
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {user ? (
                <>
                  <Link to="/discover">
                    <Button variant="primary" size="sm">
                      <HiSparkles size={16} className="mr-1 inline" />
                      Go to Discover
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm">Log In</Button>
                  </Link>
                  <Link to="/signup">
                    <Button variant="primary" size="sm">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </header>

        <main>
          {/* ── Hero ─────────────────────────────────────────────── */}
          <section
            style={{
              maxWidth: '1100px',
              marginInline: 'auto',
              paddingInline: 'clamp(16px, 3vw, 32px)',
              paddingTop: 'clamp(48px, 8vw, 88px)',
              paddingBottom: 'clamp(40px, 6vw, 72px)',
              textAlign: 'center',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(2rem, 5vw, 3.75rem)',
                  fontWeight: 700,
                  lineHeight: 1.15,
                  color: 'var(--color-heading)',
                  marginBottom: '24px',
                  textWrap: 'balance',
                }}
              >
                Where CAs Find Their{' '}
                <span style={{ color: 'var(--color-primary)' }}>Perfect Match</span>
              </h1>

              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
                  lineHeight: 1.7,
                  color: 'var(--color-muted)',
                  maxWidth: '640px',
                  marginInline: 'auto',
                  marginBottom: '40px',
                  textWrap: 'balance',
                }}
              >
                The only dating &amp; networking app exclusively for Chartered Accountants and CA students.
                ICAI-verified profiles. Zero fakes. 100% free.
              </p>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '16px',
                }}
              >
                <Link to="/signup">
                  <Button size="lg">Get Started — It's Free</Button>
                </Link>
                <Button variant="outline" size="lg" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Learn More</Button>
              </div>
            </motion.div>

            {/* Audience chips */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '12px',
                marginTop: '48px',
              }}
            >
              {tags.map((tag, i) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + i * 0.08, type: 'spring', stiffness: 220 }}
                  whileHover={{
                    y: -3,
                    boxShadow: '0 6px 20px rgba(217,105,74,0.14)',
                  }}
                  style={{
                    display: 'inline-block',
                    padding: '8px 20px',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '999px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    fontFamily: 'var(--font-sans)',
                    color: 'var(--color-heading)',
                    boxShadow: '0 2px 8px rgba(217,105,74,0.06)',
                    cursor: 'default',
                  }}
                >
                  {tag}
                </motion.span>
              ))}
            </div>
          </section>

          {/* ── Features ──────────────────────────────────────────── */}
          <section
            id="features"
            style={{
              maxWidth: '1100px',
              marginInline: 'auto',
              paddingInline: 'clamp(16px, 3vw, 32px)',
              paddingTop: 'clamp(40px, 6vw, 80px)',
              paddingBottom: 'clamp(40px, 6vw, 80px)',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                fontWeight: 700,
                textAlign: 'center',
                color: 'var(--color-heading)',
                marginBottom: 'clamp(32px, 4vw, 56px)',
              }}
            >
              Built for the CA Community
            </h2>

            {/* Top row: 3 cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
                gap: '24px',
                marginBottom: '24px',
              }}
            >
              {features.slice(0, 3).map((feat, i) => (
                <FeatureCard key={feat.title} feat={feat} index={i} />
              ))}
            </div>

            {/* Bottom row: 2 cards, centered */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '24px',
              }}
            >
              {features.slice(3).map((feat, i) => (
                <div key={feat.title} style={{ flex: '1 1 320px', maxWidth: '440px' }}>
                  <FeatureCard feat={feat} index={i + 3} />
                </div>
              ))}
            </div>
          </section>

          {/* ── How It Works ──────────────────────────────────────── */}
          <section
            style={{
              maxWidth: '880px',
              marginInline: 'auto',
              paddingInline: 'clamp(16px, 4vw, 48px)',
              paddingTop: 'clamp(40px, 6vw, 80px)',
              paddingBottom: 'clamp(40px, 6vw, 80px)',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                fontWeight: 700,
                textAlign: 'center',
                color: 'var(--color-heading)',
                marginBottom: 'clamp(32px, 4vw, 56px)',
              }}
            >
              How It Works
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {steps.map((step, i) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -16 : 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '20px',
                    padding: '24px',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '20px',
                    boxShadow: '0 2px 8px rgba(217,105,74,0.05)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '2rem',
                      fontWeight: 700,
                      color: 'rgba(217, 105, 74, 0.25)',
                      lineHeight: 1,
                      flexShrink: 0,
                      width: '48px',
                    }}
                  >
                    {step.num}
                  </span>
                  <div>
                    <h3
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        color: 'var(--color-heading)',
                        marginBottom: '4px',
                      }}
                    >
                      {step.title}
                    </h3>
                    <p
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.875rem',
                        color: 'var(--color-muted)',
                        lineHeight: 1.6,
                      }}
                    >
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ── Final CTA ─────────────────────────────────────────── */}
          <section
            style={{
              maxWidth: '880px',
              marginInline: 'auto',
              paddingInline: 'clamp(16px, 4vw, 48px)',
              paddingTop: 'clamp(24px, 3vw, 40px)',
              paddingBottom: 'clamp(48px, 8vw, 96px)',
              textAlign: 'center',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: 'linear-gradient(135deg, rgba(217,105,74,0.06) 0%, rgba(217,140,123,0.06) 100%)',
                border: '1px solid rgba(217,105,74,0.15)',
                borderRadius: '24px',
                padding: 'clamp(32px, 5vw, 56px) clamp(24px, 4vw, 48px)',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                  fontWeight: 700,
                  color: 'var(--color-heading)',
                  marginBottom: '16px',
                }}
              >
                Ready to Connect?
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '1rem',
                  color: 'var(--color-muted)',
                  marginBottom: '32px',
                  lineHeight: 1.6,
                }}
              >
                Join thousands of CAs already finding their match. Always free.
              </p>
              <Link to="/signup">
                <Button size="lg">Create Free Account</Button>
              </Link>
            </motion.div>
          </section>
        </main>

        {/* ── Footer ───────────────────────────────────────────── */}
        <footer
          style={{
            borderTop: '1px solid var(--color-border)',
            paddingBlock: '32px',
            paddingInline: 'clamp(16px, 3vw, 32px)',
          }}
        >
          <div
            style={{
              maxWidth: '1100px',
              marginInline: 'auto',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              rowGap: '12px',
              columnGap: '24px',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.875rem',
              color: 'var(--color-muted)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: 600,
                color: 'var(--color-heading)',
              }}
            >
              CA2gether
            </span>
            <div style={{ display: 'flex', gap: '24px' }}>
              <Link
                to="/terms"
                style={{ color: 'var(--color-muted)', textDecoration: 'none', transition: 'color 0.2s', fontSize: '0.875rem' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-muted)'; }}
              >
                Terms
              </Link>
              <Link
                to="/privacy"
                style={{ color: 'var(--color-muted)', textDecoration: 'none', transition: 'color 0.2s', fontSize: '0.875rem' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-muted)'; }}
              >
                Privacy
              </Link>
            </div>
            <span>© {new Date().getFullYear()} CA2gether. All rights reserved.</span>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}

/* ── Feature Card sub-component ──────────────────────────────────── */

function FeatureCard({ feat, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        y: -6,
        boxShadow: '0 12px 40px rgba(217,105,74,0.12)',
      }}
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '20px',
        padding: '28px',
        boxShadow: '0 4px 16px rgba(217,105,74,0.06)',
        cursor: 'default',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '14px',
          backgroundColor: 'rgba(217,105,74,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          flexShrink: 0,
        }}
      >
        <feat.icon size={24} color="var(--color-primary)" />
      </div>
      <h3
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.125rem',
          fontWeight: 600,
          color: 'var(--color-heading)',
          marginBottom: '8px',
        }}
      >
        {feat.title}
      </h3>
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.875rem',
          lineHeight: 1.65,
          color: 'var(--color-muted)',
          flex: 1,
        }}
      >
        {feat.desc}
      </p>
    </motion.div>
  );
}
