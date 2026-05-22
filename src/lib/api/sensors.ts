export type SensorStatus = 'optimal' | 'critical' | 'active' | 'good' | 'normal' | 'warning';
export type SensorColor = 'indigo' | 'green' | 'red' | 'amber' | 'cyan' | 'purple';
export type SensorStatusType = 'ok' | 'warn' | 'crit';

export interface Sensor {
  id: string;
  label: string;
  value: string;
  unit: string;
  status: string;
  color: SensorColor;
  icon: string;
  fill: number;
  statusType: SensorStatusType;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const initialSensors: Sensor[] = [
  { id: 'temp',     label: 'Temperature', value: '22.4', unit: '°C', status: 'optimal', color: 'indigo',  icon: 'thermometer-outline', fill: 55, statusType: 'ok' },
  { id: 'humidity', label: 'Humidity',    value: '47',   unit: '%',  status: 'optimal', color: 'green',   icon: 'water-outline',       fill: 47, statusType: 'ok' },
  { id: 'co2',      label: 'CO₂ Level',   value: '1842', unit: 'ppm',status: 'critical',color: 'red',     icon: 'alert-circle-outline',fill: 95, statusType: 'crit' },
  { id: 'motion',   label: 'Motion',      value: '12',   unit: ' zones', status: 'active', color: 'amber',   icon: 'radio-outline',       fill: 88, statusType: 'warn' },
  { id: 'aq',       label: 'Air Quality', value: '94',   unit: ' AQI', status: 'good',    color: 'cyan',    icon: 'leaf-outline',        fill: 62, statusType: 'ok' },
  { id: 'pressure', label: 'Pressure',    value: '1013', unit: ' hPa', status: 'normal',  color: 'purple',  icon: 'speedometer-outline', fill: 45, statusType: 'ok' },
];

export const mockSensorsApi = {
  getSensors: async (): Promise<Sensor[]> => {
    await sleep(800); // simulated load
    
    // Return initial values with slight random fluctuations to simulate active sensors
    return initialSensors.map(sensor => {
      let val = parseFloat(sensor.value);
      let fill = sensor.fill;
      let status = sensor.status;
      let statusType = sensor.statusType;

      if (sensor.id === 'temp') {
        val = Number((22.0 + Math.random() * 1.2).toFixed(1));
        fill = Math.round(((val - 15) / (30 - 15)) * 100);
      } else if (sensor.id === 'humidity') {
        val = Math.round(45 + Math.random() * 5);
        fill = val;
      } else if (sensor.id === 'co2') {
        // keep it critical but fluctuate
        val = Math.round(1800 + Math.random() * 90);
        fill = Math.min(100, Math.round((val / 2000) * 100));
      } else if (sensor.id === 'motion') {
        val = Math.round(10 + Math.random() * 4);
        fill = Math.round((val / 20) * 100);
      } else if (sensor.id === 'aq') {
        val = Math.round(90 + Math.random() * 8);
        fill = val;
      } else if (sensor.id === 'pressure') {
        val = Math.round(1010 + Math.random() * 6);
        fill = Math.round(((val - 980) / (1050 - 980)) * 100);
      }

      return {
        ...sensor,
        value: val.toString(),
        fill,
        status,
        statusType,
      };
    });
  }
};
