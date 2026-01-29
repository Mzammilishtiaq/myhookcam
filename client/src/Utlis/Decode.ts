import { jwtDecode } from "jwt-decode";
import { useAuthStore } from "@/hooks/authStore";

const decodeJwtToken = (token: string) => {
  try {
    // decode JWT
    const decoded: any = jwtDecode(token);
    // console.log("decoded token added to store:", decoded);
    return decoded;  
  } catch (error: any) {
    console.error("Invalid token:", error?.message || "Token decode failed");
    return null;
  }
};

export default decodeJwtToken;