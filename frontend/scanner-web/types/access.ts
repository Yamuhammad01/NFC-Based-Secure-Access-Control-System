export interface VerifyAccessRequest {
  uid: string;
  readerId: string;
  door: string;
}

export interface VerifyAccessResponse {
  status: "granted" | "denied" | "error";
  message: string;
  user: string;
  role: string;
}