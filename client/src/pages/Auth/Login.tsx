import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { SetStorage } from "@/Utlis/authServices";
import { backendCall } from "@/Utlis/BackendService";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/hooks/authStore"
import { useUserTypeRedirect } from "@/hooks/userType"
import Loginimg from "@/assets/login1.png"
export default function Login() {
    const { redirectByUserType } = useUserTypeRedirect();
    const { login } = useAuthStore();
    const navigate = useNavigate();
    const { toast } = useToast();
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
        await backendCall({
            url: "/person/login",
            method: "POST",
            data: {
                email: values.username,
                password: values.password
            }
        }).then((response: any) => {
            if (response && !response.error) {
                console.log(response)
                const finalData = {
                    data: response, // Use response instead of undefined response variable
                    userType: response.person_type,
                    token: "",      // no token in API
                    meta: null
                };
                setLoading(false)
                login(finalData, rememberMe);
                redirectByUserType(response.person_type);

                toast({
                    title: "Login Successful",
                    description: "You have been logged in successfully.",
                })
                // handleToastMessage('success',response?.message)
            } else {
                setLoading(false)
                toast({
                    title: "Login Failed",
                    description: response?.message || "Invalid credentials. Please try again.",
                    variant: "destructive"
                })
                console.log('error', response?.message);
            }
        });


    };

    return (
        <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#555555]">
            {/* Left side: Hero/Branding */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#555555] text-white">
                <div className="max-w-md text-center">
                    <div className="flex justify-center">
                        <div className="w-full h-96 -pb-10 relative">
                            <img
                                src={Loginimg}
                                alt="HookCam Crane"
                                className="w-full h-full object-contain filter brightness-110"
                                style={{ filter: 'sepia(1) saturate(10) hue-rotate(-10deg) brightness(1.1)' }}
                            />
                        </div>
                    </div>
                    <h1 className="font-poppins text-5xl md:text-7xl font-bold mb-4 tracking-tight">
                        <span className="text-[#FBBC05]">Hook</span>Cam
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-300 font-light">
                        Smart Construction Monitoring
                    </p>
                </div>
            </div>

            {/* Right side: Login Form */}
            <div className="flex-1 bg-white flex items-center justify-center p-8 md:p-16">
                <div className="w-full max-w-md">
                    <div className="mb-10 text-center md:text-left">
                        <h2 className="text-3xl font-bold text-[#555555] mb-2">Welcome Back</h2>
                        <p className="text-gray-500">Log in to manage your jobsites and cameras</p>
                    </div>
                    <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-sm font-bold text-gray-700 uppercase tracking-wider">Email Address</Label>
                            <Input
                                type="email"
                                placeholder="name@company.com"
                                className="h-14 text-lg rounded-none border-gray-300 focus:border-[#FBBC05] focus:ring-0"                                {...form.register("username", { required: true })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" title="Password" className="text-sm font-bold text-gray-700 uppercase tracking-wider">Password</Label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                className="h-14 text-lg rounded-none border-gray-300 focus:border-[#FBBC05] focus:ring-0"                                {...form.register("password", { required: true })}
                            />
                        </div>

                        <Button
                            className="w-full bg-[#FBBC05] hover:bg-[#e5a900] text-white font-bold h-16 text-xl rounded-none mt-4 transition-all"
                            onClick={handleLogin}
                            disabled={loading}
                        >
                            {loading ? "Authenticating..." : "Login to Portal"}
                        </Button>

                        <div className="mt-8 text-center">
                            <p className="text-gray-400 text-sm italic">
                                Authorized personnel only. All access is logged.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
