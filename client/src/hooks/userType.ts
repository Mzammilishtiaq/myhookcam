import { useNavigate } from "react-router-dom";
import { UserType } from "@/hooks/enum";

export const useUserTypeRedirect = () => {
  const navigate = useNavigate();

  const redirectByUserType = (personType: string) => {
    if (personType === UserType.ADMIN) {
      navigate("/admin-dashboard", { replace: true });
    } else {
      navigate("/jobsites/:jobsites", { replace: true });
    }
  };

  return { redirectByUserType };
};
