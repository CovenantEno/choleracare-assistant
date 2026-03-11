import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    toast.success('Password reset link sent (demo)');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg text-foreground">CholeraCare AI</span>
        </Link>

        <div className="bg-card rounded-xl border border-border p-8 shadow-card">
          <h2 className="text-2xl font-display font-bold text-foreground text-center">Reset Password</h2>
          <p className="mt-2 text-sm text-muted-foreground text-center">
            {sent ? 'Check your email for reset instructions' : 'Enter your email to receive a reset link'}
          </p>

          {!sent ? (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1.5" required />
              </div>
              <Button type="submit" className="w-full bg-gradient-hero text-primary-foreground hover:opacity-90">Send Reset Link</Button>
            </form>
          ) : (
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground mb-4">A reset link has been sent to <span className="font-medium text-foreground">{email}</span></p>
              <Button variant="outline" onClick={() => setSent(false)}>Try another email</Button>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Back to <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
