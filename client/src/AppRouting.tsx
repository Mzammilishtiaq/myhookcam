import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "@/pages/Login";
import MainLayout from "@/pages/Layout/MainLayout";
import LiveStream from "@/pages/LiveStream";
import Insight from "@/pages/Insights";
import Recording from "@/pages/Recordings";
import SystemStatus from "@/pages/SystemStatus";
import AuthGuide from "./hooks/ProtectRoute";
import NotFound from "@/pages/not-found";

function AppRouting() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Public Route */}
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Login />} />

                {/* Protected Wrapper */}
                <Route
                    path="/"
                    // element={<MainLayout />}
                    element={
                        <AuthGuide protectedPath={true}>
                            <MainLayout />
                        </AuthGuide>
                    }
                >

                    {/* Protected Children */}
                    <Route path="" element={<LiveStream />} />
                    <Route path="livestream" element={<LiveStream />} />
                    <Route path="insights" element={<Insight />} />
                    <Route path="recordings" element={<Recording />} />
                    <Route path="system-status" element={<SystemStatus />} />
                    <Route path="*" element={<NotFound />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFound />} />

            </Routes>
        </BrowserRouter>
    );
}

export default AppRouting;
