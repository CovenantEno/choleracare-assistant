export interface Consultation {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  riskLevel: 'low' | 'moderate' | 'high';
  status: 'pending' | 'reviewed' | 'escalated' | 'resolved';
  summary: string;
  doctorNotes?: string;
  symptoms: string[];
}

export const sampleConsultations: Consultation[] = [
  {
    id: 'c1', patientId: 'p1', patientName: 'Sarah Johnson', date: '2026-03-10',
    riskLevel: 'moderate', status: 'pending',
    summary: 'Moderate risk — watery diarrhea and vomiting for 2 days',
    symptoms: ['Diarrhea', 'Watery stool', 'Vomiting', 'Weakness'],
  },
  {
    id: 'c2', patientId: 'p2', patientName: 'James Mwangi', date: '2026-03-09',
    riskLevel: 'high', status: 'escalated',
    summary: 'High risk — severe dehydration, contaminated water exposure',
    symptoms: ['Severe diarrhea', 'Dehydration', 'Contaminated water', 'Vomiting'],
    doctorNotes: 'Referred to emergency care. IV fluids recommended.',
  },
  {
    id: 'c3', patientId: 'p3', patientName: 'Amina Osei', date: '2026-03-08',
    riskLevel: 'low', status: 'resolved',
    summary: 'Low risk — mild stomach discomfort, no red flags',
    symptoms: ['Mild diarrhea'],
    doctorNotes: 'No cholera indicators. Advised hydration and follow-up if symptoms persist.',
  },
  {
    id: 'c4', patientId: 'p4', patientName: 'David Park', date: '2026-03-07',
    riskLevel: 'high', status: 'reviewed',
    summary: 'High risk — profuse watery diarrhea, severe weakness',
    symptoms: ['Profuse diarrhea', 'Weakness', 'Vomiting', 'Dehydration'],
    doctorNotes: 'Patient admitted. Stool culture pending.',
  },
  {
    id: 'c5', patientId: 'p5', patientName: 'Fatima Al-Rashid', date: '2026-03-06',
    riskLevel: 'moderate', status: 'resolved',
    summary: 'Moderate risk — diarrhea with fever, possible contaminated food',
    symptoms: ['Diarrhea', 'Fever', 'Nausea'],
    doctorNotes: 'Treated with ORS. Symptoms resolved after 48 hours.',
  },
];

export const sampleNotifications = [
  { id: '1', message: 'Your consultation result is ready', time: '2 hours ago', read: false },
  { id: '2', message: 'Hydration reminder: Drink clean water regularly', time: '5 hours ago', read: false },
  { id: '3', message: 'Dr. Chen reviewed your case', time: '1 day ago', read: true },
];

export const adminStats = {
  totalPatients: 1247,
  totalDoctors: 38,
  totalConsultations: 3891,
  suspectedCases: 156,
  resolvedCases: 3420,
  activeAlerts: 12,
};
