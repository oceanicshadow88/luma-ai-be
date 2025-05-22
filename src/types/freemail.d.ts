declare module 'freemail' {
  const freemail: {
    isFree: (email: string) => boolean;
    isDisposable: (email: string) => boolean;
    isBlacklisted: (email: string) => boolean;
    free: string[];
    disposable: string[];
    blacklisted: string[];
  };

  export default freemail;
}
