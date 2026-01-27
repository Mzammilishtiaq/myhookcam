import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import login1 from "@/assets/login1.png";
export default function ResetPassword() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm({
        defaultValues: {
            password: "",
            confirmPassword: "",
        }
    });

    const handleSubmit = (data: { password: string; confirmPassword: string }) => {
        if (data.password !== data.confirmPassword) {
            toast({
                title: "Error",
                description: "Passwords do not match",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            toast({
                title: "Password Reset",
                description: "Your password has been successfully reset.",
            });
            navigate("/login");
        }, 1500);
    };

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
                                {...form.register("password", { required: true })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" title="Confirm Password" className="text-sm font-bold text-gray-700 uppercase tracking-wider">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                className="h-14 text-lg rounded-none border-gray-300 focus:border-[#FBBC05] focus:ring-0"
                                {...form.register("confirmPassword", { required: true })}
                            />
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