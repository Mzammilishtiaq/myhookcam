import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { ChevronLeft } from "lucide-react";
import Login1 from "@/assets/login1.png";
import { backendCall } from "@/Utlis/BackendService";

interface FormData {
    email: string;
}

export default function ForgotPassword() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<FormData>({
        defaultValues: {
            email: ""
        }
    });

    const onSubmit = async (data: FormData) => {
        const values = form.getValues()
        setIsLoading(true);
        try {
            const response: any = await backendCall({
                url: "/accounts/password/reset/request",
                method: "POST",
                data: {
                    email: values.email,
                },
            })

            // login failed (business or api error)
            if (!response || response.status !== "success") {
                toast({
                    title: "Email Send Failed",
                    description: response?.message || "Email send failed",
                    variant: "destructive",
                })
                return
            }
            // success
            toast({
                title: "Email Sent Successfully",
                description: "If an account exists for this email, you will receive reset instructions.",
            })

        } catch (err) {
            toast({
                title: "Email Send Failed",
                description: "An error occurred while sending the email. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#555555]">
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#555555] text-white">
                <div className="max-w-md text-center">
                    <div className="mb-8 flex justify-center">
                        <div className="w-full lg:h-96  lg:-pb-10 pb-0 relative">
                            <img
                                src={Login1}
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
                    <Link to="/login" className="flex items-center text-[#555555] hover:text-[#FBBC05] mb-8 transition-colors">
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Back to Login
                    </Link>

                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-[#555555] mb-2">Forgot Password?</h2>
                        <p className="text-gray-500">Enter your email address and we'll send you a link to reset your password.</p>
                    </div>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-bold text-gray-700 uppercase tracking-wider">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@company.com"
                                className="h-14 text-lg rounded-none border-gray-300 focus:border-[#FBBC05] focus:ring-0"
                                {...form.register("email", {
                                    required: "Email address is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address"
                                    }
                                })}
                            />
                            {form.formState.errors.email && (
                                <p className="text-red-500 text-sm">{form.formState.errors.email.message}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-[#FBBC05] hover:bg-[#e5a900] text-white font-bold h-16 text-xl rounded-none mt-4 transition-all"
                            disabled={isLoading}
                        >
                            {isLoading ? "Sending..." : "Send Reset Link"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}