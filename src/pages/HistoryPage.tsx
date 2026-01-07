import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import type { LatLngTuple } from 'leaflet';
import { useDevices } from '../hooks/useDevices';
import { useHistoricalTrack } from '../hooks/useLocations';
import { Card, CardContent } from '../components/ui/Card';
import { Play, Pause, SkipBack, SkipForward, Calendar, Clock, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Create marker icons
const currentIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const startIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const endIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const formatDateTimeLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Get default date range
const getDefaultDateRange = () => {
  const end = new Date();
  const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
  return {
    start: formatDateTimeLocal(start),
    end: formatDateTimeLocal(end),
  };
};

export default function HistoryPage() {
  const { data: devicesResponse, isLoading: devicesLoading } = useDevices();
  
  // Get default date range
  const defaultDates = getDefaultDateRange();
  
  // State for filters
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(defaultDates.start);
  const [endDate, setEndDate] = useState<string>(defaultDates.end);
  
  // State for playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  
  // Fetch historical track
  const startTime = startDate ? Math.floor(new Date(startDate).getTime() / 1000) : 0;
  const endTime = endDate ? Math.floor(new Date(endDate).getTime() / 1000) : 0;
  
  const { data: trackPoints, isLoading: trackLoading } = useHistoricalTrack(
    selectedDevice,
    startTime,
    endTime,
    !!selectedDevice && !!startTime && !!endTime
  );
  
  // Playback effect
  useEffect(() => {
    if (!isPlaying || !trackPoints || trackPoints.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= trackPoints.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / playbackSpeed);
    
    return () => clearInterval(interval);
  }, [isPlaying, trackPoints, playbackSpeed]);
  
  const handlePlayPause = () => {
    if (trackPoints && trackPoints.length > 0) {
      if (currentIndex >= trackPoints.length - 1) {
        setCurrentIndex(0);
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const handleReset = () => {
    setCurrentIndex(0);
    setIsPlaying(false);
  };
  
  const handleSkipToEnd = () => {
    if (trackPoints && trackPoints.length > 0) {
      setCurrentIndex(trackPoints.length - 1);
      setIsPlaying(false);
    }
  };
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = parseInt(e.target.value);
    setCurrentIndex(index);
    setIsPlaying(false);
  };
  
  const getDeviceName = useCallback((imei: string): string => {
    const devices = devicesResponse?.data || [];
    const device = devices.find((d) => d.imei === imei);
    return device?.carNumber || imei;
  }, [devicesResponse]);
  
  // Calculate map center and bounds
  const mapCenter: LatLngTuple = trackPoints && trackPoints.length > 0
    ? [trackPoints[0].latitude, trackPoints[0].longitude]
    : [13.7563, 100.5018]; // Bangkok default
  
  const pathCoordinates: LatLngTuple[] = trackPoints
    ? trackPoints.slice(0, currentIndex + 1).map(p => [p.latitude, p.longitude])
    : [];
  
  const currentPoint = trackPoints && trackPoints[currentIndex];
  const startPoint = trackPoints && trackPoints[0];
  const endPoint = trackPoints && trackPoints[trackPoints.length - 1];
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Location History</h2>
        <p className="text-muted-foreground mt-2">
          View and playback historical location tracks
        </p>
      </div>
      
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Device</label>
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                disabled={devicesLoading}
              >
                <option value="">Select device...</option>
                {devicesResponse?.data?.map((device) => (
                  <option key={device.imei} value={device.imei}>
                    {device.carNumber} ({device.imei})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                End Date & Time
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Playback Speed</label>
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={2}>2x</option>
                <option value={5}>5x</option>
                <option value={10}>10x</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Map */}
      <Card>
        <CardContent className="p-0">
          <div className="h-[500px] relative">
            <MapContainer
              center={mapCenter}
              zoom={13}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Track path */}
              {pathCoordinates.length > 1 && (
                <Polyline
                  positions={pathCoordinates}
                  color="blue"
                  weight={3}
                  opacity={0.7}
                />
              )}
              
              {/* Start marker */}
              {startPoint && (
                <Marker position={[startPoint.latitude, startPoint.longitude]} icon={startIcon}>
                  <Popup>
                    <div className="text-sm">
                      <div className="font-semibold mb-1">Start Point</div>
                      <div>Time: {new Date(startPoint.time * 1000).toLocaleString()}</div>
                      <div>Speed: {startPoint.speed} km/h</div>
                    </div>
                  </Popup>
                </Marker>
              )}
              
              {/* Current position marker */}
              {currentPoint && (
                <Marker position={[currentPoint.latitude, currentPoint.longitude]} icon={currentIcon}>
                  <Popup>
                    <div className="text-sm">
                      <div className="font-semibold mb-1">Current Position</div>
                      <div>Time: {new Date(currentPoint.time * 1000).toLocaleString()}</div>
                      <div>Speed: {currentPoint.speed} km/h</div>
                      <div>Direction: {currentPoint.direction}°</div>
                    </div>
                  </Popup>
                </Marker>
              )}
              
              {/* End marker (only show if not at current position) */}
              {endPoint && currentIndex < (trackPoints?.length || 0) - 1 && (
                <Marker position={[endPoint.latitude, endPoint.longitude]} icon={endIcon}>
                  <Popup>
                    <div className="text-sm">
                      <div className="font-semibold mb-1">End Point</div>
                      <div>Time: {new Date(endPoint.time * 1000).toLocaleString()}</div>
                      <div>Speed: {endPoint.speed} km/h</div>
                    </div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
            
            {trackLoading && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                <div className="bg-white p-4 rounded-lg shadow-lg">
                  Loading track data...
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Playback Controls */}
      {trackPoints && trackPoints.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Timeline Slider */}
              <div>
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, trackPoints.length - 1)}
                  value={currentIndex}
                  onChange={handleSliderChange}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{startPoint ? new Date(startPoint.time * 1000).toLocaleString() : ''}</span>
                  <span>{endPoint ? new Date(endPoint.time * 1000).toLocaleString() : ''}</span>
                </div>
              </div>
              
              {/* Control Buttons */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50 flex items-center gap-2"
                >
                  <SkipBack className="h-4 w-4" />
                  Reset
                </button>
                
                <button
                  onClick={handlePlayPause}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Play
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleSkipToEnd}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50 flex items-center gap-2"
                >
                  Skip to End
                  <SkipForward className="h-4 w-4" />
                </button>
              </div>
              
              {/* Current Info */}
              {currentPoint && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Position
                    </div>
                    <div className="font-medium text-sm">
                      {currentIndex + 1} / {trackPoints.length}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Time
                    </div>
                    <div className="font-medium text-sm">
                      {new Date(currentPoint.time * 1000).toLocaleTimeString()}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Speed</div>
                    <div className="font-medium text-sm">{currentPoint.speed} km/h</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Direction</div>
                    <div className="font-medium text-sm">{currentPoint.direction}°</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* No Data Message */}
      {!trackLoading && (!trackPoints || trackPoints.length === 0) && selectedDevice && (
        <Card>
          <CardContent className="py-12 text-center">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No track data found</h3>
            <p className="text-muted-foreground">
              No location history available for {getDeviceName(selectedDevice)} in the selected time range.
              <br />
              Try selecting a different date range or check if the device was active during this period.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
