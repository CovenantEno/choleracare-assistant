import { Badge } from '@/components/ui/badge';

const riskStyles = {
  low: 'bg-medical-green-light text-medical-green border-medical-green/20',
  moderate: 'bg-medical-orange-light text-medical-orange border-medical-orange/20',
  high: 'bg-medical-red-light text-medical-red border-medical-red/20',
};

const riskLabels = { low: 'Low Risk', moderate: 'Moderate Risk', high: 'High Risk' };

export default function RiskBadge({ level }: { level: 'low' | 'moderate' | 'high' }) {
  return (
    <Badge variant="outline" className={`${riskStyles[level]} font-medium text-xs`}>
      {riskLabels[level]}
    </Badge>
  );
}
