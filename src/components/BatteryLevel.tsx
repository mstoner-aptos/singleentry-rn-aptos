import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { type CaptureHelperDevice, PowerState, SocketCamTypes } from 'react-native-capture';

interface BatteryLevelProps {
  device: CaptureHelperDevice;
  onBack: () => void;
}

const powerStateLabel = (value: number): string => {
  switch (value) {
    case PowerState.OnBattery: return 'On Battery';
    case PowerState.OnCradle: return 'On Cradle';
    case PowerState.OnAc: return 'On AC';
    default: return 'Unknown';
  }
};

const BatteryLevel: React.FC<BatteryLevelProps> = ({ device, onBack }) => {
  const isSocketCam = SocketCamTypes.indexOf(device.type) > -1;
  const [batteryLevel, setBatteryLevel] = useState<string | null>(null);
  const [powerState, setPowerState] = useState<string | null>(null);

  const getBatteryLevel = async () => {
    try {
      // The SDK packs the value: bits 8–15 hold the percentage
      const raw = await device.getBatteryLevel();
      const level = (raw >> 8) & 0xff;
      setBatteryLevel(`${level}%`);
    } catch (err: any) {
      setBatteryLevel(`Error: ${err?.code ?? err?.error?.code}`);
    }
  };

  const getPowerState = async () => {
    try {
      // The SDK packs the value: bits 0–7 hold the power state
      const raw = await device.getPowerState();
      const state = (raw as unknown as number) & 0x000000ff;
      setPowerState(powerStateLabel(state));
    } catch (err: any) {
      setPowerState(`Error: ${err?.code ?? err?.error?.code}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>{'< Features'}</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Battery feature</Text>
      </View>

      <Text style={styles.deviceName}>{device.name}</Text>

      <View style={styles.content}>
        <TouchableOpacity style={styles.button} onPress={getBatteryLevel}>
          <Text style={styles.buttonText}>Get Battery Level</Text>
        </TouchableOpacity>
        {batteryLevel !== null && (
          <Text style={styles.result}>{batteryLevel}</Text>
        )}

        {!isSocketCam && (
          <>
            <TouchableOpacity style={styles.button} onPress={getPowerState}>
              <Text style={styles.buttonText}>Get Power State</Text>
            </TouchableOpacity>
            {powerState !== null && (
              <Text style={styles.result}>{powerState}</Text>
            )}
          </>
        )}
      </View>
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
    fontSize: 16,
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
    marginBottom: 32,
  },
  content: {
    paddingHorizontal: 16,
    gap: 16,
  },
  button: {
    backgroundColor: '#2979FF',
    paddingVertical: 18,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  result: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
  },
});

export default BatteryLevel;
