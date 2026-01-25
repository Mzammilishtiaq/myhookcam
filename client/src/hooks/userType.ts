import { useNavigate } from "react-router-dom";
import { PersonType } from "@/hooks/enum";

export const useUserTypeRedirect = () => {
  const navigate = useNavigate();

  const redirectByUserType = (personType: string) => {
    if (
      personType === PersonType.ADMIN ||
      personType === PersonType.SUB_ADMIN
    ) {
      navigate("/admin-dashboard", { replace: true });
    } else {
      navigate("/camera/list", { replace: true });
    }
  };

  return { redirectByUserType };
};
