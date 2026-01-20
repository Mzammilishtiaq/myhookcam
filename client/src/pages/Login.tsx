import { useForm } from "react-hook-form";
import { backendCall } from "@/Utlis/BackendService";
import { SetStorage } from "@/Utlis/authServices";
import { useNavigate } from "react-router-dom";
import Loading from "@/components/ui/loading";
import { useState } from "react";
export default function Login() {
    const [loading, setLoading] = useState(false)
    const form = useForm({
        defaultValues: {
            username: "",
            password: ""
        }
    });

    const navigation = useNavigate();

    const handleLogin = async () => {
        const values = form.getValues();
        const rememberMe = true; // Add missing variable
        setLoading(true)
        const response = await backendCall({
            url: "/person/login",
            method: "POST",
            data: {
                email: values.username,
                password: values.password
            }
        });

        if (response && !response.error) {
            console.log(response)
            const finalData = {
                data: response, // Use response instead of undefined response variable
                userType: response.person_type,
                token: "",      // no token in API
                meta: null
            };
            setLoading(false)
            SetStorage(finalData, rememberMe);
            navigation(`/livestream`)
            // handleToastMessage('success',response?.message)
        } else {
            setLoading(false)
            console.log('error', response?.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl shadow-gray-200 p-8 border border-gray-200">
                    <div className="flex flex-col items-center mb-5">
                        <div className="flex items-center justify-center mb-3">
                            <img
                                src="https://myhookcam.com/images/logo_white.png?id=asd"
                                className="w-52"
                                alt="Hookcam"
                            />
                        </div>
                        <p className="text-gray-600 text-lg font-semibold">Login to HookCam</p>
                    </div>

                    <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-6">
                        <div>
                            <label className="block mb-1">Username</label>
                            <input
                                type="text"
                                {...form.register("username", { required: true })}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block mb-1">Password</label>
                            <input
                                type="password"
                                {...form.register("password", { required: true })}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-primary text-white font-semibold rounded-lg flex items-center justify-center gap-3"
                        >
                            {loading && <Loading classNames="!text-white" />}  Login
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
