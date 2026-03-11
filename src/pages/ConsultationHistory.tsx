import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { fetchConsultations } from '@/lib/supabase-helpers';
import RiskBadge from '@/components/RiskBadge';
import StatusBadge from '@/components/StatusBadge';
import { MessageSquare, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function ConsultationHistory() {
  const { user, isAuthenticated, loading } = useAuth();
  const [consultations, setConsultations] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchConsultations(user.id).then(setConsultations).catch(console.error).finally(() => setFetching(false));
  }, [user]);

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Consultation History</h1>
            <p className="text-muted-foreground mt-1">Review your past assessments and recommendations</p>
          </div>
          <Button className="bg-gradient-hero text-primary-foreground hover:opacity-90" asChild>
            <Link to="/consultation"><MessageSquare className="w-4 h-4 mr-2" /> New Consultation</Link>
          </Button>
        </div>

        <div className="space-y-4">
          {fetching ? (
            <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground text-sm">Loading...</div>
          ) : consultations.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <p className="text-muted-foreground text-sm">No consultations yet. Start your first assessment!</p>
              <Button className="mt-4 bg-gradient-hero text-primary-foreground hover:opacity-90" asChild>
                <Link to="/consultation">Start Assessment</Link>
              </Button>
            </div>
          ) : (
            consultations.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-card rounded-xl border border-border p-6 shadow-card hover:shadow-card-hover transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <RiskBadge level={c.risk_level} />
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="text-sm text-foreground font-medium">{c.summary}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(c.created_at).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {(c.symptoms || []).length} symptoms</span>
                    </div>
                  </div>
                </div>

                {c.free_text_description && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs font-medium text-foreground mb-1">Your Description</p>
                    <p className="text-sm text-muted-foreground">{c.free_text_description}</p>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {(c.symptoms || []).map((s: string) => (
                    <span key={s} className="px-2.5 py-1 bg-muted rounded-md text-xs text-muted-foreground">{s}</span>
                  ))}
                </div>

                {c.doctor_notes && (
                  <div className="mt-4 p-3 bg-accent/50 rounded-lg border border-border">
                    <p className="text-xs font-medium text-accent-foreground mb-1">Doctor's Notes</p>
                    <p className="text-sm text-muted-foreground">{c.doctor_notes}</p>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
