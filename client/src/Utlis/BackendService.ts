import axios from 'axios'
import { GetStorage } from "@/Utlis/authServices";

export const backendCall = async ({
    url,
    method = 'POST',
    data,
    source,
    isNavigate = true,
    isShowErrorMessage = true,
    contentType = 'application/json',
    dataModel,
}: backendCall) => {
    const storageData = await GetStorage();
    const _headers = {
        'Content-Type': contentType,
        // Authorization: 'Bearer ' + storageData?.token || '',
    };
console.log('token')
    let _response: any = '';
    await axios(import.meta.env.VITE_REACT_API_URL + url, {
        method: method,
        data: data,
        headers: _headers,
        cancelToken: source?.token,
    }).then((response: { data: string }) => {
// debugger
        _response = response.data;
        if (dataModel) {
            let dataSet = dataModel.adapt(_response?.data);
            console.log('data pass', dataSet)
            _response.data = dataSet;
        }
    }).catch((error: { response: { data: any; status: number } }) => {
        let _responseData = error.response?.data;
        if (isShowErrorMessage) {
            // handleToastMessage("error", _responseData.message);
            console.log('error ==', _responseData?.message);
        }
        _response = _responseData;
        if (error.response?.status === 401 && isNavigate) {
            // window.location.replace("/");
            // localStorage.clear();
        }
    });

    return _response;
}

interface backendCall {
    url: string;
    method: string;
    data?: any;
    source?: any;
    isNavigate?: boolean;
    isShowErrorMessage?: boolean;
    contentType?: string;
    dataModel?: any;
}