import React from 'react';
import { Employee } from '../types';
import { Mail, MoreHorizontal, UserCircle } from 'lucide-react';
import { Language } from '../translations';

interface EmployeeTableProps {
  employees: Employee[];
  language: Language;
  t: (key: any) => string;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({ employees, t }) => {
  return (
    <div className="glass-card">
      <div className="p-6 border-b border-brand-line flex items-center justify-between">
        <h3 className="font-semibold">{t('periodRoster')}</h3>
        <span className="text-xs font-mono text-brand-ink/40 uppercase tracking-tighter">
          {employees.length} {t('recordsShowing')}
        </span>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-brand-ink/5">
              <th className="col-header p-4">{t('employee')}</th>
              <th className="col-header p-4">{t('department')}</th>
              <th className="col-header p-4">{t('hireDate')}</th>
              <th className="col-header p-4 text-center">{t('tenure')}</th>
              <th className="col-header p-4 text-center">{t('status')}</th>
              <th className="col-header p-4">{t('terminationInfo')}</th>
              <th className="p-4 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {employees.slice(0, 10).map((emp) => (
              <tr key={emp.id} className="data-row group">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                      <UserCircle className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        {emp.name.split(' ').map(name => 
                          name.charAt(0) + '*'.repeat(Math.max(0, name.length - 1))
                        ).join(' ')}
                      </div>
                      <div className="text-[10px] text-brand-ink/40 group-hover:text-brand-bg/60 font-mono transition-colors">{t('employeeId')}: {emp.id}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm font-medium text-brand-ink/70 group-hover:text-brand-bg transition-colors">
                  {emp.department}
                  <div className="text-[10px] text-brand-ink/40 group-hover:text-brand-bg/60 uppercase">{emp.location}</div>
                </td>
                <td className="p-4 text-sm text-brand-ink/60 group-hover:text-brand-bg/80 transition-colors font-mono">{emp.hireDate}</td>
                <td className="p-4 text-center text-sm font-mono">{emp.tenureYears}y</td>
                <td className="p-4 text-center">
                  <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${
                    emp.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {emp.status}
                  </span>
                </td>
                <td className="p-4">
                  {emp.terminationDate ? (
                    <div className="flex flex-col">
                      <span className="text-xs text-brand-ink/60 group-hover:text-brand-bg/80 font-mono">{emp.terminationDate}</span>
                      <span className="text-[9px] uppercase tracking-tighter text-red-500 font-bold">{emp.terminationType}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-brand-ink/20">—</span>
                  )}
                </td>
                <td className="p-4">
                  <button className="p-1 hover:bg-brand-ink/5 rounded">
                    <MoreHorizontal className="w-4 h-4 text-brand-ink/40" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {employees.length > 10 && (
        <div className="p-4 text-center border-t border-brand-line">
          <p className="text-xs text-brand-ink/40 font-medium italic">{t('showingFirstN')}</p>
        </div>
      )}
    </div>
  );
};
