import React from 'react';
import { Eye, EyeOff, Layout, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Employee } from '../types';
import { Language, TRANSLATIONS } from '../translations';

interface InsightContextProps {
  data: Employee[];
  language: Language;
}

export const InsightContext: React.FC<InsightContextProps> = ({ data, language }) => {
  const [context, setContext] = React.useState<string | null>(null);
  const [show, setShow] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const t = (key: keyof typeof TRANSLATIONS['en']) => {
    return TRANSLATIONS[language][key] || TRANSLATIONS['en'][key];
  };

  const generateContext = () => {
    const leavers = data.filter(e => e.status === 'Terminated');
    const active = data.filter(e => e.status === 'Active');
    
    const summary = {
      activeCount: active.length,
      terminatedCount: leavers.length,
      depts: active.reduce((acc, curr) => {
        acc[curr.department] = (acc[curr.department] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      terminationTypes: leavers.reduce((acc, curr) => {
        acc[curr.terminationType || 'Unknown'] = (acc[curr.terminationType || 'Unknown'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      tenureAvg: active.reduce((acc, curr) => acc + curr.tenureYears, 0) / (active.length || 1),
    };

    const languageNames: Record<Language, string> = {
      en: 'English',
      fr: 'French',
      es: 'Spanish',
      de: 'German',
      tr: 'Turkish',
      ru: 'Russian',
      hi: 'Hindi'
    };

    const prompt = `Analyze this workforce lifecycle summary. Provide 3-4 professional bullet points focusing on retention, turnover ratio per department vs terminations, and potential attrition risks. 
    IMPORTANT: Respond in ${languageNames[language] || 'English'}.
    Active: ${summary.activeCount}, Terminated: ${summary.terminatedCount}. 
    Depts: ${JSON.stringify(summary.depts)}. 
    Terminations: ${JSON.stringify(summary.terminationTypes)}.`;

    setContext(prompt);
    setShow(true);
  };

  const copyToClipboard = () => {
    if (context) {
      navigator.clipboard.writeText(context);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="glass-card p-6 border-dashed border-2 border-brand-ink/10">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Layout className="w-5 h-5 text-brand-ink/40" />
          <h3 className="font-bold text-sm tracking-widest uppercase text-brand-ink/60">{t('insightContextTitle')}</h3>
        </div>
        <div className="flex items-center gap-2">
           <button
            onClick={generateContext}
            className="px-4 py-2 bg-white border border-brand-line rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-brand-ink/5 transition-all text-brand-ink/70"
          >
            {t('generateContextBtn')}
          </button>
          {context && (
            <div className="flex items-center">
              <button
                onClick={copyToClipboard}
                className="p-2 text-brand-ink/40 hover:text-brand-ink transition-colors"
                title="Copy Context"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setShow(!show)}
                className="p-2 text-brand-ink/40 hover:text-brand-ink transition-colors"
                title={show ? "Hide Context" : "Show Context"}
              >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
      </div>
      
      <p className="text-xs text-brand-ink/30 mb-4 whitespace-pre-line">
        {t('insightContextDesc')}
      </p>

      <AnimatePresence>
        {show && context && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-brand-ink/5 rounded-lg p-4 font-mono text-[11px] leading-relaxed text-brand-ink/70 border border-brand-line select-text cursor-text">
              {context}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

