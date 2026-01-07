import { create } from 'zustand';
import type { Alarm } from '../types';

interface AlarmState {
  alarms: Alarm[];
  filteredAlarmTypes: number[];
  setAlarms: (alarms: Alarm[]) => void;
  addAlarm: (alarm: Alarm) => void;
  setFilteredAlarmTypes: (types: number[]) => void;
  clearAlarms: () => void;
}

export const useAlarmStore = create<AlarmState>((set) => ({
  alarms: [],
  filteredAlarmTypes: [],
  setAlarms: (alarms) => set({ alarms }),
  addAlarm: (alarm) =>
    set((state) => ({
      alarms: [alarm, ...state.alarms],
    })),
  setFilteredAlarmTypes: (types) => set({ filteredAlarmTypes: types }),
  clearAlarms: () => set({ alarms: [] }),
}));
