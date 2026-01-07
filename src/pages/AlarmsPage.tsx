import { useRealtimeAlarms } from '../hooks/useAlarms';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { AlertTriangle, Clock, MapPin, CheckCircle } from 'lucide-react';
import { ALARM_TYPES } from '../utils/constants';

export default function AlarmsPage() {
  const { data: alarms, isLoading, error } = useRealtimeAlarms('');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading alarms...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-600">Error loading alarms: {error.message}</div>
      </div>
    );
  }

  const getAlarmTypeName = (type: number): string => {
    const alarmType = ALARM_TYPES[type as keyof typeof ALARM_TYPES];
    return alarmType?.name || `Unknown (${type})`;
  };

  const getAlarmSeverity = (type: number): 'high' | 'medium' | 'low' => {
    // High severity alarms
    if ([1, 2, 7, 10, 24, 25].includes(type)) return 'high';
    // Medium severity alarms
    if ([3, 4, 5, 6, 8, 9, 11, 12].includes(type)) return 'medium';
    // Low severity alarms
    return 'low';
  };

  const getSeverityStyles = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Alarms</h2>
          <p className="text-muted-foreground mt-2">
            Monitor real-time alerts and notifications
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="font-medium">{alarms?.rows?.length || 0}</span> active alarms
          </div>
        </div>
      </div>

      {!alarms?.rows || alarms.rows.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
            <h3 className="text-lg font-semibold mb-2">No active alarms</h3>
            <p className="text-muted-foreground">
              All devices are operating normally. New alarms will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {alarms.rows.map((alarm: any) => {
            const severity = getAlarmSeverity(alarm.alarmType);
            const severityStyles = getSeverityStyles(severity);

            return (
              <Card
                key={alarm.id}
                className={`border-l-4 ${
                  severity === 'high'
                    ? 'border-l-red-500'
                    : severity === 'medium'
                    ? 'border-l-yellow-500'
                    : 'border-l-blue-500'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <AlertTriangle
                        className={`h-5 w-5 mt-1 ${
                          severity === 'high'
                            ? 'text-red-600'
                            : severity === 'medium'
                            ? 'text-yellow-600'
                            : 'text-blue-600'
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">
                            {getAlarmTypeName(alarm.alarmType)}
                          </CardTitle>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${severityStyles}`}
                          >
                            {severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Device: {alarm.macId}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {new Date(alarm.locateTime * 1000).toLocaleString()}
                      </span>
                    </div>

                    {alarm.lat && alarm.lng && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {alarm.lat.toFixed(6)}, {alarm.lng.toFixed(6)}
                        </span>
                      </div>
                    )}
                  </div>

                  {alarm.address && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground">
                        Location: {alarm.address}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                    <span>Alarm ID: {alarm.id}</span>
                    {alarm.state && <span>• State: {alarm.state}</span>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
