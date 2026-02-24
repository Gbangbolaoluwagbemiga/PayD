'use client';

import React, { useState } from 'react';
import { anchorService } from '../../services/anchor';
import { Loader2, ArrowRightLeft, ShieldCheck, Info, CheckCircle2 } from 'lucide-react';
import { useNotification } from '../../hooks/useNotification';

interface Quote {
  rate: number;
  fee: number;
  total_out: number;
}

interface SEP31Transaction {
  id: string;
  status: string;
}

interface InitiationResult {
  id: string;
}

export default function CrossAssetPayment() {
  const { notifySuccess, notifyError } = useNotification();
  const [domain, setDomain] = useState('testanchor.stellar.org');
  const [assetIn, setAssetIn] = useState('USDC');
  const [assetOut, setAssetOut] = useState('NGN');
  const [amount, setAmount] = useState('');
  const [receiver, setReceiver] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [transaction, setTransaction] = useState<InitiationResult | SEP31Transaction | null>(null);
  const [status, setStatus] = useState<string>('idle');

  const fetchQuote = async () => {
    if (!amount || Number(amount) <= 0) return;
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setQuote({
        rate: 1550.25,
        fee: 2.5,
        total_out: Number(amount) * 1550.25 - 2.5,
      });
    } catch (error) {
      console.error(error);
      notifyError('Quote fetch failed', 'Could not retrieve conversion rate from anchor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitiate = async () => {
    setStatus('initiating');
    try {
      const result = await anchorService.initiatePayment(domain, 'S...MOCKED', {
        amount,
        asset_code: assetOut,
        receiver_id: receiver,
      });
      setTransaction(result);
      setStatus('pending');
      notifySuccess('Payment initiated', `Transaction ID: ${result.id}`);

      const interval = setInterval(() => {
        void (async () => {
          const statusUpdate = await anchorService.getTransactionStatus(
            domain,
            result.id,
            'S...MOCKED'
          );
          setTransaction(statusUpdate);
          if (statusUpdate.status === 'completed') {
            setStatus('completed');
            notifySuccess('Payment completed!', `${amount} ${assetIn} sent successfully.`);
            clearInterval(interval);
          }
        })();
      }, 3000);
    } catch (error) {
      setStatus('error');
      notifyError(
        'Payment failed',
        error instanceof Error ? error.message : 'An unexpected error occurred.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            SEP-31 Cross-Asset Payments
          </h1>
          <p className="text-zinc-400 mt-2">
            Send local assets, receive global value. Powered by Stellar Anchors.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#16161a] border border-zinc-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                  Anchor Domain
                </label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                    Send Asset
                  </label>
                  <select
                    value={assetIn}
                    onChange={(e) => setAssetIn(e.target.value)}
                    className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-xl px-4 py-3 outline-none"
                  >
                    <option>USDC</option>
                    <option>XLM</option>
                    <option>EURT</option>
                  </select>
                </div>
                <div className="mt-6">
                  <ArrowRightLeft className="text-zinc-600 h-6 w-6" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                    Receive Asset
                  </label>
                  <select
                    value={assetOut}
                    onChange={(e) => setAssetOut(e.target.value)}
                    className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-xl px-4 py-3 outline-none"
                  >
                    <option>NGN</option>
                    <option>BRL</option>
                    <option>ARS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                  Amount to Send
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    onBlur={() => {
                      void fetchQuote();
                    }}
                    placeholder="0.00"
                    className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-xl px-4 py-3 text-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">
                    {assetIn}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                  Receiver Address / ID
                </label>
                <input
                  type="text"
                  value={receiver}
                  onChange={(e) => setReceiver(e.target.value)}
                  placeholder="G... or local ID"
                  className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-xl px-4 py-3 outline-none"
                />
              </div>

              <button
                onClick={() => {
                  void handleInitiate();
                }}
                disabled={status !== 'idle' || !quote}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {status === 'initiating' ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  'Initiate Payment'
                )}
              </button>
            </div>
          </div>

          <div className="space-y-8">
            {quote && (
              <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-2xl p-8 shadow-xl">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
                  <ShieldCheck className="text-emerald-400" />
                  Live Conversion Rate
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-zinc-400">
                    <span>Rate</span>
                    <span className="text-white font-mono">
                      1 {assetIn} = {quote.rate} {assetOut}
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Anchor Fee</span>
                    <span className="text-white font-mono">
                      {quote.fee} {assetOut}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-zinc-800 flex justify-between">
                    <span className="text-zinc-400 font-bold">Receiver Gets</span>
                    <span className="text-2xl font-bold text-emerald-400 font-mono">
                      {quote.total_out.toLocaleString()} {assetOut}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
