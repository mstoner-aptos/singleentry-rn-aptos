import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  type CaptureHelperDevice,
  type DiscoveredDeviceInfo,
  SocketCamTypes,
} from 'react-native-capture';

interface MainViewProps {
  devices: CaptureHelperDevice[];
  bleDiscovery: () => void;
  classicDiscovery: () => void;
  onDisconnectDevice: (device: CaptureHelperDevice) => void;
  onSelectDevice: (device: CaptureHelperDevice) => void;
  discoveredDevices: DiscoveredDeviceInfo[];
  onConnectDevice: (device: DiscoveredDeviceInfo) => void;
  isAndroid?: boolean;
  socketCamEnabled?: boolean;
  onToggleSocketCam?: () => void;
}

const MainView: React.FC<MainViewProps> = ({
  devices,
  bleDiscovery,
  classicDiscovery,
  onDisconnectDevice,
  onSelectDevice,
  discoveredDevices,
  onConnectDevice,
  isAndroid,
  socketCamEnabled,
  onToggleSocketCam,
}) => {
  const isSocketCam = (device: CaptureHelperDevice) =>
    SocketCamTypes.indexOf(device.type) > -1;

  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.addButton} onPress={bleDiscovery}>
          <Text style={styles.addButtonText}>Add BLE device</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={classicDiscovery}>
          <Text style={styles.addButtonText}>Add Classic device</Text>
        </TouchableOpacity>
        {isAndroid && onToggleSocketCam && (
          <TouchableOpacity style={styles.addButton} onPress={onToggleSocketCam}>
            <Text style={styles.addButtonText}>
              {socketCamEnabled ? 'Disable SocketCam' : 'Enable SocketCam'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Connected Devices</Text>
        <View style={styles.sectionDivider} />
        {devices.map(device => (
          <TouchableOpacity
            key={device.guid}
            style={styles.deviceItem}
            onPress={() => onSelectDevice(device)}>
            <Text style={styles.deviceName}>{device.name}</Text>
            {!isSocketCam(device) && (
              <TouchableOpacity onPress={() => onDisconnectDevice(device)}>
                <Text style={styles.disconnectText}>Disconnect</Text>
              </TouchableOpacity>
            )}
            <View style={styles.itemDivider} />
          </TouchableOpacity>
        ))}
      </View>

      {discoveredDevices.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>
            Discovered Devices ({discoveredDevices.length})
          </Text>
          <View style={styles.sectionDivider} />
          <ScrollView style={styles.discoveryList}>
            {discoveredDevices.map(device => (
              <TouchableOpacity
                key={device.identifierUuid}
                style={styles.deviceItem}
                onPress={() => onConnectDevice(device)}>
                <Text style={styles.deviceName}>
                  {device.name || 'Unknown device'}
                </Text>
                <Text style={styles.connectText}>Connect</Text>
                <View style={styles.itemDivider} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  addButton: {
    flex: 1,
    backgroundColor: '#2979FF',
    paddingVertical: 18,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    color: '#888',
    fontSize: 13,
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  sectionDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#333',
    marginBottom: 2,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 2,
  },
  deviceName: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  disconnectText: {
    color: '#007AFF',
    fontSize: 16,
  },
  connectText: {
    color: '#007AFF',
    fontSize: 16,
  },
  itemDivider: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#333',
  },
  discoveryList: {
    maxHeight: 200,
  },
});

export default MainView;
