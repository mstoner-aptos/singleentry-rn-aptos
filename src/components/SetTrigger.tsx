import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  type CaptureHelperDevice,
  CaptureRn,
  Trigger,
  SocketCamTypes,
  SocketCamViewContainer,
} from 'react-native-capture';

interface SetTriggerProps {
  device: CaptureHelperDevice;
  onBack: () => void;
  // SocketCam props – only needed when device is a SocketCam type
  socketCamCapture?: CaptureRn;
  clientOrDeviceHandle?: number;
  isAndroid?: boolean;
  setStatus?: (s: string) => void;
  handleIsContinuous?: (isContinuous: boolean) => void;
  openSocketCamView?: boolean;
  setOpenSocketCamView?: React.Dispatch<React.SetStateAction<boolean>>;
}

const SetTrigger: React.FC<SetTriggerProps> = ({
  device,
  onBack,
  socketCamCapture,
  clientOrDeviceHandle,
  setStatus,
  handleIsContinuous,
  openSocketCamView,
  setOpenSocketCamView,
}) => {
  const isSocketCam = SocketCamTypes.indexOf(device.type) > -1;

  const [, setSocketCamExtensionStatus] =
    useState<string>('Not Ready');
  const [viewMode, setViewMode] = useState<'fullscreen' | 'subview' | null>(null);
  const [triggerType, setTriggerType] = useState<Trigger>(Trigger.Start);

  const hasSocketCamView =
    isSocketCam &&
    socketCamCapture != null &&
    clientOrDeviceHandle !== undefined;

  useEffect(() => {
    if (!openSocketCamView) {
      setViewMode(null);
      setTriggerType(Trigger.Start);
      handleIsContinuous?.(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openSocketCamView]);

  const setTrigger = async (value: Trigger) => {
    try {
      await device.setTrigger(value);
    } catch (err: any) {
      console.error('SetTrigger error:', err?.code ?? err?.error?.code);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>{'< Features'}</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Trigger feature</Text>
      </View>

      <Text style={styles.deviceName}>{device.name}</Text>

      <View style={styles.buttons}>
        {isSocketCam ? (
              <>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    setTriggerType(Trigger.Start);
                    handleIsContinuous?.(false);
                    setViewMode('fullscreen');
                    setOpenSocketCamView?.(true);
                  }}>
                  <Text style={styles.buttonText}>Trigger SocketCam full screen</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    setTriggerType(Trigger.Start);
                    handleIsContinuous?.(false);
                    setViewMode('subview');
                    setOpenSocketCamView?.(true);
                  }}>
                  <Text style={styles.buttonText}>Trigger SocketCam sub view</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    setTriggerType(Trigger.ContinuousScan);
                    handleIsContinuous?.(true);
                    setViewMode('fullscreen');
                    setOpenSocketCamView?.(true);
                  }}>
                  <Text style={styles.buttonText}>Trigger SocketCam full screen continuous scan</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    setTriggerType(Trigger.ContinuousScan);
                    handleIsContinuous?.(true);
                    setViewMode('subview');
                    setOpenSocketCamView?.(true);
                  }}>
                  <Text style={styles.buttonText}>Trigger SocketCam sub view continuous scan</Text>
                </TouchableOpacity>
              </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setTrigger(Trigger.Start)}>
              <Text style={styles.buttonText}>Set Trigger Start</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => setTrigger(Trigger.Stop)}>
              <Text style={styles.buttonText}>Set Trigger Stop</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => setTrigger(Trigger.ContinuousScan)}>
              <Text style={styles.buttonText}>Set Trigger Continuous</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {hasSocketCamView ? (
        <View style={styles.socketCamSection}>
          <SocketCamViewContainer
            openSocketCamView={openSocketCamView ?? false}
            handleSetSocketCamEnabled={() => {}}
            clientOrDeviceHandle={clientOrDeviceHandle!}
            triggerType={triggerType}
            socketCamCapture={socketCamCapture!}
            socketCamDevice={device as any}
            handleSetStatus={setStatus ?? (() => {})}
            handleSetSocketCamExtensionStatus={setSocketCamExtensionStatus}
            socketCamCustomModalStyle={
              viewMode === 'fullscreen'
                ? {presentationStyle: 'overFullScreen', animationType: 'fade', transparent: true}
                : undefined
            }
            socketCamCustomStyle={
              viewMode === 'subview' ? socketCamSubViewStyles.container : undefined
            }
          />
        </View>
      ) : null}
    </View>
  );
};

const socketCamSubViewStyles = StyleSheet.create({
  container: {
    flex: 1,
    width: '60%',
    zIndex: 1,
    elevation: -1,
  },
});

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
    marginBottom: 24,
  },
  buttons: {
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
  socketCamSection: {
    marginTop: 24,
    flex: 1,
  },
  extensionStatus: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
});

export default SetTrigger;
