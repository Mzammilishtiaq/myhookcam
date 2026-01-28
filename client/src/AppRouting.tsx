import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/Auth/Login";
import MainLayout from "@/pages/Layout/MainLayout";
import LiveStream from "@/pages/Cameras/LiveStream/LiveStream";
import Insight from "@/pages/Cameras/InSight/index";
import Recording from "@/pages/Cameras/Recording/index";
import SystemStatus from "@/pages/Cameras/SystemStatus/SystemStatus";
import AuthGuide from "./hooks/ProtectRoute";
import NotFound from "@/pages/not-found";
import UserManagement from "./pages/Admin/User/UserManagement";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import CameraDashboard from "./pages/Jobsite/CameraDashboard";
import CameraSetting from "./pages/Cameras/CameraSetting/CameraSetting";
import CreateCamera from "./pages/Cameras/CreateCamera/CreateCamera";
import CreateJobsite from "./pages/Jobsite/CreateJobSite/CreateJobsite";
import JobsiteSetting from "./pages/Jobsite/JobSiteSetting/JobSetting";
import FortgotPassword from "./pages/Auth/ForgotPassword";
import NewResetPassword from "./pages/Auth/NewResetPassowrs";
import { useAuthStore } from "@/hooks/authStore";
import MailSent from "./pages/Auth/MailSent";
import GetUserProfile from "./pages/Admin/User/GetUserProfile";
import UpdateUserProfile from "./pages/Admin/User/UpdateUserProfile";
function AppRouting() {
    const { user } = useAuthStore()
    const isAdmin =
        user?.userType === "admin" ||
        user?.userType === "sub-admin";
    return (
        <BrowserRouter>
            <Routes>

                {/* Public Route */}
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<FortgotPassword />} />
                <Route path="/reset-password" element={<NewResetPassword />} />
                <Route path="/mail-sent" element={<MailSent />} />
                <Route
                    path="/"
                    element={
                        !user ? (
                            <Login />
                        ) : isAdmin ? (
                            <Navigate to="/admin-dashboard" replace />
                        ) : (
                            <Navigate to="/camera/list" replace />
                        )
                    }
                />

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
                    <Route path="camera/livestream" element={<LiveStream />} />
                    <Route path="camera/insights" element={<Insight />} />
                    <Route path="camera/recordings" element={<Recording />} />
                    <Route path="camera/system-status" element={<SystemStatus />} />
                    <Route path="camera/list" element={<CameraDashboard />} />
                    <Route path="jobsite/create" element={<CreateJobsite />} />
                    <Route path="jobsite/setting" element={<JobsiteSetting />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="user/profile" element={<GetUserProfile />} />
                    <Route path="user/profile/update" element={<UpdateUserProfile />} />
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
