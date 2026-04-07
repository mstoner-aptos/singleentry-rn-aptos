import React, {useState, useEffect, useRef} from 'react';

import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Platform,
  TouchableOpacity,
  AppState,
} from 'react-native';

import {
  CaptureHelper,
  type CaptureHelperDevice,
  type AppInfoRn,
  type DecodedData,
  type DiscoveredDeviceInfo,
  SocketCamTypes,
  BluetoothDiscoveryMode,
  SocketCamViewContainer,
  Trigger,
} from 'react-native-capture';

import MainView from './components/MainView';
import DeviceFeatures from './components/DeviceFeatures';

const arrayToString = (dataArray: number[]) =>
  String.fromCharCode.apply(null, dataArray);

const appInfo: AppInfoRn = {
  appIdIos: 'ios:com.socketmobile.reactjs.native.example.example',
  appIdAndroid: 'android:com.example',
  developerId: 'ecc6c526-970b-ec11-b6e6-0022480a2304',
  appKeyIos: 'MC0CFHL9no0HS6LohlvgGj3s6R4fUTTGAhUAjkIUkoWjCi8NXAjDB9uk9WMdlJc=',
  appKeyAndroid:
    'MC0CFBJxr9ERxurLZQk8voZsFC7BH+8zAhUAxbT41GqB8EwOu7JtVYhffCnTdmI=',
};

