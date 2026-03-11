import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { User, Mail, Phone, MapPin, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

export default function Profile() {
  const { user, isAuthenticated, loading, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [saving, setSaving] = useState(false);

  // Password
  const [newPassword, setNewPassword] = useState('');
  const [changingPw, setChangingPw] = useState(false);

  if (loading) return null;
  if (!isAuthenticated || !user) return <Navigate to="/login" />;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ name, phone, address });
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setChangingPw(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Password updated successfully');
      setNewPassword('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update password');
    }
    setChangingPw(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-display font-bold text-foreground">Profile Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account information</p>
        </motion.div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-card flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-gradient-hero flex items-center justify-center text-2xl font-bold text-primary-foreground">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="font-display font-semibold text-foreground text-lg">{user.name}</h2>
            <p className="text-sm text-muted-foreground capitalize flex items-center gap-1.5"><Shield className="w-4 h-4" /> {user.role}</p>
            <p className="text-xs text-muted-foreground mt-1">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-5">
          <div>
            <Label className="flex items-center gap-1.5"><User className="w-4 h-4" /> Full Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> Email</Label>
            <Input value={email} disabled className="mt-1.5 opacity-60" />
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
          </div>
          <div>
            <Label className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> Phone</Label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Your phone number" className="mt-1.5" />
          </div>
          <div>
            <Label className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Address</Label>
            <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Your address" className="mt-1.5" />
          </div>
          <Button className="bg-gradient-hero text-primary-foreground hover:opacity-90" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-4">
          <h3 className="font-display font-semibold text-foreground">Change Password</h3>
          <div>
            <Label>New Password</Label>
            <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" className="mt-1.5" />
          </div>
          <Button variant="outline" onClick={handleChangePassword} disabled={changingPw}>
            {changingPw ? 'Updating...' : 'Update Password'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
