export interface SymptomAnswers {
  diarrhea?: boolean;
  wateryDiarrhea?: boolean;
  vomiting?: boolean;
  weakness?: boolean;
  contaminatedWater?: boolean;
  fever?: boolean;
  durationDays?: number;
  severeDehydration?: boolean;
}

export type RiskLevel = 'low' | 'moderate' | 'high';

export interface AssessmentResult {
  riskLevel: RiskLevel;
  score: number;
  summary: string;
  advice: string[];
  preventionTips: string[];
  urgentReferral: boolean;
}

export const SYMPTOM_QUESTIONS = [
  { key: 'diarrhea', question: 'Are you currently experiencing diarrhea?', emoji: '🔍' },
  { key: 'wateryDiarrhea', question: 'Is the diarrhea watery (rice-water appearance)?', emoji: '💧' },
  { key: 'vomiting', question: 'Have you been vomiting?', emoji: '🤢' },
  { key: 'weakness', question: 'Do you feel weak, dizzy, or unusually tired?', emoji: '😰' },
  { key: 'severeDehydration', question: 'Are you experiencing signs of severe dehydration (dry mouth, sunken eyes, very dark urine, rapid heartbeat)?', emoji: '⚠️' },
  { key: 'contaminatedWater', question: 'Have you recently consumed water from an untreated or potentially contaminated source?', emoji: '🚰' },
  { key: 'fever', question: 'Do you have a fever?', emoji: '🌡️' },
  { key: 'durationDays', question: 'How many days have your symptoms lasted?', emoji: '📅', type: 'duration' as const },
];

export function assessCholera(answers: SymptomAnswers): AssessmentResult {
  let score = 0;
  if (answers.diarrhea) score += 15;
  if (answers.wateryDiarrhea) score += 25;
  if (answers.vomiting) score += 15;
  if (answers.weakness) score += 10;
  if (answers.severeDehydration) score += 20;
  if (answers.contaminatedWater) score += 10;
  if (answers.fever) score += 5;
  if (answers.durationDays && answers.durationDays >= 2) score += 5;
  if (answers.durationDays && answers.durationDays >= 4) score += 5;

  let riskLevel: RiskLevel = 'low';
  if (score >= 60) riskLevel = 'high';
  else if (score >= 30) riskLevel = 'moderate';

  const urgentReferral = riskLevel === 'high' || !!answers.severeDehydration;

  const advice: string[] = [];
  const preventionTips = [
    'Drink only safe, treated, or boiled water',
    'Wash hands thoroughly with soap and clean water',
    'Avoid raw or undercooked food from street vendors',
    'Use proper sanitation facilities',
    'Use Oral Rehydration Salts (ORS) if experiencing any dehydration',
  ];

  if (riskLevel === 'high') {
    advice.push('⚠️ URGENT: Seek immediate medical attention at the nearest hospital or clinic');
    advice.push('Begin oral rehydration immediately with ORS solution');
    advice.push('Do not wait — cholera can become life-threatening within hours');
    advice.push('Avoid solid foods until vomiting subsides');
    advice.push('Keep track of fluid intake and output');
  } else if (riskLevel === 'moderate') {
    advice.push('Visit a healthcare provider within 24 hours');
    advice.push('Start oral rehydration with ORS or a homemade solution (1L water + 6 tsp sugar + ½ tsp salt)');
    advice.push('Rest and avoid strenuous activity');
    advice.push('Monitor symptoms closely — seek emergency care if they worsen');
    advice.push('Avoid dairy and high-fiber foods');
  } else {
    advice.push('Continue monitoring your symptoms');
    advice.push('Stay well hydrated with clean water');
    advice.push('If symptoms develop or worsen, consult a healthcare provider');
    advice.push('Practice good hygiene and food safety');
  }

  const summaries: Record<RiskLevel, string> = {
    low: 'Based on your responses, your cholera risk appears to be LOW. Your symptoms do not strongly indicate cholera at this time, but please continue to monitor your health.',
    moderate: 'Based on your responses, you show MODERATE risk indicators for cholera. Some of your symptoms are consistent with early cholera. We recommend consulting a healthcare professional soon.',
    high: 'Based on your responses, you show HIGH risk indicators for cholera. Your symptoms strongly suggest possible cholera infection. Immediate medical attention is critical.',
  };

  return { riskLevel, score, summary: summaries[riskLevel], advice, preventionTips, urgentReferral };
}
