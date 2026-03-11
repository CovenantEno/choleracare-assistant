import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color?: 'teal' | 'blue' | 'green' | 'orange' | 'red';
}

const colorMap = {
  teal: 'bg-medical-teal-light text-medical-teal',
  blue: 'bg-accent text-medical-blue',
  green: 'bg-medical-green-light text-medical-green',
  orange: 'bg-medical-orange-light text-medical-orange',
  red: 'bg-medical-red-light text-medical-red',
};

export default function StatCard({ title, value, icon: Icon, trend, trendUp, color = 'teal' }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border p-6 shadow-card hover:shadow-card-hover transition-shadow duration-300"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-display font-bold text-foreground mt-1">{value}</p>
          {trend && (
            <p className={`text-xs mt-2 font-medium ${trendUp ? 'text-medical-green' : 'text-medical-red'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
}
