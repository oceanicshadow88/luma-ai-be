declare module 'freemail' {
  const freemail: {
    isFree(email: string): boolean;
    isFreeOrDisposable(email: string): boolean;
    isDisposable(email: string): boolean;
  };
  export default freemail;
}