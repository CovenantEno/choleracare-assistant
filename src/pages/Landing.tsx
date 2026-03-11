import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Activity, MessageSquare, Droplets, Users, CheckCircle, ChevronRight, Heart, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  { icon: MessageSquare, title: 'AI Symptom Assessment', desc: 'Answer guided questions and receive instant cholera risk evaluation powered by intelligent analysis.' },
  { icon: Activity, title: 'Early Detection', desc: 'Identify cholera symptoms early with our structured assessment engine before they become critical.' },
  { icon: Droplets, title: 'Hydration Guidance', desc: 'Get personalized ORS preparation instructions and hydration monitoring recommendations.' },
  { icon: Shield, title: 'Prevention Education', desc: 'Learn evidence-based prevention strategies for clean water, food safety, and hygiene.' },
  { icon: Users, title: 'Doctor Consultation', desc: 'Connect with healthcare professionals who can review your assessment and provide expert guidance.' },
  { icon: Heart, title: 'Follow-up Care', desc: 'Track your health progress with consultation history and follow-up reminders.' },
];

const steps = [
  { num: '01', title: 'Start Assessment', desc: 'Begin by answering simple symptom questions in our guided chat interface.' },
  { num: '02', title: 'Get AI Analysis', desc: 'Our assessment engine evaluates your symptoms and determines risk level.' },
  { num: '03', title: 'Receive Guidance', desc: 'Get personalized advice, prevention tips, and next steps based on your assessment.' },
  { num: '04', title: 'Connect with Doctors', desc: 'If needed, your case is flagged for review by healthcare professionals.' },
];

const faqs = [
  { q: 'How does the AI assessment work?', a: 'Our system uses a structured symptom questionnaire based on WHO cholera diagnostic criteria. It evaluates your responses to determine risk level and provides tailored recommendations.' },
  { q: 'Is this a replacement for medical advice?', a: 'No. CholeraCare AI is a screening and education tool. Always consult a healthcare professional for diagnosis and treatment, especially for high-risk assessments.' },
  { q: 'How accurate is the risk assessment?', a: 'Our assessment follows established clinical guidelines. However, only lab tests can confirm cholera. The tool helps with early detection and triage.' },
  { q: 'Is my health data private?', a: 'Yes. All consultation data is securely stored and only accessible to you and your assigned healthcare provider.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">CholeraCare AI</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button size="sm" className="bg-gradient-hero text-primary-foreground hover:opacity-90" asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-8">
            <Zap className="w-4 h-4" /> AI-Powered Cholera Prevention & Detection
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-foreground leading-tight">
            Protect Lives with{' '}
            <span className="text-gradient-hero">Intelligent</span>{' '}
            Cholera Detection
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Get instant symptom assessment, personalized prevention advice, and connect with healthcare professionals — all through an intelligent AI assistant.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-gradient-hero text-primary-foreground hover:opacity-90 px-8 h-12 text-base" asChild>
              <Link to="/signup">Start Free Assessment <ChevronRight className="w-4 h-4 ml-1" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="px-8 h-12 text-base" asChild>
              <Link to="#features">Learn Prevention Tips</Link>
            </Button>
          </div>
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-medical-green" /> Free to use</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-medical-green" /> Evidence-based</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-medical-green" /> Instant results</span>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { num: '3,800+', label: 'Assessments Completed' },
            { num: '1,200+', label: 'Users Protected' },
            { num: '38', label: 'Healthcare Providers' },
            { num: '95%', label: 'Detection Accuracy' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-3xl font-display font-bold text-gradient-hero">{s.num}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground">Everything You Need for Cholera Prevention</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Comprehensive tools to assess, prevent, and manage cholera risk with confidence.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-xl border border-border p-6 shadow-card hover:shadow-card-hover transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-primary mb-4 group-hover:bg-gradient-hero group-hover:text-primary-foreground transition-all duration-300">
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="font-display font-semibold text-foreground text-lg">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-card rounded-2xl border border-border">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground">How It Works</h2>
          <p className="mt-4 text-lg text-muted-foreground">Four simple steps to protect your health</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4 sm:px-8">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center"
            >
              <div className="text-5xl font-display font-extrabold text-gradient-hero mb-4">{s.num}</div>
              <h3 className="font-display font-semibold text-foreground text-lg">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground">Trusted by Healthcare Workers</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { name: 'Dr. Aisha Bello', role: 'Public Health Officer', text: 'CholeraCare AI has transformed how we screen patients in rural communities. The risk assessment is remarkably accurate.' },
            { name: 'James Okonkwo', role: 'Community Health Worker', text: 'The guided questions make it easy for anyone to understand their symptoms. It\'s been invaluable during outbreak seasons.' },
            { name: 'Dr. Priya Sharma', role: 'Emergency Medicine', text: 'The triage system helps us prioritize cases efficiently. High-risk patients get flagged immediately for urgent care.' },
          ].map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-xl border border-border p-6 shadow-card"
            >
              <p className="text-sm text-muted-foreground leading-relaxed italic">"{t.text}"</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-sm font-bold text-accent-foreground">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-4">
          {faqs.map(f => (
            <details key={f.q} className="bg-card rounded-xl border border-border p-6 shadow-card group">
              <summary className="font-display font-semibold text-foreground cursor-pointer list-none flex items-center justify-between">
                {f.q}
                <ChevronRight className="w-5 h-5 text-muted-foreground transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-hero rounded-2xl p-12 text-center">
          <Globe className="w-12 h-12 text-primary-foreground/80 mx-auto mb-4" />
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-primary-foreground">Ready to Protect Your Health?</h2>
          <p className="mt-4 text-lg text-primary-foreground/80 max-w-xl mx-auto">Start your free cholera assessment today and get instant, expert-backed guidance.</p>
          <Button size="lg" className="mt-8 bg-card text-foreground hover:bg-card/90 px-8 h-12 text-base font-semibold" asChild>
            <Link to="/signup">Get Started Free <ChevronRight className="w-4 h-4 ml-1" /></Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-foreground">CholeraCare AI</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 CholeraCare AI. For educational and screening purposes only.</p>
        </div>
      </footer>
    </div>
  );
}
