interface Window {
  electron: {
    toggleServer: () => void;
    getServerStatus: () => Promise<boolean>;
  };
}
