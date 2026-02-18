
import React, { useState, useEffect, useMemo } from 'react';
// Added HouseRankResult to imports to fix type casting issues
import { House, Participant, SportEvent, EventType, EventGroup, EventResult, HouseStandings, SukanekaResults, HouseRankResult } from './types';
import { SPORT_EVENTS } from './constants';
import { EventSelector } from './components/EventSelector';
import { Dashboard } from './components/Dashboard';
import { StandingsTab } from './components/StandingsTab';
import { ResultsTab } from './components/ResultsTab';
import { OverallResultsTab } from './components/OverallResultsTab';
import { SukanekaTab } from './components/SukanekaTab';

type UserRole = 'ADMIN' | 'KETUA_RUMAH' | null;

interface StudentMaster {
  name: string;
  house: House;
  participantNumber: string;
  category: string;
}

const initialStandings: HouseStandings[] = Object.values(House).map(h => ({
  house: h,
  emasInd: 0, perakInd: 0, gangsaInd: 0, keempatInd: 0,
  emasTeam: 0, perakTeam: 0, gangsaTeam: 0, keempatTeam: 0,
  sukantara: 0
}));

const TABS_CONFIG = {
  KETUA_RUMAH: [
    { id: 'register', label: 'Daftar' },
    { id: 'search', label: 'Semak' },
    { id: 'list', label: 'Atlet' },
    { id: 'overall_results', label: 'Keputusan' },
    { id: 'standings', label: 'Kedudukan' }
  ],
  ADMIN: [
    { id: 'list', label: 'Atlet' },
    { id: 'field_results', label: 'Padang' },
    { id: 'track_results', label: 'Balapan' },
    { id: 'sukaneka', label: 'Sukaneka' },
    { id: 'overall_results', label: 'Ringkasan' },
    { id: 'standings', label: 'Carta' },
    { id: 'master_data', label: 'Master' },
    { id: 'cloud_setup', label: 'Setup' }
  ]
};

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [masterList, setMasterList] = useState<StudentMaster[]>([]);
  const [standings, setStandings] = useState<HouseStandings[]>(initialStandings);
  const [eventResults, setEventResults] = useState<EventResult[]>([]);
  const [sukanekaResults, setSukanekaResults] = useState<SukanekaResults>({});
  
  const [isLoadingMaster, setIsLoadingMaster] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '', house: House.BIRU, participantNumber: '', category: '', events: [] as string[]
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchByNo, setSearchByNo] = useState('');
  const [eventFilter, setEventFilter] = useState(''); 
  const [activeTab, setActiveTab] = useState<string>('');
  
  const [scriptUrl, setScriptUrl] = useState<string>(localStorage.getItem('kot2026_script_url') || '');
  
  const [masterSheetUrl, setMasterSheetUrl] = useState<string>(
    localStorage.getItem('kot2026_master_url') || 
    'https://docs.google.com/spreadsheets/d/1QqYsCQzfFxx0uoVRFiC2tlUth0MrGuunWNR5tcpAOcE/export?format=csv&gid=0'
  );

  const LOGO_URL = 'https://lh3.googleusercontent.com/d/1KOLgY94nBJgs6UK6Gwo_eGmmeV6Jexsu';
  const theme = userRole === 'ADMIN' ? 'indigo' : 'orange';

  useEffect(() => {
    const savedRole = localStorage.getItem('kot2026_role') as UserRole;
    if (savedRole && TABS_CONFIG[savedRole]) {
      setUserRole(savedRole);
      setActiveTab(TABS_CONFIG[savedRole][0].id);
    }
    const savedP = localStorage.getItem('kot2026_participants');
    if (savedP) setParticipants(JSON.parse(savedP));
    const savedS = localStorage.getItem('kot2026_standings');
    if (savedS) setStandings(JSON.parse(savedS));
    const savedR = localStorage.getItem('kot2026_results');
    if (savedR) setEventResults(JSON.parse(savedR));
    const savedSuk = localStorage.getItem('kot2026_sukaneka');
    if (savedSuk) setSukanekaResults(JSON.parse(savedSuk));
    fetchMasterList();
  }, []);

  useEffect(() => {
    localStorage.setItem('kot2026_participants', JSON.stringify(participants));
  }, [participants]);

  useEffect(() => {
    localStorage.setItem('kot2026_script_url', scriptUrl);
  }, [scriptUrl]);

  useEffect(() => {
    localStorage.setItem('kot2026_master_url', masterSheetUrl);
    fetchMasterList();
  }, [masterSheetUrl]);

  const fetchMasterList = async () => {
    if (!masterSheetUrl) return;
    setIsLoadingMaster(true);
    try {
      const response = await fetch(`${masterSheetUrl}${masterSheetUrl.includes('?') ? '&' : '?'}cache_bust=${Date.now()}`);
      const csvText = await response.text();
      const lines = csvText.split('\n').filter(line => line.trim() !== '');
      const students: StudentMaster[] = [];
      
      if (lines.length > 1) {
        const header = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const nameIdx = header.findIndex(h => h.includes('nama') || h.includes('name'));
        const houseIdx = header.findIndex(h => h.includes('rumah') || h.includes('house'));
        const numIdx = header.findIndex(h => h.includes('no') || h.includes('bil') || h.includes('peserta'));
        const catIdx = header.findIndex(h => h.includes('kat') || h.includes('cat') || h.includes('kategori'));

        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
          if (row.length < 2) continue;

          let rawHouse = row[houseIdx !== -1 ? houseIdx : 1];
          let hVal = House.BIRU;
          if (rawHouse) {
            const hStr = rawHouse.toLowerCase();
            if (hStr.includes('biru')) hVal = House.BIRU;
            else if (hStr.includes('hijau')) hVal = House.HIJAU;
            else if (hStr.includes('kun')) hVal = House.KUNING;
            else if (hStr.includes('mer')) hVal = House.MERAH;
          }

          students.push({ 
            name: (row[nameIdx !== -1 ? nameIdx : 0] || 'N/A').toUpperCase(), 
            house: hVal, 
            participantNumber: row[numIdx !== -1 ? numIdx : 2] || '000', 
            category: (row[catIdx !== -1 ? catIdx : 3] || 'L1').toUpperCase()
          });
        }
      }
      setMasterList(students);
    } catch (e) { 
      console.error("Gagal memuatkan data master:", e); 
    } finally { 
      setIsLoadingMaster(false); 
    }
  };

  const syncWithGoogleSheet = async (participant: Participant) => {
    if (!scriptUrl) return;
    setIsSyncing(true);
    try {
      const eventNames = participant.events.map(id => SPORT_EVENTS.find(e => e.id === id)?.name || id).join(', ');
      const payload = {
        action: 'register',
        timestamp: new Date().toISOString(),
        id: participant.id,
        name: participant.name,
        house: participant.house,
        participantNumber: participant.participantNumber,
        category: participant.category,
        events: eventNames
      };
      await fetch(scriptUrl, { method: 'POST', mode: 'no-cors', cache: 'no-cache', body: JSON.stringify(payload) });
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const u = loginForm.username.toLowerCase();
    const p = loginForm.password;
    if (u === 'admin' && p === 'admin2026') {
      setUserRole('ADMIN'); setActiveTab('list'); localStorage.setItem('kot2026_role', 'ADMIN');
    } else if (u === 'ketua' && p === 'rumah2026') {
      setUserRole('KETUA_RUMAH'); setActiveTab('register'); localStorage.setItem('kot2026_role', 'KETUA_RUMAH');
    } else {
      setLoginError('ID atau Kata Laluan Salah');
    }
  };

  const handleLogout = () => { setUserRole(null); setActiveTab(''); localStorage.removeItem('kot2026_role'); };

  const masterListFilteredByHouse = useMemo(() => {
    const registered = new Set(participants.map(p => p.participantNumber.trim().toLowerCase()));
    if (editingId) {
      const current = participants.find(p => p.id === editingId);
      if (current) registered.delete(current.participantNumber.trim().toLowerCase());
    }
    return masterList.filter(s => s.house === formData.house && !registered.has(s.participantNumber.trim().toLowerCase()));
  }, [masterList, formData.house, participants, editingId]);

  const filteredParticipants = useMemo(() => {
    let result = participants;
    if (eventFilter) {
      result = result.filter(p => p.events.includes(eventFilter));
    } else {
      return [];
    }
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(s) || p.participantNumber.toLowerCase().includes(s));
    }
    return result;
  }, [searchTerm, eventFilter, participants]);

  const handleDownloadCSV = () => {
    if (!eventFilter) return alert("Pilih acara dahulu.");
    const event = SPORT_EVENTS.find(e => e.id === eventFilter);
    const filename = `Senarai_Atlet_${event?.name.replace(/\s+/g, '_') || 'Acara'}.csv`;
    const headers = ['Bil', 'No Peserta', 'Nama Atlet', 'Rumah', 'Kategori', 'Lorong/Giliran', 'Keputusan'];
    const rows = filteredParticipants.map((p, i) => [
      i + 1, p.participantNumber, p.name.toUpperCase(), p.house.toUpperCase(), p.category, '', ''
    ]);
    const csvContent = [`ACARA: ${event?.name.toUpperCase()}`, `KAT: ${event?.category}`, '', headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let updated: Participant;
    if (editingId) {
      updated = { ...formData, id: editingId };
      setParticipants(participants.map(p => p.id === editingId ? updated : p));
      setEditingId(null);
    } else {
      updated = { id: Date.now().toString(), ...formData };
      setParticipants([updated, ...participants]);
    }
    syncWithGoogleSheet(updated);
    setFormData({ name: '', house: House.BIRU, participantNumber: '', category: '', events: [] });
    setActiveTab('list');
  };

  const autoStandings = useMemo(() => {
    const base = Object.values(House).map(h => ({
      house: h, 
      emasInd: 0, perakInd: 0, gangsaInd: 0, keempatInd: 0,
      emasTeam: 0, perakTeam: 0, gangsaTeam: 0, keempatTeam: 0, 
      sukantara: standings.find(s => s.house === h)?.sukantara || 0
    }));

    eventResults.forEach(res => {
      const event = SPORT_EVENTS.find(e => e.id === res.eventId);
      if (!event) return;
      const positions: ('firstId' | 'secondId' | 'thirdId' | 'fourthId')[] = ['firstId', 'secondId', 'thirdId', 'fourthId'];
      const medals: ('emas' | 'perak' | 'gangsa' | 'keempat')[] = ['emas', 'perak', 'gangsa', 'keempat'];
      positions.forEach((pos, idx) => {
        const id = res[pos];
        if (!id) return;
        let house: House | undefined = event.type === EventType.TEAM ? id as House : participants.find(p => p.id === id)?.house;
        if (house) {
          const houseEntry = base.find(b => b.house === house);
          if (houseEntry) {
            const medalType = medals[idx];
            const suffix = event.type === EventType.INDIVIDUAL ? 'Ind' : 'Team';
            (houseEntry as any)[`${medalType}${suffix}`] += 1;
          }
        }
      });
    });

    // Explicitly cast Object.entries(sukanekaResults) to [string, HouseRankResult][] to fix "unknown" type error
    (Object.entries(sukanekaResults) as [string, HouseRankResult][]).forEach(([_, res]) => {
      if (res.first) { const h = base.find(b => b.house === res.first); if (h) h.emasTeam += 1; }
      if (res.second) { const h = base.find(b => b.house === res.second); if (h) h.perakTeam += 1; }
      if (res.third) { const h = base.find(b => b.house === res.third); if (h) h.gangsaTeam += 1; }
      if (res.fourth) { const h = base.find(b => b.house === res.fourth); if (h) h.keempatTeam += 1; }
    });

    return base;
  }, [eventResults, sukanekaResults, participants, standings]);

  if (!userRole) {
    return (
      <div className="min-h-screen bg-indigo-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl">
          <h1 className="text-xl md:text-2xl font-sporty text-white tracking-widest uppercase text-center mb-8 md:mb-10">Log Masuk e-KOT 2026</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <input type="text" required value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})} className="w-full bg-indigo-900/50 border-2 border-indigo-800 rounded-2xl p-4 text-white outline-none text-sm" placeholder="Username (admin / ketua)" />
            <input type="password" required value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} className="w-full bg-indigo-900/50 border-2 border-indigo-800 rounded-2xl p-4 text-white outline-none text-sm" placeholder="Password" />
            {loginError && <p className="text-rose-400 text-[10px] font-bold text-center uppercase tracking-widest">{loginError}</p>}
            <button type="submit" className="w-full bg-indigo-600 hover:bg-violet-600 text-white font-black py-5 rounded-2xl uppercase tracking-widest text-[10px] md:text-xs transition-all shadow-lg active:scale-95">Masuk</button>
          </form>
        </div>
      </div>
    );
  }

  const currentTabs = TABS_CONFIG[userRole] || [];

  return (
    <div className="min-h-screen pb-10 md:pb-20 text-slate-900 font-sans overflow-x-hidden">
      <header className={`bg-${theme}-950 text-white shadow-2xl sticky top-0 z-50 border-b border-${theme}-900`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col items-center gap-3">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={LOGO_URL} alt="Logo" className="h-8 w-8 md:h-10 md:w-10 object-contain bg-white p-1 rounded-xl shadow-lg" />
              <div>
                <h1 className="text-sm md:text-xl font-sporty tracking-widest uppercase leading-none">e-KOT 2026</h1>
                <div className={`flex items-center gap-1.5 text-[7px] md:text-[8px] font-black uppercase tracking-widest ${isSyncing ? 'text-amber-400' : syncStatus === 'success' ? 'text-emerald-400' : 'text-white/40'}`}>
                  {isSyncing ? 'SYNC...' : syncStatus === 'success' ? 'DATA DISIMPAN' : 'SISTEM SEDIA'}
                </div>
              </div>
            </div>
            <button onClick={handleLogout} className="bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl transition-all text-[8px] md:text-[9px] font-black uppercase tracking-widest border border-rose-600/30 active:scale-95">Keluar</button>
          </div>
          <nav className={`flex w-full bg-${theme}-900/40 backdrop-blur-md rounded-2xl p-1 shadow-inner border border-${theme}-800/50 overflow-x-auto scrollbar-hide snap-x`}>
            {currentTabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 min-w-[70px] md:min-w-[100px] px-2 md:px-6 py-2 md:py-3 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap snap-center ${activeTab === tab.id ? `bg-${theme}-600 text-white shadow-lg` : `text-${theme}-300/70 hover:text-white`}`}>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
        {activeTab === 'register' && (
          <div className="bg-white rounded-[2rem] shadow-2xl p-6 md:p-10 animate-in zoom-in-95 border border-slate-100">
            <h2 className={`text-xl md:text-2xl font-black text-${theme}-950 uppercase mb-8 border-b border-slate-50 pb-4`}>Pendaftaran Atlet</h2>
            <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Rumah Sukan</label>
                  <select value={formData.house} onChange={e => setFormData({ ...formData, house: e.target.value as House, name: '', participantNumber: '', category: '' })} className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold outline-none text-sm md:text-base focus:border-indigo-500 transition-all appearance-none">
                    {Object.values(House).map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Carian Nama (Dari Master)</label>
                  <input list="m-list" required value={formData.name} onChange={e => {
                      const val = e.target.value.toUpperCase();
                      const s = masterListFilteredByHouse.find(x => x.name === val);
                      if (s) setFormData({...formData, name: s.name, participantNumber: s.participantNumber, category: s.category});
                      else setFormData({...formData, name: val});
                  }} className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold outline-none text-sm md:text-base focus:border-indigo-500 transition-all" placeholder="Taip nama atlet..." />
                  <datalist id="m-list">{masterListFilteredByHouse.map((s,i) => <option key={i} value={s.name}>{s.participantNumber} ({s.category})</option>)}</datalist>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">No Peserta</label>
                  <input type="text" required value={formData.participantNumber} onChange={e => setFormData({...formData, participantNumber: e.target.value})} className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-white text-center font-sporty text-4xl md:text-5xl outline-none text-indigo-600 shadow-inner" />
                </div>
              </div>
              <div className="p-5 md:p-8 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                <EventSelector selectedEvents={formData.events} participantCategory={formData.category} onChange={evs => setFormData({...formData, events: evs})} userRole={userRole} />
              </div>
              <button type="submit" className={`w-full bg-${theme}-600 hover:bg-emerald-600 text-white font-black py-6 md:py-8 rounded-[2rem] uppercase text-xs md:text-sm tracking-widest shadow-2xl transition-all active:scale-[0.98]`}>
                SIMPAN PENDAFTARAN
              </button>
            </form>
          </div>
        )}

        {activeTab === 'list' && (
          <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100">
            <div className="p-6 md:p-8 border-b flex flex-col md:flex-row justify-between items-center gap-5 bg-slate-50/50">
              <div className="text-center md:text-left">
                <h2 className="text-lg md:text-xl font-black uppercase tracking-tight">Semakan Atlet</h2>
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-1">Leret jadual untuk maklumat penuh</p>
              </div>
              <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
                <select value={eventFilter} onChange={e => setEventFilter(e.target.value)} className="px-4 py-3 border-2 border-indigo-100 rounded-2xl text-[10px] md:text-xs font-bold outline-none bg-white">
                  <option value="">-- Pilih Acara --</option>
                  {SPORT_EVENTS.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
                <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Cari..." className="px-5 py-3 border-2 border-slate-100 rounded-2xl text-[10px] md:text-xs font-bold outline-none" />
                <button onClick={handleDownloadCSV} disabled={!eventFilter} className={`${eventFilter ? 'bg-emerald-600' : 'bg-slate-300'} text-white px-5 py-3 rounded-2xl font-black uppercase text-[9px] md:text-[10px] tracking-widest shadow-lg active:scale-95`}>CSV</button>
              </div>
            </div>
            <div className="overflow-x-auto scrollbar-hide table-container pb-4">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-slate-900 text-white text-[9px] md:text-[10px] uppercase font-black">
                  <tr><th className="p-4 md:p-6">Profil Atlet</th><th className="p-4 md:p-6">Rumah</th><th className="p-4 md:p-6">Acara</th><th className="p-4 md:p-6 text-center">Aksi</th></tr>
                </thead>
                <tbody className="divide-y text-xs md:text-sm">
                  {filteredParticipants.map(p => (
                    <tr key={p.id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="p-4 md:p-6"><div className="font-bold uppercase text-slate-900">{p.name}</div><div className="text-[9px] text-slate-400">NO: {p.participantNumber} • {p.category}</div></td>
                      <td className="p-4 md:p-6 font-black uppercase text-[10px] text-indigo-600">{p.house}</td>
                      <td className="p-4 md:p-6">
                        <div className="flex flex-wrap gap-1">
                          {p.events.map(e => <span key={e} className="bg-white border px-2 py-1 rounded-md text-[8px] font-black uppercase">{SPORT_EVENTS.find(x => x.id === e)?.name}</span>)}
                        </div>
                      </td>
                      <td className="p-4 md:p-6 text-center">
                        <button onClick={() => {setEditingId(p.id); setFormData({name: p.name, house: p.house, participantNumber: p.participantNumber, category: p.category, events: p.events}); setActiveTab('register');}} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase border border-indigo-100 active:scale-90">EDIT</button>
                      </td>
                    </tr>
                  ))}
                  {filteredParticipants.length === 0 && (
                    <tr><td colSpan={4} className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest italic">{eventFilter ? 'Tiada data dijumpai.' : 'Sila pilih acara.'}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="max-w-md mx-auto py-10 md:py-20 text-center px-4">
            <h2 className="text-2xl md:text-3xl font-sporty uppercase mb-8 tracking-widest">Semakan No Peserta</h2>
            <input type="text" value={searchByNo} onChange={e => setSearchByNo(e.target.value)} className="w-full p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border-4 border-indigo-50 text-center font-sporty text-5xl md:text-7xl outline-none focus:border-indigo-500 transition-all bg-white shadow-2xl text-indigo-600" placeholder="MASUK NO" />
          </div>
        )}
        
        {activeTab === 'field_results' && <ResultsTab participants={participants} group={EventGroup.FIELD} results={eventResults} onUpdateResults={setEventResults} userRole={userRole} />}
        {activeTab === 'track_results' && <ResultsTab participants={participants} group={EventGroup.TRACK} results={eventResults} onUpdateResults={setEventResults} userRole={userRole} />}
        {activeTab === 'sukaneka' && <SukanekaTab results={sukanekaResults} onUpdate={setSukanekaResults} standings={standings} onUpdateStandings={setStandings} userRole={userRole} />}
        {activeTab === 'overall_results' && <OverallResultsTab participants={participants} results={eventResults} sukanekaResults={sukanekaResults} userRole={userRole} />}
        {activeTab === 'standings' && <StandingsTab standings={autoStandings} onUpdate={setStandings} participants={participants} results={eventResults} userRole={userRole} />}
        
        {activeTab === 'master_data' && userRole === 'ADMIN' && (
          <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100">
             <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                <div>
                  <h2 className="font-black text-sm md:text-base uppercase">Master Data ({masterList.length})</h2>
                  <p className="text-[7px] md:text-[8px] font-mono text-slate-400 break-all">ID: 1QqYsCQzfFxx0uoVRFiC2tlUth0MrGuunWNR5tcpAOcE</p>
                </div>
                <button onClick={fetchMasterList} disabled={isLoadingMaster} className="bg-indigo-600 text-white px-3 py-2 md:px-5 md:py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase active:scale-95">{isLoadingMaster ? 'MUAT...' : 'RELOAD'}</button>
             </div>
             <div className="max-h-[500px] overflow-y-auto scrollbar-hide table-container">
                <table className="w-full text-left text-[10px] md:text-xs">
                   <thead className="bg-slate-900 text-white uppercase sticky top-0 font-black">
                      <tr><th className="p-4">Nama</th><th className="p-4">No</th><th className="p-4">Rumah</th><th className="p-4">Kategori</th></tr>
                   </thead>
                   <tbody className="divide-y">
                      {masterList.map((s,i) => <tr key={i} className="hover:bg-slate-50"><td className="p-4 uppercase font-bold">{s.name}</td><td className="p-4 font-mono">{s.participantNumber}</td><td className="p-4 uppercase">{s.house}</td><td className="p-4">{s.category}</td></tr>)}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {activeTab === 'cloud_setup' && userRole === 'ADMIN' && (
          <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-2 border-indigo-50 animate-in fade-in">
              <div className="bg-indigo-950 p-6 md:p-8 text-white">
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight">Pengurusan Awan</h3>
                <p className="text-indigo-300 text-[8px] md:text-[10px] font-black uppercase mt-1 tracking-widest">Integrasi Google Sheets & Apps Script</p>
              </div>
              <div className="p-6 md:p-8 space-y-6 md:space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Carian (Master Data ID):</label>
                    <p className="font-mono text-[9px] break-all text-indigo-600 bg-white p-3 rounded-xl border">1QqYsCQzfFxx0uoVRFiC2tlUth0MrGuunWNR5tcpAOcE</p>
                  </div>
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Simpanan (Storage ID):</label>
                    <p className="font-mono text-[9px] break-all text-indigo-600 bg-white p-3 rounded-xl border">1o9_SQPkzWY9GaqDMNLvMqMk2_nfBuRdqyXHqg7ZMSWk</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest block ml-1">Apps Script URL (Pendaftaran):</label>
                  <input type="text" value={scriptUrl} onChange={e => setScriptUrl(e.target.value)} className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-[10px] md:text-xs font-mono outline-none focus:border-indigo-500" placeholder="https://script.google.com/macros/..." />
                </div>
              </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
