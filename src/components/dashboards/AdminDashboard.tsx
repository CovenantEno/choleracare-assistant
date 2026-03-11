import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Stethoscope, Activity, AlertTriangle } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { fetchConsultations, fetchProfiles, fetchUserRoles } from '@/lib/supabase-helpers';
import RiskBadge from '@/components/RiskBadge';
import StatusBadge from '@/components/StatusBadge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard() {
  const [consultations, setConsultations] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchConsultations().then(setConsultations).catch(console.error),
      fetchProfiles().then(setProfiles).catch(console.error),
      fetchUserRoles().then(setRoles).catch(console.error),
    ]).finally(() => setLoading(false));
  }, []);

  const doctorCount = roles.filter(r => r.role === 'doctor').length;
  const patientCount = roles.filter(r => r.role === 'patient').length;
  const highRiskCount = consultations.filter(c => c.risk_level === 'high').length;

  const riskDist = [
    { name: 'Low Risk', value: consultations.filter(c => c.risk_level === 'low').length, color: 'hsl(152, 55%, 45%)' },
    { name: 'Moderate', value: consultations.filter(c => c.risk_level === 'moderate').length, color: 'hsl(30, 90%, 55%)' },
    { name: 'High Risk', value: highRiskCount, color: 'hsl(0, 72%, 51%)' },
  ];

  // Group consultations by date for chart
  const dateMap: Record<string, { date: string; consultations: number; highRisk: number }> = {};
  consultations.forEach(c => {
    const d = new Date(c.created_at).toLocaleDateString('en', { weekday: 'short' });
    if (!dateMap[d]) dateMap[d] = { date: d, consultations: 0, highRisk: 0 };
    dateMap[d].consultations++;
    if (c.risk_level === 'high') dateMap[d].highRisk++;
  });
  const weeklyData = Object.values(dateMap).slice(0, 7);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform overview and system monitoring</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Patients" value={patientCount} icon={Users} color="teal" />
        <StatCard title="Total Doctors" value={doctorCount} icon={Stethoscope} color="blue" />
        <StatCard title="Consultations" value={consultations.length} icon={Activity} color="green" />
        <StatCard title="High Risk Cases" value={highRiskCount} icon={AlertTriangle} color="red" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6 shadow-card">
          <h3 className="font-display font-semibold text-foreground mb-4">Consultations by Day</h3>
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 20%, 90%)" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(210, 10%, 46%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(210, 10%, 46%)" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(200, 20%, 90%)', fontSize: '12px' }} />
                <Bar dataKey="consultations" fill="hsl(174, 62%, 38%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="highRisk" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">No data yet</div>
          )}
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-card">
          <h3 className="font-display font-semibold text-foreground mb-4">Risk Distribution</h3>
          {consultations.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={riskDist} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                    {riskDist.map(entry => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(200, 20%, 90%)', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-2">
                {riskDist.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />{d.name} ({d.value})
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Recent consultations table */}
      <div className="bg-card rounded-xl border border-border shadow-card">
        <div className="p-5 border-b border-border">
          <h3 className="font-display font-semibold text-foreground">Recent Consultations</h3>
        </div>
        {consultations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-muted-foreground font-medium">Patient</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Date</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Risk</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {consultations.slice(0, 10).map(c => (
                  <tr key={c.id} className="hover:bg-muted/50 transition-colors">
                    <td className="p-4 font-medium text-foreground">{c.patient_name}</td>
                    <td className="p-4 text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="p-4"><RiskBadge level={c.risk_level} /></td>
                    <td className="p-4"><StatusBadge status={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground text-sm">No consultations yet</div>
        )}
      </div>
    </div>
  );
}
