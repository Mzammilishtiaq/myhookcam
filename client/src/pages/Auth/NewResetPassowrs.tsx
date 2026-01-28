import { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import login1 from "@/assets/login1.png";
import { backendCall } from "@/Utlis/BackendService";

interface FormData {
    password: string;
    confirmPassword: string;
}
export default function ResetPassword() {
    const [searchParams] = useSearchParams()
    const token = searchParams.get("token")

    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<FormData>({
        defaultValues: {
            password: "",
            confirmPassword: "",
        }
    });
    useEffect(() => {
        form.trigger("confirmPassword")
    }, [form.watch("password")])

    const handleSubmit = async (data: FormData) => {
        if (!token) {
            toast({
                title: "Invalid link",
                description: "Reset token is missing or expired",
                variant: "destructive",
            })
            return
        }

        if (data.password !== data.confirmPassword) {
            toast({
                title: "Password mismatch",
                description: "Passwords do not match",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)

        try {
            const response: any = await backendCall({
                url: "/accounts/password/reset/confirm",
                method: "POST",
                data: {
                    token: token,
                    password: data.password,
                },
                isNavigate: false,
            })

            if (response && response.status === "success") {
                toast({
                    title: "Password Updated",
                    description: "Your password has been reset successfully",
                })

                navigate("/login")
            } else {
                toast({
                    title: "Reset Failed",
                    description: response?.message || "Password reset failed",
                    variant: "destructive",
                })
                return
            }



        } catch {
            toast({
                title: "Reset Failed",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#555555]">
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#555555] text-white">
                <div className="max-w-md text-center">
                    <div className="mb-8 flex justify-center">
                        <div className="w-full lg:h-96  lg:-pb-10 pb-0 relative">
                            <img
                                src={login1}
                                alt="HookCam Crane"
                                className="w-full h-full object-contain filter brightness-110"
                                style={{ filter: 'sepia(1) saturate(10) hue-rotate(-10deg) brightness(1.1)' }}
                            />
                        </div>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
                        <span className="text-[#FBBC05]">Hook</span>Cam
                    </h1>
                </div>
            </div>

            <div className="flex-1 bg-white flex items-center justify-center p-8 md:p-16">
                <div className="w-full max-w-md">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-[#555555] mb-2">Reset Password</h2>
                        <p className="text-gray-500">Please enter your new password below.</p>
                    </div>

                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="password" title="New Password" className="text-sm font-bold text-gray-700 uppercase tracking-wider">New Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="h-14 text-lg rounded-none border-gray-300 focus:border-[#FBBC05] focus:ring-0"
                                {...form.register("password", { required: "password is required" })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" title="Confirm Password" className="text-sm font-bold text-gray-700 uppercase tracking-wider">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                className="h-14 text-lg rounded-none border-gray-300 focus:border-[#FBBC05] focus:ring-0"
                                {...form.register("confirmPassword", {
                                    required: "Confirm password is required",
                                    validate: (value) =>
                                        value === form.watch("password") || "Passwords do not match",
                                })}
                            />
                            {form.formState.errors.confirmPassword && (
                                <p className="text-sm text-red-500">
                                    {form.formState.errors.confirmPassword.message}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-[#FBBC05] hover:bg-[#e5a900] text-white font-bold h-16 text-xl rounded-none mt-4 transition-all"
                            disabled={isLoading}
                        >
                            {isLoading ? "Resetting..." : "Update Password"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}