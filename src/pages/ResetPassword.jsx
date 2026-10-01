import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import AuthLayout from '../components/layout/AuthLayout';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const token = params.get('token');
    if (!token) return toast.error('This reset link is incomplete.');
    if (password !== confirmPassword) return toast.error('Passwords do not match.');
    if (password.length < 8 || !/\d/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return toast.error('Use 8+ characters with a number and special character.');
    }
    setLoading(true);
    try {
      await authService.resetPassword(token, { password });
      setComplete(true);
      toast.success('Password updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not reset your password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Choose a new password" subtitle="Use a strong password you do not reuse elsewhere" activeTab="">
      {complete ? (
        <div className="text-center"><p className="mb-6 text-sm text-muted">Your password has been changed successfully.</p><Link to="/login"><Button fullWidth>Sign in</Button></Link></div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Input label="New password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" required />
          <Input label="Confirm password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" required />
          <Button type="submit" fullWidth loading={loading}>Reset password</Button>
        </form>
      )}
    </AuthLayout>
  );
}
