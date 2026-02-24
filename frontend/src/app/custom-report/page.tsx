'use client';

import React, { useState, useMemo } from 'react';
import { Button, Card, Icon } from '@stellar/design-system';

type ReportColumn = {
  id: string;
  label: string;
};

const ALL_COLUMNS: ReportColumn[] = [
  { id: 'worker_id', label: 'Worker ID' },
  { id: 'amount', label: 'Amount' },
  { id: 'asset', label: 'Asset' },
  { id: 'setup_date', label: 'Stream Setup Date' },
  { id: 'payout_date', label: 'Expected Payout Date' },
  { id: 'status', label: 'Status' },
];

const MOCK_DATA = [
  {
    worker_id: 'W-1001',
    amount: '500.00',
    asset: 'USDC',
    setup_date: '2026-02-01',
    payout_date: '2026-02-15',
    status: 'Paid',
  },
];

export default function CustomReportBuilder() {
  const [selectedColumns, setSelectedColumns] = useState<string[]>(ALL_COLUMNS.map((c) => c.id));
  const [startDate, setStartDate] = useState<string>('2026-02-01');
  const [endDate, setEndDate] = useState<string>('2026-02-28');

  const toggleColumn = (colId: string) => {
    setSelectedColumns((prev) =>
      prev.includes(colId) ? prev.filter((id) => id !== colId) : [...prev, colId]
    );
  };

  const activeColumns = ALL_COLUMNS.filter((c) => selectedColumns.includes(c.id));

  const filteredData = useMemo(() => {
    return MOCK_DATA.filter((row) => {
      const rowDate = new Date(row.setup_date);
      const start = startDate ? new Date(startDate) : new Date('2000-01-01');
      const end = endDate ? new Date(endDate) : new Date('2100-01-01');
      return rowDate >= start && rowDate <= end;
    });
  }, [startDate, endDate]);

  const handleExport = () => {
    alert(`Exporting ${filteredData.length} records`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Custom Report Builder</h1>
        <p className="text-muted">
          Select columns and date ranges to preview and export custom payroll data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-6 flex flex-col">
          <Card>
            <div className="p-4 space-y-4">
              <h3 className="font-semibold text-lg border-b border-hi pb-2">Date Range</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-muted mb-1">Start Date</label>
                  <input
                    type="date"
                    className="w-full border-hi rounded-md shadow-sm p-2 bg-black/20 text-white"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-1">End Date</label>
                  <input
                    type="date"
                    className="w-full border-hi rounded-md shadow-sm p-2 bg-black/20 text-white"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-4 space-y-4">
              <h3 className="font-semibold text-lg border-b border-hi pb-2">Columns</h3>
              <div className="space-y-2">
                {ALL_COLUMNS.map((col) => (
                  <label key={col.id} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-accent rounded border-hi bg-black/20"
                      checked={selectedColumns.includes(col.id)}
                      onChange={() => toggleColumn(col.id)}
                    />
                    <span className="text-muted text-sm">{col.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </Card>

          <Button
            onClick={handleExport}
            variant="primary"
            size="md"
            className="w-full flex justify-center mt-auto"
          >
            <Icon.DownloadCloud01 className="mr-2" />
            Export Data
          </Button>
        </div>

        <div className="md:col-span-3">
          <Card>
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-xl">Live Preview</h3>
                <span className="text-sm text-muted bg-hi px-3 py-1 rounded-full">
                  {filteredData.length} records found
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-hi">
                  <thead>
                    <tr>
                      {activeColumns.map((col) => (
                        <th
                          key={col.id}
                          className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider"
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hi">
                    {filteredData.map((row) => (
                      <tr key={row.worker_id} className="hover:bg-white/5">
                        {activeColumns.map((col) => (
                          <td
                            key={col.id}
                            className="px-6 py-4 whitespace-nowrap text-sm text-text"
                          >
                            {row[col.id as keyof typeof row]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
