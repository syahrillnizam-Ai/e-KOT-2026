
import React, { useState, useMemo } from 'react';
import { House, HouseStandings, Participant, EventResult, EventType } from '../types';
import { SPORT_EVENTS } from '../constants';

interface StandingsTabProps {
  standings: HouseStandings[];
  onUpdate: (data: HouseStandings[]) => void;
  participants: Participant[];
  results: EventResult[];
  userRole?: 'ADMIN' | 'KETUA_RUMAH' | null;
}

const HOUSE_COLORS: Record<House, string> = {
  [House.BIRU]: '#3b82f6',
  [House.HIJAU]: '#10b981',
  [House.KUNING]: '#f59e0b',
  [House.MERAH]: '#f43f5e'
};

const LOGO_URL = 'https://lh3.googleusercontent.com/d/1KOLgY94nBJgs6UK6Gwo_eGmmeV6Jexsu';

export const StandingsTab: React.FC<StandingsTabProps> = ({ standings, onUpdate, participants, results, userRole }) => {
  const theme = userRole === 'ADMIN' ? 'indigo' : 'orange';
  const themeAccent = userRole === 'ADMIN' ? 'violet' : 'amber';

  const calculateTotalPoints = (s: HouseStandings) => {
    // Individu: 5,3,2,1 | Team & Sukaneka: 10,7,5,3
    const indPoints = (s.emasInd * 5) + (s.perakInd * 3) + (s.gangsaInd * 2) + (s.keempatInd * 1);
    const teamPoints = (s.emasTeam * 10) + (s.perakTeam * 7) + (s.gangsaTeam * 5) + (s.keempatTeam * 3);
    return indPoints + teamPoints + Number(s.sukantara);
  };

  const calculateTotalMedals = (s: HouseStandings) => {
    return (s.emasInd + s.emasTeam) + (s.perakInd + s.perakTeam) + (s.gangsaInd + s.gangsaTeam) + (s.keempatInd + s.keempatTeam);
  };

  const sortedStandings = useMemo(() => {
    return [...standings].sort((a, b) => {
      // 1. Bandingkan Emas (Ind + Team + Sukaneka)
      const goldA = a.emasInd + a.emasTeam;
      const goldB = b.emasInd + b.emasTeam;
      if (goldB !== goldA) return goldB - goldA;

      // 2. Bandingkan Perak
      const silverA = a.perakInd + a.perakTeam;
      const silverB = b.perakInd + b.perakTeam;
      if (silverB !== silverA) return silverB - silverA;

      // 3. Bandingkan Gangsa
      const bronzeA = a.gangsaInd + a.gangsaTeam;
      const bronzeB = b.gangsaInd + b.gangsaTeam;
      if (bronzeB !== bronzeA) return bronzeB - bronzeA;

      // 4. Bandingkan Markah Keseluruhan (Tie-breaker)
      return calculateTotalPoints(b) - calculateTotalPoints(a);
    });
  }, [standings]);

  const athletePerformances = useMemo(() => {
    const scores: Record<string, { gold: number, silver: number, bronze: number, fourth: number, total: number }> = {};
    results.forEach(res => {
      const event = SPORT_EVENTS.find(e => e.id === res.eventId);
      if (!event || event.type !== EventType.INDIVIDUAL) return;
      const assign = (id: string, points: number, type: 'gold' | 'silver' | 'bronze' | 'fourth') => {
        if (!id) return;
        if (!scores[id]) scores[id] = { gold: 0, silver: 0, bronze: 0, fourth: 0, total: 0 };
        scores[id][type] += 1;
        scores[id].total += points;
      };
      assign(res.firstId, 5, 'gold');
      assign(res.secondId, 3, 'silver');
      assign(res.thirdId, 2, 'bronze');
      assign(res.fourthId, 1, 'fourth');
    });
    return Object.entries(scores)
      .map(([id, stats]) => ({ id, ...stats, participant: participants.find(p => p.id === id) }))
      .filter(a => a.participant)
      .sort((a, b) => {
        if (b.gold !== a.gold) return b.gold - a.gold;
        if (b.silver !== a.silver) return b.silver - a.silver;
        if (b.bronze !== a.bronze) return b.bronze - a.bronze;
        return b.total - a.total;
      });
  }, [results, participants]);

  const awards = {
    olahragawan: athletePerformances.filter(a => a.participant?.category.startsWith('L')).slice(0, 3),
    olahragawati: athletePerformances.filter(a => a.participant?.category.startsWith('P')).slice(0, 3)
  };

  const handlePrintIndividualAward = (type: 'OLAHRAGAWAN' | 'OLAHRAGAWATI', data: any[]) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const html = `
      <html>
        <head>
          <title>Anugerah ${type}</title>
          <style>
            body { font-family: 'Arial', sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            .logo-container { text-align: center; margin-bottom: 10px; }
            .logo-container img { height: 80px; width: auto; }
            .header { text-align: center; border-bottom: 3px solid #000; padding-bottom: 20px; margin-bottom: 40px; }
            .award-title { text-align: center; font-size: 28px; font-weight: 900; margin-bottom: 30px; text-transform: uppercase; }
            .results-table { width: 100%; border-collapse: collapse; }
            .results-table th, .results-table td { border: 1px solid #000; padding: 12px; text-align: center; }
            .results-table th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <div class="logo-container"><img src="${LOGO_URL}"></div>
          <div class="header"><h1>KEJOHANAN OLAHRAGA TAHUNAN 2026</h1><p>KEPUTUSAN ANUGERAH KHAS INDIVIDU</p></div>
          <div class="award-title">ANUGERAH ${type}</div>
          <table class="results-table">
            <thead><tr><th>KED</th><th>NAMA ATLET</th><th>RUMAH</th><th>EMAS</th><th>PERAK</th><th>GANGSA</th><th>MARKAH</th></tr></thead>
            <tbody>${data.map((a, idx) => `<tr><td>${idx + 1}</td><td>${a.participant?.name.toUpperCase()}</td><td>${a.participant?.house.toUpperCase()}</td><td>${a.gold}</td><td>${a.silver}</td><td>${a.bronze}</td><td>${a.total}</td></tr>`).join('')}</tbody>
          </table>
          <script>window.onload = function() { window.print(); window.close(); };</script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-10 md:space-y-16 animate-in fade-in duration-700">
      <div className={`bg-${theme}-950 rounded-[2.5rem] md:rounded-[4rem] shadow-2xl border border-${theme}-900 p-6 md:p-12 overflow-hidden relative`}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 md:mb-16">
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-sporty text-white tracking-widest uppercase leading-none">Pungutan Pingat Keseluruhan</h2>
            <p className={`text-${theme}-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest mt-3`}>Termasuk Individu, Kumpulan & Sukaneka</p>
          </div>
          <button onClick={() => window.print()} className="w-full md:w-auto bg-white/10 hover:bg-white/20 text-white px-8 py-5 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest">Cetak Laporan</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-3 min-w-[850px]">
            <thead>
              <tr className={`text-${theme}-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest`}>
                <th className="px-4 py-2">Ked</th><th>Rumah</th><th className="text-center text-yellow-400">Emas</th><th className="text-center text-slate-300">Perak</th><th className="text-center text-orange-400">Gangsa</th><th className={`text-center text-${theme}-300`}>Keempat</th><th className="text-center">Sukantara</th><th className={`text-center text-${themeAccent}-400`}>Jum Pingat</th><th className="text-right text-white">Markah</th>
              </tr>
            </thead>
            <tbody>
              {sortedStandings.map((s, idx) => (
                <tr key={s.house}>
                  <td className={`px-4 py-4 md:py-6 rounded-l-2xl bg-${theme}-900/40`}><div className={`w-10 h-10 rounded-xl flex items-center justify-center font-sporty text-2xl ${idx === 0 ? 'bg-yellow-500 text-indigo-950' : `bg-${theme}-800 text-${theme}-300`}`}>{idx + 1}</div></td>
                  <td className={`px-4 py-4 md:py-6 bg-${theme}-900/40 border-l border-${theme}-800/50`}><span className="font-black text-white uppercase text-xs">{s.house}</span></td>
                  <td className={`px-2 py-4 bg-${theme}-900/40 text-center text-lg font-sporty text-yellow-400`}>{s.emasInd+s.emasTeam}</td>
                  <td className={`px-2 py-4 bg-${theme}-900/40 text-center text-lg font-sporty text-slate-300`}>{s.perakInd+s.perakTeam}</td>
                  <td className={`px-2 py-4 bg-${theme}-900/40 text-center text-lg font-sporty text-orange-400`}>{s.gangsaInd+s.gangsaTeam}</td>
                  <td className={`px-2 py-4 bg-${theme}-900/40 text-center text-lg font-sporty text-${theme}-400`}>{s.keempatInd+s.keempatTeam}</td>
                  <td className={`px-2 py-4 bg-${theme}-900/40 text-center font-bold text-${theme}-300 text-xs`}>{s.sukantara}</td>
                  <td className={`px-2 py-4 bg-${theme}-900/40 text-center text-lg font-sporty text-${themeAccent}-300`}>{calculateTotalMedals(s)}</td>
                  <td className={`px-4 py-4 md:py-6 rounded-r-2xl text-right ${idx === 0 ? `bg-${theme}-600` : `bg-${theme}-900/60`}`}><span className={`text-2xl md:text-4xl font-sporty ${idx === 0 ? 'text-white' : `text-${themeAccent}-400`}`}>{calculateTotalPoints(s)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {[{ title: 'Top 3 Olahragawan', list: awards.olahragawan, color: 'blue', type: 'OLAHRAGAWAN' }, { title: 'Top 3 Olahragawati', list: awards.olahragawati, color: 'rose', type: 'OLAHRAGAWATI' }].map((sec, i) => (
          <div key={i} className={`bg-white rounded-[2rem] shadow-xl border border-${theme}-50 p-6 md:p-10`}>
            <div className={`flex justify-between items-center mb-8 border-b-2 border-${theme}-50 pb-4`}>
              <h3 className={`text-xl font-bold text-${theme}-950 uppercase`}>{sec.title}</h3>
              <button onClick={() => handlePrintIndividualAward(sec.type as any, sec.list)} className={`p-2 bg-${sec.color}-50 text-${sec.color}-600 rounded-xl hover:bg-${sec.color}-100 transition-all border border-${sec.color}-100`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg></button>
            </div>
            <div className="space-y-4">
              {sec.list.map((a, idx) => (
                <div key={a.id} className={`flex items-center justify-between p-4 bg-${theme}-50/50 rounded-2xl border border-${theme}-100`}>
                  <div className="flex items-center gap-4">
                    <span className={`font-sporty text-2xl text-${theme}-300`}>#{idx+1}</span>
                    <div>
                      <p className={`font-bold text-${theme}-950 text-sm uppercase truncate max-w-[150px]`}>{a.participant?.name}</p>
                      <p className={`text-[9px] font-black text-${theme}-400 uppercase tracking-widest`}>{a.participant?.house}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[8px] font-bold text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-100">E: {a.gold}</span>
                        <span className="text-[8px] font-bold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">P: {a.silver}</span>
                        <span className="text-[8px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">G: {a.bronze}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-sporty text-${theme}-600 block`}>{a.total}</span>
                    <span className="text-[8px] font-black text-indigo-300 uppercase">Markah</span>
                  </div>
                </div>
              ))}
              {sec.list.length === 0 && <p className={`text-center py-6 text-${theme}-200 uppercase font-black text-[10px]`}>Tiada Data</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
