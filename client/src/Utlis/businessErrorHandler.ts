export const handleBusinessError = (res: any) => {
    const code = res?.code
    const backendMessage = res?.message

    let message = "Request failed"

    switch (code) {
        case "AUTH_FAILED":
            message = backendMessage || `Authentication failed status ${code}.`
            break;
        case "RESET_TOKEN_INVALI":
            message = backendMessage || `Reset token is invalid or expired status ${code}.`
            break;
        case "VALIDATION_ERROR":
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
