interface Device {
  event: "up" | "down";
  name: string;
  host: string;
  port: number;
  addresses: string[];
}

interface SendFileArgs {
  ip: string;
  port: number;
  filePath: string;
}

interface DeviceDiscoveryAPI {
  start: () => void;
  stop: () => void;
  onDeviceFound: (callback: (device: Device) => void) => () => void;
  startBroadcast: () => void;
  stopBroadcast: () => void;
}

interface FileTransferAPI {
  startFileReceiver: () => Promise<void>;
  stopFileReceiver: () => Promise<void>;
  sendFile: (args: SendFileArgs) => Promise<void>;
  onSendFileProgress: (callback: (progress: number) => void) => () => void;
  onReceiveFileProgress: (callback: (progress: number) => void) => () => void;
  onReceiveFileComplete: (callback: () => void) => () => void;
  onReceiveFileError: (callback: (error: Error) => void) => () => void;
}

interface ElectronAPI {
  openFileDialog: () => Promise<string | null>;
  showMessageDialog: (args: {
    title: string;
    message: string;
  }) => Promise<void>;
}

interface Window {
  deviceDiscovery: DeviceDiscoveryAPI;
  fileTransfer: FileTransferAPI;
  electronApi: ElectronAPI;
}
