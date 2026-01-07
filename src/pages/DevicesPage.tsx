import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDevices, useBindDevice, useUnbindDevice, useUpdateDevice } from '../hooks/useDevices';
import { useDeviceLocations } from '../hooks/useLocations';
import { getUsers } from '../api/users';
import { useAuthStore } from '../stores';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '../components/ui/Dialog';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Car, MapPin, Signal, Navigation, Plus, Edit2, Trash2 } from 'lucide-react';
import type { Device } from '../types';

export default function DevicesPage() {
  const { data: response, isLoading, error } = useDevices();
  const devices = response?.data || [];
  const deviceImeis = devices.map((d: { imei?: string }) => d.imei).filter(Boolean) as string[];
  
  const { data: locationsData } = useDeviceLocations(deviceImeis);
  const { isAdmin } = useAuthStore();
  
  // Fetch users list for admin
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    enabled: isAdmin(),
  });
  
  // Device management mutations
  const bindDevice = useBindDevice();
  const unbindDevice = useUnbindDevice();
  const updateDevice = useUpdateDevice();
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    imei: '',
    carNumber: '',
    ownerName: '',
    sim: '',
    ownerTel: '',
    remark: '',
    userId: undefined as number | undefined,
  });
  
  const resetForm = () => {
    setFormData({
      imei: '',
      carNumber: '',
      ownerName: '',
      sim: '',
      ownerTel: '',
      remark: '',
      userId: undefined,
    });
  };
  
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await bindDevice.mutateAsync({
        macid: formData.imei,
        fullName: formData.ownerName,
        plateNumber: formData.carNumber,
        userId: formData.userId,
      });
      setAddDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to add device:', error);
    }
  };
  
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDevice) return;
    
    try {
      await updateDevice.mutateAsync({
        macid: selectedDevice.imei,
        fullName: formData.ownerName,
        plateNumber: formData.carNumber,
        linkTel: formData.ownerTel,
        sim: formData.sim,
        userId: formData.userId,
      });
      setEditDialogOpen(false);
      setSelectedDevice(null);
      resetForm();
    } catch (error) {
      console.error('Failed to update device:', error);
    }
  };
  
  const handleDelete = async () => {
    if (!selectedDevice) return;
    
    try {
      await unbindDevice.mutateAsync(selectedDevice.imei);
      setDeleteDialogOpen(false);
      setSelectedDevice(null);
    } catch (error) {
      console.error('Failed to delete device:', error);
    }
  };
  
  const openEditDialog = (device: Device) => {
    setSelectedDevice(device);
    setFormData({
      imei: device.imei,
      carNumber: device.carNumber || '',
      ownerName: device.ownerName || '',
      sim: device.sim || '',
      ownerTel: device.ownerTel || '',
      remark: device.remark || '',
      userId: device.userId,
    });
    setEditDialogOpen(true);
  };
  
  const openDeleteDialog = (device: Device) => {
    setSelectedDevice(device);
    setDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading devices...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-600">Error loading devices: {error.message}</div>
      </div>
    );
  }

  // Create a map of locations by IMEI
  const locationsByImei = new Map(
    locationsData?.map(({ imei, location }) => [imei, location]) || []
  );

  const devicesWithLocation = devices.map((device: { imei?: string }) => ({
    ...device,
    location: device.imei ? locationsByImei.get(device.imei) : null,
  }));

  const onlineDevices = devicesWithLocation.filter(d => d.location !== null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Devices</h2>
          <p className="text-muted-foreground mt-2">
            Manage and monitor your GPS tracking devices
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="font-medium">{devices.length}</span> total
          </div>
          <div className="text-sm text-green-600">
            <span className="font-medium">{onlineDevices.length}</span> with location
          </div>
          <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Device
          </Button>
        </div>
      </div>

      {devices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No devices found</h3>
            <p className="text-muted-foreground">
              You haven't added any devices yet. Bind a device to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {devicesWithLocation.map((device: { 
            imei?: string; 
            strTEID?: string; 
            carNumber?: string; 
            ownerName?: string; 
            sim?: string; 
            remark?: string;
            location?: {
              latitude: number;
              longitude: number;
              speed: number;
              time: number;
              direction: number;
            } | null;
          }, index: number) => {
            const hasLocation = device.location !== null && device.location !== undefined;
            
            return (
              <Card key={device.imei || device.strTEID || `device-${index}`} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {device.carNumber || device.imei}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        IMEI: {device.imei}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {hasLocation ? (
                        <Signal className="h-5 w-5 text-green-600" />
                      ) : (
                        <Signal className="h-5 w-5 text-gray-400" />
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        hasLocation 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {hasLocation ? 'Active' : 'No Data'}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {hasLocation && device.location && (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground font-mono text-xs">
                          {device.location.latitude.toFixed(6)}, {device.location.longitude.toFixed(6)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Navigation className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Speed: {device.location.speed} km/h • Direction: {device.location.direction}°
                        </span>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Last update: {new Date(device.location.time * 1000).toLocaleString()}
                      </div>
                    </>
                  )}

                  {device.ownerName && (
                    <div className="flex items-center gap-2 text-sm pt-2 border-t">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {device.ownerName}
                      </span>
                    </div>
                  )}

                  {!hasLocation && device.sim && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">
                        SIM: {device.sim}
                      </span>
                    </div>
                  )}

                  {device.remark && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        {device.remark}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => openEditDialog(device as Device)}
                    >
                      <Edit2 className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2 text-red-600 hover:text-red-700 hover:border-red-300"
                      onClick={() => openDeleteDialog(device as Device)}
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      
      {/* Add Device Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Device</DialogTitle>
            <DialogClose onClose={() => setAddDialogOpen(false)} />
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">IMEI *</label>
              <Input
                type="text"
                placeholder="Enter device IMEI"
                value={formData.imei}
                onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Vehicle Number</label>
              <Input
                type="text"
                placeholder="e.g., ABC-1234"
                value={formData.carNumber}
                onChange={(e) => setFormData({ ...formData, carNumber: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Owner Name</label>
              <Input
                type="text"
                placeholder="Enter owner name"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SIM Number</label>
              <Input
                type="text"
                placeholder="Enter SIM number"
                value={formData.sim}
                onChange={(e) => setFormData({ ...formData, sim: e.target.value })}
              />
            </div>
            {isAdmin() && users.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-1">Assign to User</label>
                <select
                  value={formData.userId || ''}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select user (optional)</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.username} {user.company && `(${user.company})`}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setAddDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={bindDevice.isPending}>
                {bindDevice.isPending ? 'Adding...' : 'Add Device'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Device Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Device</DialogTitle>
            <DialogClose onClose={() => {
              setEditDialogOpen(false);
              setSelectedDevice(null);
              resetForm();
            }} />
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">IMEI</label>
              <Input
                type="text"
                value={formData.imei}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Vehicle Number</label>
              <Input
                type="text"
                placeholder="e.g., ABC-1234"
                value={formData.carNumber}
                onChange={(e) => setFormData({ ...formData, carNumber: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Owner Name</label>
              <Input
                type="text"
                placeholder="Enter owner name"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Owner Phone</label>
              <Input
                type="text"
                placeholder="Enter phone number"
                value={formData.ownerTel}
                onChange={(e) => setFormData({ ...formData, ownerTel: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SIM Number</label>
              <Input
                type="text"
                placeholder="Enter SIM number"
                value={formData.sim}
                onChange={(e) => setFormData({ ...formData, sim: e.target.value })}
              />
            </div>
            {isAdmin() && users.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-1">Assign to User</label>
                <select
                  value={formData.userId || ''}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select user (optional)</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.username} {user.company && `(${user.company})`}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setEditDialogOpen(false);
                  setSelectedDevice(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={updateDevice.isPending}>
                {updateDevice.isPending ? 'Updating...' : 'Update Device'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Device</DialogTitle>
            <DialogClose onClose={() => {
              setDeleteDialogOpen(false);
              setSelectedDevice(null);
            }} />
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete device <strong>{selectedDevice?.carNumber || selectedDevice?.imei}</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setSelectedDevice(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleDelete}
                disabled={unbindDevice.isPending}
              >
                {unbindDevice.isPending ? 'Deleting...' : 'Delete Device'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
