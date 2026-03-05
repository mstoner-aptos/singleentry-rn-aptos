# SingleEntryRN

SingleEntryRN is a React Native sample app demonstrating how to integrate the [Socket Mobile React Native Capture SDK](https://github.com/SocketMobile/react-native-capture) (`react-native-capture` v2.x).

It shows how to:

- Receive decoded barcode/NFC data from Socket Mobile devices
- Discover and connect Bluetooth LE and Classic devices
- Use **SocketCam** (camera-based scanning) on both iOS and Android
- Read device properties (battery level, firmware version, friendly name)
- Configure symbologies and trigger modes

## Requirements

- React Native 0.83+
- Node 18+
- `react-native-capture` ^2.0.11

## Install

```sh
git clone git@github.com:socketmobile/singleentry-rn.git
cd singleentry-rn
```

Using npm:

```sh
npm install
```

Using yarn:

```sh
yarn install
```

Then set up the iOS portion:

```sh
cd ios
pod install
```

### Android

The Socket Mobile Companion app must be installed on the Android device. It hosts the service used for connecting to scanners.

Download it from the [Google Play Store](https://play.google.com/store/apps/details?id=com.socketmobile.companion&hl=en_US&gl=US).

If Socket Mobile Companion is not installed, `helper.open()` will return error code `-27` (`ESKT_UNABLEOPENDEVICE`).

### iOS

The easiest way to connect a Socket Mobile device on iOS is by using the [Socket Mobile Companion](https://apps.apple.com/us/app/socket-mobile-companion/id1175638950) app from the App Store.

## Integrating the React Native Capture SDK

### Application Credentials

The Capture SDK requires your app to be registered on the [Socket Mobile Developer Portal](https://www.socketmobile.com/developers).

You will need three credentials:

| Credential | Description |
|---|---|
| `developerId` | UUID returned during developer registration |
| `appId` | Platform-prefixed app identifier (e.g. `ios:com.mycompany.myapp`) |
| `appKey` | Generated when you register your app on the portal |

> **Note:** The application ID is case sensitive.

Define them as an `AppInfoRn` object with platform-specific values:

```typescript
import { type AppInfoRn } from 'react-native-capture';

const appInfo: AppInfoRn = {
  appIdIos: 'ios:com.mycompany.myapp',
  appKeyIos: 'MC0C...',
  appIdAndroid: 'android:com.mycompany.myapp',
  appKeyAndroid: 'MC0C...',
  developerId: 'your-developer-id-uuid',
};
```

### Opening Capture with CaptureHelper

The v2.x SDK introduces `CaptureHelper`, an instance-based lifecycle manager that replaces the older `CaptureRn` + manual event handling pattern. You create a single instance with declarative callbacks, then call `open()` / `close()`:

```typescript
import { CaptureHelper, type CaptureHelperDevice, type DecodedData } from 'react-native-capture';

const helper = new CaptureHelper({
  appInfo,

  onDeviceArrival: (device: CaptureHelperDevice) => {
    // A Socket Mobile device has connected
    console.log(`Connected: ${device.name}`);
  },

  onDeviceRemoval: (device: CaptureHelperDevice) => {
    // A Socket Mobile device has disconnected
    console.log(`Disconnected: ${device.name}`);
  },

  onDecodedData: (data: DecodedData, device: CaptureHelperDevice) => {
    // A barcode or NFC tag was scanned
    const text = String.fromCharCode(...(data.data as number[]));
    console.log(`Scanned from ${device.name}: ${text}`);
  },

  onError: ({ code, message }) => {
    console.error(`Capture error ${code}: ${message}`);
  },
});

// Open the SDK (typically in a useEffect)
await helper.open();

// Close when done (cleanup)
await helper.close();
```

In a React component, this looks like:

```typescript
useEffect(() => {
  const helper = new CaptureHelper({ appInfo, onDeviceArrival, onDecodedData, /* ... */ });
  helper.open().then(() => setStatus('Capture open'));
  return () => { helper.close().catch(() => {}); };
}, []);
```

### Available CaptureHelper Callbacks

| Callback | Description |
|---|---|
| `onDeviceArrival(device)` | Device connected |
| `onDeviceRemoval(device)` | Device disconnected |
| `onDecodedData(data, device)` | Barcode or NFC data scanned |
| `onSocketCamCanceled()` | User closed the SocketCam camera view |
| `onDiscoveredDevice(device)` | BLE device found during discovery |
| `onDiscoveryEnd()` | Bluetooth discovery completed |
| `onBatteryLevel(level, device)` | Battery level notification (0-100) |
| `onError({ code, message })` | An error occurred |

### Bluetooth LE Device Discovery

BLE devices (e.g. S721) require a manual discovery and connection flow, unlike Classic Bluetooth devices which pair at the OS level:

```typescript
import { BluetoothDiscoveryMode, type DiscoveredDeviceInfo } from 'react-native-capture';

// Start BLE discovery — results arrive via onDiscoveredDevice callback
await helper.addBluetoothDevice(BluetoothDiscoveryMode.BluetoothLowEnergy);

// When the user selects a discovered device, connect it
await helper.connectDiscoveredDevice(discoveredDevice);

// To disconnect a BLE device later
await helper.removeBleDevice(device);
```

Classic Bluetooth discovery is also available:

```typescript
await helper.addBluetoothDevice(BluetoothDiscoveryMode.BluetoothClassic);
```

### Working with Connected Devices

Connected devices arrive as `CaptureHelperDevice` objects with typed methods:

```typescript
// Read device properties
const friendlyName = await device.getFriendlyName();
const firmware = await device.getFirmwareVersion();
const battery = await device.getBatteryLevel();

// Set device properties
await device.setFriendlyName('My Scanner');
await device.setTrigger(Trigger.Start);

// Configure symbologies
await device.setDataSource(CaptureDataSourceID.SymbologyQRCode, CaptureDataSourceStatus.Enable);
```

### SocketCam (Camera-Based Scanning)

SocketCam lets users scan barcodes using the device camera. Enable it through the helper:

```typescript
await helper.setSocketCamEnabled(true);
```

Then use the `SocketCamViewContainer` component to display the camera UI. Access the underlying `CaptureRn` instance via `helper.rootCapture`:

```typescript
import { SocketCamViewContainer, Trigger } from 'react-native-capture';

const rootCapture = helper.rootCapture;

<SocketCamViewContainer
  openSocketCamView={showCamera}
  socketCamCapture={rootCapture}
  socketCamDevice={socketCamDevice}
  clientOrDeviceHandle={rootCapture?.clientOrDeviceHandle}
  triggerType={Trigger.Start}
  handleSetSocketCamEnabled={setSocketCamEnabled}
  handleSetStatus={setStatus}
  handleSetSocketCamExtensionStatus={setExtStatus}
/>
```

> **Android note:** Mount `SocketCamViewContainer` as soon as `rootCapture` is available (before enabling SocketCam) so the extension process starts. Without this, `setSocketCamEnabled` may return error `-32` (`ESKT_NOTAVAILABLE`).

## App Structure

| File | Description |
|---|---|
| `src/App.tsx` | Main component — opens CaptureHelper, manages state |
| `src/components/MainView.tsx` | Device list, BLE/Classic discovery, SocketCam toggle |
| `src/components/DeviceFeatures.tsx` | Feature menu for a selected device |
| `src/components/SetTrigger.tsx` | Trigger modes (start, stop, continuous) and SocketCam camera views |
| `src/components/Symbologies.tsx` | Enable/disable barcode symbologies and NFC tag types |
| `src/components/FriendlyName.tsx` | Get/set the device friendly name |
| `src/components/BatteryLevel.tsx` | Read battery level and power state |
| `src/components/FirmwareVersion.tsx` | Read firmware version and build date |

## Running the App

Make sure Metro is running before launching:

```sh
yarn start
```

Then in a separate terminal:

```sh
yarn ios
# or
yarn android
```

You can also run the app through Xcode or Android Studio.

### Android Debugging

To allow the Android device to reach the Metro bundler:

```sh
adb reverse tcp:8081 tcp:8081
```

## Resources

- [react-native-capture on GitHub](https://github.com/SocketMobile/react-native-capture)
- [CaptureJS SDK Documentation](https://docs.socketmobile.com/capturejs/en/latest/)
- [Socket Mobile Developer Portal](https://www.socketmobile.com/developers)
