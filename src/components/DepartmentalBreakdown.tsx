import React from 'react';
import { Employee, FilterState } from '../types';
import { motion } from 'motion/react';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { Language } from '../translations';

interface DepartmentalBreakdownProps {
  employees: Employee[];
  filters: FilterState;
  language: Language;
  t: (key: any) => string;
}

export const DepartmentalBreakdown: React.FC<DepartmentalBreakdownProps> = ({ employees, filters, t }) => {
  const periodStart = new Date(filters.dateRange.start);
  const periodEnd = new Date(filters.dateRange.end);

  const departments = React.useMemo(() => {
    const depts = [...new Set(employees.map(e => e.department))];
    
    return depts.map(dept => {
      const deptEmployees = employees.filter(e => e.department === dept);
      
      const initialHC = deptEmployees.filter(e => {
        const hire = new Date(e.hireDate);
        const term = e.terminationDate ? new Date(e.terminationDate) : null;
        return hire <= periodStart && (!term || term >= periodStart);
      }).length;

      const finalHC = deptEmployees.filter(e => {
        const hire = new Date(e.hireDate);
        const term = e.terminationDate ? new Date(e.terminationDate) : null;
        return hire <= periodEnd && (!term || term >= periodEnd);
      }).length;

      const leavers = deptEmployees.filter(e => {
        const term = e.terminationDate ? new Date(e.terminationDate) : null;
        return term && term >= periodStart && term <= periodEnd;
      }).length;

      const activeAtEnd = deptEmployees.filter(e => {
        const hire = new Date(e.hireDate);
        const term = e.terminationDate ? new Date(e.terminationDate) : null;
        return hire <= periodEnd && (!term || term >= periodEnd);
      });

      const avgTenure = activeAtEnd.length > 0
        ? activeAtEnd.reduce((acc, curr) => acc + curr.tenureYears, 0) / activeAtEnd.length
        : 0;

      const avgHC = (initialHC + finalHC) / 2 || 1;
      const turnoverRate = (leavers / avgHC) * 100;

      return {
        name: dept,
        initialHC,
        finalHC,
        leavers,
        turnoverRate,
        avgTenure,
        trend: finalHC > initialHC ? 'up' : finalHC < initialHC ? 'down' : 'stable'
      };
    }).sort((a, b) => b.turnoverRate - a.turnoverRate);
  }, [employees, filters.dateRange]);

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-6 border-b border-brand-line flex items-center justify-between">
        <h3 className="font-semibold">{t('deptBreakdownPerformance')}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-brand-ink/5 border-b border-brand-line">
              <th className="p-4 text-[11px] font-mono uppercase tracking-widest text-brand-ink/40">{t('department')}</th>
              <th className="p-4 text-[11px] font-mono uppercase tracking-widest text-brand-ink/40 text-center">{t('startHc')}</th>
              <th className="p-4 text-[11px] font-mono uppercase tracking-widest text-brand-ink/40 text-center">{t('endHc')}</th>
              <th className="p-4 text-[11px] font-mono uppercase tracking-widest text-brand-ink/40 text-center">{t('terminations')}</th>
              <th className="p-4 text-[11px] font-mono uppercase tracking-widest text-brand-ink/40 text-center">{t('turnoverRate')}</th>
              <th className="p-4 text-[11px] font-mono uppercase tracking-widest text-brand-ink/40 text-center">{t('avgTenure')}</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => (
              <tr key={dept.name} className="border-b border-brand-line hover:bg-brand-ink/[0.02] transition-colors group">
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {dept.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-500" />}
                    {dept.trend === 'down' && <TrendingDown className="w-3 h-3 text-red-500" />}
                    {dept.trend === 'stable' && <Minus className="w-3 h-3 text-brand-ink/20" />}
                    <span className="font-medium text-sm text-brand-ink/80 group-hover:text-brand-ink transition-colors">{dept.name}</span>
                  </div>
                </td>
                <td className="p-4 text-center font-mono text-sm text-brand-ink/60">{dept.initialHC}</td>
                <td className="p-4 text-center font-mono text-sm text-brand-ink/80 font-bold">{dept.finalHC}</td>
                <td className="p-4 text-center font-mono text-sm text-red-500/80">{dept.leavers}</td>
                <td className="p-4 text-center font-mono text-sm">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    dept.turnoverRate > 15 ? 'bg-red-100 text-red-600' : 
                    dept.turnoverRate > 5 ? 'bg-orange-100 text-orange-600' : 
                    'bg-green-100 text-green-600'
                  }`}>
                    {dept.turnoverRate.toFixed(1)}%
                  </span>
                </td>
                <td className="p-4 text-center font-mono text-sm text-brand-ink/60">{dept.avgTenure.toFixed(1)}y</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
