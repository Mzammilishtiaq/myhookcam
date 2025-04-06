import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "../lib/queryClient";

// Import the required types directly without using the schema import
type WeatherDaily = {
  date: string;
  highTemp: number;
  lowTemp: number;
  precipitation: number;
  conditions: string;
  createdAt?: Date;
};

type WeatherHourly = {
  date: string;
  time: string;
  temperature: number;
  precipitation: number;
  windSpeed: number;
  windDirection: string;
  conditions: string;
  createdAt?: Date;
};

/**
 * Hook to fetch daily weather data for a specific date
 */
export function useDailyWeather(date: string) {
  return useQuery({
    queryKey: ['/api/weather/daily', date],
    queryFn: getQueryFn<WeatherDaily>({ on401: "throw" }),
    enabled: !!date,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch hourly weather data for a specific date and optional hour
 */
export function useHourlyWeather(date: string, hour?: string) {
  return useQuery({
    queryKey: ['/api/weather/hourly', date, hour],
    queryFn: getQueryFn<WeatherHourly[]>({ on401: "throw" }),
    enabled: !!date,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch weather data for a specific clip time
 * This returns the hourly weather data for the specific hour of the clip
 */
export function useClipWeather(date: string, clipTime: string) {
  // Extract the hour from the clip time (format: HH:MM)
  const hour = clipTime.split(':')[0];
  
  return useQuery({
    queryKey: ['/api/weather/hourly', date, hour],
    queryFn: getQueryFn<WeatherHourly[]>({ on401: "throw" }),
    enabled: !!date && !!clipTime,
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => {
      // Find the weather data for the specific time
      const hourMatch = data.find(entry => {
        // Extract hour from entries (format: HH:00)
        const entryHour = entry.time.split(':')[0];
        return entryHour === hour;
      });
      
      return hourMatch || null;
    }
  });
}