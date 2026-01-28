import { useNavigate } from "react-router-dom";
import { UserType } from "@/hooks/enum";

export const useUserTypeRedirect = () => {
  const navigate = useNavigate();

  const redirectByUserType = (personType: string) => {
    if (
      personType === UserType.ADMIN ||
      personType === UserType.SUB_ADMIN
    ) {
      navigate("/admin-dashboard", { replace: true });
    } else {
      navigate("/camera/list", { replace: true });
    }
  };

  return { redirectByUserType };
};
