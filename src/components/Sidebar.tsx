import React from 'react';
import { 
  Users, 
  MapPin, 
  Clock, 
  Building2, 
  Search, 
  Filter,
  LogOut,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { cn } from '../lib/utils';
import { FilterState } from '../types';
import { DEPARTMENTS, LOCATIONS } from '../constants';
import { TRANSLATIONS, Language } from '../translations';

interface SidebarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  availableDepartments: string[];
  availableLocations: string[];
  language: Language;
}

export const Sidebar: React.FC<SidebarProps> = ({ filters, onFilterChange, availableDepartments, availableLocations, language }) => {
  const t = (key: keyof typeof TRANSLATIONS['en']) => {
    return TRANSLATIONS[language][key] || TRANSLATIONS['en'][key];
  };

  return (
    <aside className="w-72 h-screen border-r border-brand-line flex flex-col bg-brand-bg/50 backdrop-blur-xl">
      <div className="p-8 border-b border-brand-line">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-brand-ink rounded flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-brand-bg" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">InsightHR</h1>
        </div>
        <p className="text-xs text-brand-ink/40 uppercase tracking-widest font-semibold">{t('analyticsSuite')}</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        {/* Search */}
        <div>
          <label className="col-header block mb-2">{t('searchEmployees')}</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-ink/40" />
            <input
              type="text"
              placeholder={t('nameOrId')}
              value={filters.searchTerm}
              onChange={(e) => onFilterChange({ ...filters, searchTerm: e.target.value })}
              className="w-full pl-10 pr-4 py-2 bg-white border border-brand-line rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-accent/40 focus:border-accent/40"
            />
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="col-header block mb-2 font-mono">{t('analysisPeriod')}</label>
          <div className="space-y-2">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-brand-ink/40 uppercase font-bold">{t('start')}</span>
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => onFilterChange({ ...filters, dateRange: { ...filters.dateRange, start: e.target.value } })}
                className="w-full px-3 py-1.5 bg-white border border-brand-line rounded text-xs font-medium focus:ring-1 focus:ring-accent/40"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-brand-ink/40 uppercase font-bold">{t('end')}</span>
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => onFilterChange({ ...filters, dateRange: { ...filters.dateRange, end: e.target.value } })}
                className="w-full px-3 py-1.5 bg-white border border-brand-line rounded text-xs font-medium focus:ring-1 focus:ring-accent/40"
              />
            </div>
          </div>
        </div>

        {/* Departments */}
        <div>
          <label className="col-header block mb-3">{t('departments')}</label>
          <div className="space-y-1.5">
            {availableDepartments.map(dept => (
              <label key={dept} className="flex items-center gap-3 group cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.departments.includes(dept)}
                  onChange={(e) => {
                    const newDepts = e.target.checked 
                      ? [...filters.departments, dept]
                      : filters.departments.filter(d => d !== dept);
                    onFilterChange({ ...filters, departments: newDepts });
                  }}
                  className="w-4 h-4 rounded border-brand-line text-brand-ink focus:ring-brand-ink"
                />
                <span className={cn(
                  "text-sm font-medium transition-colors",
                  dept === "Not Available" ? "text-red-400 italic" : "text-brand-ink/70 group-hover:text-brand-ink"
                )}>
                  {dept === "Not Available" ? t('all') : dept}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Locations */}
        <div>
          <label className="col-header block mb-3">{t('locations')}</label>
          <div className="space-y-1.5">
            {availableLocations.map(loc => (
              <label key={loc} className="flex items-center gap-3 group cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.locations.includes(loc)}
                  onChange={(e) => {
                    const newLocs = e.target.checked 
                      ? [...filters.locations, loc]
                      : filters.locations.filter(l => l !== loc);
                    onFilterChange({ ...filters, locations: newLocs });
                  }}
                  className="w-4 h-4 rounded border-brand-line text-brand-ink focus:ring-brand-ink"
                />
                <span className={cn(
                  "text-sm font-medium transition-colors",
                  loc === "Not Available" ? "text-red-400 italic" : "text-brand-ink/70 group-hover:text-brand-ink"
                )}>
                  {loc === "Not Available" ? t('all') : loc}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-brand-line">
        <button 
          onClick={() => onFilterChange({ ...filters, departments: [], locations: [], searchTerm: '' })}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-brand-ink/60 hover:text-brand-ink transition-colors"
        >
          <Filter className="w-4 h-4" />
          {t('resetFilters')}
        </button>
      </div>
    </aside>
  );
};
