import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, AlertTriangle, CheckCircle, Clock, Search } from 'lucide-react';
import StatCard from '@/components/StatCard';
import RiskBadge from '@/components/RiskBadge';
import StatusBadge from '@/components/StatusBadge';
import { fetchConsultations, updateConsultationStatus, updateConsultationNotes } from '@/lib/supabase-helpers';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function DoctorDashboard() {
  const [search, setSearch] = useState('');
  const [consultations, setConsultations] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConsultations();
  }, []);

  async function loadConsultations() {
    try {
      const data = await fetchConsultations();
      setConsultations(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  const filtered = consultations.filter(c =>
    c.patient_name.toLowerCase().includes(search.toLowerCase()) ||
    c.summary.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateConsultationStatus(id, status);
      setConsultations(prev => prev.map(c => c.id === id ? { ...c, status } : c));
      if (selected?.id === id) setSelected((prev: any) => prev ? { ...prev, status } : prev);
      toast.success(`Status updated to ${status}`);
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const handleSaveNotes = async (id: string) => {
    try {
      await updateConsultationNotes(id, notes);
      setConsultations(prev => prev.map(c => c.id === id ? { ...c, doctor_notes: notes } : c));
      toast.success('Notes saved');
    } catch (e) {
      toast.error('Failed to save notes');
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-foreground">Doctor Dashboard</h1>
        <p className="text-muted-foreground mt-1">Review patient consultations and manage cases</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Patients" value={consultations.length} icon={Users} color="teal" />
        <StatCard title="High Risk" value={consultations.filter(c => c.risk_level === 'high').length} icon={AlertTriangle} color="red" />
        <StatCard title="Pending Review" value={consultations.filter(c => c.status === 'pending').length} icon={Clock} color="orange" />
        <StatCard title="Resolved" value={consultations.filter(c => c.status === 'resolved').length} icon={CheckCircle} color="green" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-card">
          <div className="p-5 border-b border-border">
            <div className="flex items-center gap-3">
              <h3 className="font-display font-semibold text-foreground">Patient Consultations</h3>
              <div className="flex-1" />
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search patients..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-60" />
              </div>
            </div>
          </div>
          <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground text-sm">Loading consultations...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">No consultations found</div>
            ) : (
              filtered.map(c => (
                <button key={c.id} onClick={() => { setSelected(c); setNotes(c.doctor_notes || ''); }}
                  className={`w-full text-left p-5 hover:bg-muted/50 transition-colors ${selected?.id === c.id ? 'bg-accent/50' : ''}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground text-sm">{c.patient_name}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{c.summary}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(c.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <RiskBadge level={c.risk_level} />
                      <StatusBadge status={c.status} />
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-card p-5">
          {selected ? (
            <div className="space-y-5">
              <div>
                <h3 className="font-display font-semibold text-foreground text-lg">{selected.patient_name}</h3>
                <p className="text-sm text-muted-foreground">{new Date(selected.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                <RiskBadge level={selected.risk_level} />
                <StatusBadge status={selected.status} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Summary</p>
                <p className="text-sm text-muted-foreground">{selected.summary}</p>
              </div>
              {selected.free_text_description && (
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Patient's Description</p>
                  <p className="text-sm text-muted-foreground bg-muted rounded-lg p-3">{selected.free_text_description}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Symptoms</p>
                <div className="flex flex-wrap gap-1.5">
                  {(selected.symptoms || []).map((s: string) => (
                    <span key={s} className="px-2.5 py-1 bg-muted rounded-md text-xs text-muted-foreground">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Doctor Notes</p>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  className="w-full min-h-[80px] p-3 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Add notes and recommendations..." />
                <Button size="sm" className="mt-2 bg-gradient-hero text-primary-foreground hover:opacity-90" onClick={() => handleSaveNotes(selected.id)}>
                  Save Notes
                </Button>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Update Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['reviewed', 'pending', 'escalated', 'resolved'] as const).map(s => (
                    <Button key={s} variant="outline" size="sm" onClick={() => handleUpdateStatus(selected.id, s)} className="capitalize text-xs">{s}</Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">Select a consultation to view details</div>
          )}
        </div>
      </div>
    </div>
  );
}
