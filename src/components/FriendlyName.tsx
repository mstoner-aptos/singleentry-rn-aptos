import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { type CaptureHelperDevice } from 'react-native-capture';

interface FriendlyNameProps {
  device: CaptureHelperDevice;
  onBack: () => void;
}

const FriendlyName: React.FC<FriendlyNameProps> = ({ device, onBack }) => {
  const [name, setName] = useState<string>(device.name);

  const setFriendlyName = async () => {
    try {
      await device.setFriendlyName(name);
    } catch (err: any) {
      console.error('FriendlyName error:', err?.code ?? err?.error?.code);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>{'< Features'}</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Friendly name feature</Text>
      </View>

      <Text style={styles.deviceName}>{device.name}</Text>

      <View style={styles.content}>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholderTextColor="#555"
        />

        <TouchableOpacity style={styles.button} onPress={setFriendlyName}>
          <Text style={styles.buttonText}>Set Friendly Name</Text>
        </TouchableOpacity>
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
  input: {
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
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

export default FriendlyName;
