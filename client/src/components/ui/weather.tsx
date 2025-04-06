import { useDailyWeather, useHourlyWeather } from "../../hooks/use-weather";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
import { WeatherIcon } from "./weather-icon";
import { Skeleton } from "./skeleton";
import { formatHourMinute } from "../../lib/time";

interface WeatherProps {
  date: string;
  className?: string;
}

export function Weather({ date, className = "" }: WeatherProps) {
  const { data: weather, isLoading, error } = useDailyWeather(date);
  
  if (isLoading) {
    return (
      <Card className={`${className}`}>
        <CardHeader className="py-3">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-24 mt-2" />
        </CardHeader>
        <CardContent className="py-2 flex justify-between items-center">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-6 w-20" />
        </CardContent>
        <CardFooter className="py-3 flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </CardFooter>
      </Card>
    );
  }
  
  if (error || !weather) {
    return (
      <Card className={`${className}`}>
        <CardHeader className="py-3">
          <CardTitle className="text-lg font-medium">Weather</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  // Format date to show day name and date: "Monday, Apr 6"
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });
  
  return (
    <Card className={`${className}`}>
      <CardHeader className="py-3">
        <CardTitle className="text-lg font-medium">Weather</CardTitle>
        <CardDescription>{formattedDate}</CardDescription>
      </CardHeader>
      <CardContent className="py-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <WeatherIcon 
            condition={weather.conditions} 
            time="12:00" 
            size={28}
            className="text-[#FBBC05]" 
          />
          <span className="text-muted-foreground">{weather.conditions}</span>
        </div>
        <div className="font-medium">
          <span className="text-lg">{weather.highTemp}°</span>
          <span className="text-sm text-muted-foreground mx-1">/</span>
          <span className="text-sm text-muted-foreground">{weather.lowTemp}°</span>
        </div>
      </CardContent>
      <CardFooter className="py-3 flex justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <span>Precipitation:</span>
          <span className="font-medium">{weather.precipitation}mm</span>
        </div>
        <div className="flex items-center gap-2">
          <span>🌅 06:15</span>
          <span>🌇 19:45</span>
        </div>
      </CardFooter>
    </Card>
  );
}

// Component to display the weather for a specific clip
interface ClipWeatherProps {
  date: string;
  time: string;
  className?: string;
  compact?: boolean;
}

export function ClipWeather({ date, time, className = "", compact = false }: ClipWeatherProps) {
  const { data: hourlyWeather, isLoading, error } = useHourlyWeather(date, time.split(":")[0]);
  
  if (isLoading) {
    return compact ? (
      <div className={`flex items-center gap-2 ${className}`}>
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-4 w-12" />
      </div>
    ) : (
      <div className={`flex flex-col gap-2 ${className}`}>
        <Skeleton className="h-5 w-24" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    );
  }
  
  if (error || !hourlyWeather || hourlyWeather.length === 0) {
    return compact ? (
      <div className={`text-xs text-muted-foreground ${className}`}>No weather data</div>
    ) : (
      <div className={`text-sm text-muted-foreground ${className}`}>No weather data available</div>
    );
  }
  
  // Find the closest hour entry
  const hourData = hourlyWeather[0];
  
  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <WeatherIcon 
          condition={hourData.conditions} 
          time={time} 
          size={16}
          className="text-[#FBBC05]" 
        />
        <span className="text-xs">{hourData.temperature}°</span>
      </div>
    );
  }
  
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="text-sm font-medium">Weather at {formatHourMinute(time)}</div>
      <div className="flex items-center gap-2">
        <WeatherIcon 
          condition={hourData.conditions} 
          time={time} 
          size={20}
          className="text-[#FBBC05]" 
        />
        <div className="flex flex-col">
          <span className="text-sm font-medium">{hourData.temperature}° {hourData.conditions}</span>
          <span className="text-xs text-muted-foreground">
            Wind: {hourData.windSpeed} km/h {hourData.windDirection}, 
            Precip: {hourData.precipitation}mm
          </span>
        </div>
      </div>
    </div>
  );
}