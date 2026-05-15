export interface QRAuthPayload {
  uid: string;
  readerId?: string;
  door?: string;
  timestamp: number;
}

export const parseQRPayload = (data: string): QRAuthPayload | null => {
  try {
    // Attempt to parse if it's JSON
    if (data.startsWith('{')) {
      return JSON.parse(data);
    }
    
    // Otherwise, treat as raw UID
    return {
      uid: data,
      timestamp: Date.now()
    };
  } catch (e) {
    return {
      uid: data,
      timestamp: Date.now()
    };
  }
};
