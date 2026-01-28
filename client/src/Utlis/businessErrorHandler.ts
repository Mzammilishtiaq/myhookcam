import {ErrorCode} from "@/hooks/enum" 
export const handleBusinessError = (res: any) => {
    const code = res?.code
    const backendMessage = res?.message

    let message = "Request failed"

    switch (code) {
        case ErrorCode.AUTH_FAILED:
            message = backendMessage || `Authentication failed status ${code}.`
            break;
        case ErrorCode.TOKEN_EXPIRED:
            message = backendMessage || `Reset token is invalid or expired status ${code}.`
            break;
        case ErrorCode.VALIDATION_ERROR:
            message = backendMessage || `Invalid profile data status ${code}.`
            break;
        default:
            message = backendMessage || `Request failed status ${code}.`
    }

    return {
        status: "fail",
        code,
        message,
    }
}
