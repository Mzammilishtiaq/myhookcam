import { useLocation, Navigate } from "react-router-dom"
import { IsAuthenticated } from "@/Utlis/authServices";

const AuthGuide = ({protectedPath,children}:any)=>{

const location = useLocation();
const isAuthenticated= IsAuthenticated();
let url = `/?redirectUrl=${location.pathname}`;

return (
     <div>{protectedPath ? <>{isAuthenticated ? children : <Navigate replace to={url} />}</> : children}</div>
)
}

export default AuthGuide;