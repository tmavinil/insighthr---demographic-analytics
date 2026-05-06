import React from 'react';
import Papa from 'papaparse';
import { Upload, CheckCircle2, AlertCircle, FileDown, Download } from 'lucide-react';
import { motion } from 'motion/react';
import { Employee } from '../types';

import { Language, TRANSLATIONS } from '../translations';

interface FileUploadProps {
  onDataLoaded: (data: Employee[]) => void;
  language: Language;
}

const REQUIRED_HEADERS = ['id', 'name', 'department', 'location', 'tenureYears', 'gender', 'age', 'hireDate', 'status', 'terminationDate', 'terminationType'];

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded, language }) => {
  const t = (key: keyof typeof TRANSLATIONS['en']) => {
    return TRANSLATIONS[language][key] || TRANSLATIONS['en'][key];
  };

  const [isDragging, setIsDragging] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const downloadTemplate = (type: 'blank' | 'sample') => {
    const headers = REQUIRED_HEADERS.join(',') + '\n';
    let content = headers;

    if (type === 'sample') {
      content += 'E001,John Doe,Engineering,San Francisco,3,Male,30,2021-01-01,Active,,\n';
      content += 'E002,Jane Smith,Marketing,London,1,Female,28,2023-05-15,Active,,\n';
      content += 'E003,Alex Rivera,Operations,New York,5,Non-binary,35,2019-11-10,Terminated,2024-01-10,Voluntary\n';
    }

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', type === 'blank' ? 'employee_template_blank.csv' : 'employee_template_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFile = (file: File) => {
    setError(null);
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv') && !file.name.endsWith('.json')) {
      setError('Please upload a CSV or JSON file.');
      return;
    }

    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          const headers = results.meta.fields || [];
          const missingHeaders = REQUIRED_HEADERS.filter(h => !headers.includes(h));

          if (missingHeaders.length > 0) {
            setError(`Invalid CSV structure. Missing columns: ${missingHeaders.join(', ')}`);
            return;
          }

          const raw = results.data as any[];
          const cleaned: Employee[] = raw.map((r, i) => ({
            id: String(r.id || i),
            name: r.name || 'Not Available',
            department: r.department || 'Not Available',
            location: r.location || 'Not Available',
            tenureYears: typeof r.tenureYears === 'number' ? r.tenureYears : 0,
            salary: typeof r.salary === 'number' ? r.salary : undefined,
            gender: r.gender || 'Not Available',
            age: typeof r.age === 'number' ? r.age : 0,
            hireDate: r.hireDate || new Date().toISOString(),
            status: r.status || 'Active',
            terminationDate: r.terminationDate || undefined,
            terminationType: r.terminationType || 'Not Available'
          }));
          onDataLoaded(cleaned);
        },
        error: (err) => setError(`Error parsing CSV: ${err.message}`)
      });
    } else {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                const data = Array.isArray(json) ? json : [json];
                
                // Simple JSON validation
                if (data.length > 0 && !REQUIRED_HEADERS.every(h => Object.keys(data[0]).includes(h))) {
                    setError('JSON file missing required employee fields.');
                    return;
                }

                onDataLoaded(data);
            } catch (err) {
                setError('Invalid JSON format.');
            }
        };
        reader.readAsText(file);
    }
  };

  return (
    <div className="w-full space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => downloadTemplate('blank')}
          className="flex items-center justify-center gap-3 p-4 bg-white border border-brand-line rounded-xl text-sm font-medium hover:bg-brand-ink hover:text-white transition-all shadow-sm"
        >
          <FileDown className="w-5 h-5" />
          <div className="text-left">
            <div>{t('downloadTemplate')}</div>
            <div className="text-[10px] opacity-60 uppercase font-bold tracking-tighter">{t('headersOnly')}</div>
          </div>
        </button>
        <button
          onClick={() => downloadTemplate('sample')}
          className="flex items-center justify-center gap-3 p-4 bg-white border border-brand-line rounded-xl text-sm font-medium hover:bg-brand-ink hover:text-white transition-all shadow-sm"
        >
          <Download className="w-5 h-5 transition-transform group-hover:translate-y-1" />
          <div className="text-left">
            <div>{t('downloadSample')}</div>
            <div className="text-[10px] opacity-60 uppercase font-bold tracking-tighter">{t('withDummy')}</div>
          </div>
        </button>
      </div>

      <motion.div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
        }}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 flex flex-col items-center gap-4 transition-all
          ${isDragging ? 'border-brand-ink bg-brand-ink/5 scale-[0.99]' : 'border-brand-line hover:border-brand-ink/20 hover:bg-white/40 shadow-sm'}
        `}
      >
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-brand-line group-hover:scale-110 transition-transform">
          <Upload className="w-8 h-8 text-brand-ink" />
        </div>
        
        <div className="text-center">
          <p className="text-lg font-semibold">{t('dropFiles')}</p>
          <p className="text-sm text-brand-ink/40 mt-1">{t('templateMatch')}</p>
        </div>

        <input
          id="file-upload"
          type="file"
          accept=".csv,.json"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="hidden"
        />
        
        <label
          htmlFor="file-upload"
          className="mt-2 px-8 py-3 bg-brand-ink text-brand-bg rounded-lg text-sm font-semibold hover:opacity-90 cursor-pointer shadow-lg active:scale-95 transition-transform"
        >
          {t('browseFiles')}
        </label>

        {error && (
          <div className="absolute -bottom-16 left-0 right-0 flex items-center justify-center gap-2 text-red-500 text-xs font-semibold bg-red-50 p-3 rounded-lg border border-red-100 italic">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-40 hover:opacity-100 transition-opacity pt-4">
          <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-[10px] uppercase font-bold tracking-widest">{t('localPrivacy')}</span>
          </div>
          <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-[10px] uppercase font-bold tracking-widest">{t('validationLogic')}</span>
          </div>
          <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-[10px] uppercase font-bold tracking-widest">{t('smartMapping')}</span>
          </div>
      </div>
    </div>
  );
};
