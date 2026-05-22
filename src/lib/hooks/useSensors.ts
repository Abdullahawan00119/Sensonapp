import { useQuery } from '@tanstack/react-query';
import { useSensorStore } from '../stores/sensorStore';

export function useSensors() {
  const { fetchSensors, sensors, isLoading, error, lastUpdated } = useSensorStore();

  const query = useQuery({
    queryKey: ['sensors'],
    queryFn: async () => {
      await fetchSensors();
      return useSensorStore.getState().sensors;
    },
    refetchInterval: 30000, // 30 seconds auto-refresh
    staleTime: 25000,
    refetchOnWindowFocus: true,
  });

  return {
    sensors: query.data || sensors,
    isLoading: query.isLoading || isLoading,
    error: query.error ? (query.error as Error).message : error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
    lastUpdated,
  };
}
