import axios from "axios"
import { useAuthStore } from "@/hooks/authStore"

export const handleApiError = (
  error: any,
  options?: {
    isNavigate?: boolean
    isShowErrorMessage?: boolean
  }
) => {
  const isNavigate = options?.isNavigate ?? true
  const isShowErrorMessage = options?.isShowErrorMessage ?? true

  // request cancelled
  if (axios.isCancel(error)) {
    return {
      status: "cancelled",
      message: "Request cancelled",
    }
  }

  // no response (network error)
  if (!error.response) {
    const message = "No internet connection"
    if (isShowErrorMessage) console.log(message)

    return {
      status: "error",
      message,
    }
  }

  const status = error.response.status
  const backendMessage = error.response.data?.message

  const message =
    backendMessage ||
    "An unexpected error occurred. Please try again."

  if (isShowErrorMessage) {
    console.log(message)
  }

  if (status === 401 && isNavigate) {
    // logout if needed
    useAuthStore.getState().logout?.()
    window.location.replace("/")
  }

  return {
    status: "error",
    message,
    code: status,
  }
}