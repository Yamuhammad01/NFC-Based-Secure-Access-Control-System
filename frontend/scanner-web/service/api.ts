import {
  VerifyAccessRequest,
  VerifyAccessResponse,
} from "@/types/access";

const BASE_URL = process.env.NEXT_PUBLIC_VERIFICATION_URL || "http://localhost:5000/api";

export const verifyAccess = async (
  payload: VerifyAccessRequest
): Promise<VerifyAccessResponse> => {
  const url = `${BASE_URL}/access/tap`;
  console.log("Verifying access at:", url, "with payload:", payload);

  const response = await fetch(
    url,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error("Verification failed");
  }

  return response.json();
};