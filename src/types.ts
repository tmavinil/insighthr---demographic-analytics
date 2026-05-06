export interface Employee {
  id: string;
  name: string;
  department: string;
  location: string;
  tenureYears: number;
  salary?: number;
  gender: string;
  age: number;
  hireDate: string;
  terminationDate?: string;
  terminationType?: 'Voluntary' | 'Involuntary' | 'Not Available';
  status: 'Active' | 'On Leave' | 'Terminated';
}

export interface FilterState {
  departments: string[];
  locations: string[];
  tenureRange: [number, number];
  searchTerm: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface DashboardMetric {
  label: string;
  value: string | number;
  change?: number;
  prefix?: string;
  suffix?: string;
}
