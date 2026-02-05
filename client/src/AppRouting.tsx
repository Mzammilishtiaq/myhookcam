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
import CreateUser from "./pages/Admin/User/CreateUser";
import UpdateUser from "./pages/Admin/User/UpdateUser";
import Signup from "./pages/Auth/Signup";
function AppRouting() {
    const { user } = useAuthStore()
    const isAdmin =
        user?.userType === "admin";
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<FortgotPassword />} />
                <Route path="/reset-password" element={<NewResetPassword />} />
                <Route path="/mail-sent" element={<MailSent />} />

                {/* Default redirect based on user */}
                <Route
                    path="/"
                    element={
                        !user ? (
                            <Navigate to="/login" replace />
                        ) : isAdmin ? (
                            <Navigate to="/admin-dashboard" replace />
                        ) : (
                            <Navigate to="/camera/list" replace />
                        )
                    }
                />

                {/* Protected Wrapper */}
                <Route element={<AuthGuide protectedPath={true}><MainLayout /></AuthGuide>}>

                    {/* Camera Routes */}
                    <Route path="camera">
                        <Route path="create" element={<CreateCamera />} />
                        <Route path="setting" element={<CameraSetting />} />
                        <Route path="livestream" element={<LiveStream />} />
                        <Route path="insights" element={<Insight />} />
                        <Route path="recordings" element={<Recording />} />
                        <Route path="system-status" element={<SystemStatus />} />
                    </Route>

                    {/* Jobsite Routes */}
                    <Route path="jobsites">
                        <Route path=":jobsiteId" element={<CameraDashboard />} />
                        <Route path="create" element={<CreateJobsite />} />
                        <Route path="setting/:jobsiteId" element={<JobsiteSetting />} />
                    </Route>

                    {/* User Management Routes */}
                    <Route path="user-management">
                        <Route index element={<UserManagement />} />          {/* /user-management */}
                        <Route path="create" element={<CreateUser />} />      {/* /user-management/create */}
                        <Route path="update/:userid" element={<UpdateUser />} /> {/* /user-management/update/:userid */}
                    </Route>

                    {/* User Profile Routes */}
                    <Route path="user">
                        <Route path="profile" element={<GetUserProfile />} />               {/* /user/profile */}
                        <Route path="profile/update" element={<UpdateUserProfile />} />     {/* /user/profile/update */}
                    </Route>

                    {/* Admin Dashboard */}
                    <Route path="admin-dashboard" element={<AdminDashboard />} />

                    {/* Catch all for protected routes */}
                    <Route path="*" element={<NotFound />} />
                </Route>

                {/* 404 for public routes */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouting;
