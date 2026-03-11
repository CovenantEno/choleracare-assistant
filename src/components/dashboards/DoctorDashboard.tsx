import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, AlertTriangle, CheckCircle, Clock, Search } from 'lucide-react';
import StatCard from '@/components/StatCard';
import RiskBadge from '@/components/RiskBadge';
import StatusBadge from '@/components/StatusBadge';
import { sampleConsultations, Consultation } from '@/lib/sample-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function DoctorDashboard() {
  const [search, setSearch] = useState('');
  const [consultations, setConsultations] = useState(sampleConsultations);
  const [selected, setSelected] = useState<Consultation | null>(null);
  const [notes, setNotes] = useState('');

  const filtered = consultations.filter(c =>
    c.patientName.toLowerCase().includes(search.toLowerCase()) ||
    c.summary.toLowerCase().includes(search.toLowerCase())
  );

  const updateStatus = (id: string, status: Consultation['status']) => {
    setConsultations(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    toast.success(`Status updated to ${status}`);
  };

  const saveNotes = (id: string) => {
    setConsultations(prev => prev.map(c => c.id === id ? { ...c, doctorNotes: notes } : c));
    toast.success('Notes saved');
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-foreground">Doctor Dashboard</h1>
        <p className="text-muted-foreground mt-1">Review patient consultations and manage cases</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Patients" value={consultations.length} icon={Users} color="teal" />
        <StatCard title="High Risk" value={consultations.filter(c => c.riskLevel === 'high').length} icon={AlertTriangle} color="red" />
        <StatCard title="Pending Review" value={consultations.filter(c => c.status === 'pending').length} icon={Clock} color="orange" />
        <StatCard title="Resolved" value={consultations.filter(c => c.status === 'resolved').length} icon={CheckCircle} color="green" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Consultation list */}
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
            {filtered.map(c => (
              <button
                key={c.id}
                onClick={() => { setSelected(c); setNotes(c.doctorNotes || ''); }}
                className={`w-full text-left p-5 hover:bg-muted/50 transition-colors ${selected?.id === c.id ? 'bg-accent/50' : ''}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-sm">{c.patientName}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{c.summary}</p>
                    <p className="text-xs text-muted-foreground mt-1">{c.date}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <RiskBadge level={c.riskLevel} />
                    <StatusBadge status={c.status} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div className="bg-card rounded-xl border border-border shadow-card p-5">
          {selected ? (
            <div className="space-y-5">
              <div>
                <h3 className="font-display font-semibold text-foreground text-lg">{selected.patientName}</h3>
                <p className="text-sm text-muted-foreground">{selected.date}</p>
              </div>
              <div className="flex gap-2">
                <RiskBadge level={selected.riskLevel} />
                <StatusBadge status={selected.status} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Summary</p>
                <p className="text-sm text-muted-foreground">{selected.summary}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Symptoms</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.symptoms.map(s => (
                    <span key={s} className="px-2.5 py-1 bg-muted rounded-md text-xs text-muted-foreground">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Doctor Notes</p>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full min-h-[80px] p-3 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Add notes and recommendations..."
                />
                <Button size="sm" className="mt-2 bg-gradient-hero text-primary-foreground hover:opacity-90" onClick={() => saveNotes(selected.id)}>
                  Save Notes
                </Button>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Update Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['reviewed', 'pending', 'escalated', 'resolved'] as const).map(s => (
                    <Button key={s} variant="outline" size="sm" onClick={() => updateStatus(selected.id, s)} className="capitalize text-xs">
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
              Select a consultation to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
