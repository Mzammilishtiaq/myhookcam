import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "@/pages/Auth/Login";
import MainLayout from "@/pages/Layout/MainLayout";
import LiveStream from "@/pages/Cameras/LiveStream/LiveStream";
import Insight from "@/pages/Cameras/InSight/index";
import Recording from "@/pages/Cameras/Recording/Recordings";
import SystemStatus from "@/pages/Cameras/SystemStatus/SystemStatus";
import AuthGuide from "./hooks/ProtectRoute";
import NotFound from "@/pages/not-found";
import UserManagement from "./pages/Admin/UserManagement";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import CameraDashboard from "./pages/Jobsite/CameraDashboard";
import CameraSetting from "./pages/Cameras/CameraSetting/CameraSetting";
import CreateCamera from "./pages/Cameras/CreateCamera/CreateCamera";
import CreateJobsite from "./pages/Jobsite/CreateJobSite/CreateJobsite";
import JobsiteSetting from "./pages/Jobsite/JobSiteSetting/JobSetting";

function AppRouting() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Public Route */}
                <Route path="/login" element={<Login />} />

                {/* Protected Wrapper */}
                <Route
                    path="/"
                    element={
                        <AuthGuide protectedPath={true}>
                            <MainLayout />
                        </AuthGuide>
                    }
                >
                    {/* Protected Children */}
                    <Route path="camera/create" element={<CreateCamera />} />
                    <Route path="camera/setting" element={<CameraSetting />} />
                    <Route path="" element={<LiveStream />} />
                    <Route path="camera/livestream" element={<LiveStream />} />
                    <Route path="camera/insights" element={<Insight />} />
                    <Route path="camera/recordings" element={<Recording />} />
                    <Route path="camera/system-status" element={<SystemStatus />} />
                    <Route path="camera/list" element={<CameraDashboard />} />
                    <Route path="jobsite/create" element={<CreateJobsite />} />
                    <Route path="jobsite/setting" element={<JobsiteSetting />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="admin-dashboard" element={<AdminDashboard />} />
                    <Route path="*" element={<NotFound />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFound />} />

            </Routes>
        </BrowserRouter>
    );
}

export default AppRouting;
