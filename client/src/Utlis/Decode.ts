import { jwtDecode } from "jwt-decode"
import { useAuthStore } from "@/hooks/authStore"

const decodeJwtToken = (token: string) => {
  try {
    const decoded: any = jwtDecode(token)

    const store = useAuthStore.getState()

    if (store.user) {
      useAuthStore.setState({
        user: {
          ...store.user,
          data: decoded,
        },
      })
    }

    console.log("decoded token", decoded)
    return decoded

  } catch (error: any) {
    console.error(
      "Invalid token:",
      error?.message || "Token decode failed"
    )
    return null
  }
}

export default decodeJwtToken