
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Participant, House } from '../types';

interface DashboardProps {
  participants: Participant[];
  userRole?: 'ADMIN' | 'KETUA_RUMAH' | null;
}

const HOUSE_COLORS: Record<House, string> = {
  [House.BIRU]: '#3b82f6',
  [House.HIJAU]: '#10b981',
  [House.KUNING]: '#f59e0b',
  [House.MERAH]: '#f43f5e'
};

export const Dashboard: React.FC<DashboardProps> = ({ participants, userRole }) => {
  const houseData = Object.values(House).map(h => ({
    name: h,
    count: participants.filter(p => p.house === h).length
  }));

  const totalEvents = participants.reduce((acc, p) => acc + p.events.length, 0);
  const theme = userRole === 'ADMIN' ? 'indigo' : 'orange';
  const themeAccent = userRole === 'ADMIN' ? 'violet' : 'amber';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8 mb-8 md:mb-12">
      {/* Cards Section */}
      <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-4 md:gap-6">
        <div className={`bg-${theme}-950 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border border-${theme}-900 flex flex-col justify-center items-center text-center relative overflow-hidden group`}>
          <div className={`absolute -bottom-4 -right-4 w-16 md:w-24 h-16 md:h-24 bg-${theme}-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`}></div>
          <span className={`text-${theme}-400 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] mb-1 md:mb-2`}>Jumlah Atlet</span>
          <span className="text-4xl md:text-6xl font-sporty text-white leading-none">{participants.length}</span>
        </div>
        <div className={`bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border border-${theme}-50 flex flex-col justify-center items-center text-center relative overflow-hidden group`}>
          <div className={`absolute -bottom-4 -right-4 w-16 md:w-24 h-16 md:h-24 bg-${themeAccent}-600/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`}></div>
          <span className={`text-${theme}-300 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] mb-1 md:mb-2`}>Jumlah Acara</span>
          <span className={`text-4xl md:text-6xl font-sporty text-${theme}-950 leading-none`}>{totalEvents}</span>
        </div>
      </div>
      
      {/* Chart Section */}
      <div className={`lg:col-span-3 bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl border border-${theme}-50 relative`}>
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 md:mb-10 gap-4">
           <h3 className={`text-xl md:text-2xl font-bold text-${theme}-950 uppercase tracking-tight`}>Statistik Pendaftaran</h3>
           <div className="flex flex-wrap justify-center gap-3 md:gap-4">
             {Object.values(House).map(h => (
               <div key={h} className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: HOUSE_COLORS[h] }}></div>
                 <span className={`text-[8px] md:text-[9px] font-black text-${theme}-300 uppercase tracking-widest`}>{h}</span>
               </div>
             ))}
           </div>
        </div>
        <div className="h-56 md:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={houseData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: userRole === 'ADMIN' ? '#6366f1' : '#ea580c', textTransform: 'uppercase' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#cbd5e1' }} allowDecimals={false} />
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '10px' }} />
              <Bar dataKey="count" radius={[10, 10, 10, 10]} barSize={30} md:barSize={50}>
                {houseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={HOUSE_COLORS[entry.name as House]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
