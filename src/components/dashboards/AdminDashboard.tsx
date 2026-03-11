import { motion } from 'framer-motion';
import { Users, Stethoscope, Activity, AlertTriangle, BarChart3, Shield } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { adminStats, sampleConsultations } from '@/lib/sample-data';
import RiskBadge from '@/components/RiskBadge';
import StatusBadge from '@/components/StatusBadge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const weeklyData = [
  { day: 'Mon', consultations: 45, highRisk: 5 },
  { day: 'Tue', consultations: 52, highRisk: 8 },
  { day: 'Wed', consultations: 38, highRisk: 3 },
  { day: 'Thu', consultations: 65, highRisk: 12 },
  { day: 'Fri', consultations: 59, highRisk: 7 },
  { day: 'Sat', consultations: 30, highRisk: 4 },
  { day: 'Sun', consultations: 22, highRisk: 2 },
];

const riskDist = [
  { name: 'Low Risk', value: 65, color: 'hsl(152, 55%, 45%)' },
  { name: 'Moderate', value: 25, color: 'hsl(30, 90%, 55%)' },
  { name: 'High Risk', value: 10, color: 'hsl(0, 72%, 51%)' },
];

const activityLogs = [
  { time: '14:30', event: 'New high-risk case flagged', type: 'alert' },
  { time: '13:15', event: 'Dr. Chen reviewed 3 cases', type: 'review' },
  { time: '12:00', event: 'System health check passed', type: 'system' },
  { time: '10:45', event: 'New patient registered', type: 'user' },
  { time: '09:30', event: 'Daily report generated', type: 'system' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform overview and system monitoring</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Patients" value={adminStats.totalPatients.toLocaleString()} icon={Users} trend="+12% this month" trendUp color="teal" />
        <StatCard title="Total Doctors" value={adminStats.totalDoctors} icon={Stethoscope} color="blue" />
        <StatCard title="Consultations" value={adminStats.totalConsultations.toLocaleString()} icon={Activity} trend="+8% this week" trendUp color="green" />
        <StatCard title="Suspected Cases" value={adminStats.suspectedCases} icon={AlertTriangle} trend="-3% this week" trendUp={false} color="red" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-card">
          <h3 className="font-display font-semibold text-foreground mb-4">Weekly Consultations</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 20%, 90%)" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(210, 10%, 46%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(210, 10%, 46%)" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(200, 20%, 90%)', fontSize: '12px' }} />
              <Bar dataKey="consultations" fill="hsl(174, 62%, 38%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="highRisk" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-card">
          <h3 className="font-display font-semibold text-foreground mb-4">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={riskDist} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                {riskDist.map(entry => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(200, 20%, 90%)', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2">
            {riskDist.map(d => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                {d.name} ({d.value}%)
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent cases */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-card">
          <div className="p-5 border-b border-border">
            <h3 className="font-display font-semibold text-foreground">Recent Consultations</h3>
          </div>
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
                {sampleConsultations.map(c => (
                  <tr key={c.id} className="hover:bg-muted/50 transition-colors">
                    <td className="p-4 font-medium text-foreground">{c.patientName}</td>
                    <td className="p-4 text-muted-foreground">{c.date}</td>
                    <td className="p-4"><RiskBadge level={c.riskLevel} /></td>
                    <td className="p-4"><StatusBadge status={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity log */}
        <div className="bg-card rounded-xl border border-border shadow-card p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">Activity Log</h3>
          <div className="space-y-4">
            {activityLogs.map((log, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  log.type === 'alert' ? 'bg-medical-red' :
                  log.type === 'review' ? 'bg-primary' :
                  log.type === 'user' ? 'bg-medical-green' : 'bg-muted-foreground'
                }`} />
                <div>
                  <p className="text-sm text-foreground">{log.event}</p>
                  <p className="text-xs text-muted-foreground">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
