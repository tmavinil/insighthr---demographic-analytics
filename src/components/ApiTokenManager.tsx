import React from 'react';
import { Key, Save, Edit2, Trash2, ShieldCheck, Lock } from 'lucide-react';
import { Language, TRANSLATIONS } from '../translations';

interface ApiTokenManagerProps {
  onTokenChange: (token: string | null) => void;
  language: Language;
}

export const ApiTokenManager: React.FC<ApiTokenManagerProps> = ({ onTokenChange, language }) => {
  const [token, setToken] = React.useState<string>('');
  const [isSaved, setIsSaved] = React.useState<boolean>(false);
  const [isEditing, setIsEditing] = React.useState<boolean>(false);

  const t = (key: keyof typeof TRANSLATIONS['en']) => {
    return TRANSLATIONS[language][key] || TRANSLATIONS['en'][key];
  };

  React.useEffect(() => {
    const savedToken = localStorage.getItem('GEMINI_API_KEY');
    if (savedToken) {
      setToken(savedToken);
      setIsSaved(true);
      onTokenChange(savedToken);
    }
  }, [onTokenChange]);

  const handleSave = () => {
    if (token.trim()) {
      localStorage.setItem('GEMINI_API_KEY', token.trim());
      setIsSaved(true);
      setIsEditing(false);
      onTokenChange(token.trim());
    }
  };

  const handleDelete = () => {
    localStorage.removeItem('GEMINI_API_KEY');
    setToken('');
    setIsSaved(false);
    setIsEditing(false);
    onTokenChange(null);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsSaved(false);
  };

  return (
    <div className="glass-card p-6 border-brand-ink/10">
      <div className="flex items-center gap-2 mb-4">
        <Key className="w-5 h-5 text-brand-ink/40" />
        <h3 className="font-bold text-sm tracking-widest uppercase text-brand-ink/60">
          {t('apiTokenTitle')}
        </h3>
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative group">
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            disabled={isSaved && !isEditing}
            placeholder={t('apiTokenPlaceholder')}
            className={`w-full bg-white border ${
              isSaved ? 'border-green-100 bg-green-50/10' : 'border-brand-line'
            } rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-ink/5 focus:border-brand-ink outline-none transition-all pr-32 font-mono`}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {!isSaved || isEditing ? (
              <button
                onClick={handleSave}
                disabled={!token.trim()}
                className="flex items-center gap-2 px-3 py-1.5 bg-brand-ink text-brand-bg rounded-md text-[10px] font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-30 transition-all"
              >
                <Save className="w-3 h-3" />
                {t('apiTokenSave')}
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  onClick={handleEdit}
                  className="p-1.5 text-brand-ink/40 hover:text-brand-ink hover:bg-brand-ink/5 rounded transition-all"
                  title={t('apiTokenEdit')}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                  title={t('apiTokenDelete')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
            <div className="flex items-start gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600 mt-0.5 shrink-0" />
                <p className="text-[10px] text-brand-ink/40 leading-relaxed uppercase font-bold tracking-tighter">
                {t('apiTokenHint')}
                </p>
            </div>
            <div className="flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 text-brand-ink/20 mt-0.5 shrink-0" />
                <p className="text-[10px] text-brand-ink/20 leading-relaxed uppercase font-bold tracking-tighter">
                Local Storage encryption: Browser Default | End-to-End Privacy
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};
