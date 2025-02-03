interface Device {
  name: string;
  address: string;
  bonjourPort: number;
  expressPort: number;
}

interface Window {
  electron: {
    startServer: () => void;
    stopServer: () => void;
    getServerStatus: () => Promise<boolean>;
    getDevices: () => Promise<Device[]>;
  };
}
