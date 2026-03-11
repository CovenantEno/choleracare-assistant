import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, AlertTriangle, CheckCircle, Shield, ArrowLeft, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { SYMPTOM_QUESTIONS, assessCholera, SymptomAnswers, AssessmentResult } from '@/lib/cholera-assessment';
import { createConsultation, analyzeSymptoms } from '@/lib/supabase-helpers';
import RiskBadge from '@/components/RiskBadge';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

type Phase = 'welcome' | 'describe' | 'questions' | 'analyzing' | 'done';

export default function Consultation() {
  const { user, isAuthenticated, loading } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [phase, setPhase] = useState<Phase>('welcome');
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<SymptomAnswers>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [freeText, setFreeText] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [saving, setSaving] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    addAssistantMessage(
      `Hello ${user?.name?.split(' ')[0] || 'there'}! 👋\n\nI'm your CholeraCare AI assistant. I'll help you assess your symptoms for potential cholera indicators.\n\nYou can **describe how you're feeling** in your own words, and our AI will analyze your symptoms using natural language processing. Then I'll ask some follow-up questions.\n\n**Important:** This is a screening tool, not a medical diagnosis.\n\nClick **"Start Assessment"** to begin.`
    );
  }, []);

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" />;

  function addAssistantMessage(content: string) {
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content, timestamp: new Date() }]);
  }

  function addUserMessage(content: string) {
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'user', content, timestamp: new Date() }]);
  }

  function startAssessment() {
    addUserMessage('Start Assessment');
    setPhase('describe');
    setTimeout(() => addAssistantMessage(
      `📝 **Describe Your Symptoms**\n\nPlease describe how you're feeling in your own words. Include details like:\n• What symptoms do you have?\n• How long have you been feeling this way?\n• How severe are your symptoms?\n• Any recent food or water exposure?\n\nType your description below and click send.`
    ), 500);
  }

  async function handleFreeTextSubmit() {
    if (!freeText.trim()) return;
    addUserMessage(freeText);
    setPhase('questions');
    
    setTimeout(() => {
      addAssistantMessage(`Thank you for describing your symptoms. Now I'll ask you some specific follow-up questions to complete the assessment.\n\n${SYMPTOM_QUESTIONS[0].emoji} **Question 1 of ${SYMPTOM_QUESTIONS.length}**\n\n${SYMPTOM_QUESTIONS[0].question}`);
    }, 600);
  }

  function handleAnswer(answer: boolean | number) {
    const q = SYMPTOM_QUESTIONS[currentStep];
    const key = q.key as keyof SymptomAnswers;

    if (q.type === 'duration') {
      addUserMessage(`${answer} days`);
      setAnswers(prev => ({ ...prev, [key]: answer as number }));
    } else {
      addUserMessage(answer ? 'Yes' : 'No');
      setAnswers(prev => ({ ...prev, [key]: answer as boolean }));
    }

    const nextStep = currentStep + 1;
    if (nextStep < SYMPTOM_QUESTIONS.length) {
      setCurrentStep(nextStep);
      const nextQ = SYMPTOM_QUESTIONS[nextStep];
      setTimeout(() => addAssistantMessage(`${nextQ.emoji} **Question ${nextStep + 1} of ${SYMPTOM_QUESTIONS.length}**\n\n${nextQ.question}`), 600);
    } else {
      finishAssessment({ ...answers, [key]: q.type === 'duration' ? (answer as number) : (answer as boolean) });
    }
  }

  async function finishAssessment(finalAnswers: SymptomAnswers) {
    setPhase('analyzing');
    addAssistantMessage('⏳ Analyzing your responses with AI...');

    // Rule-based assessment
    const ruleResult = assessCholera(finalAnswers);
    setResult(ruleResult);

    // AI NLP analysis of free text
    let aiResult = null;
    try {
      aiResult = await analyzeSymptoms(freeText, finalAnswers);
      setAiAnalysis(aiResult);
    } catch (e) {
      console.error('AI analysis error:', e);
      // Continue with rule-based result
    }

    // Merge: use AI result if available, fallback to rule-based
    const finalResult = aiResult ? {
      ...ruleResult,
      riskLevel: aiResult.risk_level || ruleResult.riskLevel,
      score: aiResult.score ?? ruleResult.score,
      summary: aiResult.summary || ruleResult.summary,
      advice: aiResult.advice?.length ? aiResult.advice : ruleResult.advice,
      preventionTips: aiResult.prevention_tips?.length ? aiResult.prevention_tips : ruleResult.preventionTips,
      urgentReferral: aiResult.urgent_referral ?? ruleResult.urgentReferral,
    } : ruleResult;

    setResult(finalResult);

    // Save to database
    if (user) {
      setSaving(true);
      try {
        const detectedSymptoms = aiResult?.detected_symptoms || 
          Object.entries(finalAnswers)
            .filter(([, v]) => v === true)
            .map(([k]) => k.replace(/([A-Z])/g, ' $1').trim());

        await createConsultation({
          patient_id: user.id,
          patient_name: user.name,
          risk_level: finalResult.riskLevel,
          score: finalResult.score,
          summary: finalResult.summary,
          free_text_description: freeText || undefined,
          ai_analysis: aiResult ? JSON.stringify(aiResult) : undefined,
          symptoms: detectedSymptoms,
          advice: finalResult.advice,
          prevention_tips: finalResult.preventionTips,
          urgent_referral: finalResult.urgentReferral,
        });
        toast.success('Consultation saved to your records');
      } catch (e) {
        console.error('Save error:', e);
        toast.error('Could not save consultation');
      }
      setSaving(false);
    }

    setPhase('done');
    setTimeout(() => addAssistantMessage(`✅ **Assessment Complete**\n\nI've analyzed your symptoms. Please review your results below.`), 500);
  }

  function handleSend() {
    if (!inputValue.trim()) return;
    if (phase === 'welcome') {
      startAssessment();
    } else if (phase === 'describe') {
      setFreeText(inputValue);
      setInputValue('');
      // Trigger the free text submit
      addUserMessage(inputValue);
      setPhase('questions');
      const text = inputValue;
      setTimeout(() => {
        setFreeText(text);
        addAssistantMessage(`Thank you for describing your symptoms. Now I'll ask you some specific follow-up questions.\n\n${SYMPTOM_QUESTIONS[0].emoji} **Question 1 of ${SYMPTOM_QUESTIONS.length}**\n\n${SYMPTOM_QUESTIONS[0].question}`);
      }, 600);
      return;
    } else {
      addUserMessage(inputValue);
      setTimeout(() => addAssistantMessage("Please use the buttons above to answer the current question."), 500);
    }
    setInputValue('');
  }

  const progress = phase === 'done' ? 100 : phase === 'questions' ? ((currentStep) / SYMPTOM_QUESTIONS.length) * 100 : phase === 'describe' ? 10 : 0;
  const currentQ = phase === 'questions' && currentStep < SYMPTOM_QUESTIONS.length ? SYMPTOM_QUESTIONS[currentStep] : null;

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-7rem)] flex flex-col lg:flex-row gap-4">
        {/* Side panel */}
        <div className="hidden lg:flex flex-col w-80 shrink-0 space-y-4">
          <div className="bg-card rounded-xl border border-border p-5 shadow-card">
            <h3 className="font-display font-semibold text-foreground text-sm mb-3">Consultation Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Patient</span><span className="text-foreground font-medium">{user?.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="text-foreground">{new Date().toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="text-foreground">{result ? 'Complete' : 'In Progress'}</span></div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-5 shadow-card">
            <h3 className="font-display font-semibold text-foreground text-sm mb-3">Progress</h3>
            <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
              <motion.div className="h-full bg-gradient-hero rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
            </div>
            <p className="text-xs text-muted-foreground">
              {phase === 'welcome' ? 'Not started' : phase === 'describe' ? 'Describing symptoms' : phase === 'questions' ? `${currentStep} of ${SYMPTOM_QUESTIONS.length} questions` : phase === 'analyzing' ? 'AI analyzing...' : 'Complete'}
            </p>
          </div>

          {/* AI Analysis badge */}
          {aiAnalysis && (
            <div className="bg-card rounded-xl border border-border p-5 shadow-card">
              <h3 className="font-display font-semibold text-foreground text-sm mb-3">🤖 AI Analysis</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Diarrhea detected</span><span className={aiAnalysis.is_diarrhea ? 'text-medical-red font-medium' : 'text-medical-green font-medium'}>{aiAnalysis.is_diarrhea ? 'Yes' : 'No'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Cholera likely</span><span className={aiAnalysis.is_cholera_likely ? 'text-medical-red font-medium' : 'text-medical-green font-medium'}>{aiAnalysis.is_cholera_likely ? 'Yes' : 'No'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Stage</span><span className="text-foreground font-medium capitalize">{aiAnalysis.stage?.replace(/_/g, ' ')}</span></div>
              </div>
            </div>
          )}

          {Object.keys(answers).length > 0 && (
            <div className="bg-card rounded-xl border border-border p-5 shadow-card flex-1 overflow-y-auto">
              <h3 className="font-display font-semibold text-foreground text-sm mb-3">Responses</h3>
              <div className="space-y-2">
                {Object.entries(answers).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className={`font-medium ${val === true ? 'text-medical-red' : val === false ? 'text-medical-green' : 'text-foreground'}`}>
                      {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : `${val} days`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-hero flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-display font-semibold text-foreground text-sm">CholeraCare AI Assistant</p>
              <p className="text-xs text-medical-green flex items-center gap-1"><span className="w-1.5 h-1.5 bg-medical-green rounded-full" /> Online</p>
            </div>
            {progress > 0 && (
              <div className="ml-auto flex items-center gap-2 lg:hidden">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
              </div>
            )}
          </div>

          {result?.urgentReferral && (
            <div className="px-5 py-3 bg-medical-red-light border-b border-medical-red/20 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-medical-red shrink-0" />
              <p className="text-sm font-medium text-medical-red">⚠️ High risk detected — urgent medical referral recommended</p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <AnimatePresence>
              {messages.map(msg => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user' ? 'bg-gradient-hero text-primary-foreground rounded-br-md' : 'bg-muted text-foreground rounded-bl-md'
                  }`}>
                    {msg.content.split(/(\*\*.*?\*\*)/).map((part, i) => {
                      if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
                      return part;
                    })}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Result card */}
            {result && phase === 'done' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className={`rounded-xl border-2 p-6 ${
                  result.riskLevel === 'high' ? 'border-medical-red/30 bg-medical-red-light' :
                  result.riskLevel === 'moderate' ? 'border-medical-orange/30 bg-medical-orange-light' :
                  'border-medical-green/30 bg-medical-green-light'
                }`}>
                  <div className="flex items-center gap-3 mb-4">
                    {result.riskLevel === 'high' ? <AlertTriangle className="w-6 h-6 text-medical-red" /> : <CheckCircle className="w-6 h-6 text-medical-green" />}
                    <h3 className="font-display font-bold text-lg text-foreground">Assessment Result</h3>
                    <RiskBadge level={result.riskLevel} />
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{result.summary}</p>
                  <div className="mt-3 text-xs text-muted-foreground">Risk Score: {result.score}/100</div>
                </div>

                {/* AI stage info */}
                {aiAnalysis && (
                  <div className="bg-card rounded-xl border border-border p-5">
                    <h4 className="font-display font-semibold text-foreground text-sm mb-3">🤖 AI NLP Analysis</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">Diarrhea Prediction:</span>
                        <span className={`text-sm font-semibold ${aiAnalysis.is_diarrhea ? 'text-medical-red' : 'text-medical-green'}`}>
                          {aiAnalysis.is_diarrhea ? '✅ Likely Diarrhea' : '❌ Not Diarrhea'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">Cholera Likelihood:</span>
                        <span className={`text-sm font-semibold ${aiAnalysis.is_cholera_likely ? 'text-medical-red' : 'text-medical-green'}`}>
                          {aiAnalysis.is_cholera_likely ? '⚠️ Cholera Possible' : '✅ Cholera Unlikely'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">Stage:</span>
                        <span className="text-sm font-semibold text-foreground capitalize">{aiAnalysis.stage?.replace(/_/g, ' ')}</span>
                      </div>
                      {aiAnalysis.stage_description && (
                        <p className="text-sm text-muted-foreground bg-muted rounded-lg p-3">{aiAnalysis.stage_description}</p>
                      )}
                      {aiAnalysis.detected_symptoms?.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-foreground mb-2">Detected Symptoms from Your Description:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {aiAnalysis.detected_symptoms.map((s: string) => (
                              <span key={s} className="px-2.5 py-1 bg-muted rounded-md text-xs text-muted-foreground">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-card rounded-xl border border-border p-5">
                  <h4 className="font-display font-semibold text-foreground text-sm mb-3">📋 Recommendations</h4>
                  <ul className="space-y-2">
                    {result.advice.map((a, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2"><span className="text-primary mt-0.5">•</span>{a}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-card rounded-xl border border-border p-5">
                  <h4 className="font-display font-semibold text-foreground text-sm mb-3">🛡️ Prevention Tips</h4>
                  <ul className="space-y-2">
                    {result.preventionTips.map((t, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2"><Shield className="w-4 h-4 text-medical-green mt-0.5 shrink-0" />{t}</li>
                    ))}
                  </ul>
                </div>

                {result.urgentReferral && (
                  <div className="bg-medical-red-light border-2 border-medical-red/30 rounded-xl p-5">
                    <h4 className="font-display font-semibold text-medical-red text-sm mb-2">🚨 Urgent Medical Referral</h4>
                    <p className="text-sm text-foreground">Please seek immediate medical attention at your nearest hospital or clinic. Cholera can be life-threatening if not treated promptly.</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" asChild><Link to="/history"><ArrowLeft className="w-4 h-4 mr-2" /> View History</Link></Button>
                  <Button className="bg-gradient-hero text-primary-foreground hover:opacity-90" onClick={() => window.location.reload()}>New Assessment</Button>
                </div>
              </motion.div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick replies */}
          {phase === 'welcome' && (
            <div className="px-5 py-3 border-t border-border flex gap-2 flex-wrap">
              <Button size="sm" className="bg-gradient-hero text-primary-foreground hover:opacity-90" onClick={startAssessment}>🩺 Start Assessment</Button>
            </div>
          )}

          {currentQ && phase === 'questions' && (
            <div className="px-5 py-3 border-t border-border flex gap-2 flex-wrap">
              {currentQ.type === 'duration' ? (
                [1, 2, 3, 5, 7].map(d => (
                  <Button key={d} size="sm" variant="outline" onClick={() => handleAnswer(d)}>{d} day{d > 1 ? 's' : ''}</Button>
                ))
              ) : (
                <>
                  <Button size="sm" variant="outline" onClick={() => handleAnswer(true)} className="border-medical-red/30 text-medical-red hover:bg-medical-red-light">Yes</Button>
                  <Button size="sm" variant="outline" onClick={() => handleAnswer(false)} className="border-medical-green/30 text-medical-green hover:bg-medical-green-light">No</Button>
                </>
              )}
            </div>
          )}

          {/* Input */}
          <div className="px-5 py-4 border-t border-border">
            <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder={phase === 'welcome' ? 'Click Start Assessment to begin...' : phase === 'describe' ? 'Describe how you are feeling...' : 'Use the buttons above to answer...'}
                className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button type="submit" size="icon" className="bg-gradient-hero text-primary-foreground hover:opacity-90 shrink-0" disabled={saving}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
