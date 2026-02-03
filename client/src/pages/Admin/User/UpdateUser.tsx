import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { backendCall } from "@/Utlis/BackendService";

type FormData = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function UpdateUser() {
  const { toast } = useToast();
  const { userid } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();
  const password = watch("password");

  const { mutate, isPending: isUpdating } = useMutation({
    mutationFn: async (payload: FormData) => {
      return backendCall({
        url: `/users/${userid}`,
        method: "PUT",
        data: {
          first_name: payload.first_name,
          last_name: payload.last_name,
          email: payload.email,
          password: payload.password,
        },
      });
    },
    onSuccess: () => {
      toast({ title: "User updated", description: "User updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/users"] });
      navigate("/user-management");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    if (data.password !== data.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    mutate(data);
  };

  return (
    <div className="w-full h-full min-h-[calc(100vh-140px)] py-6 px-4">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pb-10">
          <CardTitle className="text-4xl font-bold flex items-center gap-3">
            <UserPlus className="h-10 w-10 text-[#FBBC05]" />
            Update User
          </CardTitle>
          <CardDescription className="text-xl mt-2">
            Update user details manually
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <Label className="text-lg">First Name *</Label>
                <Input {...register("first_name", { required: "First name is required" })} className="h-16 text-lg" />
                {errors.first_name && <p className="text-red-500 text-sm">{errors.first_name.message}</p>}
              </div>

              <div className="space-y-3">
                <Label className="text-lg">Last Name *</Label>
                <Input {...register("last_name", { required: "Last name is required" })} className="h-16 text-lg" />
                {errors.last_name && <p className="text-red-500 text-sm">{errors.last_name.message}</p>}
              </div>

              <div className="space-y-3">
                <Label className="text-lg">Email *</Label>
                <Input
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^[^@]+@[^@]+\.[^@]+$/, message: "Invalid email format" },
                  })}
                  className="h-16 text-lg"
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
              </div>

              <div className="space-y-3">
                <Label className="text-lg">Password *</Label>
                <Input
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 8, message: "Password must be at least 8 characters" },
                    maxLength: { value: 8, message: "Password cannot exceed 8 characters" },
                  })}
                  className="h-16 text-lg"
                />
                {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
              </div>

              <div className="space-y-3">
                <Label className="text-lg">Confirm Password *</Label>
                <Input
                  type="password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: value => value === password || "Passwords do not match",
                  })}
                  className="h-16 text-lg"
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
                {!errors.confirmPassword && watch("confirmPassword") === password && watch("confirmPassword") && (
                  <p className="text-green-600 text-sm">Passwords match</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-6 pt-10 border-t">
              <Button type="button" variant="outline" className="h-16 px-10 text-xl" onClick={() => window.history.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating} className="bg-[#FBBC05] hover:bg-[#e5a900] text-white h-16 px-16 text-xl font-bold">
                {isUpdating ? "Updating..." : "Update User"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}