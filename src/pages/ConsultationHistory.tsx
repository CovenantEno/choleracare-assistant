import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { sampleConsultations } from '@/lib/sample-data';
import RiskBadge from '@/components/RiskBadge';
import StatusBadge from '@/components/StatusBadge';
import { MessageSquare, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function ConsultationHistory() {
  const { isAuthenticated } = useAuth();
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
          {sampleConsultations.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-xl border border-border p-6 shadow-card hover:shadow-card-hover transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <RiskBadge level={c.riskLevel} />
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="text-sm text-foreground font-medium">{c.summary}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {c.date}</span>
                    <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {c.symptoms.length} symptoms</span>
                  </div>
                </div>
              </div>

              {/* Symptoms */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {c.symptoms.map(s => (
                  <span key={s} className="px-2.5 py-1 bg-muted rounded-md text-xs text-muted-foreground">{s}</span>
                ))}
              </div>

              {/* Doctor notes */}
              {c.doctorNotes && (
                <div className="mt-4 p-3 bg-accent/50 rounded-lg border border-border">
                  <p className="text-xs font-medium text-accent-foreground mb-1">Doctor's Notes</p>
                  <p className="text-sm text-muted-foreground">{c.doctorNotes}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
