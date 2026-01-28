import { Link } from "react-router-dom";
import { MailCheck, ChevronLeft, TicketCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Login1 from "@/assets/login1.png"
export default function MailSent() {
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
                <div className="w-full max-w-md text-center">
                    <div className="mb-8 flex justify-center">
                        <div className="bg-[#FBBC05]/10 p-6 rounded-full">
                            <MailCheck className="h-20 w-20 text-[#FBBC05]" />
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold text-[#555555] mb-4">Email Sent!</h2>
                    <p className="text-gray-500 mb-8 text-lg">
                        Check your inbox. We've sent a password reset link to your email address.
                    </p>

                    <Link to="/login">
                        <Button className="w-full bg-[#FBBC05] hover:bg-[#e5a900] text-white font-bold h-16 text-xl rounded-none transition-all">
                            Return to Login
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}