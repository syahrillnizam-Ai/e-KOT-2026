
import React from 'react';
import { Participant, SportEvent, EventResult, EventType, House, SukanekaResults, HouseRankResult } from '../types';
import { SPORT_EVENTS } from '../constants';

interface OverallResultsTabProps {
  participants: Participant[];
  results: EventResult[];
  sukanekaResults: SukanekaResults;
  userRole?: 'ADMIN' | 'KETUA_RUMAH' | null;
}

const HOUSE_COLORS: Record<House, string> = {
  [House.BIRU]: '#3b82f6',
  [House.HIJAU]: '#10b981',
  [House.KUNING]: '#f59e0b',
  [House.MERAH]: '#f43f5e'
};

export const OverallResultsTab: React.FC<OverallResultsTabProps> = ({ participants, results, sukanekaResults, userRole }) => {
  const getParticipant = (id: string) => participants.find(p => p.id === id);
  const theme = userRole === 'ADMIN' ? 'indigo' : 'orange';
  const themeAccent = userRole === 'ADMIN' ? 'violet' : 'amber';

  const getPoints = (type: EventType, rank: number) => {
    return type === EventType.INDIVIDUAL ? [5, 3, 2, 1][rank - 1] || 0 : [10, 7, 5, 3][rank - 1] || 0;
  };

  const completedResults = results.filter(r => r.firstId || r.secondId || r.thirdId || r.fourthId);
  const completedSukaneka = (Object.entries(sukanekaResults) as [string, HouseRankResult][]).filter(
    ([_, res]) => res.first || res.second || res.third || res.fourth
  );

  const renderWinnerRow = (label: string, id: string, rank: number, type: EventType) => {
    if (!id) return null;
    const points = getPoints(type, rank);
    const isTeam = type === EventType.TEAM;
    const p = !isTeam ? getParticipant(id) : null;
    const houseVal = isTeam ? id as House : (p ? p.house : null);
    if (!isTeam && !p) return null;

    return (
      <div className={`flex items-center justify-between py-3 border-b border-${theme}-50 last:border-0`}>
        <div className="flex items-center gap-4">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-sporty text-lg text-white ${rank === 1 ? 'bg-yellow-500' : rank === 2 ? 'bg-slate-300' : rank === 3 ? 'bg-orange-500' : `bg-${theme}-400`}`}>
            {rank}
          </div>
          <div>
            <p className={`font-bold text-${theme}-950 text-sm leading-tight`}>{isTeam ? `RUMAH ${id.toUpperCase()}` : p?.name}</p>
            <p className={`text-[9px] font-black text-${theme}-400 uppercase tracking-widest`}>{houseVal} {p ? `• ${p.participantNumber}` : ''}</p>
          </div>
        </div>
        <div className="text-right"><span className={`text-lg font-sporty text-${theme}-600`}>+{points}</span></div>
      </div>
    );
  };

  const renderHouseRow = (house: House | '', rank: number) => {
    if (!house) return null;
    const points = [10, 7, 5, 3][rank - 1] || 0;
    return (
      <div className={`flex items-center justify-between py-3 border-b border-${theme}-50 last:border-0`}>
        <div className="flex items-center gap-4">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-sporty text-lg text-white ${rank === 1 ? 'bg-yellow-500' : rank === 2 ? 'bg-slate-300' : rank === 3 ? 'bg-orange-500' : `bg-${theme}-400`}`}>{rank}</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: HOUSE_COLORS[house] }}></div><span className={`font-bold text-${theme}-950 text-sm uppercase`}>Rumah {house}</span></div>
        </div>
        <div className="text-right"><span className={`text-lg font-sporty text-${themeAccent}-600`}>+{points}</span></div>
      </div>
    );
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div>
        <h2 className={`text-4xl font-bold text-${theme}-950 uppercase tracking-tight`}>Keputusan Balapan & Padang</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-8">
          {completedResults.map(res => {
            const event = SPORT_EVENTS.find(e => e.id === res.eventId);
            if (!event) return null;
            return (
              <div key={res.eventId} className={`bg-white rounded-[2.5rem] shadow-xl border border-${theme}-50 p-6`}>
                <div className="flex justify-between items-start mb-4">
                  <h3 className={`font-bold text-${theme}-950 text-lg uppercase leading-tight`}>{event.name}</h3>
                  <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase ${event.type === EventType.TEAM ? `bg-${themeAccent}-100 text-${themeAccent}-600` : `bg-${theme}-100 text-${theme}-600`}`}>{event.type}</span>
                </div>
                {renderWinnerRow('1st', res.firstId, 1, event.type)}
                {renderWinnerRow('2nd', res.secondId, 2, event.type)}
                {renderWinnerRow('3rd', res.thirdId, 3, event.type)}
                {renderWinnerRow('4th', res.fourthId, 4, event.type)}
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <h2 className={`text-4xl font-bold text-${themeAccent}-950 uppercase tracking-tight`}>Keputusan Sukaneka & Tarik Tali</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-8">
          {completedSukaneka.map(([event, res]) => (
            <div key={event} className={`bg-white rounded-[2.5rem] shadow-xl border border-${themeAccent}-100 p-6`}>
              <h3 className={`font-bold text-${themeAccent}-950 text-lg uppercase mb-4`}>{event}</h3>
              {renderHouseRow(res.first, 1)}
              {renderHouseRow(res.second, 2)}
              {renderHouseRow(res.third, 3)}
              {renderHouseRow(res.fourth, 4)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
