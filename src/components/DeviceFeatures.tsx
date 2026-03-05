import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { type CaptureHelperDevice, CaptureRn } from 'react-native-capture';
import SetTrigger from './SetTrigger';
import FriendlyName from './FriendlyName';
import BatteryLevel from './BatteryLevel';
import Symbologies from './Symbologies';
import FirmwareVersion from './FirmwareVersion';

interface DeviceFeaturesProps {
  device: CaptureHelperDevice;
  onBack: () => void;
  socketCamCapture?: CaptureRn;
  clientOrDeviceHandle?: number;
  isAndroid?: boolean;
  setStatus?: (s: string) => void;
  handleIsContinuous?: (v: boolean) => void;
  openSocketCamView?: boolean;
  setOpenSocketCamView?: React.Dispatch<React.SetStateAction<boolean>>;
}

type FeatureScreen = 'trigger' | 'friendlyName' | 'batteryLevel' | 'symbologies' | 'firmwareVersion' | null;

const DeviceFeatures: React.FC<DeviceFeaturesProps> = ({
  device,
  onBack,
  socketCamCapture,
  clientOrDeviceHandle,
  isAndroid,
  setStatus,
  handleIsContinuous,
  openSocketCamView,
  setOpenSocketCamView,
}) => {
  const [activeScreen, setActiveScreen] = useState<FeatureScreen>(null);

  if (activeScreen === 'trigger') {
    return (
      <SetTrigger
        device={device}
        onBack={() => setActiveScreen(null)}
        socketCamCapture={socketCamCapture}
        clientOrDeviceHandle={clientOrDeviceHandle}
        isAndroid={isAndroid}
        setStatus={setStatus}
        handleIsContinuous={handleIsContinuous}
        openSocketCamView={openSocketCamView}
        setOpenSocketCamView={setOpenSocketCamView}
      />
    );
  }

  if (activeScreen === 'friendlyName') {
    return (
      <FriendlyName
        device={device}
        onBack={() => setActiveScreen(null)}
      />
    );
  }

  if (activeScreen === 'batteryLevel') {
    return (
      <BatteryLevel
        device={device}
        onBack={() => setActiveScreen(null)}
      />
    );
  }

  if (activeScreen === 'symbologies') {
    return (
      <Symbologies
        device={device}
        onBack={() => setActiveScreen(null)}
      />
    );
  }

  if (activeScreen === 'firmwareVersion') {
    return (
      <FirmwareVersion
        device={device}
        onBack={() => setActiveScreen(null)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Features</Text>
      </View>

      <Text style={styles.deviceName}>{device.name}</Text>

      <ScrollView style={styles.list}>
        <View style={styles.sectionDivider} />

        <TouchableOpacity
          style={styles.featureRow}
          onPress={() => setActiveScreen('trigger')}>
          <Text style={styles.featureText}>Set Trigger</Text>
        </TouchableOpacity>
        <View style={styles.itemDivider} />

        <TouchableOpacity
          style={styles.featureRow}
          onPress={() => setActiveScreen('friendlyName')}>
          <Text style={styles.featureText}>Friendly Name</Text>
        </TouchableOpacity>
        <View style={styles.itemDivider} />

        <TouchableOpacity
          style={styles.featureRow}
          onPress={() => setActiveScreen('symbologies')}>
          <Text style={styles.featureText}>Symbologies</Text>
        </TouchableOpacity>
        <View style={styles.itemDivider} />

        <TouchableOpacity
          style={styles.featureRow}
          onPress={() => setActiveScreen('batteryLevel')}>
          <Text style={styles.featureText}>Battery Level</Text>
        </TouchableOpacity>
        <View style={styles.itemDivider} />

        <TouchableOpacity
          style={styles.featureRow}
          onPress={() => setActiveScreen('firmwareVersion')}>
          <Text style={styles.featureText}>Get Firmware Version</Text>
        </TouchableOpacity>
        <View style={styles.itemDivider} />

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    padding: 4,
  },
  backText: {
    color: '#007AFF',
    fontSize: 20,
    fontWeight: '600',
  },
  navTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
  deviceName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#333',
  },
  featureRow: {
    paddingVertical: 14,
    paddingHorizontal: 2,
  },
  featureText: {
    color: '#fff',
    fontSize: 16,
  },
  itemDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#333',
  },
});

export default DeviceFeatures;
