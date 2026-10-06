import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiEnvelope,
  HiLockClosed,
  HiEye,
  HiEyeSlash,
  HiArrowRight,
  HiXMark,
  HiShieldCheck,
} from 'react-icons/hi2';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import AuthLayout from '../components/layout/AuthLayout';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [developmentResetUrl, setDevelopmentResetUrl] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      await login({ email: email.trim(), password }, rememberMe);
      toast.success('Welcome back to CA2gether!', { className: 'toast-success' });
      navigate('/discover');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(msg, { className: 'toast-error' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast.error('Please enter your registered email address');
      return;
    }
    setForgotLoading(true);
    try {
      const { data } = await authService.forgotPassword({ email: forgotEmail.trim() });
      if (data.resetUrl) {
        setDevelopmentResetUrl(data.resetUrl);
        toast.success('Development reset link created.', { className: 'toast-success' });
        return;
      }
      setForgotModalOpen(false);
      toast.success('If an account exists for this email, reset instructions have been sent.', {
        duration: 5000,
        className: 'toast-success',
      });
      setForgotEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to send reset instructions.', { className: 'toast-error' });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back, CA!"
      subtitle="Sign in to your verified account to connect and network."
      activeTab="login"
      maxWidth="max-w-[460px]"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email Address"
          id="login-email"
          type="email"
          icon={HiEnvelope}
          placeholder="e.g. ca.sharma@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <div>
          <Input
            label="Password"
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            icon={HiLockClosed}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-muted hover:text-heading transition-colors cursor-pointer rounded-md focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <HiEyeSlash size={18} /> : <HiEye size={18} />}
              </button>
            }
          />

          <div className="flex items-center justify-between mt-2.5">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-muted hover:text-heading transition-colors">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-border accent-primary cursor-pointer shrink-0"
              />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              onClick={() => {
                setForgotEmail(email);
                setDevelopmentResetUrl('');
                setForgotModalOpen(true);
              }}
              className="text-xs text-primary font-medium hover:underline bg-transparent border-0 p-0 cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={loading}
            className="shadow-sm hover:shadow-md transition-shadow"
          >
            <span>Sign In</span>
            {!loading && <HiArrowRight size={16} className="ml-1 inline" />}
          </Button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-border/80 text-center">
        <p className="text-sm text-muted">
          New to the CA community?{' '}
          <Link to="/signup" className="text-primary font-semibold hover:underline">
            Create an account
          </Link>
        </p>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {forgotModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-surface rounded-[24px] p-6 sm:p-7 border border-border shadow-xl relative"
            >
              <button
                type="button"
                onClick={() => setForgotModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-muted hover:text-heading hover:bg-background transition-colors"
                aria-label="Close"
              >
                <HiXMark size={20} />
              </button>

              <div className="text-left mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <HiShieldCheck size={22} />
                </div>
                <h3 className="font-serif text-xl font-bold text-heading">Reset Password</h3>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  Enter your registered email address and we'll send you instructions to reset your password.
                </p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                {developmentResetUrl ? (
                  <div className="rounded-2xl border border-success/30 bg-success/10 p-4">
                    <p className="text-sm font-semibold text-heading">Local reset link ready</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted">
                      SMTP is unavailable locally, so use this one-time link to finish testing.
                    </p>
                    <a
                      href={developmentResetUrl}
                      className="mt-3 inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-sm font-semibold text-white"
                    >
                      Choose a new password
                    </a>
                  </div>
                ) : (
                <Input
                  label="Registered Email"
                  type="email"
                  icon={HiEnvelope}
                  placeholder="you@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  autoFocus
                />
                )}

                <div className="flex gap-2.5 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setForgotModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  {!developmentResetUrl && (
                    <Button
                      type="submit"
                      className="flex-1"
                      loading={forgotLoading}
                    >
                      Send Instructions
                    </Button>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
