import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { MessageSquare, History, Droplets, Shield, Bell, Activity, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatCard from '@/components/StatCard';
import { fetchConsultations, fetchNotifications } from '@/lib/supabase-helpers';
import RiskBadge from '@/components/RiskBadge';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    fetchConsultations(user.id).then(setConsultations).catch(console.error);
    fetchNotifications(user.id).then(setNotifications).catch(console.error);
  }, [user]);

  const lastRisk = consultations[0]?.risk_level || 'N/A';
  const daysSinceCheck = consultations.length > 0
    ? Math.floor((Date.now() - new Date(consultations[0].created_at).getTime()) / 86400000)
    : 0;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-hero rounded-2xl p-8 text-primary-foreground">
        <h1 className="text-2xl sm:text-3xl font-display font-bold">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="mt-2 opacity-80 max-w-lg">Monitor your health, start new consultations, and stay protected with our AI-powered cholera prevention tools.</p>
        <Button className="mt-6 bg-card text-foreground hover:bg-card/90" asChild>
          <Link to="/consultation"><MessageSquare className="w-4 h-4 mr-2" /> Start New Consultation</Link>
        </Button>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Consultations" value={consultations.length} icon={Activity} color="teal" />
        <StatCard title="Last Risk Level" value={lastRisk === 'N/A' ? 'N/A' : lastRisk.charAt(0).toUpperCase() + lastRisk.slice(1)} icon={Shield} color={lastRisk === 'high' ? 'red' : lastRisk === 'moderate' ? 'orange' : 'green'} />
        <StatCard title="Days Since Check" value={consultations.length > 0 ? daysSinceCheck : '-'} icon={Heart} color="green" />
        <StatCard title="Prevention Score" value={consultations.length > 0 ? '85%' : '-'} icon={Droplets} color="blue" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <Link to="/consultation" className="bg-card rounded-xl border border-border p-5 shadow-card hover:shadow-card-hover transition-all group">
              <MessageSquare className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-display font-semibold text-foreground">New Consultation</h3>
              <p className="text-sm text-muted-foreground mt-1">Start an AI-guided symptom assessment</p>
            </Link>
            <Link to="/history" className="bg-card rounded-xl border border-border p-5 shadow-card hover:shadow-card-hover transition-all group">
              <History className="w-8 h-8 text-medical-blue mb-3" />
              <h3 className="font-display font-semibold text-foreground">View History</h3>
              <p className="text-sm text-muted-foreground mt-1">Review past consultations and results</p>
            </Link>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-card">
            <div className="p-5 border-b border-border">
              <h3 className="font-display font-semibold text-foreground">Recent Consultations</h3>
            </div>
            <div className="divide-y divide-border">
              {consultations.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">No consultations yet. Start your first assessment!</div>
              ) : (
                consultations.slice(0, 3).map(c => (
                  <div key={c.id} className="p-5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{c.summary}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(c.created_at).toLocaleDateString()}</p>
                    </div>
                    <RiskBadge level={c.risk_level} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-5 shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <Droplets className="w-5 h-5 text-medical-cyan" />
              <h3 className="font-display font-semibold text-foreground text-sm">Hydration Reminder</h3>
            </div>
            <p className="text-sm text-muted-foreground">Drink at least 8 glasses of clean, safe water daily. If experiencing any diarrhea, increase intake and use ORS.</p>
          </div>

          <div className="bg-card rounded-xl border border-border p-5 shadow-card">
            <h3 className="font-display font-semibold text-foreground text-sm mb-3">Prevention Tips</h3>
            <ul className="space-y-2.5">
              {['Boil or treat drinking water', 'Wash hands before eating', 'Avoid raw street food', 'Use sanitary facilities'].map(tip => (
                <li key={tip} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 text-medical-green mt-0.5 shrink-0" />{tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-card rounded-xl border border-border p-5 shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-5 h-5 text-medical-orange" />
              <h3 className="font-display font-semibold text-foreground text-sm">Notifications</h3>
            </div>
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className="flex items-start gap-2">
                    {!n.read && <span className="w-2 h-2 bg-primary rounded-full mt-1.5 shrink-0" />}
                    <div>
                      <p className="text-sm text-foreground">{n.message}</p>
                      <p className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
