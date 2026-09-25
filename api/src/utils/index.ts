export const randomBytes = (length: number): Uint8Array => {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
};

export const convertFieldToBytes = (len: number, field: bigint): Uint8Array => {
  const hex = field.toString(16).padStart(len * 2, "0");
  const buffer = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    buffer[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return buffer;
};
