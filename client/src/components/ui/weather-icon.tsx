import { 
  Cloud, 
  CloudRain, 
  CloudDrizzle, 
  Sun, 
  Moon, 
  CloudSun, 
  CloudMoon 
} from "lucide-react";

type WeatherCondition = 
  | "Sunny" 
  | "Clear" 
  | "Partly Cloudy" 
  | "Cloudy" 
  | "Drizzle" 
  | "Light Rain" 
  | "Heavy Rain";

interface WeatherIconProps {
  condition: string;
  time?: string; // Optional time in "HH:MM" format
  className?: string;
  size?: number;
}

export function WeatherIcon({ 
  condition, 
  time, 
  className = "", 
  size = 24 
}: WeatherIconProps) {
  // Determine if it's day or night based on time
  const isNight = (): boolean => {
    if (!time) return false;
    
    const hour = parseInt(time.split(":")[0]);
    return hour < 6 || hour >= 19; // Consider night time between 7pm and 6am
  };
  
  // Map condition to the appropriate icon
  const getIcon = () => {
    const normalizedCondition = condition as WeatherCondition;
    
    switch (normalizedCondition) {
      case "Sunny":
        return isNight() ? <Moon size={size} className={className} /> : <Sun size={size} className={className} />;
      case "Clear":
        return isNight() ? <Moon size={size} className={className} /> : <Sun size={size} className={className} />;
      case "Partly Cloudy":
        return isNight() 
          ? <CloudMoon size={size} className={className} /> 
          : <CloudSun size={size} className={className} />;
      case "Cloudy":
        return <Cloud size={size} className={className} />;
      case "Drizzle":
        return <CloudDrizzle size={size} className={className} />;
      case "Light Rain":
        return <CloudDrizzle size={size} className={className} />;
      case "Heavy Rain":
        return <CloudRain size={size} className={className} />;
      default:
        return <Sun size={size} className={className} />; // Default to sun
    }
  };
  
  return getIcon();
}