
import React, { useState } from 'react';
import { House, SukanekaResults, HouseRankResult, HouseStandings } from '../types';

interface SukanekaTabProps {
  results: SukanekaResults;
  onUpdate: (results: SukanekaResults) => void;
  standings: HouseStandings[];
  onUpdateStandings: (standings: HouseStandings[]) => void;
  userRole?: 'ADMIN' | 'KETUA_RUMAH' | null;
}

const EVENTS = [
  'Sukaneka Tahun 1', 'Sukaneka Tahun 2', 'Sukaneka Tahun 3', 'Sukaneka Tahun 4', 'Sukaneka Tahun 5', 'Sukaneka Tahun 6', 'Sukaneka PPKI', 'Tarik Tali (Lelaki)', 'Tarik Tali (Perempuan)'
];

const HOUSE_COLORS: Record<House, string> = {
  [House.BIRU]: '#3b82f6',
  [House.HIJAU]: '#10b981',
  [House.KUNING]: '#f59e0b',
  [House.MERAH]: '#f43f5e'
};

const LOGO_URL = 'https://lh3.googleusercontent.com/d/1KOLgY94nBJgs6UK6Gwo_eGmmeV6Jexsu';

export const SukanekaTab: React.FC<SukanekaTabProps> = ({ results, onUpdate, standings, onUpdateStandings, userRole }) => {
  const [editingHouse, setEditingHouse] = useState<House | null>(null);
  const theme = userRole === 'ADMIN' ? 'indigo' : 'orange';
  const themeAccent = userRole === 'ADMIN' ? 'violet' : 'amber';

  const handleUpdate = (eventName: string, pos: keyof HouseRankResult, house: House | '') => {
    const currentEvent = results[eventName] || { first: '', second: '', third: '', fourth: '' };
    onUpdate({ ...results, [eventName]: { ...currentEvent, [pos]: house } });
  };

  const handleUpdateSukantara = (house: House, value: number) => {
    onUpdateStandings(standings.map(s => s.house === house ? { ...s, sukantara: value } : s));
  };

  const handlePrintSukantara = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const html = `
      <html><head><title>Keputusan Rasmi Markah Sukantara</title><style>body { font-family: 'Arial', sans-serif; padding: 40px; color: #333; line-height: 1.6; } .logo-container { text-align: center; } .header { text-align: center; border-bottom: 3px solid #000; padding-bottom: 20px; } .results-table { width: 100%; border-collapse: collapse; margin-top: 20px; } .results-table th, .results-table td { border: 1px solid #000; padding: 15px; text-align: center; } .footer { margin-top: 80px; display: flex; justify-content: space-between; } .sig-box { border-top: 1px solid #000; width: 250px; text-align: center; padding-top: 10px; font-weight: bold; }</style></head>
      <body><div class="logo-container"><img src="${LOGO_URL}" height="80"></div><div class="header"><h1>KEJOHANAN OLAHRAGA TAHUNAN 2026</h1><p>KEPUTUSAN RASMI MARKAH SUKANTARA</p></div><table class="results-table"><thead><tr><th>BIL</th><th>RUMAH SUKAN</th><th>MARKAH SUKANTARA</th></tr></thead><tbody>${Object.values(House).map((h, idx) => `<tr><td>${idx + 1}</td><td>RUMAH ${h.toUpperCase()}</td><td>${standings.find(s => s.house === h)?.sukantara || 0}</td></tr>`).join('')}</tbody></table><div class="footer"><div class="sig-box">Penyelaras Sukantara</div><div class="sig-box">Setiausaha Sukan</div></div><script>window.onload = function(){ setTimeout(function(){ window.print(); window.close(); }, 500); };</script></body></html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handlePrintAll = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const html = `
      <html><head><title>Keputusan Rasmi Sukaneka</title><style>body { font-family: 'Arial', sans-serif; padding: 40px; color: #333; } .results-table { width: 100%; border-collapse: collapse; } .results-table th, .results-table td { border: 1px solid #000; padding: 10px; text-align: center; }</style></head>
      <body><h1>KEJOHANAN OLAHRAGA TAHUNAN 2026 - SUKANEKA</h1><table class="results-table"><thead><tr><th>ACARA</th><th>JOHAN (10)</th><th>NAIB JOHAN (7)</th><th>KETIGA (5)</th><th>KEEMPAT (3)</th></tr></thead><tbody>${EVENTS.map(event => { const res = results[event] || { first: '', second: '', third: '', fourth: '' }; return `<tr><td>${event.toUpperCase()}</td><td>${res.first || '-'}</td><td>${res.second || '-'}</td><td>${res.third || '-'}</td><td>${res.fourth || '-'}</td></tr>`; }).join('')}</tbody></table><script>window.onload = function(){ window.print(); window.close(); };</script></body></html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const Selector = ({ eventName, pos, label }: { eventName: string, pos: keyof HouseRankResult, label: string }) => {
    const value = (results[eventName] || { first: '', second: '', third: '', fourth: '' })[pos];
    return (
      <div className="flex flex-col gap-1.5">
        <label className={`text-[9px] font-black text-${theme}-400 uppercase tracking-widest ml-1`}>{label}</label>
        <select value={value} onChange={(e) => handleUpdate(eventName, pos, e.target.value as House | '')} style={value ? { color: 'white', backgroundColor: HOUSE_COLORS[value as House] } : {}} className={`w-full p-3 rounded-xl border-2 border-${theme}-50 font-bold text-xs outline-none transition-all appearance-none ${!value ? `bg-white text-${theme}-300` : 'shadow-md border-transparent'}`}>
          <option value="" style={{ color: '#ea580c', backgroundColor: 'white' }}>-- Pilih Rumah --</option>
          {Object.values(House).map(h => <option key={h} value={h} style={{ color: 'white', backgroundColor: HOUSE_COLORS[h] }}>Rumah {h}</option>)}
        </select>
      </div>
    );
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className={`bg-white rounded-[2rem] md:rounded-[3rem] shadow-xl border border-${theme}-50 p-6 md:p-10`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h2 className={`text-xl md:text-2xl font-bold text-${theme}-950 uppercase`}>Markah Sukantara</h2>
          <button onClick={handlePrintSukantara} className={`flex items-center gap-2 bg-${theme}-50 hover:bg-${theme}-100 text-${theme}-600 px-4 py-2 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest border border-${theme}-100 shadow-sm`}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>Cetak Keputusan Rasmi Sukantara</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {Object.values(House).map(h => {
            const hs = standings.find(s => s.house === h);
            const isActive = editingHouse === h;
            return (
              <button key={h} onClick={() => setEditingHouse(isActive ? null : h)} className={`p-4 md:p-6 rounded-2xl md:rounded-[2rem] border-2 transition-all flex flex-col items-center gap-2 md:gap-3 ${isActive ? `border-${theme}-600 bg-${theme}-50` : `border-${theme}-50 bg-white`}`}>
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center font-sporty text-xl md:text-2xl text-white shadow-md" style={{ backgroundColor: HOUSE_COLORS[h] }}>{h.charAt(0)}</div>
                <div className="text-center"><span className={`font-black text-${theme}-950 uppercase text-[8px] md:text-[10px] tracking-widest`}>{h}</span><span className={`text-base md:text-xl font-sporty text-${theme}-600 block leading-none mt-1`}>{hs ? hs.sukantara : 0} Pts</span></div>
              </button>
            );
          })}
        </div>
        {editingHouse && (
          <div className={`mt-8 p-6 md:p-10 bg-${theme}-950 rounded-[2rem] animate-in slide-in-from-top-4`}>
            <h4 className="text-lg font-bold text-white uppercase mb-4 text-center">Update Sukantara: {editingHouse}</h4>
            <div className="max-w-xs mx-auto"><input type="number" min="0" value={standings.find(s => s.house === editingHouse)!.sukantara} onChange={e => handleUpdateSukantara(editingHouse, parseInt(e.target.value) || 0)} className={`w-full bg-${theme}-900/50 border-2 border-${theme}-800 rounded-2xl p-4 md:p-6 outline-none text-4xl md:text-5xl font-sporty text-center text-white focus:border-${themeAccent}-500`} /><button onClick={() => setEditingHouse(null)} className={`w-full mt-4 bg-${theme}-600 py-3 md:py-4 rounded-xl text-white font-black uppercase text-[10px] tracking-widest`}>Simpan</button></div>
          </div>
        )}
      </div>
      <div className={`flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-xl border border-${theme}-50`}>
        <div><h2 className={`text-4xl font-bold text-${theme}-950 tracking-tight uppercase`}>Keputusan Sukaneka & Tarik Tali</h2><p className={`text-${theme}-400 text-sm mt-1 font-medium italic`}>Markah: Johan(10), Naib Johan(7), Ketiga(5), Keempat(3).</p></div>
        <button onClick={handlePrintAll} className={`flex items-center gap-3 bg-${theme}-600 hover:bg-${theme}-700 text-white px-8 py-4 rounded-2xl transition-all shadow-xl shadow-${theme}-200 active:scale-95 group`}><svg className="w-5 h-5 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg><span className="text-xs font-black uppercase tracking-widest">Cetak Keputusan Rasmi</span></button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {EVENTS.map(event => (
          <div key={event} className={`bg-white rounded-[2.5rem] shadow-xl border border-${theme}-50 overflow-hidden flex flex-col group hover:shadow-2xl transition-all`}>
            <div className={`p-6 bg-${theme}-50/50 border-b border-${theme}-100 flex justify-between items-center`}><h3 className={`font-bold text-${theme}-950 text-lg uppercase leading-tight`}>{event}</h3><div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm"><svg className={`w-4 h-4 text-${theme}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /></svg></div></div>
            <div className="p-6 grid grid-cols-2 gap-4"><Selector eventName={event} pos="first" label="Johan (10pts)" /><Selector eventName={event} pos="second" label="Naib Johan (7pts)" /><Selector eventName={event} pos="third" label="Ketiga (5pts)" /><Selector eventName={event} pos="fourth" label="Keempat (3pts)" /></div>
          </div>
        ))}
      </div>
    </div>
  );
};
