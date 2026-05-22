import { create } from 'zustand';
import { mockSensorsApi, Sensor, SensorStatusType } from '../api/sensors';

export interface Thresholds {
  tempMin: number;
  tempMax: number;
  humidityMin: number;
  humidityMax: number;
  co2Max: number;
  aqiMin: number;
}

interface SensorState {
  sensors: Sensor[];
  lastUpdated: string | null;
  isLoading: boolean;
  error: string | null;
  thresholds: Thresholds;
  updateThreshold: (key: keyof Thresholds, value: number) => void;
  fetchSensors: () => Promise<void>;
  updateSensorValue: (id: string, value: string) => void;
}

// Single source of truth for threshold evaluation
function evaluateSensor(sensor: Sensor, thresholds: Thresholds): Sensor {
  const val = parseFloat(sensor.value);
  let statusType: SensorStatusType = sensor.statusType;
  let status = sensor.status;

  if (sensor.id === 'temp') {
    if (val > thresholds.tempMax || val < thresholds.tempMin) {
      statusType = 'warn';
      status = val > thresholds.tempMax ? 'high' : 'low';
    } else {
      statusType = 'ok';
      status = 'optimal';
    }
  } else if (sensor.id === 'humidity') {
    if (val > thresholds.humidityMax || val < thresholds.humidityMin) {
      statusType = 'warn';
      status = val > thresholds.humidityMax ? 'high' : 'low';
    } else {
      statusType = 'ok';
      status = 'optimal';
    }
  } else if (sensor.id === 'co2') {
    if (val > thresholds.co2Max) {
      statusType = val > thresholds.co2Max * 1.3 ? 'crit' : 'warn';
      status = statusType === 'crit' ? 'critical' : 'warning';
    } else {
      statusType = 'ok';
      status = 'optimal';
    }
  } else if (sensor.id === 'aq') {
    if (val < thresholds.aqiMin) {
      statusType = 'warn';
      status = 'low';
    } else {
      statusType = 'ok';
      status = 'good';
    }
  }

  return { ...sensor, statusType, status };
}

const DEFAULT_THRESHOLDS: Thresholds = {
  tempMin: 18,
  tempMax: 26,
  humidityMin: 30,
  humidityMax: 65,
  co2Max: 1200,
  aqiMin: 70,
};

export const useSensorStore = create<SensorState>((set, get) => ({
  sensors: [],
  lastUpdated: null,
  isLoading: false,
  error: null,
  thresholds: DEFAULT_THRESHOLDS,

  updateThreshold: (key, value) => {
    set(state => {
      const thresholds = { ...state.thresholds, [key]: value };
      const sensors = state.sensors.map(s => evaluateSensor(s, thresholds));
      return { thresholds, sensors };
    });
  },

  fetchSensors: async () => {
    set({ isLoading: true, error: null });
    try {
      const raw = await mockSensorsApi.getSensors();
      const { thresholds } = get();
      const sensors = raw.map(s => evaluateSensor(s, thresholds));
      set({
        sensors,
        isLoading: false,
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        error: null,
      });
    } catch (e: any) {
      set({ error: e.message || 'Failed to fetch sensor data', isLoading: false });
    }
  },

  updateSensorValue: (id, value) => {
    set(state => {
      const sensors = state.sensors.map(sensor => {
        if (sensor.id !== id) return sensor;
        const val = parseFloat(value);
        const maxRange = id === 'co2' ? 2000 : id === 'humidity' ? 100 : id === 'temp' ? 40 : 1200;
        const fill = Math.min(100, Math.round((val / maxRange) * 100));
        return evaluateSensor({ ...sensor, value, fill }, state.thresholds);
      });
      return { sensors };
    });
  },
}));
