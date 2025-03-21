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
    startPublishing: () => void;
    stopPublishing: () => void;
    downloadProgress: () => Promise<number | null>;
    onDownloadFinish: (callback: (fileName: string) => void) => void;
    offDownloadFinish: () => void;
    removeListener: (
      event: string,
      listener: (...args: unknown[]) => void
    ) => void;
  };
}
