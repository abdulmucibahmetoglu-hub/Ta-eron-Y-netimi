
export enum UnitType {
  M2 = 'm²',
  M3 = 'm³',
  MT = 'mt',
  ADET = 'Adet',
  TON = 'Ton',
  KG = 'Kg',
  LS = 'Lump-sum'
}

export interface WorkItem {
  id: string;
  pozNo?: string;
  description: string;
  unit: UnitType;
  unitPrice: number;
  contractQuantity: number;
  completedQuantity: number;
}

export interface ContractDocument {
  id: string;
  url: string;
  name: string;
  uploadDate: string;
}

export interface Project {
  id: string;
  ikn?: string;
  name: string;
  client: string;
  location: string;
  startDate: string;
  endDate?: string;
  status: 'Devam Ediyor' | 'Tamamlandı' | 'Geçici Kabulde';
  totalBudget: number;
}

export interface Transaction {
  id: string;
  projectId: string;
  type: 'income' | 'expense';
  category: 'Hakediş Tahsilatı' | 'Taşeron Hakedişi' | 'Akaryakıt' | 'Malzeme' | 'Personel' | 'Kira' | 'Vergi' | 'Diğer';
  amount: number;
  date: string;
  description: string;
}

export interface Contract {
  id: string;
  projectId: string;
  subcontractorId: string;
  title: string;
  contractDate: string;
  totalValue: number;
  workItems: WorkItem[];
  progressPayments: ProgressPayment[];
  documents: ContractDocument[];
  status: 'Aktif' | 'Fesih' | 'Bitti';
}

export interface Subcontractor {
  id: string;
  name: string;
  trade: string;
  contactInfo?: string;
  taxNumber?: string;
  contractDate?: string;
  totalContractValue?: number;
  workItems?: WorkItem[];
  progressPayments?: ProgressPayment[];
  contractDocuments?: ContractDocument[];
}

export interface ProgressPayment {
  id: string;
  number: number;
  date: string;
  contractId: string;
  status: 'Pending' | 'Approved';
  items: {
    workItemId: string;
    thisPeriodQuantity: number;
    cumulativeQuantity: number;
  }[];
  summary: {
    previousTotal: number;
    currentTotal: number;
    cumulativeTotal: number;
    retentionAmount: number;
    stampDutyAmount: number;
    vatAmount: number;
    netPayable: number;
  };
}

export interface AppState {
  projects: Project[];
  subcontractors: Subcontractor[];
  contracts: Contract[];
  transactions: Transaction[];
}
