import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, AlertTriangle, CheckCircle, Shield, ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { SYMPTOM_QUESTIONS, assessCholera, SymptomAnswers, AssessmentResult } from '@/lib/cholera-assessment';
import RiskBadge from '@/components/RiskBadge';

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

export default function Consultation() {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState(-1); // -1 = welcome
  const [answers, setAnswers] = useState<SymptomAnswers>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [inputValue, setInputValue] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Welcome message
    addAssistantMessage(
      `Hello ${user?.name?.split(' ')[0] || 'there'}! 👋\n\nI'm your CholeraCare AI assistant. I'll help you assess your symptoms for potential cholera indicators.\n\nThis assessment takes about 2-3 minutes. I'll ask you a series of questions about your symptoms, and then provide a risk evaluation with personalized advice.\n\n**Important:** This is a screening tool, not a medical diagnosis. Always consult a healthcare professional for confirmation.\n\nReady to begin? Click **"Start Assessment"** below.`
    );
  }, []);

  if (!isAuthenticated) return <Navigate to="/login" />;

  function addAssistantMessage(content: string) {
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content, timestamp: new Date() }]);
  }

  function addUserMessage(content: string) {
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'user', content, timestamp: new Date() }]);
  }

  function startAssessment() {
    addUserMessage('Start Assessment');
    setCurrentStep(0);
    const q = SYMPTOM_QUESTIONS[0];
    setTimeout(() => addAssistantMessage(`${q.emoji} **Question 1 of ${SYMPTOM_QUESTIONS.length}**\n\n${q.question}`), 500);
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
      setCurrentStep(SYMPTOM_QUESTIONS.length);
      setTimeout(() => {
        addAssistantMessage('⏳ Analyzing your responses...');
        setTimeout(() => {
          const updatedAnswers = { ...answers, [key]: q.type === 'duration' ? (answer as number) : (answer as boolean) };
          const assessment = assessCholera(updatedAnswers);
          setResult(assessment);
          addAssistantMessage(`✅ **Assessment Complete**\n\nI've analyzed your symptoms. Please review your results below.`);
        }, 1500);
      }, 500);
    }
  }

  function handleSend() {
    if (!inputValue.trim()) return;
    if (currentStep === -1) {
      startAssessment();
    } else {
      addUserMessage(inputValue);
      setTimeout(() => addAssistantMessage("I'm currently focused on the symptom assessment. Please use the buttons to answer the questions, or start a new assessment when this one completes."), 500);
    }
    setInputValue('');
  }

  const progress = currentStep >= 0 ? Math.min(((currentStep) / SYMPTOM_QUESTIONS.length) * 100, 100) : 0;
  const currentQ = currentStep >= 0 && currentStep < SYMPTOM_QUESTIONS.length ? SYMPTOM_QUESTIONS[currentStep] : null;

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

          {/* Progress */}
          <div className="bg-card rounded-xl border border-border p-5 shadow-card">
            <h3 className="font-display font-semibold text-foreground text-sm mb-3">Progress</h3>
            <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
              <motion.div className="h-full bg-gradient-hero rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
            </div>
            <p className="text-xs text-muted-foreground">{currentStep >= 0 ? `${Math.min(currentStep, SYMPTOM_QUESTIONS.length)} of ${SYMPTOM_QUESTIONS.length} questions` : 'Not started'}</p>
          </div>

          {/* Symptom summary */}
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
          {/* Header */}
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

          {/* Risk alert */}
          {result?.urgentReferral && (
            <div className="px-5 py-3 bg-medical-red-light border-b border-medical-red/20 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-medical-red shrink-0" />
              <p className="text-sm font-medium text-medical-red">⚠️ High risk detected — urgent medical referral recommended</p>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <AnimatePresence>
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-gradient-hero text-primary-foreground rounded-br-md'
                      : 'bg-muted text-foreground rounded-bl-md'
                  }`}>
                    {msg.content.split(/(\*\*.*?\*\*)/).map((part, i) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={i}>{part.slice(2, -2)}</strong>;
                      }
                      return part;
                    })}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Result card */}
            {result && (
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

                <div className="bg-card rounded-xl border border-border p-5">
                  <h4 className="font-display font-semibold text-foreground text-sm mb-3">📋 Recommendations</h4>
                  <ul className="space-y-2">
                    {result.advice.map((a, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>{a}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-card rounded-xl border border-border p-5">
                  <h4 className="font-display font-semibold text-foreground text-sm mb-3">🛡️ Prevention Tips</h4>
                  <ul className="space-y-2">
                    {result.preventionTips.map((t, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <Shield className="w-4 h-4 text-medical-green mt-0.5 shrink-0" />{t}
                      </li>
                    ))}
                  </ul>
                </div>

                {result.urgentReferral && (
                  <div className="bg-medical-red-light border-2 border-medical-red/30 rounded-xl p-5">
                    <h4 className="font-display font-semibold text-medical-red text-sm mb-2">🚨 Urgent Medical Referral</h4>
                    <p className="text-sm text-foreground">Please seek immediate medical attention at your nearest hospital or clinic. Cholera can be life-threatening if not treated promptly. Call emergency services if you are unable to travel.</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" asChild>
                    <Link to="/history"><ArrowLeft className="w-4 h-4 mr-2" /> View History</Link>
                  </Button>
                  <Button className="bg-gradient-hero text-primary-foreground hover:opacity-90" onClick={() => window.location.reload()}>
                    New Assessment
                  </Button>
                </div>
              </motion.div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick replies */}
          {currentStep === -1 && !result && (
            <div className="px-5 py-3 border-t border-border flex gap-2 flex-wrap">
              <Button size="sm" className="bg-gradient-hero text-primary-foreground hover:opacity-90" onClick={startAssessment}>
                🩺 Start Assessment
              </Button>
            </div>
          )}

          {currentQ && !result && (
            <div className="px-5 py-3 border-t border-border flex gap-2 flex-wrap">
              {currentQ.type === 'duration' ? (
                <>
                  {[1, 2, 3, 5, 7].map(d => (
                    <Button key={d} size="sm" variant="outline" onClick={() => handleAnswer(d)}>{d} day{d > 1 ? 's' : ''}</Button>
                  ))}
                </>
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
                placeholder={currentStep === -1 ? 'Type "start" or click Start Assessment...' : 'Use the buttons above to answer...'}
                className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button type="submit" size="icon" className="bg-gradient-hero text-primary-foreground hover:opacity-90 shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
