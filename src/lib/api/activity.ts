export type ActivityType = 'alert' | 'ok' | 'info';

export interface ActivityItem {
  id: string;
  title: string;
  time: string;
  type: ActivityType;
  icon: string;
  color: string;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const initialActivity: ActivityItem[] = [
  {
    id: 'act_1',
    title: 'CO₂ Alert in Suite 2204 — Level reached 1842 ppm',
    time: '2 mins ago',
    type: 'alert',
    icon: 'alert-circle-outline',
    color: 'red',
  },
  {
    id: 'act_2',
    title: 'HVAC filtration cycle completed in Grand Ballroom',
    time: '15 mins ago',
    type: 'ok',
    icon: 'leaf-outline',
    color: 'green',
  },
  {
    id: 'act_3',
    title: 'Main Lobby humidity stabilized to 45%',
    time: '42 mins ago',
    type: 'info',
    icon: 'water-outline',
    color: 'indigo',
  },
  {
    id: 'act_4',
    title: 'Executive Suite 1801 smart access lock locked',
    time: '1 hr ago',
    type: 'info',
    icon: 'lock-closed-outline',
    color: 'purple',
  },
  {
    id: 'act_5',
    title: 'Wine Cellar temperature alarm cleared',
    time: '2 hrs ago',
    type: 'ok',
    icon: 'checkmark-circle-outline',
    color: 'green',
  },
  {
    id: 'act_6',
    title: 'Staff Entrance motion sensor maintenance checked',
    time: '4 hrs ago',
    type: 'info',
    icon: 'build-outline',
    color: 'amber',
  }
];

export const mockActivityApi = {
  getActivity: async (limit?: number): Promise<ActivityItem[]> => {
    await sleep(600); // simulated load
    return limit ? initialActivity.slice(0, limit) : initialActivity;
  }
};
