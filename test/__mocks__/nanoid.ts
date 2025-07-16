export const customAlphabet = (alphabet: string, size: number) => {
  return () => {
    return 'mocked-nanoid-' + '1'.repeat(size);
  };
};

export const nanoid = (size?: number) => {
  return 'mocked-nanoid-' + (size || 21);
};

export default nanoid;
