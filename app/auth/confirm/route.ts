import { completeAuthRequest } from "@/lib/auth/complete-auth-request";

export async function GET(request: Request) {
  return completeAuthRequest(request);
}
