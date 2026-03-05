import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  type CaptureHelperDevice,
  CaptureDataSourceID,
  CaptureDataSourceStatus,
  CaptureDeviceType,
} from 'react-native-capture';

interface SymbologiesProps {
  device: CaptureHelperDevice;
  onBack: () => void;
}

interface DataSource {
  id: number;
  name: string;
  status: CaptureDataSourceStatus;
}

const NFC_DEVICE_TYPES = [
  CaptureDeviceType.NFCS370,
  CaptureDeviceType.NFCTag,
];

const isNfcDevice = (type: number) => NFC_DEVICE_TYPES.indexOf(type) > -1;

const getDataSourceIdRange = (deviceType: number): number[] => {
  if (isNfcDevice(deviceType)) {
    const ids: number[] = [];
    for (let id = CaptureDataSourceID.TagTypeISO14443TypeA; id < CaptureDataSourceID.TagTypeLastTagType; id++) {
      ids.push(id);
    }
    return ids;
  }
  const ids: number[] = [];
  for (let id = 1; id < CaptureDataSourceID.LastSymbologyID; id++) {
    ids.push(id);
  }
  return ids;
};

const Symbologies: React.FC<SymbologiesProps> = ({ device, onBack }) => {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDataSources();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDataSources = async () => {
    setLoading(true);
    const ids = getDataSourceIdRange(device.type);
    const results: DataSource[] = [];

    for (const id of ids) {
      try {
        const ds = await device.getDataSource(id);
        results.push({ id: ds.id, name: ds.name, status: ds.status });
      } catch {
        // skip IDs not recognised by this device
      }
    }

    setDataSources(results);
    setLoading(false);
  };

  const toggleDataSource = async (dataSource: DataSource) => {
    const newStatus =
      dataSource.status === CaptureDataSourceStatus.Enable
        ? CaptureDataSourceStatus.Disable
        : CaptureDataSourceStatus.Enable;
    try {
      await device.setDataSource(dataSource.id, newStatus);
      setDataSources(prev =>
        prev.map(ds =>
          ds.id === dataSource.id ? { ...ds, status: newStatus } : ds,
        ),
      );
    } catch (err: any) {
      console.error('Symbologies toggle error:', err?.code ?? err?.error?.code);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>{'< Features'}</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Symbologies</Text>
      </View>

      <Text style={styles.deviceName}>{device.name}</Text>

      <View style={styles.listContainer}>
        {loading ? (
          <ActivityIndicator color="#fff" style={styles.loader} />
        ) : (
          <ScrollView style={styles.list}>
            <View style={styles.sectionDivider} />
            {dataSources.map(ds => {
              const notSupported = ds.status === CaptureDataSourceStatus.NotSupported;
              return (
                <View key={`${ds.id}-${ds.name}`}>
                  <TouchableOpacity
                    style={styles.row}
                    onPress={() => !notSupported && toggleDataSource(ds)}
                    activeOpacity={notSupported ? 1 : 0.6}>
                    <Text style={[styles.dsName, notSupported && styles.unsupported]}>
                      {ds.name}
                    </Text>
                    {!notSupported && (
                      <Text
                        style={[
                          styles.status,
                          ds.status === CaptureDataSourceStatus.Enable
                            ? styles.enabled
                            : styles.disabled,
                        ]}>
                        {ds.status === CaptureDataSourceStatus.Enable ? 'On' : 'Off'}
                      </Text>
                    )}
                  </TouchableOpacity>
                  <View style={styles.itemDivider} />
                </View>
              );
            })}
          </ScrollView>
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
    marginBottom: 16,
  },
  listContainer: {
    flex: 1,
  },
  loader: {
    marginTop: 32,
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#333',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 2,
  },
  dsName: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
  },
  status: {
    fontSize: 15,
    fontWeight: '500',
  },
  enabled: {
    color: '#34C759',
  },
  disabled: {
    color: '#888',
  },
  unsupported: {
    color: '#444',
  },
  itemDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#333',
  },
});

export default Symbologies;
