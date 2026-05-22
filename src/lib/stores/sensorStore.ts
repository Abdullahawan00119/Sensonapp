import { create } from 'zustand';
import { mockSensorsApi, Sensor } from '../api/sensors';

interface Thresholds {
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

export const useSensorStore = create<SensorState>((set, get) => ({
  sensors: [],
  lastUpdated: null,
  isLoading: false,
  error: null,
  thresholds: {
    tempMin: 18,
    tempMax: 26,
    humidityMin: 30,
    humidityMax: 65,
    co2Max: 1200, // standard CO2 warning threshold is around 1000-1200ppm, 1800+ is critical!
    aqiMin: 70,   // standard AQI warning
  },

  updateThreshold: (key, value) => {
    set((state) => {
      const nextThresholds = { ...state.thresholds, [key]: value };
      
      // Re-evaluate sensor statuses based on new thresholds
      const updatedSensors = state.sensors.map((sensor) => {
        let statusType = sensor.statusType;
        let statusText = sensor.status;
        const val = parseFloat(sensor.value);

        if (sensor.id === 'temp') {
          if (val > nextThresholds.tempMax || val < nextThresholds.tempMin) {
            statusType = 'warn';
            statusText = val > nextThresholds.tempMax ? 'high' : 'low';
          } else {
            statusType = 'ok';
            statusText = 'optimal';
          }
        } else if (sensor.id === 'humidity') {
          if (val > nextThresholds.humidityMax || val < nextThresholds.humidityMin) {
            statusType = 'warn';
            statusText = val > nextThresholds.humidityMax ? 'high' : 'low';
          } else {
            statusType = 'ok';
            statusText = 'optimal';
          }
        } else if (sensor.id === 'co2') {
          if (val > nextThresholds.co2Max) {
            statusType = val > nextThresholds.co2Max * 1.3 ? 'crit' : 'warn';
            statusText = statusType === 'crit' ? 'critical' : 'warning';
          } else {
            statusType = 'ok';
            statusText = 'optimal';
          }
        }

        return {
          ...sensor,
          statusType,
          status: statusText,
        };
      });

      return {
        thresholds: nextThresholds,
        sensors: updatedSensors,
      };
    });
  },

  fetchSensors: async () => {
    set({ isLoading: true, error: null });
    try {
      const rawSensors = await mockSensorsApi.getSensors();
      
      // Apply thresholds override to statuses
      const { thresholds } = get();
      const sensors = rawSensors.map((sensor) => {
        let statusType = sensor.statusType;
        let statusText = sensor.status;
        const val = parseFloat(sensor.value);

        if (sensor.id === 'temp') {
          if (val > thresholds.tempMax || val < thresholds.tempMin) {
            statusType = 'warn';
            statusText = val > thresholds.tempMax ? 'high' : 'low';
          } else {
            statusType = 'ok';
            statusText = 'optimal';
          }
        } else if (sensor.id === 'humidity') {
          if (val > thresholds.humidityMax || val < thresholds.humidityMin) {
            statusType = 'warn';
            statusText = val > thresholds.humidityMax ? 'high' : 'low';
          } else {
            statusType = 'ok';
            statusText = 'optimal';
          }
        } else if (sensor.id === 'co2') {
          if (val > thresholds.co2Max) {
            statusType = val > thresholds.co2Max * 1.3 ? 'crit' : 'warn';
            statusText = statusType === 'crit' ? 'critical' : 'warning';
          } else {
            statusType = 'ok';
            statusText = 'optimal';
          }
        }

        return {
          ...sensor,
          statusType,
          status: statusText,
        };
      });

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
    set((state) => {
      const sensors = state.sensors.map((sensor) => {
        if (sensor.id !== id) return sensor;
        
        const val = parseFloat(value);
        let statusType = sensor.statusType;
        let statusText = sensor.status;
        const thresholds = state.thresholds;

        if (id === 'temp') {
          if (val > thresholds.tempMax || val < thresholds.tempMin) {
            statusType = 'warn';
            statusText = val > thresholds.tempMax ? 'high' : 'low';
          } else {
            statusType = 'ok';
            statusText = 'optimal';
          }
        } else if (id === 'humidity') {
          if (val > thresholds.humidityMax || val < thresholds.humidityMin) {
            statusType = 'warn';
            statusText = val > thresholds.humidityMax ? 'high' : 'low';
          } else {
            statusType = 'ok';
            statusText = 'optimal';
          }
        } else if (id === 'co2') {
          if (val > thresholds.co2Max) {
            statusType = val > thresholds.co2Max * 1.3 ? 'crit' : 'warn';
            statusText = statusType === 'crit' ? 'critical' : 'warning';
          } else {
            statusType = 'ok';
            statusText = 'optimal';
          }
        }

        const maxRangeVal = id === 'co2' ? 2000 : id === 'humidity' ? 100 : id === 'temp' ? 40 : 1200;
        const fill = Math.min(100, Math.round((val / maxRangeVal) * 100));

        return {
          ...sensor,
          value,
          fill,
          statusType,
          status: statusText,
        };
      });

      return { sensors };
    });
  }
}));
