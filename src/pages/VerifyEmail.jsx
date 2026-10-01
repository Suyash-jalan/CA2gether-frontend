import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { HiCheckCircle, HiExclamationCircle } from 'react-icons/hi2';
import { authService } from '../services/authService';
import Button from '../components/ui/Button';
import AuthLayout from '../components/layout/AuthLayout';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const [state, setState] = useState({ loading: true, success: false, message: 'Verifying your email…' });

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setState({ loading: false, success: false, message: 'This verification link is incomplete.' });
      return;
    }
    authService.verifyEmail(token)
      .then(() => setState({ loading: false, success: true, message: 'Your email is verified. You can now sign in.' }))
      .catch((error) => setState({ loading: false, success: false, message: error.response?.data?.message || 'This verification link is invalid or expired.' }));
  }, [params]);

  const Icon = state.success ? HiCheckCircle : HiExclamationCircle;
  return (
    <AuthLayout title="Email verification" subtitle="Secure access to CA2gether" activeTab="">
      <div className="text-center">
        <Icon className={`mx-auto mb-4 ${state.success ? 'text-success' : 'text-primary'}`} size={52} />
        <p className="mb-6 text-sm leading-6 text-muted">{state.message}</p>
        {!state.loading && <Link to="/login"><Button fullWidth>Continue to sign in</Button></Link>}
      </div>
    </AuthLayout>
  );
}
