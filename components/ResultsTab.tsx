
import React, { useState } from 'react';
import { Participant, SportEvent, EventGroup, EventResult, House, EventType } from '../types';
import { SPORT_EVENTS } from '../constants';

interface ResultsTabProps {
  participants: Participant[];
  group: EventGroup;
  results: EventResult[];
  onUpdateResults: (results: EventResult[]) => void;
  userRole?: 'ADMIN' | 'KETUA_RUMAH' | null;
}

const HOUSE_COLORS: Record<House, string> = {
  [House.BIRU]: '#3b82f6',
  [House.HIJAU]: '#10b981',
  [House.KUNING]: '#f59e0b',
  [House.MERAH]: '#f43f5e'
};

const LOGO_URL = 'https://lh3.googleusercontent.com/d/1KOLgY94nBJgs6UK6Gwo_eGmmeV6Jexsu';

export const ResultsTab: React.FC<ResultsTabProps> = ({ participants, group, results, onUpdateResults, userRole }) => {
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const theme = userRole === 'ADMIN' ? 'indigo' : 'orange';

  const groupEvents = SPORT_EVENTS.filter(e => e.group === group);
  const selectedEvent = SPORT_EVENTS.find(e => e.id === selectedEventId);
  const eventParticipants = participants.filter(p => p.events.includes(selectedEventId));
  const currentResult = results.find(r => r.eventId === selectedEventId) || {
    eventId: selectedEventId, firstId: '', secondId: '', thirdId: '', fourthId: ''
  };

  const handleUpdateWinner = (pos: 'firstId' | 'secondId' | 'thirdId' | 'fourthId', value: string) => {
    const updated = { ...currentResult, [pos]: value };
    const existingIdx = results.findIndex(r => r.eventId === selectedEventId);
    let newResults = [...results];
    if (existingIdx > -1) {
      newResults[existingIdx] = updated;
    } else {
      newResults.push(updated);
    }
    onUpdateResults(newResults);
  };

  const getParticipant = (id: string) => participants.find(p => p.id === id);

  const handleExportExcel = () => {
    if (!selectedEvent || eventParticipants.length === 0) return;
    const headers = ['Bil', 'No Peserta', 'Nama Atlet', 'Rumah', 'Kategori', 'Acara'];
    const rows = eventParticipants.map((p, index) => [
      index + 1, p.participantNumber, p.name.toUpperCase(), p.house.toUpperCase(), p.category, selectedEvent.name.toUpperCase()
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Senarai_Atlet_${selectedEvent.name.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (!selectedEvent) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const isTeamEvent = selectedEvent.type === EventType.TEAM;
    const getWinnerLabel = (id: string) => {
      if (!id) return '-';
      if (isTeamEvent) return `RUMAH ${id.toUpperCase()}`;
      const p = getParticipant(id);
      return p ? p.name.toUpperCase() : '-';
    };
    const getWinnerNo = (id: string) => (isTeamEvent || !id) ? '-' : (getParticipant(id)?.participantNumber || '-');
    const getWinnerHouse = (id: string) => {
      if (!id) return '-';
      if (isTeamEvent) return id.toUpperCase();
      return getParticipant(id)?.house.toUpperCase() || '-';
    };
    const winners = [
      { label: 'PERTAMA (EMAS)', id: currentResult.firstId },
      { label: 'KEDUA (PERAK)', id: currentResult.secondId },
      { label: 'KETIGA (GANGSA)', id: currentResult.thirdId },
      { label: 'KEEMPAT', id: currentResult.fourthId },
    ];
    const html = `
      <html>
        <head>
          <title>Keputusan Rasmi - ${selectedEvent.name}</title>
          <style>
            body { font-family: 'Arial', sans-serif; padding: 40px; color: #333; }
            .logo-container { text-align: center; margin-bottom: 10px; }
            .logo-container img { height: 80px; width: auto; }
            .header { text-align: center; border-bottom: 3px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { margin: 5px 0 0; text-transform: uppercase; font-size: 24px; }
            .header p { margin: 5px 0 0; font-weight: bold; letter-spacing: 2px; }
            .info-table { width: 100%; margin-bottom: 30px; }
            .info-table td { padding: 5px 0; font-weight: bold; }
            .results-table { width: 100%; border-collapse: collapse; margin-bottom: 50px; }
            .results-table th, .results-table td { border: 1px solid #000; padding: 12px; text-align: left; }
            .results-table th { background-color: #f2f2f2; text-transform: uppercase; font-size: 12px; }
            .footer { margin-top: 100px; display: flex; justify-content: space-between; }
            .sig-box { border-top: 1px solid #000; width: 250px; text-align: center; padding-top: 10px; font-weight: bold; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="logo-container"><img src="${LOGO_URL}"></div>
          <div class="header"><h1>KEJOHANAN OLAHRAGA TAHUNAN 2026</h1><p>KEPUTUSAN RASMI ACARA ${group.toUpperCase()}</p></div>
          <table class="info-table">
            <tr><td width="150">ACARA</td><td>: ${selectedEvent.name}</td></tr>
            <tr><td>KATEGORI</td><td>: ${selectedEvent.category}</td></tr>
            <tr><td>TARIKH</td><td>: ${new Date().toLocaleDateString('ms-MY')}</td></tr>
          </table>
          <table class="results-table">
            <thead><tr><th width="150">KEDUDUKAN</th><th>${isTeamEvent ? 'RUMAH PEMENANG' : 'NAMA ATLET'}</th><th width="100">NO PESERTA</th><th width="150">RUMAH SUKAN</th></tr></thead>
            <tbody>${winners.map(w => `<tr><td><strong>${w.label}</strong></td><td>${getWinnerLabel(w.id)}</td><td>${getWinnerNo(w.id)}</td><td>${getWinnerHouse(w.id)}</td></tr>`).join('')}</tbody>
          </table>
          <div class="footer"><div class="sig-box">Tandatangan Ketua Hakim<br><br><br><br>(....................................................)</div><div class="sig-box">Tandatangan Setiausaha Sukan<br><br><br><br>(....................................................)</div></div>
          <script>window.onload = function() { setTimeout(function(){ window.print(); window.close(); }, 500); };</script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const WinnerCard = ({ pos, label, color, icon, isTeam }: { pos: 'firstId' | 'secondId' | 'thirdId' | 'fourthId', label: string, color: string, icon: string, isTeam: boolean }) => {
    const value = (currentResult as any)[pos];
    const p = !isTeam ? getParticipant(value) : null;
    const houseVal = isTeam ? value as House : (p ? p.house : null);

    return (
      <div className={`p-5 md:p-6 rounded-2xl md:rounded-[2rem] border-2 bg-white flex flex-col items-center gap-3 md:gap-4 transition-all shadow-xl ${value ? `border-${color}-500 ring-4 ring-${color}-50/50` : `border-${theme}-50 border-dashed`}`}>
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white text-lg md:text-xl shadow-lg bg-${color}-500`}>
          {icon}
        </div>
        <div className="text-center h-16 md:h-20 flex flex-col justify-center w-full">
          <p className={`text-[8px] md:text-[10px] font-black text-${theme}-300 uppercase tracking-widest`}>{label}</p>
          <h5 className={`font-bold text-sm md:text-lg leading-tight truncate ${value ? `text-${theme}-950` : `text-${theme}-200 uppercase`}`}>
            {isTeam ? (value ? `RUMAH ${value.toUpperCase()}` : 'Pilih Rumah') : (p ? p.name : 'Pilih Pemenang')}
          </h5>
          {houseVal && (
            <div className="flex items-center justify-center gap-2 mt-1 md:mt-2">
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-full" style={{ backgroundColor: HOUSE_COLORS[houseVal as House] }}></div>
              <span className={`text-[8px] md:text-[10px] font-bold text-${theme}-400 uppercase tracking-widest`}>{houseVal}</span>
            </div>
          )}
        </div>
        <select value={value} onChange={e => handleUpdateWinner(pos, e.target.value)} className={`w-full mt-2 p-3 rounded-xl border border-${theme}-50 text-[10px] md:text-xs font-bold bg-${theme}-50/30 outline-none`}>
          <option value="">-- Pilih --</option>
          {isTeam ? Object.values(House).map(h => <option key={h} value={h} disabled={[currentResult.firstId, currentResult.secondId, currentResult.thirdId, currentResult.fourthId].includes(h) && h !== value}>Rumah {h}</option>) : eventParticipants.map(ep => <option key={ep.id} value={ep.id} disabled={[currentResult.firstId, currentResult.secondId, currentResult.thirdId, currentResult.fourthId].includes(ep.id) && ep.id !== value}>{ep.name}</option>)}
        </select>
      </div>
    );
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className={`bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-${theme}-50`}>
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 md:gap-8 mb-8 md:mb-10">
          <div className="text-center lg:text-left">
            <h2 className={`text-2xl md:text-3xl font-bold text-${theme}-950 uppercase tracking-tight`}>Keputusan {group}</h2>
            <p className={`text-${theme}-400 text-[10px] md:text-sm mt-1 font-medium italic`}>Sila pilih acara & rekod pemenang.</p>
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <select value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)} className={`flex-1 lg:w-80 px-4 md:px-8 py-4 md:py-5 rounded-xl md:rounded-[1.5rem] border-2 border-${theme}-100 bg-white outline-none font-bold shadow-xl text-sm`}>
              <option value="">-- Pilih Acara --</option>
              {groupEvents.map(e => <option key={e.id} value={e.id}>{results.some(r => r.eventId === e.id && (r.firstId || r.secondId)) ? '✓ ' : ''}{e.name}</option>)}
            </select>
            <div className="flex gap-2">
              {selectedEventId && eventParticipants.length > 0 && (
                <button onClick={handleExportExcel} className="p-4 md:p-5 bg-emerald-600 text-white rounded-xl md:rounded-2xl hover:bg-emerald-700 shadow-xl"><svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></button>
              )}
              {selectedEventId && (currentResult.firstId || currentResult.secondId) && (
                <button onClick={handlePrint} className={`p-4 md:p-5 bg-${theme}-600 text-white rounded-xl md:rounded-2xl hover:bg-${theme}-700 shadow-xl`}><svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg></button>
              )}
            </div>
          </div>
        </div>
        {selectedEventId && selectedEvent ? (
          <div className="space-y-10 md:space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <WinnerCard pos="firstId" label="Tempat Pertama" color="yellow" icon="1" isTeam={selectedEvent.type === EventType.TEAM} />
              <WinnerCard pos="secondId" label="Tempat Kedua" color="slate" icon="2" isTeam={selectedEvent.type === EventType.TEAM} />
              <WinnerCard pos="thirdId" label="Tempat Ketiga" color="orange" icon="3" isTeam={selectedEvent.type === EventType.TEAM} />
              <WinnerCard pos="fourthId" label="Tempat Keempat" color={theme} icon="4" isTeam={selectedEvent.type === EventType.TEAM} />
            </div>
            <div className={`pt-6 md:pt-10 border-t border-${theme}-50`}>
              <h4 className={`text-[8px] md:text-[10px] font-black text-${theme}-400 uppercase tracking-widest mb-4 md:mb-6 ml-1`}>{selectedEvent.type === EventType.TEAM ? 'Rumah Bertanding' : `Atlet Berdaftar (${eventParticipants.length})`}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {(selectedEvent.type === EventType.TEAM ? Object.values(House) : eventParticipants).map((item, idx) => {
                  const id = typeof item === 'string' ? item : item.id;
                  const label = typeof item === 'string' ? `RUMAH ${item}` : item.name;
                  const rankIdx = [currentResult.firstId, currentResult.secondId, currentResult.thirdId, currentResult.fourthId].indexOf(id);
                  return (
                    <div key={id} className={`p-3 md:p-4 rounded-xl md:rounded-2xl border flex items-center justify-between ${rankIdx !== -1 ? `bg-${theme}-600 border-${theme}-600 text-white shadow-lg` : `bg-${theme}-50/30 border-${theme}-50 text-${theme}-900`}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center font-sporty bg-white/20 text-xs md:text-sm">{typeof item === 'string' ? item.charAt(0) : item.participantNumber.slice(-2)}</div>
                        <span className="font-bold text-[10px] md:text-xs uppercase truncate max-w-[120px]">{label}</span>
                      </div>
                      {rankIdx !== -1 && <span className="text-[8px] md:text-[9px] font-black uppercase">#{rankIdx + 1}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-20 md:py-24 text-center">
             <div className={`w-20 h-20 md:w-24 md:h-24 bg-${theme}-50 rounded-full flex items-center justify-center mx-auto mb-6`}>
               <svg className={`w-10 h-10 md:w-12 md:h-12 text-${theme}-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
             </div>
             <p className={`text-${theme}-300 font-black uppercase tracking-widest text-[10px] md:text-xs`}>Sila Pilih Acara</p>
          </div>
        )}
      </div>
    </div>
  );
};
