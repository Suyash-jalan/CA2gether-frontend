import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiUser,
  HiEnvelope,
  HiLockClosed,
  HiEye,
  HiEyeSlash,
  HiCheck,
  HiArrowRight,
  HiInformationCircle,
  HiAcademicCap,
  HiIdentification,
} from 'react-icons/hi2';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import BirthDateInput from '../components/ui/BirthDateInput';
import AuthLayout from '../components/layout/AuthLayout';
import GoogleSignInButton from '../components/auth/GoogleSignInButton';

const CA_STATUSES = [
  { value: 'CA Foundation', label: 'Foundation Student' },
  { value: 'CA Inter', label: 'Intermediate Student' },
  { value: 'CA Final', label: 'CA Final Student' },
  { value: 'Articleship', label: 'Article / Articleship' },
  { value: 'Qualified CA', label: 'Qualified CA' },
];

export default function Signup() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    dob: '',
    gender: '',
    caStatus: '',
    icaiRegNumber: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleCredential, setGoogleCredential] = useState(() => sessionStorage.getItem('googleSignupCredential') || '');

  const { signup, googleLogin, googleSignup } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!googleCredential) return;
    try {
      const profile = JSON.parse(sessionStorage.getItem('googleSignupProfile') || '{}');
      setForm((current) => ({ ...current, name: profile.name || current.name, email: profile.email || current.email }));
    } catch {
      sessionStorage.removeItem('googleSignupProfile');
    }
  }, [googleCredential]);

  const set = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleBlur = (field) => () => {
    setTouched({ ...touched, [field]: true });
  };

  // Real-time password criteria
  const passwordCriteria = useMemo(() => {
    const p = form.password;
    return {
      hasLength: p.length >= 8,
      hasNumber: /\d/.test(p),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(p),
    };
  }, [form.password]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!form.caStatus) errs.caStatus = 'Please select your current CA status';
    if (!form.gender) errs.gender = 'Please select your gender';
    if (!form.icaiRegNumber.trim()) {
      errs.icaiRegNumber = 'CA registration number is required';
    } else if (!/^[A-Za-z0-9/ -]{4,30}$/.test(form.icaiRegNumber.trim())) {
      errs.icaiRegNumber = 'Enter a valid CA registration or membership number';
    }

    if (!googleCredential) {
      if (form.password.length < 8) {
        errs.password = 'Must be at least 8 characters';
      } else if (!/\d/.test(form.password)) {
        errs.password = 'Must contain at least one number';
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) {
        errs.password = 'Must contain a special character (e.g. @, #, $, !)';
      }

      if (form.password !== form.confirmPassword) {
        errs.confirmPassword = 'Passwords do not match';
      }
    }

    // 18+ check
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.dob)) {
      errs.dob = 'Date of birth is required';
    } else {
      const dob = new Date(form.dob);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
      if (age < 18) errs.dob = 'You must be at least 18 years old to join';
    }

    if (!agreed) {
      errs.agreed = 'Please accept the Terms of Service and Privacy Policy to continue';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleGoogleCredential = async (credential) => {
    setLoading(true);
    try {
      const data = await googleLogin(credential, true);
      if (!data.needsRegistration) {
        toast.success('Welcome back to CA2gether!', { duration: 1500, className: 'toast-success' });
        navigate('/discover');
        return;
      }
      sessionStorage.setItem('googleSignupCredential', credential);
      sessionStorage.setItem('googleSignupProfile', JSON.stringify(data.profile || {}));
      setGoogleCredential(credential);
      setForm((current) => ({ ...current, name: data.profile?.name || '', email: data.profile?.email || '' }));
      toast.success('Google email verified. Complete your CA profile.', { className: 'toast-success' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google sign-in failed. Please try again.', { className: 'toast-error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      if (!agreed) {
        toast.error('Please accept the Terms and Privacy Policy', { className: 'toast-error' });
      } else {
        toast.error('Please correct the highlighted errors', { className: 'toast-error' });
      }
      return;
    }

    setLoading(true);
    try {
      const registration = {
        name: form.name.trim(),
        dateOfBirth: form.dob,
        gender: form.gender,
        caStatus: form.caStatus,
        icaiRegNumber: form.icaiRegNumber.trim().toUpperCase(),
      };
      if (googleCredential) {
        await googleSignup({ ...registration, credential: googleCredential });
        sessionStorage.removeItem('googleSignupCredential');
        sessionStorage.removeItem('googleSignupProfile');
      } else {
        await signup({ ...registration, email: form.email.trim(), password: form.password });
      }
      toast.success('Account created successfully! Welcome to CA2gether.', { className: 'toast-success' });
      navigate('/profile-setup');
    } catch (err) {
      const msg = err.response?.data?.message || 'Signup failed. Please try again.';
      toast.error(msg, { className: 'toast-error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join India's verified network for Chartered Accountants & Students."
      activeTab="signup"
      maxWidth="max-w-[580px]"
    >
      {!googleCredential && (
        <>
          <div className="mb-5 flex justify-center">
            <GoogleSignInButton onCredential={handleGoogleCredential} disabled={loading} text="signup_with" />
          </div>
          {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
            <div className="mb-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
              <span className="h-px flex-1 bg-border" />
              <span>or register with email</span>
              <span className="h-px flex-1 bg-border" />
            </div>
          )}
        </>
      )}
      {googleCredential && (
        <div className="mb-5 rounded-2xl border border-[var(--color-success)]/30 bg-[var(--color-success)]/10 px-4 py-3 text-sm text-heading">
          <span className="font-semibold">Google email verified:</span> {form.email}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Name and Email 2-column on larger screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            id="signup-name"
            icon={HiUser}
            placeholder="e.g. Suyash Agrawal"
            value={form.name}
            onChange={set('name')}
            onBlur={handleBlur('name')}
            error={touched.name ? errors.name : ''}
            required
            autoComplete="name"
          />

          <Input
            label="Email Address"
            id="signup-email"
            type="email"
            icon={HiEnvelope}
            placeholder="ca.name@example.com"
            value={form.email}
            onChange={set('email')}
            onBlur={handleBlur('email')}
            error={touched.email ? errors.email : ''}
            required
            autoComplete="email"
            disabled={Boolean(googleCredential)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><BirthDateInput value={form.dob} onChange={set('dob')} />
            {errors.dob && <p role="alert" className="mt-1 text-xs text-error">{errors.dob}</p>}
          </div>

          <div className="flex flex-col">
            <label htmlFor="signup-gender" className="mb-1.5 block text-xs font-semibold text-heading/85">
              Gender
            </label>
            <div className="relative flex items-center">
              <HiUser size={18} className="pointer-events-none absolute left-3.5 z-10 text-muted" />
              <select
                id="signup-gender"
                value={form.gender}
                onChange={set('gender')}
                onBlur={handleBlur('gender')}
                className={`w-full bg-white pl-10 pr-10 ${touched.gender && errors.gender ? '!border-[var(--color-error)]' : ''}`}
                required
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
            {touched.gender && errors.gender && <p className="mt-1.5 text-xs font-medium text-[var(--color-error)]">{errors.gender}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col">
            <label htmlFor="signup-ca-status" className="mb-1.5 block text-xs font-semibold text-heading/85">
              Current CA Status
            </label>
            <div className="relative flex items-center">
              <HiAcademicCap size={18} className="pointer-events-none absolute left-3.5 z-10 text-muted" />
              <select
                id="signup-ca-status"
                value={form.caStatus}
                onChange={set('caStatus')}
                onBlur={handleBlur('caStatus')}
                className={`w-full bg-white pl-10 pr-10 ${touched.caStatus && errors.caStatus ? '!border-[var(--color-error)]' : ''}`}
                required
              >
                <option value="">Select current stage</option>
                {CA_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
            {touched.caStatus && errors.caStatus && <p className="mt-1.5 text-xs font-medium text-[var(--color-error)]">{errors.caStatus}</p>}
          </div>

          <Input
            label="CA Registration Number"
            id="signup-icai-registration"
            icon={HiIdentification}
            placeholder="e.g. SRO0123456"
            value={form.icaiRegNumber}
            onChange={set('icaiRegNumber')}
            onBlur={handleBlur('icaiRegNumber')}
            error={touched.icaiRegNumber ? errors.icaiRegNumber : ''}
            helperText="Stored securely and never shown publicly"
            maxLength={30}
            autoComplete="off"
            required
          />
        </div>

        {!googleCredential && <>
        {/* Password & Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Password"
            id="signup-password"
            type={showPassword ? 'text' : 'password'}
            icon={HiLockClosed}
            placeholder="Create password"
            value={form.password}
            onChange={set('password')}
            onBlur={handleBlur('password')}
            error={touched.password ? errors.password : ''}
            required
            autoComplete="new-password"
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

          <Input
            label="Confirm Password"
            id="signup-confirm-password"
            type={showConfirmPassword ? 'text' : 'password'}
            icon={HiLockClosed}
            placeholder="Re-enter password"
            value={form.confirmPassword}
            onChange={set('confirmPassword')}
            onBlur={handleBlur('confirmPassword')}
            error={touched.confirmPassword ? errors.confirmPassword : ''}
            required
            autoComplete="new-password"
            rightElement={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="p-1 text-muted hover:text-heading transition-colors cursor-pointer rounded-md focus:outline-none"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <HiEyeSlash size={18} /> : <HiEye size={18} />}
              </button>
            }
          />
        </div>

        {/* Live Password Criteria Pills */}
        <div className="p-3 rounded-xl bg-background border border-border/70 text-xs">
          <p className="font-semibold text-heading/70 mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
            <HiInformationCircle size={14} className="text-muted" />
            Password Requirements
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div
              className={`flex items-center gap-1.5 transition-colors ${
                passwordCriteria.hasLength ? 'text-[var(--color-success)] font-semibold' : 'text-muted'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                  passwordCriteria.hasLength
                    ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]'
                    : 'bg-border text-muted'
                }`}
              >
                <HiCheck size={12} />
              </div>
              <span>8+ characters</span>
            </div>

            <div
              className={`flex items-center gap-1.5 transition-colors ${
                passwordCriteria.hasNumber ? 'text-[var(--color-success)] font-semibold' : 'text-muted'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                  passwordCriteria.hasNumber
                    ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]'
                    : 'bg-border text-muted'
                }`}
              >
                <HiCheck size={12} />
              </div>
              <span>At least 1 number</span>
            </div>

            <div
              className={`flex items-center gap-1.5 transition-colors ${
                passwordCriteria.hasSpecial ? 'text-[var(--color-success)] font-semibold' : 'text-muted'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                  passwordCriteria.hasSpecial
                    ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]'
                    : 'bg-border text-muted'
                }`}
              >
                <HiCheck size={12} />
              </div>
              <span>1 special symbol</span>
            </div>
          </div>
        </div>
        </>}

        {/* Terms agreement checkbox */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer select-none group">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => {
                setAgreed(e.target.checked);
                if (errors.agreed) setErrors({ ...errors, agreed: '' });
              }}
              className="mt-0.5 w-4 h-4 rounded border-border accent-primary cursor-pointer shrink-0"
            />
            <span className="text-xs text-muted leading-relaxed">
              I agree to the{' '}
              <Link
                to="/terms"
                className="text-primary font-medium hover:underline"
                target="_blank"
                onClick={(e) => e.stopPropagation()}
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                to="/privacy"
                className="text-primary font-medium hover:underline"
                target="_blank"
                onClick={(e) => e.stopPropagation()}
              >
                Privacy Policy
              </Link>
              . I confirm that I am a CA student or qualified CA.
            </span>
          </label>
          {errors.agreed && (
            <p className="text-xs text-[var(--color-error)] font-medium mt-1 pl-6.5">
              {errors.agreed}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={loading}
            className="shadow-sm hover:shadow-md transition-shadow"
          >
            <span>Create Account</span>
            {!loading && <HiArrowRight size={16} className="ml-1 inline" />}
          </Button>
        </div>
      </form>

      <div className="mt-6 pt-5 border-t border-border/80 text-center">
        <p className="text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
