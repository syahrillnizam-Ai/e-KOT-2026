
import React, { useMemo } from 'react';
import { SPORT_EVENTS } from '../constants';
import { EventType } from '../types';

interface EventSelectorProps {
  selectedEvents: string[];
  participantCategory: string;
  onChange: (events: string[]) => void;
  userRole?: 'ADMIN' | 'KETUA_RUMAH' | null;
}

export const EventSelector: React.FC<EventSelectorProps> = ({ selectedEvents, participantCategory, onChange, userRole }) => {
  const theme = userRole === 'ADMIN' ? 'indigo' : 'orange';
  const themeAccent = userRole === 'ADMIN' ? 'violet' : 'amber';

  const isEligible = (eventCategory: string, studentCategory: string) => {
    const eCat = eventCategory.toUpperCase().trim();
    const sCat = studentCategory.toUpperCase().trim();
    if (eCat === sCat) return true;
    const isMale = sCat.startsWith('L') || sCat.endsWith(' L');
    const isFemale = sCat.startsWith('P') || sCat.endsWith(' P');
    if (eCat === 'TERBUKA L' && isMale) return true;
    if (eCat === 'TERBUKA P' && isFemale) return true;
    if (eCat === 'PPKI MIX' && sCat.includes('PPKI')) return true;
    return false;
  };

  const availableEvents = useMemo(() => {
    if (!participantCategory) return null;
    const sCat = participantCategory.toUpperCase().trim();
    return {
      individual: SPORT_EVENTS.filter(e => e.type === EventType.INDIVIDUAL && isEligible(e.category, sCat)),
      team: SPORT_EVENTS.filter(e => e.type === EventType.TEAM && isEligible(e.category, sCat))
    };
  }, [participantCategory]);

  const currentIndv = useMemo(() => selectedEvents.filter(id => SPORT_EVENTS.find(e => e.id === id)?.type === EventType.INDIVIDUAL), [selectedEvents]);
  const currentTeam = useMemo(() => selectedEvents.filter(id => SPORT_EVENTS.find(e => e.id === id)?.type === EventType.TEAM), [selectedEvents]);

  const handleSelectChange = (type: EventType, index: number, value: string) => {
    const currentItemsOfType = type === EventType.INDIVIDUAL ? [...currentIndv] : [...currentTeam];
    const otherItems = selectedEvents.filter(id => SPORT_EVENTS.find(e => e.id === id)?.type !== type);
    if (value === "") currentItemsOfType.splice(index, 1);
    else currentItemsOfType[index] = value;
    onChange([...otherItems, ...Array.from(new Set(currentItemsOfType.filter(v => v !== "" && v !== undefined)))]);
  };

  if (!participantCategory || !availableEvents) {
    return (
      <div className={`flex flex-col items-center justify-center py-24 text-center bg-${theme}-50/30 rounded-[3rem] border-4 border-dashed border-${theme}-100`}>
        <div className={`w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl mb-8 ring-8 ring-${theme}-50`}>
           <svg className={`w-12 h-12 text-${theme}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        </div>
        <h4 className={`text-${theme}-950 text-2xl font-bold mb-3 uppercase tracking-tight`}>Sila Pilih Atlet</h4>
        <p className={`text-${theme}-400 text-[10px] md:text-xs max-w-xs mx-auto font-black uppercase tracking-[0.2em] leading-relaxed`}>Pilihan acara akan dipaparkan secara dinamik mengikut kelayakan atlet.</p>
      </div>
    );
  }

  const renderSlot = (type: EventType, index: number, currentVal: string) => {
    const list = type === EventType.INDIVIDUAL ? availableEvents.individual : availableEvents.team;
    const label = type === EventType.INDIVIDUAL ? `Individu ${index + 1}` : `Kumpulan ${index + 1}`;
    const otherSelected = (type === EventType.INDIVIDUAL ? currentIndv : currentTeam).filter((_, idx) => idx !== index);
    const accentColor = type === EventType.INDIVIDUAL ? theme : themeAccent;

    return (
      <div className="flex flex-col gap-4">
        <label className={`text-[10px] font-black text-${accentColor}-400 uppercase tracking-[0.3em] ml-2`}>{label}</label>
        <div className="relative group">
          <select value={currentVal || ""} onChange={e => handleSelectChange(type, index, e.target.value)} className={`w-full px-8 py-6 rounded-3xl border-2 outline-none transition-all font-bold appearance-none shadow-xl pr-14 text-lg ${currentVal ? `border-${accentColor}-600 bg-${accentColor}-50/50 text-${accentColor}-950` : `border-indigo-50 bg-white text-${theme}-300 focus:border-${accentColor}-500`}`}>
            <option value="">-- Pilih Acara --</option>
            {list.map(e => <option key={e.id} value={e.id} disabled={otherSelected.includes(e.id)}>{e.name} {e.category.includes('Terbuka') || e.category.includes('Mix') ? `(${e.category})` : ''}</option>)}
          </select>
          <div className={`absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${currentVal ? `text-${accentColor}-600` : `text-${theme}-200`}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg></div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-16">
      <section className="space-y-8">
        <div className={`flex justify-between items-end border-b-2 border-${theme}-50 pb-6`}>
          <div>
            <h2 className={`text-4xl font-sporty text-${theme}-950 tracking-[0.2em] uppercase`}>Acara Individu</h2>
            <p className={`text-${theme}-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic`}>Had Maksimum: 2 Acara</p>
          </div>
          <div className={`px-8 py-3 rounded-2xl border-2 font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg ${currentIndv.length >= 2 ? `bg-${theme}-600 border-${theme}-600 text-white shadow-${theme}-200` : `bg-white border-${theme}-100 text-${theme}-400`}`}>
            {currentIndv.length} / 2 Slot Terisi
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {renderSlot(EventType.INDIVIDUAL, 0, currentIndv[0])}
          {renderSlot(EventType.INDIVIDUAL, 1, currentIndv[1])}
        </div>
      </section>

      <section className="space-y-8">
        <div className={`flex justify-between items-end border-b-2 border-${theme}-50 pb-6`}>
          <div>
            <h2 className={`text-4xl font-sporty text-${themeAccent}-950 tracking-[0.2em] uppercase`}>Acara Kumpulan</h2>
            <p className={`text-${themeAccent}-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic`}>Relay & Berpasukan</p>
          </div>
          <div className={`px-8 py-3 rounded-2xl border-2 font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg ${currentTeam.length >= 2 ? `bg-${themeAccent}-600 border-${themeAccent}-600 text-white shadow-${themeAccent}-200` : `bg-white border-${themeAccent}-100 text-${themeAccent}-400`}`}>
            {currentTeam.length} / 2 Slot Terisi
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {renderSlot(EventType.TEAM, 0, currentTeam[0])}
          {renderSlot(EventType.TEAM, 1, currentTeam[1])}
        </div>
      </section>
    </div>
  );
};
