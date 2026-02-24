'use client';

import React, { useState, useEffect } from 'react';
import { Icon, Button, Card, Input, Select, Alert } from '@stellar/design-system';
import { EmployeeList } from '../../components/EmployeeList';
import { AutosaveIndicator } from '../../components/AutosaveIndicator';
import { WalletQRCode } from '../../components/WalletQRCode';
import { useAutosave } from '../../hooks/useAutosave';
import { generateWallet } from '../../services/stellar';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../../hooks/useNotification';

interface EmployeeFormState {
  fullName: string;
  walletAddress: string;
  role: string;
  currency: string;
}

interface EmployeeItem {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
  position: string;
  wallet?: string;
  status?: 'Active' | 'Inactive';
}

const initialFormState: EmployeeFormState = {
  fullName: '',
  walletAddress: '',
  role: 'contractor',
  currency: 'USDC',
};

const mockEmployees: EmployeeItem[] = [
  {
    id: '1',
    name: 'Wilfred G.',
    email: 'wilfred@example.com',
    imageUrl: '',
    position: 'Lead Developer',
    wallet: 'GDUKMGUGKAAZBAMNSMUA4Y6G4XDSZPSZ3SW5UN3ARVMO6QSRDWP5YLEXT2U2D6',
    status: 'Active',
  },
  {
    id: '2',
    name: 'Chinelo A.',
    email: 'chinelo@example.com',
    imageUrl: '',
    position: 'Product Manager',
    wallet: 'GDUKMGUGKAAZBAMNSMUA4Y6G4XDSZPSZ3SW5UN3ARVMO6QSRDWP5YLEXT2U2D6',
    status: 'Active',
  },
];

export default function EmployeeEntry() {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<EmployeeFormState>(initialFormState);
  const [notification, setNotification] = useState<{
    message: string;
    secretKey?: string;
    walletAddress?: string;
    employeeName?: string;
  } | null>(null);
  const { notifySuccess } = useNotification();
  const { saving, lastSaved, loadSavedData } = useAutosave<EmployeeFormState>(
    'employee-entry-draft',
    formData
  );
  const { t } = useTranslation();

  useEffect(() => {
    const saved = loadSavedData();
    if (saved) {
      setFormData(saved);
    }
  }, [loadSavedData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let generatedWallet: { publicKey: string; secretKey: string } | undefined;
    if (!formData.walletAddress) {
      generatedWallet = generateWallet();
      setFormData((prev) => ({
        ...prev,
        walletAddress: generatedWallet!.publicKey,
      }));
    }

    const submitData = {
      ...formData,
      walletAddress: generatedWallet ? generatedWallet.publicKey : formData.walletAddress,
    };

    notifySuccess(
      `${submitData.fullName} added successfully!`,
      generatedWallet ? 'A new Stellar wallet was generated for this employee.' : undefined
    );

    setNotification({
      message: `Employee ${submitData.fullName} added successfully! ${
        generatedWallet ? 'A wallet was created for them.' : ''
      }`,
      secretKey: generatedWallet?.secretKey,
      walletAddress: submitData.walletAddress,
      employeeName: submitData.fullName,
    });
  };

  if (isAdding) {
    return (
      <div className="max-w-[600px] mx-auto my-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsAdding(false)}
              className="text-muted hover:text-white transition-colors"
            >
              <Icon.ArrowLeft />
            </button>
            <h1 className="font-bold text-2xl m-0">Add New Employee</h1>
          </div>
          <AutosaveIndicator saving={saving} lastSaved={lastSaved} />
        </div>

        {notification && notification.walletAddress && (
          <div className="mb-6">
            <WalletQRCode
              walletAddress={notification.walletAddress}
              secretKey={notification.secretKey}
              employeeName={notification.employeeName}
            />
          </div>
        )}

        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <Input
              id="fullName"
              fieldSize="md"
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Jane Smith"
              required
            />
            <Input
              id="walletAddress"
              fieldSize="md"
              label="Stellar Wallet Address (Optional)"
              note="If no wallet is provided, a claimable balance will be created using a new wallet generated for them."
              name="walletAddress"
              value={formData.walletAddress}
              onChange={handleChange}
              placeholder="Leave blank to generate a wallet"
            />
            <Select
              id="role"
              fieldSize="md"
              label="Role"
              value={formData.role}
              onChange={(e) => handleSelectChange('role', e.target.value)}
            >
              <option value="contractor">Contractor</option>
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
            </Select>
            <Button type="submit" variant="primary" size="md">
              Add Employee
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-12 max-w-6xl mx-auto w-full">
      <div className="w-full mb-12 flex items-end justify-between border-b border-hi pb-8">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tight">
            {t('employees.title', { highlight: '' }).replace('{{highlight}}', '')}
            <span className="text-accent"> {t('employees.titleHighlight')}</span>
          </h1>
          <p className="text-muted font-mono text-sm tracking-wider uppercase">
            {t('employees.subtitle')}
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="px-5 py-2.5 bg-accent text-bg font-bold rounded-lg hover:bg-accent/90 transition-all flex items-center gap-2 text-sm shadow-lg shadow-accent/10"
        >
          <Icon.Plus size="sm" />
          {t('employees.addEmployee')}
        </button>
      </div>

      <EmployeeList
        employees={mockEmployees}
        onEmployeeClick={(employee) => console.log('Clicked:', employee.name)}
      />
    </div>
  );
}
