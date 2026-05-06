/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import Papa from 'papaparse';
import { 
  Users, 
  MapPin, 
  Clock, 
  RotateCcw,
  Download,
  Share2,
  Calendar,
  Layers,
  Sparkles,
  Upload,
  Linkedin
} from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { MainDashboard } from './components/MainDashboard';
import { SmartInsights } from './components/SmartInsights';
import { InsightContext } from './components/InsightContext';
import { ApiTokenManager } from './components/ApiTokenManager';
import { FileUpload } from './components/FileUpload';
import { MetricCard } from './components/MetricCard';
import { EmployeeTable } from './components/EmployeeTable';
import { DepartmentalBreakdown } from './components/DepartmentalBreakdown';
import { Employee, FilterState } from './types';
import { SAMPLE_DATA } from './constants';
import { motion, AnimatePresence } from 'motion/react';
import { Palette, Pipette, Languages } from 'lucide-react';
import { TRANSLATIONS, Language } from './translations';

export default function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [apiToken, setApiToken] = useState<string | null>(null);
  const [theme, setTheme] = useState({
    pageBg: '#E4E3E0',
    cardBg: '#ffffff'
  });

  const t = (key: keyof typeof TRANSLATIONS['en']) => {
    return TRANSLATIONS[language][key] || TRANSLATIONS['en'][key];
  };

  const [filters, setFilters] = useState<FilterState>(() => {
    const today = new Date();
    const lastYear = new Date(today);
    lastYear.setFullYear(today.getFullYear() - 1);
    return {
      departments: [],
      locations: [],
      tenureRange: [0, 20],
      searchTerm: '',
      dateRange: {
        start: lastYear.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0]
      }
    };
  });

  const handleDataLoaded = (data: Employee[]) => {
    setEmployees(data);
    setShowUpload(false);
  };

  const resetAll = () => {
    const today = new Date();
    const lastYear = new Date(today);
    lastYear.setFullYear(today.getFullYear() - 1);
    setFilters({
      departments: [],
      locations: [],
      tenureRange: [0, 20],
      searchTerm: '',
      dateRange: {
        start: lastYear.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0]
      }
    });
    setShowUpload(false);
  };

  const availableDepartments = useMemo(() => {
    if (employees.length === 0) return [];
    return Array.from(new Set(employees.map(e => e.department))).sort();
  }, [employees]);

  const availableLocations = useMemo(() => {
    if (employees.length === 0) return [];
    return Array.from(new Set(employees.map(e => e.location))).sort();
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      // Identity filters
      const matchesDept = filters.departments.length === 0 || filters.departments.includes(e.department);
      const matchesLoc = filters.locations.length === 0 || filters.locations.includes(e.location);
      const matchesSearch = !filters.searchTerm || 
        e.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        e.id.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      // Temporal Availability Filter
      const periodStart = new Date(filters.dateRange.start);
      const periodEnd = new Date(filters.dateRange.end);
      const hireDate = new Date(e.hireDate);
      const terminationDate = e.terminationDate ? new Date(e.terminationDate) : null;

      // An employee is relevant to the period if they were hired BEFORE period end
      // AND they either haven't been terminated OR were terminated AFTER period start
      const wasEmployedDuringPeriod = hireDate <= periodEnd && (!terminationDate || terminationDate >= periodStart);

      return matchesDept && matchesLoc && matchesSearch && wasEmployedDuringPeriod;
    });
  }, [employees, filters]);

  const metrics = useMemo(() => {
    if (filteredEmployees.length === 0) return null;
    
    const periodStart = new Date(filters.dateRange.start);
    const periodEnd = new Date(filters.dateRange.end);

    // Initial headcount (active on start date)
    const initialHC = filteredEmployees.filter(e => {
        const hire = new Date(e.hireDate);
        const term = e.terminationDate ? new Date(e.terminationDate) : null;
        return hire <= periodStart && (!term || term >= periodStart);
    }).length;

    // Final headcount (active on end date)
    const finalHC = filteredEmployees.filter(e => {
        const hire = new Date(e.hireDate);
        const term = e.terminationDate ? new Date(e.terminationDate) : null;
        return hire <= periodEnd && (!term || term >= periodEnd);
    }).length;

    // Terminations during period
    const leavers = filteredEmployees.filter(e => {
        const term = e.terminationDate ? new Date(e.terminationDate) : null;
        return term && term >= periodStart && term <= periodEnd;
    }).length;

    const avgHC = (initialHC + finalHC) / 2 || 1;
    const turnoverRate = (leavers / avgHC) * 100;

    // Active workforce at end of period for demographic averages
    const activeAtEnd = filteredEmployees.filter(e => {
        const hire = new Date(e.hireDate);
        const term = e.terminationDate ? new Date(e.terminationDate) : null;
        return hire <= periodEnd && (!term || term >= periodEnd);
    });

    const avgTenure = activeAtEnd.length > 0
      ? activeAtEnd.reduce((acc, curr) => acc + curr.tenureYears, 0) / activeAtEnd.length
      : 0;

    const avgAge = activeAtEnd.length > 0
      ? activeAtEnd.reduce((acc, curr) => acc + curr.age, 0) / activeAtEnd.length
      : 0;

    return [
      { label: t('activeHeadcount'), value: finalHC, icon: Users, change: leavers > 0 ? `-${leavers} ${t('leavers')}` : t('stable'), isPositive: leavers === 0 },
      { label: t('turnoverRate'), value: `${turnoverRate.toFixed(1)}%`, icon: RotateCcw, isPositive: turnoverRate < 10 },
      { label: t('avgPeriodHeadcount'), value: avgHC.toFixed(1), icon: Clock },
      { label: t('periodAttrition'), value: leavers, icon: Calendar, change: t('grossOutflow') },
      { label: t('avgTenure'), value: `${avgTenure.toFixed(1)}y`, icon: Layers },
      { label: t('avgEmployeeAge'), value: `${avgAge.toFixed(0)}y`, icon: Sparkles },
    ];
  }, [filteredEmployees, filters.dateRange, language]);

  const handleExport = () => {
    if (filteredEmployees.length === 0) return;
    
    // Use Papa.unparse for reliable CSV generation
    const csv = Papa.unparse(filteredEmployees);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute("href", url);
    link.setAttribute("download", `workforce_roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      className="flex h-screen select-none transition-colors duration-500"
      style={{ 
        backgroundColor: theme.pageBg,
        // Override CSS variables for components that use them
        ['--color-brand-bg' as any]: theme.pageBg,
        ['--dynamic-card-bg' as any]: theme.cardBg
      } as React.CSSProperties}
    >
      <Sidebar 
        filters={filters} 
        onFilterChange={setFilters} 
        availableDepartments={availableDepartments}
        availableLocations={availableLocations}
        language={language}
      />

      <main className="flex-1 overflow-y-auto custom-scrollbar bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.05),transparent_50%)]">
        <div className="max-w-[1400px] mx-auto p-12">
          
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-brand-ink/40">{t('periodAnalytics')} ({filters.dateRange.start} - {filters.dateRange.end})</span>
              </div>
              <div>
                <h2 className="text-4xl font-bold tracking-tight mb-2">{t('appTitle')}</h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Language Selector */}
              <div className="flex flex-col items-end gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/40 pr-1">Language</span>
                <div className="relative group">
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    className="appearance-none pl-8 pr-4 py-1.5 bg-white border border-brand-line rounded-lg text-sm font-medium focus:ring-1 focus:ring-accent/40 cursor-pointer hover:bg-brand-ink/5 transition-colors"
                  >
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="es">Español</option>
                    <option value="de">Deutsch</option>
                    <option value="tr">Türkçe</option>
                    <option value="ru">Русский</option>
                    <option value="hi">हिन्दी</option>
                  </select>
                  <Languages className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-ink/40 pointer-events-none" />
                </div>
              </div>

              {/* Theme Pickers */}
              <div className="flex flex-col items-end gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/40 pr-1">{t('personalize')}</span>
                <div className="flex items-center gap-2 p-1.5 bg-white border border-brand-line rounded-lg shadow-sm">
                  <div className="flex items-center gap-3 px-2 border-r border-brand-line">
                    <div className="relative group flex items-center justify-center">
                      <input 
                        type="color" 
                        id="pageColor"
                        value={theme.pageBg}
                        onChange={(e) => setTheme(prev => ({ ...prev, pageBg: e.target.value }))}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div className="flex items-center gap-1.5">
                        <div 
                          className="w-4 h-4 rounded-full border border-brand-line shadow-inner" 
                          style={{ backgroundColor: theme.pageBg }}
                        />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/40">{t('page')}</span>
                      </div>
                    </div>
                    
                    <div className="relative group flex items-center justify-center">
                      <input 
                        type="color" 
                        id="cardColor"
                        value={theme.cardBg}
                        onChange={(e) => setTheme(prev => ({ ...prev, cardBg: e.target.value }))}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div className="flex items-center gap-1.5">
                        <div 
                          className="w-4 h-4 rounded-full border border-brand-line shadow-inner" 
                          style={{ backgroundColor: theme.cardBg }}
                        />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/40">{t('cards')}</span>
                      </div>
                    </div>
                  </div>
                  <Palette className="w-3.5 h-3.5 text-brand-ink/30 mx-1" />
                </div>
              </div>

              {/* Reset Filters */}
              <div className="relative group">
                <button 
                  onClick={resetAll}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-brand-line text-brand-ink rounded-lg text-sm font-medium hover:bg-brand-ink/5 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  {t('resetFilters')}
                </button>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-brand-ink text-brand-bg text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {t('restoreDefaults')}
                </div>
              </div>

              <div className="h-4 w-px bg-brand-line mx-1" />

              {/* Action Buttons */}
              <div className="flex bg-white border border-brand-line rounded-lg p-1">
                <div className="relative group">
                  <button 
                    onClick={() => setShowUpload(!showUpload)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      showUpload ? 'bg-brand-ink text-brand-bg shadow-sm' : 'hover:bg-brand-ink/5'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    {t('dataUpload')}
                  </button>
                  {!showUpload && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-brand-ink text-brand-bg text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {t('uploadHint')}
                    </div>
                  )}
                </div>

                <div className="relative group">
                  <button 
                  onClick={() => {
                    setEmployees(SAMPLE_DATA);
                    setShowUpload(false);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-brand-ink/5 rounded-md text-sm font-medium transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  {t('trySample')}
                </button>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-brand-ink text-brand-bg text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {t('useBuiltIn')}
                  </div>
                </div>
              </div>

              <div className="h-4 w-px bg-brand-line mx-1" />
            </div>
          </header>

          <AnimatePresence mode="wait">
            {employees.length === 0 || showUpload ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex flex-col items-center justify-center min-h-[500px] space-y-12"
              >
                <div className="w-full max-w-2xl">
                  <div className="text-center mb-12">
                    <h3 className="text-2xl font-bold mb-2">{t('ingestData')}</h3>
                    <p className="text-brand-ink/40 text-sm">{t('syncHint')}</p>
                  </div>
                  <FileUpload onDataLoaded={handleDataLoaded} language={language} />
                  {employees.length > 0 && (
                    <button 
                      onClick={() => setShowUpload(false)}
                      className="w-full mt-8 py-3 border border-brand-ink/10 rounded-xl text-sm font-medium hover:bg-brand-ink/5 transition-colors"
                    >
                      {t('returnDashboard')}
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-10 rounded-2xl"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {metrics?.map((metric, i) => (
                    <motion.div
                      key={metric.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <MetricCard {...metric} />
                    </motion.div>
                  )) || <div className="col-span-full h-32 bg-white/40 rounded-xl animate-pulse" />}
                </div>

                {/* AI Insights Section */}
                <div className="space-y-6">
                  <ApiTokenManager language={language} onTokenChange={setApiToken} />
                  
                  <InsightContext data={filteredEmployees} language={language} />

                  {apiToken && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-6 overflow-hidden"
                    >
                      <SmartInsights data={filteredEmployees} language={language} apiToken={apiToken} />
                    </motion.div>
                  )}
                </div>

                {/* Main Content Grid */}
                <div className="space-y-10">
                  <MainDashboard data={filteredEmployees} filters={filters} language={language} />
                  
                  {/* Department Breakdown Table */}
                  <DepartmentalBreakdown employees={filteredEmployees} filters={filters} language={language} t={t} />
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold tracking-tight">{t('periodRoster')}</h3>
                      <button 
                        onClick={handleExport}
                        className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-brand-ink/40 hover:text-brand-ink transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        {t('downloadCsv')}
                      </button>
                    </div>
                    <EmployeeTable employees={filteredEmployees} language={language} t={t} />
                  </div>
                </div>

                {/* Footer Section */}
                <footer className="mt-20 py-8 border-t border-brand-line/50 text-center space-y-4">
                  <p className="text-xs text-brand-ink/40 max-w-2xl mx-auto leading-relaxed">
                    <strong>{t('disclaimer')}:</strong> {t('disclaimerText')}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs font-medium text-brand-ink/60">
                    <span>{t('developedBy')}</span>
                    <a 
                      href="https://www.linkedin.com/in/toygunmavinil/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-brand-ink hover:underline flex items-center gap-1"
                    >
                      Toygun Mavinil
                      <Linkedin className="w-3 h-3" />
                    </a>
                  </div>
                </footer>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
