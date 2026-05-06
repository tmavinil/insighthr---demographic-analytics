import React from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Loader2, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Employee } from '../types';
import { TRANSLATIONS, Language } from '../translations';

interface SmartInsightsProps {
  data: Employee[];
  language: Language;
  apiToken: string | null;
}

export const SmartInsights: React.FC<SmartInsightsProps> = ({ data, language, apiToken }) => {
  const [insight, setInsight] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const t = (key: keyof typeof TRANSLATIONS['en']) => {
    return TRANSLATIONS[language][key] || TRANSLATIONS['en'][key];
  };

  const generateInsights = async () => {
    if (!apiToken) return;
    
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: apiToken });
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
        locations: [...new Set(data.map(d => d.location))],
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

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setInsight(response.text || "No insights found.");
    } catch (error) {
      console.error("Gemini failed:", error);
      setInsight("Unable to generate insights at this time.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-accent" />
          <h3 className="font-semibold text-lg italic serif">{t('smartInsights')}</h3>
        </div>
        <button
          onClick={generateInsights}
          disabled={loading || data.length === 0}
          className="flex items-center gap-2 px-3 py-1.5 bg-brand-ink text-brand-bg rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {loading ? t('scanningData') : t('generateInsights')}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {insight ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="prose prose-sm prose-slate max-w-none prose-p:my-2 prose-li:my-1"
          >
            <div className="text-sm leading-relaxed whitespace-pre-line text-brand-ink/80">
              {insight}
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-brand-ink/30">
            <Sparkles className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-sm">{t('generateInsights')}</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
