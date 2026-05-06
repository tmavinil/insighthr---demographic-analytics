import React from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { Employee, FilterState } from '../types';
import { TRANSLATIONS, Language } from '../translations';

interface MainDashboardProps {
  data: Employee[];
  language: Language;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export const MainDashboard: React.FC<MainDashboardProps & { filters: FilterState }> = ({ data, filters, language }) => {
  const t = (key: keyof typeof TRANSLATIONS['en']) => {
    return TRANSLATIONS[language][key] || TRANSLATIONS['en'][key];
  };

  // Aggregate Dept Data
  const deptData = React.useMemo(() => {
    const activeData = data.filter(e => e.status === 'Active');
    const counts = activeData.reduce((acc, curr) => {
      acc[curr.department] = (acc[curr.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [data]);

  // Turnover Trend Data
  const turnoverTrend = React.useMemo(() => {
    const startDate = new Date(filters.dateRange.start);
    const endDate = new Date(filters.dateRange.end);
    const months = [];
    let cur = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    
    // Map of languages to locales
    const localeMap: Record<Language, string> = {
      en: 'en-US',
      fr: 'fr-FR',
      es: 'es-ES',
      tr: 'tr-TR',
      ru: 'ru-RU',
      de: 'de-DE',
      hi: 'hi-IN'
    };
    const locale = localeMap[language] || 'en-US';

    while (cur <= endDate) {
      const monthStr = cur.toLocaleDateString(locale, { month: 'short', year: '2-digit' });
      const monthStart = new Date(cur.getFullYear(), cur.getMonth(), 1);
      const monthEnd = new Date(cur.getFullYear(), cur.getMonth() + 1, 0);

      // Employees active at start of month
      const startCount = data.filter(e => {
        const hire = new Date(e.hireDate);
        const term = e.terminationDate ? new Date(e.terminationDate) : null;
        return hire <= monthStart && (!term || term >= monthStart);
      }).length;

      // Terminations during month
      const leavers = data.filter(e => {
        const term = e.terminationDate ? new Date(e.terminationDate) : null;
        return term && term >= monthStart && term <= monthEnd;
      }).length;

      // Net headcount at end of month
      const endCount = data.filter(e => {
        const hire = new Date(e.hireDate);
        const term = e.terminationDate ? new Date(e.terminationDate) : null;
        return hire <= monthEnd && (!term || term >= monthEnd);
      }).length;

      const avgHeadcount = (startCount + endCount) / 2 || 1;
      const rate = (leavers / avgHeadcount) * 100;

      months.push({
        month: monthStr,
        headcount: endCount,
        attrition: leavers,
        rate: Number(rate.toFixed(2))
      });
      cur.setMonth(cur.getMonth() + 1);
    }
    return months;
  }, [data, filters.dateRange, language]);

  // Termination Types
  const termTypeData = React.useMemo(() => {
    const leavers = data.filter(e => e.status === 'Terminated');
    const counts = leavers.reduce((acc, curr) => {
      acc[curr.terminationType || 'Unknown'] = (acc[curr.terminationType || 'Unknown'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [data]);

  const totalTerminations = React.useMemo(() => 
    termTypeData.reduce((acc, curr) => acc + curr.value, 0)
  , [termTypeData]);

  // Aggregate Gender Data
  const genderData = React.useMemo(() => {
    const activeData = data.filter(e => e.status === 'Active');
    const counts = activeData.reduce((acc, curr) => {
      acc[curr.gender] = (acc[curr.gender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [data]);

  const totalActive = React.useMemo(() => 
    genderData.reduce((acc, curr) => acc + curr.value, 0)
  , [genderData]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Headcount vs Attrition Growth */}
      <div className="glass-card p-6 lg:col-span-3">
        <h3 className="font-semibold mb-6 flex items-center justify-between">
          <span>{t('headcountDynamics')}</span>
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <LineChart data={turnoverTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(20, 20, 20, 0.05)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={10} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} fontSize={10} label={{ value: t('activeHeadcount'), angle: -90, position: 'insideLeft', fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} fontSize={10} label={{ value: `${t('turnoverRate')} %`, angle: 90, position: 'insideRight', fontSize: 10 }} />
              <Tooltip 
                formatter={(value: any, name: string) => {
                  if (name === 'rate') return [`${value}%`, t('turnoverRate')];
                  if (name === 'headcount') return [value, t('activeHeadcount')];
                  if (name === 'attrition') return [value, t('periodAttrition')];
                  return [value, name];
                }}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                  border: '1px solid rgba(20, 20, 20, 0.1)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }} 
              />
              <Line yAxisId="left" type="monotone" dataKey="headcount" stroke="#141414" strokeWidth={2} dot={{ r: 4 }} />
              <Bar yAxisId="left" dataKey="attrition" fill="#EF4444" opacity={0.2} radius={[2, 2, 0, 0]} />
              <Line yAxisId="right" type="step" dataKey="rate" stroke="#3B82F6" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dept Distribution */}
      <div className="glass-card p-6 lg:col-span-2">
        <h3 className="font-semibold mb-6 flex items-center justify-between">
          <span>{t('activeByDept')}</span>
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(20, 20, 20, 0.05)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                fontSize={12} 
                tick={{ fill: 'rgba(20, 20, 20, 0.6)' }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                fontSize={12} 
                tick={{ fill: 'rgba(20, 20, 20, 0.6)' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                  border: '1px solid rgba(20, 20, 20, 0.1)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }} 
              />
              <Bar dataKey="value" fill="#141414" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Attrition Type */}
      <div className="glass-card p-6">
        <h3 className="font-semibold mb-6 flex items-center justify-between">
          <span>{t('attritionBreakdown')}</span>
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <PieChart>
              <Pie
                data={termTypeData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {termTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string) => {
                  const percent = totalTerminations > 0 ? ((value / totalTerminations) * 100).toFixed(1) : 0;
                  return [`${value} (${percent}%)`, name];
                }}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                  border: '1px solid rgba(20, 20, 20, 0.1)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 justify-center">
            {termTypeData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-brand-ink/60">{d.name}</span>
                </div>
            ))}
        </div>
      </div>

      {/* Gender Distribution */}
      <div className="glass-card p-6">
        <h3 className="font-semibold mb-6 flex items-center justify-between">
          <span>{t('genderDistribution')}</span>
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <PieChart>
              <Pie
                data={genderData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string) => {
                  const percent = totalActive > 0 ? ((value / totalActive) * 100).toFixed(1) : 0;
                  return [`${value} (${percent}%)`, name];
                }}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                  border: '1px solid rgba(20, 20, 20, 0.1)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 justify-center">
            {genderData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[(i + 2) % COLORS.length] }} />
                    <span className="text-xs text-brand-ink/60">{d.name}</span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
