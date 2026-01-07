import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Car, MapPin, AlertTriangle, Activity } from 'lucide-react';
import { useDevices } from '../hooks/useDevices';
import { useDeviceLocations } from '../hooks/useLocations';

export default function DashboardPage() {
  const { data: response, isLoading } = useDevices();
  const devices = response?.data || [];
  const deviceImeis = devices.map((d: { imei?: string }) => d.imei).filter(Boolean) as string[];
  
  const { data: locationsData } = useDeviceLocations(deviceImeis);
  const onlineDevices = locationsData?.filter(({ location }) => location !== null) || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Dashboard Overview</h2>
        <p className="text-muted-foreground mt-2">
          Welcome to your GPS tracking dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '--' : devices.length}</div>
            <p className="text-xs text-muted-foreground mt-1">All registered devices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Online Devices</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{isLoading ? '--' : onlineDevices.length}</div>
            <p className="text-xs text-muted-foreground mt-1">With GPS data</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Alarms</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{isLoading ? '--' : 0}</div>
            <p className="text-xs text-muted-foreground mt-1">No alarms configured</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
            <MapPin className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{isLoading ? '--' : '100+'}</div>
            <p className="text-xs text-muted-foreground mt-1">GPS records stored</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              No recent activity to display
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">API Connection</span>
                <span className="text-sm text-green-600 font-medium">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Real-time Updates</span>
                <span className="text-sm text-green-600 font-medium">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Map Service</span>
                <span className="text-sm text-green-600 font-medium">Available</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
