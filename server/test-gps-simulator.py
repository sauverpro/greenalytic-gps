#!/usr/bin/env python3
"""
GPS Device Simulator - Python Version
Simulates a GPS tracking device sending data to the TCP server
"""

import socket
import time
import sys

SERVER_HOST = 'localhost'
SERVER_PORT = 8800

def send_gps_data():
    """Simulate GPS device sending location data"""
    
    # Test GPS data points
    test_data = [
        {
            'imei': '867584123456789',
            'lat': 13.7563,
            'lon': 100.5018,
            'speed': 45,
            'direction': 90,
            'mileage': 1500,
        },
        {
            'imei': '867584123456789',
            'lat': 13.7573,
            'lon': 100.5028,
            'speed': 50,
            'direction': 95,
            'mileage': 1502,
        },
        {
            'imei': '867584123456789',
            'lat': 13.7583,
            'lon': 100.5038,
            'speed': 55,
            'direction': 100,
            'mileage': 1504,
        },
    ]
    
    try:
        # Connect to server
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.connect((SERVER_HOST, SERVER_PORT))
        print(f'✅ Connected to GPS server')
        print(f'📡 Server: {SERVER_HOST}:{SERVER_PORT}\n')
        
        # Send each GPS data point
        for i, data in enumerate(test_data):
            timestamp = int(time.time())
            
            # Format: IMEI,timestamp,lat,lon,speed,direction,mileage,gpsSignal,gsmSignal,carState,deviceState,alarmState
            message = ','.join([
                data['imei'],
                str(timestamp),
                str(data['lat']),
                str(data['lon']),
                str(data['speed']),
                str(data['direction']),
                str(data['mileage']),
                '5',  # GPS signal (0-5)
                '4',  # GSM signal (0-5)
                '1',  # Car state (0=off, 1=on)
                '1',  # Device state
                '0',  # Alarm state (0=normal)
            ]) + '\r\n'
            
            print(f'📤 Sending [{i+1}/{len(test_data)}]: {message.strip()}')
            sock.send(message.encode('utf-8'))
            
            # Wait for server response
            response = sock.recv(1024).decode('utf-8').strip()
            print(f'📥 Server response: {response}\n')
            
            # Wait 3 seconds before next update
            if i < len(test_data) - 1:
                time.sleep(3)
        
        print('✅ All test data sent')
        sock.close()
        
    except ConnectionRefusedError:
        print(f'❌ Connection refused. Is the server running on port {SERVER_PORT}?')
        sys.exit(1)
    except Exception as e:
        print(f'❌ Error: {e}')
        sys.exit(1)

if __name__ == '__main__':
    print('🚀 GPS Device Simulator\n')
    print('This will simulate a GPS device sending location data to your server.\n')
    send_gps_data()
