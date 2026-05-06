import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  isPositive?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon: Icon, change, isPositive }) => {
  return (
    <div className="glass-card p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-brand-ink/5 rounded-lg">
          <Icon className="w-5 h-5 text-brand-ink/60" />
        </div>
        {change && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {change}
          </span>
        )}
      </div>
      <div>
        <p className="text-xs font-medium text-brand-ink/40 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-3xl font-light tracking-tight">{value}</p>
      </div>
    </div>
  );
};
