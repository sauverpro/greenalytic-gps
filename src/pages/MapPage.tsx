import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngBounds, type LatLngExpression } from 'leaflet';
import { useDevices } from '../hooks/useDevices';
import { useDeviceLocations } from '../hooks/useLocations';
import { Navigation, Activity, Clock, Search, ChevronDown, Users, Car, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue with Webpack/Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Component to fit map bounds to show all markers
const FitBounds = ({ positions }: { positions: LatLngExpression[] }) => {
  const map = useMap();
  
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = new LatLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [map, positions]);
  
  return null;
};

export default function MapPage() {
  const { data: devicesResponse, isLoading: devicesLoading } = useDevices();
  const devices = useMemo(() => devicesResponse?.data || [], [devicesResponse]);
  const deviceImeis = useMemo(() => 
    devices
      .filter(d => d.imei && d.imei.trim() !== '')
      .map(d => d.imei),
    [devices]
  );
  const { data: locationResults = [] } = useDeviceLocations(deviceImeis);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline'>('all');
  
  // Create a map of locations by IMEI
  const locationsByImei = useMemo(() => {
    return new Map(
      locationResults
        .filter(result => result.location)
        .map(result => [result.imei, result.location!])
    );
  }, [locationResults]);
  
  // Combine devices with their locations
  const devicesWithLocation = useMemo(() => {
    return devices.map(device => ({
      ...device,
      location: locationsByImei.get(device.imei),
      isOnline: locationsByImei.has(device.imei)
    }));
  }, [devices, locationsByImei]);

  // Group devices by user (groupName acts as user/fleet)
  const devicesByUser = useMemo(() => {
    const grouped = new Map<string, typeof devicesWithLocation>();
    devicesWithLocation.forEach(device => {
      const user = device.groupName || 'Unassigned';
      if (!grouped.has(user)) {
        grouped.set(user, []);
      }
      grouped.get(user)!.push(device);
    });
    return grouped;
  }, [devicesWithLocation]);

  // Filter devices based on search and status
  const filteredDevices = useMemo(() => {
    let filtered = devicesWithLocation;
    
    if (selectedUser) {
      filtered = devicesByUser.get(selectedUser) || [];
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(d => 
        filterStatus === 'online' ? d.isOnline : !d.isOnline
      );
    }
    
    if (searchTerm) {
      filtered = filtered.filter(d => 
        d.carNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.imei.includes(searchTerm)
      );
    }
    
    return filtered;
  }, [devicesWithLocation, devicesByUser, selectedUser, filterStatus, searchTerm]);

  // Get selected device for map focus
  const focusedDevice = useMemo(() => {
    if (selectedDevice) {
      return devicesWithLocation.find(d => d.imei === selectedDevice);
    }
    return null;
  }, [selectedDevice, devicesWithLocation]);

  // Map positions
  const mapCenter: LatLngExpression = focusedDevice?.location 
    ? [focusedDevice.location.latitude, focusedDevice.location.longitude]
    : [0, 0];

  const positions: LatLngExpression[] = useMemo(() => {
    const devicesToShow = selectedDevice 
      ? devicesWithLocation.filter(d => d.imei === selectedDevice && d.location)
      : filteredDevices.filter(d => d.location);
    
    return devicesToShow.map(d => [d.location!.latitude, d.location!.longitude]);
  }, [filteredDevices, selectedDevice, devicesWithLocation]);
  
  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const onlineCount = devicesWithLocation.filter(d => d.isOnline).length;
  const offlineCount = devicesWithLocation.length - onlineCount;

  return (
    <div className="h-full flex">
      {/* Left Sidebar */}
      <div className="w-60 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Users className="w-5 h-5" />
            User list
          </h2>
          
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search devices or users"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded ${filterStatus === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              All {devices.length}
            </button>
            <button
              onClick={() => setFilterStatus('online')}
              className={`px-3 py-1 rounded ${filterStatus === 'online' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              Online {onlineCount}
            </button>
            <button
              onClick={() => setFilterStatus('offline')}
              className={`px-3 py-1 rounded ${filterStatus === 'offline' ? 'bg-gray-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              Offline {offlineCount}
            </button>
          </div>
        </div>

        {/* User/Device List */}
        <div className="flex-1 overflow-y-auto">
          {devicesLoading ? (
            <div className="flex items-center justify-center h-40">
              <Activity className="w-8 h-8 text-gray-400 animate-pulse" />
            </div>
          ) : (
            <div className="p-2">
              {/* Show users as expandable groups */}
              {Array.from(devicesByUser.entries()).map(([userName, userDevices]) => {
                const filteredUserDevices = userDevices.filter(d => {
                  if (filterStatus === 'online' && !d.isOnline) return false;
                  if (filterStatus === 'offline' && d.isOnline) return false;
                  if (searchTerm && !d.carNumber?.toLowerCase().includes(searchTerm.toLowerCase()) &&
                      !d.imei.includes(searchTerm)) return false;
                  return true;
                });

                if (filteredUserDevices.length === 0 && searchTerm) return null;

                const isExpanded = selectedUser === userName;
                const userOnlineCount = userDevices.filter(d => d.isOnline).length;

                return (
                  <div key={userName} className="mb-2">
                    {/* User Header */}
                    <button
                      onClick={() => setSelectedUser(isExpanded ? null : userName)}
                      className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className="font-medium text-sm text-gray-900">{userName}</span>
                        <span className="text-xs text-gray-500">({userOnlineCount}/{userDevices.length})</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Device List */}
                    {isExpanded && (
                      <div className="ml-4 mt-1 space-y-1">
                        {filteredUserDevices.map(device => (
                          <button
                            key={device.imei}
                            onClick={() => setSelectedDevice(device.imei === selectedDevice ? null : device.imei)}
                            className={`w-full flex items-start gap-2 p-2 rounded-md text-left transition-colors ${
                              selectedDevice === device.imei 
                                ? 'bg-blue-50 border-l-2 border-blue-500' 
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <Car className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm text-gray-900 truncate">
                                  {device.carNumber || 'Unnamed'}
                                </span>
                                <span className={`px-1.5 py-0.5 text-xs rounded ${
                                  device.isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                }`}>
                                  {device.isOnline ? 'Online' : 'Offline'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">{device.groupName}</p>
                              {device.location && (
                                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {device.location.speed} km/h
                                </p>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        {positions.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {selectedDevice ? 'No GPS Data' : 'Select a Device'}
              </h3>
              <p className="text-gray-600">
                {selectedDevice 
                  ? 'This device has not reported its location yet'
                  : 'Choose a device from the list to view its location on the map'}
              </p>
            </div>
          </div>
        ) : (
          <MapContainer
            center={mapCenter}
            zoom={focusedDevice ? 15 : 13}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <FitBounds positions={positions} />
            
            {(selectedDevice 
              ? devicesWithLocation.filter(d => d.imei && d.imei === selectedDevice && d.location)
              : filteredDevices.filter(d => d.imei && d.location)
            ).map(device => (
              <Marker
                key={device.imei}
                position={[device.location!.latitude, device.location!.longitude]}
              >
                <Popup>
                  <div className="min-w-[250px]">
                    <h3 className="font-bold text-lg mb-2">{device.carNumber || 'Unnamed Device'}</h3>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">Fleet:</span>
                        <span>{device.groupName || 'N/A'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">IMEI:</span>
                        <span className="font-mono text-xs">{device.imei}</span>
                      </div>
                      
                      <div className="border-t pt-2 mt-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Navigation className="w-4 h-4 text-blue-500" />
                          <span className="font-medium text-gray-700">Position:</span>
                        </div>
                        <div className="ml-6 text-xs space-y-1">
                          <div>Lat: {device.location!.latitude.toFixed(6)}</div>
                          <div>Lon: {device.location!.longitude.toFixed(6)}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-green-500" />
                        <span className="font-medium text-gray-700">Speed:</span>
                        <span>{device.location!.speed} km/h</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-purple-500" />
                        <span className="font-medium text-gray-700">Direction:</span>
                        <span>{device.location!.direction}°</span>
                      </div>
                      
                      <div className="border-t pt-2 mt-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-700">Last Update:</span>
                        </div>
                        <div className="ml-6 text-xs text-gray-600">
                          {formatDateTime(device.location!.time)}
                        </div>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
}
