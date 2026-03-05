import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { type CaptureHelperDevice } from 'react-native-capture';

interface FirmwareVersionProps {
  device: CaptureHelperDevice;
  onBack: () => void;
}

const FirmwareVersion: React.FC<FirmwareVersionProps> = ({ device, onBack }) => {
  const [versionString, setVersionString] = useState<string | null>(null);
  const [dateString, setDateString] = useState<string | null>(null);

  const getFirmwareVersion = async () => {
    try {
      const v = await device.getFirmwareVersion();
      setVersionString(`${v.major}.${v.middle}.${v.minor}.${v.build}`);
      if (v.year !== undefined) {
        const month = String(v.month).padStart(2, '0');
        const day = String(v.day).padStart(2, '0');
        setDateString(`${v.year}-${month}-${day}`);
      }
    } catch (err: any) {
      setVersionString(`Error: ${err?.code ?? err?.error?.code}`);
      setDateString(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>{'< Features'}</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Firmware Version feature</Text>
      </View>

      <Text style={styles.deviceName}>{device.name}</Text>

      <View style={styles.content}>
        <TouchableOpacity style={styles.button} onPress={getFirmwareVersion}>
          <Text style={styles.buttonText}>Get Firmware Version</Text>
        </TouchableOpacity>
        {versionString !== null && (
          <View style={styles.results}>
            <Text style={styles.resultLabel}>Version</Text>
            <Text style={styles.resultValue}>{versionString}</Text>
            {dateString !== null && (
              <>
                <Text style={styles.resultLabel}>Date</Text>
                <Text style={styles.resultValue}>{dateString}</Text>
              </>
            )}
          </View>
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
  results: {
    gap: 4,
  },
  resultLabel: {
    color: '#888',
    fontSize: 13,
  },
  resultValue: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
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
});

export default FirmwareVersion;
