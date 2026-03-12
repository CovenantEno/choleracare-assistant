import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/context/AuthContext';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('patient');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const result = await signup(name, email, password, role);

      if (result.needsEmailConfirmation) {
        toast.success('Account created! Please verify your email before signing in.');
        navigate('/login');
      } else {
        toast.success('Account created successfully!');
        navigate('/dashboard');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const roles: { value: UserRole; label: string; desc: string }[] = [
    { value: 'patient', label: 'Patient', desc: 'Get symptom assessment and health guidance' },
    { value: 'doctor', label: 'Doctor', desc: 'Review and manage patient consultations' },
    { value: 'admin', label: 'Admin', desc: 'Manage platform and monitor analytics' },
  ];

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero items-center justify-center p-12">
        <div className="max-w-md text-primary-foreground">
          <Shield className="w-16 h-16 mb-8 opacity-90" />
          <h1 className="text-4xl font-display font-bold leading-tight">Join CholeraCare AI</h1>
          <p className="mt-4 text-lg opacity-80 leading-relaxed">Create your account to access intelligent cholera prevention tools and connect with healthcare professionals.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">CholeraCare AI</span>
          </Link>

          <h2 className="text-2xl font-display font-bold text-foreground">Create your account</h2>
          <p className="mt-2 text-sm text-muted-foreground">Start your health journey in minutes</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" className="mt-1.5" required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1.5" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1.5">
                <Input id="password" type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" required />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label>I am a</Label>
              <div className="grid grid-cols-3 gap-2 mt-1.5">
                {roles.map(r => (
                  <button key={r.value} type="button" onClick={() => setRole(r.value)}
                    className={`p-3 rounded-lg border text-center transition-all text-sm ${
                      role === r.value ? 'border-primary bg-accent text-accent-foreground' : 'border-border text-muted-foreground hover:border-primary/50'
                    }`}>
                    <p className="font-medium">{r.label}</p>
                  </button>
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full bg-gradient-hero text-primary-foreground hover:opacity-90 h-11" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
