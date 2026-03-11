import { supabase } from '@/integrations/supabase/client';

export async function fetchConsultations(patientId?: string) {
  let query = supabase.from('consultations').select('*').order('created_at', { ascending: false });
  if (patientId) query = query.eq('patient_id', patientId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createConsultation(consultation: {
  patient_id: string;
  patient_name: string;
  risk_level: string;
  score: number;
  summary: string;
  free_text_description?: string;
  ai_analysis?: string;
  symptoms: string[];
  advice: string[];
  prevention_tips: string[];
  urgent_referral: boolean;
}) {
  const { data, error } = await supabase.from('consultations').insert(consultation).select().single();
  if (error) throw error;
  return data;
}

export async function updateConsultationStatus(id: string, status: string, doctorNotes?: string) {
  const updates: Record<string, unknown> = { status };
  if (doctorNotes !== undefined) updates.doctor_notes = doctorNotes;
  const { error } = await supabase.from('consultations').update(updates).eq('id', id);
  if (error) throw error;
}

export async function updateConsultationNotes(id: string, notes: string) {
  const { error } = await supabase.from('consultations').update({ doctor_notes: notes }).eq('id', id);
  if (error) throw error;
}

export async function fetchNotifications(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);
  if (error) throw error;
  return data || [];
}

export async function analyzeSymptoms(description: string, symptomAnswers: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('analyze-symptoms', {
    body: { description, symptomAnswers },
  });
  if (error) throw error;
  return data;
}

export async function fetchProfiles() {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchUserRoles() {
  const { data, error } = await supabase.from('user_roles').select('*');
  if (error) throw error;
  return data || [];
}
