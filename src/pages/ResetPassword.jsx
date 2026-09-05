import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// The password-reset flow no longer uses a click-through email link (see
// ForgotPassword.jsx -- it's now a single page that collects the emailed
// 6-digit code and the new password directly, via the
// request-password-reset / confirm-password-reset Edge Functions). This
// route is kept only so an old bookmark or a link in an already-delivered
// email doesn't dead-end; it just sends the visitor to the real flow.
export default function ResetPassword() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/forgot-password', { replace: true });
  }, [navigate]);

  return null;
}
