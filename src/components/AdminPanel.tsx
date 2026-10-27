import React, { useState } from 'react';
import { Target, BarChart3, Clock, ListOrdered, Edit3, Check, X } from 'lucide-react';
import { OwnerWinLossReport } from './OwnerWinLossReport';
import { RoundResult } from '../types/yuki';

export const AdminPanel: React.FC<{
  lang: 'km' | 'en';
  betSlips: any[];
  recentResults: RoundResult[];
  activeBets: any[];
}> = ({ lang, betSlips, recentResults, activeBets }) => {
  const [forcedNumber, setForcedNumber] = useState<number>(1);
  const [editingResult, setEditingResult] = useState<{roundId: string, drawDate: string, number: number} | null>(null);

  const handleForceResult = async () => {
    await fetch('/api/admin/force-result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ number: forcedNumber }),
    });
    alert(`Forced next result to ${forcedNumber}`);
  };

  const handleUpdateResult = async (roundId: string, date: string, number: number) => {
    await fetch('/api/admin/update-result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roundId, date, number }),
    });
    setEditingResult(null);
    window.location.reload(); // Quick refresh to update data
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-black text-slate-900">Admin Control Panel</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Next Result
          </h3>
          <div className="flex gap-2">
              <input 
                  type="number" 
                  value={forcedNumber} 
                  onChange={(e) => setForcedNumber(Number(e.target.value))}
                  className="border p-2 rounded w-16"
                  min="1" max="12"
              />
              <button 
                  onClick={handleForceResult}
                  className="bg-blue-600 text-white px-3 py-1 rounded font-bold hover:bg-blue-700 text-sm"
              >
                  Force
              </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              Upload Image
          </h3>
          <input 
              type="file" 
              onChange={(e) => {
                  const file = e.target.files?.[0];
                  if(file) {
                      const reader = new FileReader();
                      reader.onloadend = async () => {
                          await fetch('/api/admin/upload-image', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ imageData: reader.result, filename: file.name }),
                          });
                          alert('Image uploaded successfully');
                      }
                      reader.readAsDataURL(file);
                  }
              }}
              className="border p-1 rounded w-full text-sm"
          />
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              Active Bets ({activeBets.length})
          </h3>
          <div className="max-h-20 overflow-y-auto">
            {activeBets.length === 0 ? <p className="text-xs text-slate-500">No active bets</p> : (
                <ul className="space-y-1">
                    {activeBets.slice(0,3).map(bet => (
                        <li key={bet.id} className="text-xs border-b pb-1">
                            {bet.label}: {bet.amount.toLocaleString()} ៛
                        </li>
                    ))}
                </ul>
            )}
          </div>
        </div>
      </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow border">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-purple-600" />
            Recent Results
        </h3>
        <div className="max-h-60 overflow-y-auto text-sm">
          {recentResults.length === 0 ? <p className="text-slate-500">No results</p> : (
            <table className="w-full text-left">
              <thead>
                <tr><th>Round</th><th>Date</th><th>Time</th><th>Number</th><th>Action</th></tr>
              </thead>
              <tbody>
                {recentResults.slice(0, 10).map(r => (
                  <tr key={`${r.drawDate}-${r.roundId}`} className="border-b">
                    <td>{r.roundId}</td>
                    <td>{r.drawDate}</td>
                    <td>{r.drawTime}</td>
                    <td className="font-bold">
                        {editingResult?.roundId === r.roundId ? (
                            <input 
                                type="number" 
                                value={editingResult.number} 
                                onChange={(e) => setEditingResult({...editingResult, number: Number(e.target.value)})}
                                className="border p-1 w-12"
                            />
                        ) : (
                            <>{r.number} ({r.khmerName})</>
                        )}
                    </td>
                    <td>
                        {editingResult?.roundId === r.roundId ? (
                            <div className="flex gap-1">
                                <button onClick={() => handleUpdateResult(r.roundId, r.drawDate, editingResult.number)} className="text-green-600"><Check /></button>
                                <button onClick={() => setEditingResult(null)} className="text-red-600"><X /></button>
                            </div>
                        ) : (
                            <button onClick={() => setEditingResult({roundId: r.roundId, drawDate: r.drawDate, number: r.number})} className="text-blue-600"><Edit3 size={16}/></button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow border">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            Owner Win/Loss Report
        </h3>
        <OwnerWinLossReport 
            lang={lang}
            betSlips={betSlips}
            balance={200000}
            onBackToGame={() => {}}
        />
      </div>
    </div>
  );
// Forced rebuild
};