const App = () => {
  const [devices, setDevices] = useState<CaptureHelperDevice[]>([]);
  const [discoveredDevices, setDiscoveredDevices] = useState<
    DiscoveredDeviceInfo[]
  >([]);
  const [selectedDevice, setSelectedDevice] =
    useState<CaptureHelperDevice | null>(null);
  const [status, setStatus] = useState<string>('Opening Capture...');
  const [decodedData, setDecodedData] = useState<DecodedData>({
    data: '',
    length: 0,
    name: '',
  });
  const isAndroid = Platform.OS === 'android';
  const [openSocketCamView, setOpenSocketCamView] = useState<boolean>(false);
  const [socketCamEnabled, setSocketCamEnabled] = useState<boolean>(false);
  // useRef so the callback closure created in useEffect([]) always reads the current value
  const isContinuousScanRef = useRef(false);
  // Same for AppState listener (empty deps): always read latest devices when backgrounding
  const devicesRef = useRef<CaptureHelperDevice[]>([]);

  // useRef so the helper instance survives re-renders without causing them
  const helperRef = useRef<CaptureHelper | null>(null);
  const appState = useRef(AppState.currentState);
  // Added a helper do do teh create process since this will be done at launch and after closing the SDK from lifecycle events
  const createHelper = (): CaptureHelper => {
    const helper = new CaptureHelper({
      appInfo,

      onDeviceArrival: device => {
        console.log('device arrived', device);
        setDevices(d => [...d, device]);
        // Remove from discovered list once the device is fully connected
        setDiscoveredDevices(d => d.filter(dd => dd.name !== device.name));
      },

      onDeviceRemoval: device => {
        console.log('device removed', device);
        setDevices(d => d.filter(dd => dd.guid !== device.guid));
      },

      onDecodedData: async (data, device) => {
        console.log('decoded data', data, device);
        if (SocketCamTypes.indexOf(device.type) > -1) {
          // Only close the view for Trigger.Start; Trigger.ContinuousScan keeps it open
          // so the user can keep scanning or close it programmatically / via the close button
          if (!isContinuousScanRef.current) {
            setOpenSocketCamView(false);
          }
        }
        setDecodedData({
          data: arrayToString(data.data as number[]),
          length: data.length,
          name: data.name,
        });
        // disable the trigger button to prevent multiple scans while processing business flow
        await device.setTrigger(Trigger.Disable);
        // pretend the app flow takes around 200ms, then let the scanner button be enabled again
        setTimeout(async () => {
          await device.setTrigger(Trigger.Enable);
        }, 200);
      },

      // result -91 (ESKT_CANCEL): user pressed the close button on the SocketCam native view
      onSocketCamCanceled: () => {
        isContinuousScanRef.current = false;
        setOpenSocketCamView(false);
      },

      onDiscoveredDevice: device => {
        setDiscoveredDevices(d => {
          if (d.find(dd => dd.identifierUuid === device.identifierUuid)) {
            return d;
          }
          return [...d, device];
        });
      },

      onDiscoveryEnd: () => setStatus('Discovery ended'),

      onBatteryLevel: level => setStatus(`Battery: ${level}%`),

      onError: ({code, message}) => setStatus(`Error ${code}: ${message}`),
    });

    return helper;
  };

  useEffect(() => {
    const helper = createHelper();
    helperRef.current = helper;
    helper
      .open()
      .then(() => setStatus('CaptureSDK open with success'))
      .catch((err: any) => {
        const code = err?.code ?? err?.error?.code;
        const message = err?.message ?? err?.error?.message;
        setStatus(`Failed to open CaptureSDK: ${code}: ${message}`);
      });

    return () => {
      helper.close().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    devicesRef.current = devices;
  }, [devices]);

  // Here is the lifecycle event handler for the app state - it creates the CaptureHelper or calls close()
  // to destroy it based on the background vs foreground. NOTE: it will not fire at launch - only when state
  // changes from background to foreground and vice versa, which is by design
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('App has come to the foreground!');
        const helper = createHelper();
        helperRef.current = helper;
        helper
          .open()
          .then(() => {
            setStatus('CaptureSDK open with success');
            console.log('opened SDK');
          })
          .catch((err: any) => {
            const code = err?.code ?? err?.error?.code;
            const message = err?.message ?? err?.error?.message;
            setStatus(`Failed to open CaptureSDK: ${code}: ${message}`);
          });
      } else if (
        appState.current.match(/active/) &&
        nextAppState === 'background'
      ) {
        console.log('App has gone to the background!');
        console.log('devices', devicesRef.current);
        // disable scanner triggers to prevent scan light and scans while app is in background
        Promise.all(
          devicesRef.current
            .filter(device => SocketCamTypes.indexOf(device.type) === -1)
            .map(device => device.setTrigger(Trigger.Disable)),
        ).catch(err => {
          console.error('error disabling trigger:', err?.error?.code);
        });
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // ─── Actions ───────────────────────────────────────────────────────────────

  const connectDiscoveredDevice = async (device: DiscoveredDeviceInfo) => {
    try {
      setStatus(`Connecting to ${device.name}...`);
      await helperRef.current?.connectDiscoveredDevice(device);
      setStatus(`Connected to ${device.name}`);
    } catch (err: any) {
      const code = err?.code ?? err?.error?.code;
      const message = err?.message ?? err?.error?.message;
      setStatus(`Failed to connect: ${code}: ${message}`);
    }
  };

  const launchBluetoothLeDiscovery = async () => {
    setDiscoveredDevices([]);
    try {
      await helperRef.current?.addBluetoothDevice(
        BluetoothDiscoveryMode.BluetoothLowEnergy,
      );
      setStatus('Scanning for BLE devices...');
    } catch {
      setStatus('BLE scan failed');
    }
  };

  const launchClassicDiscovery = async () => {
    setDiscoveredDevices([]);
    try {
      await helperRef.current?.addBluetoothDevice(
        BluetoothDiscoveryMode.BluetoothClassic,
      );
      setStatus('Scanning for Classic devices...');
    } catch {
      setStatus('Classic scan failed');
    }
  };

  const disconnectDevice = async (device: CaptureHelperDevice) => {
    try {
      await helperRef.current?.removeBleDevice(device);
      setStatus(`Disconnected from ${device.name}`);
    } catch (err: any) {
      console.error('error disconnecting:', err?.error?.code);
    }
  };

  const toggleSocketCam = async () => {
    const next = !socketCamEnabled;
    try {
      await helperRef.current?.setSocketCamEnabled(next);
      setSocketCamEnabled(next);
    } catch (err: any) {
      const code = err?.code ?? err?.error?.code;
      const message = err?.message ?? err?.error?.message;
      setStatus(`SocketCam toggle failed: ${code}: ${message}`);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  // rootCapture is needed by SocketCamViewContainer (reads Capture-level SocketCamStatus)
  const rootCapture = helperRef.current?.rootCapture ?? undefined;

  // The SocketCam virtual device, if present (arrives after setSocketCamEnabled(true))
  const socketCamDevice =
    devices.find(d => SocketCamTypes.indexOf(d.type) > -1) ?? null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navBar}>
        <Text style={styles.navTitle}>SingleEntry RN</Text>
        <TouchableOpacity style={styles.navSettings}>
          <Text style={styles.navSettingsText}>Settings</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.decodedSection}>
        <Text style={styles.decodedLabel}>Decoded data</Text>
        <TextInput
          style={styles.input}
          value={decodedData.data ? `${decodedData.data}` : ''}
          placeholder="Scan a barcode..."
          placeholderTextColor="#555"
          editable={false}
        />
      </View>

      <View style={styles.content}>
        {selectedDevice ? (
          <DeviceFeatures
            device={selectedDevice!}
            onBack={() => setSelectedDevice(null)}
            socketCamCapture={rootCapture}
            clientOrDeviceHandle={rootCapture?.clientOrDeviceHandle}
            isAndroid={isAndroid}
            setStatus={setStatus}
            openSocketCamView={openSocketCamView}
            setOpenSocketCamView={setOpenSocketCamView}
            handleIsContinuous={v => {
              isContinuousScanRef.current = v;
            }}
          />
        ) : (
          <MainView
            devices={devices}
            bleDiscovery={launchBluetoothLeDiscovery}
            classicDiscovery={launchClassicDiscovery}
            onDisconnectDevice={disconnectDevice}
            onSelectDevice={setSelectedDevice}
            discoveredDevices={discoveredDevices}
            onConnectDevice={connectDiscoveredDevice}
            isAndroid={isAndroid}
            socketCamEnabled={socketCamEnabled}
            onToggleSocketCam={toggleSocketCam}
          />
        )}
      </View>

      {/* Android only: mount SocketCamViewContainer as soon as rootCapture is available
          (i.e. right after CaptureSDK opens), NOT gated on socketCamEnabled.
          The mount triggers startSocketCamExtension so the extension process is running
          before the user presses "Enable SocketCam". Without this, setProperty(SocketCamStatus)
          returns -32 (ESKT_NOTAVAILABLE) because the extension isn't up yet.
          openSocketCamView stays false here; the camera UI is handled by SetTrigger. */}
      {isAndroid && rootCapture && (
        <SocketCamViewContainer
          openSocketCamView={false}
          handleSetSocketCamEnabled={() => {}}
          clientOrDeviceHandle={rootCapture.clientOrDeviceHandle}
          triggerType={Trigger.Start}
          socketCamCapture={rootCapture}
          socketCamDevice={socketCamDevice as any}
          handleSetStatus={setStatus}
          handleSetSocketCamExtensionStatus={(s: string) =>
            setStatus(`SocketCam Extension: ${s}`)
          }
        />
      )}

      <View style={styles.statusBar}>
        <Text style={styles.statusText} numberOfLines={1}>
          {status}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  navTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    textAlign: 'center',
    flex: 1,
  },
  navSettings: {
    position: 'absolute',
    right: 16,
  },
  navSettingsText: {
    color: '#007AFF',
    fontSize: 17,
  },
  content: {
    flex: 1,
  },
  decodedSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  decodedLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    height: 44,
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#000',
  },
  statusBar: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#333',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
  },
});

export default App;
