import axios from "axios"
import { useAuthStore } from "@/hooks/authStore"
import { handleApiError } from "@/Utlis/apiErrorHandler"
import { handleBusinessError } from "@/Utlis/businessErrorHandler"

export const backendCall = async ({
  url,
  method = "POST",
  data,
  source,
  isNavigate = true,
  isShowErrorMessage = true,
  contentType = "application/json",
  dataModel,
}: backendCall) => {

  const user = useAuthStore.getState().user

  const headers: any = {
    "Content-Type": contentType,
  }

  if (user?.token) {
    headers.Authorization = `Bearer ${user.token}`
  }

  try {
    const response = await axios({
      url: import.meta.env.VITE_REACT_API_URL + url,
      method,
      data,
      headers,
      cancelToken: source?.token,
    })

    let result = response.data

    // business error
    if (result?.status === "fail") {
      return handleBusinessError(result)
    }

    if (dataModel && result?.data) {
      result.data = dataModel.adapt(result.data)
    }

    return result

  } catch (error: any) {
    return handleApiError(error, {
      isNavigate,
      isShowErrorMessage,
    })
  }
}

interface backendCall {
  url: string
  method?: string
  data?: any
  source?: any
  isNavigate?: boolean
  isShowErrorMessage?: boolean
  contentType?: string
  dataModel?: any
}
