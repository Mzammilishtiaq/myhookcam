import { jwtDecode } from "jwt-decode";

const decodeJwtToken = (token: string) => {
  try {
    const decoded = jwtDecode(token);
    console.log(decoded);
    // { foo: "bar", exp: 1393286893, iat: 1393268893 }
    return decoded;
  } catch (error) {
    console.error("Invalid token specified:", error instanceof Error ? error.message : String(error));
    // Handle invalid token error
    return null;
  }
};