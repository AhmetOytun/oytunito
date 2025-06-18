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
}

interface ElectronAPI {
  openFileDialog: () => Promise<string | null>;
}

interface Window {
  deviceDiscovery: DeviceDiscoveryAPI;
  fileTransfer: FileTransferAPI;
  electronApi: ElectronAPI;
}
