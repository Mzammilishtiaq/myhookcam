export const SetStorage = (data: StorageI, remember: boolean = true) => {
    if (remember) {
        localStorage.setItem(STORAGE, JSON.stringify(data))
    } else {
        sessionStorage.setItem(STORAGE, JSON.stringify(data))
    }
}

export const GetStorage = () => {
    const savedCredential = localStorage.getItem(STORAGE) || sessionStorage.getItem(STORAGE);
    let credentials: StorageI | null = null;
    if (savedCredential) {
        credentials = JSON.parse(savedCredential);
    }
    return credentials;
}

export const Logout = async () => {
    sessionStorage.removeItem(STORAGE);
    localStorage.removeItem(STORAGE);
    return await true;
};

export const IsLoggedin = (): boolean => {
    const savedCredential = localStorage.getItem(STORAGE) || sessionStorage.getItem(STORAGE);
    let credentials: StorageI | null = null;
    if (savedCredential) {
        credentials = JSON.parse(savedCredential);
    }
    return !!credentials;
}

export const IsAuthenticated = (): boolean => {
    const savedCredential = localStorage.getItem(STORAGE) || sessionStorage.getItem(STORAGE);
    let credentials: StorageI | null = null;
    if (savedCredential) {
        credentials = JSON.parse(savedCredential);
    }
    return !!credentials;
}

export interface StorageI{
    data:Object;
    userType:any,
    token:string;
    meta:any;
}
export const STORAGE = 'HOOKCAM';