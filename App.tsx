
import React, { useState, useEffect } from 'react';
import { Project, Subcontractor, Contract, Transaction, ProgressPayment } from './types';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import ProjectForm from './components/ProjectForm';
import SubcontractorList from './components/SubcontractorList';
import SubcontractorDetail from './components/SubcontractorDetail';
import AddSubcontractorForm from './components/AddSubcontractorForm';
import ProgressPaymentForm from './components/ProgressPaymentForm';
import ContractForm from './components/ContractForm';
import TransactionList from './components/TransactionList';
import TransactionForm from './components/TransactionForm';
import Reports from './components/Reports';
import AllPaymentsList from './components/AllPaymentsList';
import ContractSummaryList from './components/ContractSummaryList';
import Settings from './components/Settings';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  History, 
  BarChart3, 
  Settings as SettingsIcon,
  CreditCard,
  FileText
} from 'lucide-react';

const App: React.FC = () => {
  // Fix: Reconstruct full App state and component structure to solve "Cannot find name" errors
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('projects');
    return saved ? JSON.parse(saved) : [];
  });
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>(() => {
    const saved = localStorage.getItem('subcontractors');
    return saved ? JSON.parse(saved) : [];
  });
  const [contracts, setContracts] = useState<Contract[]>(() => {
    const saved = localStorage.getItem('contracts');
    return saved ? JSON.parse(saved) : [];
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeView, setActiveView] = useState('dashboard');
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => localStorage.setItem('projects', JSON.stringify(projects)), [projects]);
  useEffect(() => localStorage.setItem('subcontractors', JSON.stringify(subcontractors)), [subcontractors]);
  useEffect(() => localStorage.setItem('contracts', JSON.stringify(contracts)), [contracts]);
  useEffect(() => localStorage.setItem('transactions', JSON.stringify(transactions)), [transactions]);

  // Handlers
  const handleAddProject = (project: Project) => {
    setProjects([...projects, project]);
    setActiveView('projects');
  };

  const handleAddSubcontractor = (sub: Subcontractor) => {
    setSubcontractors([...subcontractors, sub]);
    setActiveView('subcontractors');
  };

  const handleAddContract = (contract: Contract) => {
    setContracts([...contracts, contract]);
    setActiveView('contracts');
  };

  const handleAddTransaction = (transaction: Transaction) => {
    setTransactions([...transactions, transaction]);
    setActiveView('transactions');
  };

  const handleUpdateSubcontractor = (updatedSub: Subcontractor) => {
    setSubcontractors(subcontractors.map(s => s.id === updatedSub.id ? updatedSub : s));
  };

  const handleAddPayment = (payment: ProgressPayment) => {
    if (!selectedSubId) return;
    const sub = subcontractors.find(s => s.id === selectedSubId);
    if (!sub) return;

    const updatedSub = {
      ...sub,
      progressPayments: [...(sub.progressPayments || []), payment]
    };
    handleUpdateSubcontractor(updatedSub);
    
    // Also update associated contract
    const contract = contracts.find(c => c.subcontractorId === selectedSubId);
    if (contract) {
      setContracts(contracts.map(c => c.id === contract.id ? {
        ...c,
        progressPayments: [...c.progressPayments, payment]
      } : c));
    }

    setActiveView('subcontractor-detail');
  };

  const handleApprovePayment = (paymentId: string) => {
    if (!selectedSubId) return;
    const sub = subcontractors.find(s => s.id === selectedSubId);
    if (!sub) return;

    const payment = sub.progressPayments?.find(p => p.id === paymentId);
    if (!payment) return;

    const updatedPayments = sub.progressPayments?.map(p => 
      p.id === paymentId ? { ...p, status: 'Approved' as const } : p
    ) || [];

    handleUpdateSubcontractor({ ...sub, progressPayments: updatedPayments });

    // Update contract payments status
    setContracts(contracts.map(c => ({
      ...c,
      progressPayments: c.progressPayments?.map(p => p.id === paymentId ? { ...p, status: 'Approved' as const } : p) || []
    })));

    // Generate transaction entry for the approved payment
    const contract = contracts.find(c => c.id === payment.contractId);
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      projectId: contract?.projectId || projects[0]?.id || '',
      type: 'expense',
      category: 'Taşeron Hakedişi',
      amount: payment.summary.netPayable,
      date: new Date().toISOString(),
      description: `${sub.name} Hakediş #${payment.number} Ödemesi`
    };
    setTransactions(prev => [...prev, newTransaction]);
  };

  const handleResetData = () => {
    setProjects([]);
    setSubcontractors([]);
    setContracts([]);
    setTransactions([]);
    localStorage.clear();
    setActiveView('dashboard');
  };

  const handleImportData = (data: any) => {
    if (data.projects) setProjects(data.projects);
    if (data.subcontractors) setSubcontractors(data.subcontractors);
    if (data.contracts) setContracts(data.contracts);
    if (data.transactions) setTransactions(data.transactions);
    setActiveView('dashboard');
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard subcontractors={subcontractors} projects={projects} contracts={contracts} transactions={transactions} />;
      case 'projects':
        return <ProjectList projects={projects} contracts={contracts} transactions={transactions} onAdd={() => setActiveView('add-project')} onSelect={() => {}} />;
      case 'add-project':
        return <ProjectForm onCancel={() => setActiveView('projects')} onSave={handleAddProject} />;
      case 'subcontractors':
        return (
          <SubcontractorList 
            subcontractors={subcontractors} 
            onSelect={(id) => { setSelectedSubId(id); setActiveView('subcontractor-detail'); }} 
            onAdd={() => setActiveView('add-subcontractor')} 
          />
        );
      case 'add-subcontractor':
        return <AddSubcontractorForm onCancel={() => setActiveView('subcontractors')} onSave={handleAddSubcontractor} />;
      case 'subcontractor-detail':
        const sub = subcontractors.find(s => s.id === selectedSubId);
        return sub ? (
          <SubcontractorDetail 
            subcontractor={sub} 
            onBack={() => setActiveView('subcontractors')} 
            onNewPayment={() => setActiveView('add-payment')}
            onApprovePayment={handleApprovePayment}
            onUpdate={handleUpdateSubcontractor}
          />
        ) : null;
      case 'add-payment':
        const pSub = subcontractors.find(s => s.id === selectedSubId);
        return pSub ? <ProgressPaymentForm subcontractor={pSub} onCancel={() => setActiveView('subcontractor-detail')} onSave={handleAddPayment} /> : null;
      case 'contracts':
        return (
          <ContractSummaryList 
            contracts={contracts} 
            projects={projects} 
            subcontractors={subcontractors} 
            onSelectContract={(id) => { 
              const c = contracts.find(ct => ct.id === id);
              if(c) { setSelectedSubId(c.subcontractorId); setActiveView('subcontractor-detail'); }
            }} 
          />
        );
      case 'add-contract':
        return <ContractForm projects={projects} subcontractors={subcontractors} onCancel={() => setActiveView('contracts')} onSave={handleAddContract} />;
      case 'transactions':
        return <TransactionList transactions={transactions} projects={projects} onAdd={() => setActiveView('add-transaction')} />;
      case 'add-transaction':
        return <TransactionForm projects={projects} onCancel={() => setActiveView('transactions')} onSave={handleAddTransaction} />;
      case 'reports':
        return (
          <Reports 
            subcontractors={subcontractors} 
            transactions={transactions} 
            contracts={contracts} 
            projects={projects} 
            onNewPayment={(id) => {
              const c = contracts.find(ct => ct.id === id);
              if(c) { setSelectedSubId(c.subcontractorId); setActiveView('add-payment'); }
            }}
          />
        );
      case 'all-payments':
        return <AllPaymentsList contracts={contracts} subcontractors={subcontractors} onSelectContract={(id) => {
          const c = contracts.find(ct => ct.id === id);
          if(c) { setSelectedSubId(c.subcontractorId); setActiveView('subcontractor-detail'); }
        }} />;
      case 'settings':
        return <Settings onResetData={handleResetData} onImportData={handleImportData} allData={{ projects, subcontractors, contracts, transactions }} />;
      default:
        return <Dashboard subcontractors={subcontractors} projects={projects} contracts={contracts} transactions={transactions} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 flex md:flex-col md:w-20 md:h-screen md:border-t-0 md:border-r z-50 justify-around md:justify-center md:gap-4 no-print">
        <NavItem icon={<LayoutDashboard />} label="Özet" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
        <NavItem icon={<Building2 />} label="Projeler" active={activeView === 'projects'} onClick={() => setActiveView('projects')} />
        <NavItem icon={<Users />} label="Taşeron" active={activeView === 'subcontractors'} onClick={() => setActiveView('subcontractors')} />
        <NavItem icon={<FileText />} label="Sözleşme" active={activeView === 'contracts'} onClick={() => setActiveView('contracts')} />
        <NavItem icon={<CreditCard />} label="Kasa" active={activeView === 'transactions'} onClick={() => setActiveView('transactions')} />
        <NavItem icon={<History />} label="Kayıtlar" active={activeView === 'all-payments'} onClick={() => setActiveView('all-payments')} />
        <NavItem icon={<BarChart3 />} label="Rapor" active={activeView === 'reports'} onClick={() => setActiveView('reports')} />
        <NavItem icon={<SettingsIcon />} label="Ayarlar" active={activeView === 'settings'} onClick={() => setActiveView('settings')} />
      </nav>

      <main className="flex-1 p-4 md:p-10 md:pl-24 overflow-y-auto h-screen pb-24 md:pb-10">
        {renderView()}
      </main>
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all gap-1 ${active ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
  >
    <div className="w-6 h-6">{icon}</div>
    <span className="text-[8px] font-black uppercase tracking-tighter">{label}</span>
  </button>
);

export default App;
