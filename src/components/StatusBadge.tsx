import { Badge } from '@/components/ui/badge';

const statusStyles: Record<string, string> = {
  pending: 'bg-medical-orange-light text-medical-orange border-medical-orange/20',
  reviewed: 'bg-accent text-primary border-primary/20',
  escalated: 'bg-medical-red-light text-medical-red border-medical-red/20',
  resolved: 'bg-medical-green-light text-medical-green border-medical-green/20',
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={`${statusStyles[status] || ''} font-medium text-xs capitalize`}>
      {status}
    </Badge>
  );
}
