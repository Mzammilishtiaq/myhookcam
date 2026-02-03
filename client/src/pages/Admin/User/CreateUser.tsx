import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { backendCall } from "@/Utlis/BackendService";
type FormData = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type CreateUserPayload = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
};

export default function CreateUser() {
  const { toast } = useToast();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();
  const password = watch("password");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isPending, mutate } = useMutation({
    mutationFn: async (payload: CreateUserPayload) => {
      return backendCall({
        url: "/users",
        method: "POST",
        data: payload,
      });
    },
    onSuccess: () => {
      toast({
        title: "User created",
        description: "User added successfully",
      });
      // 🔄 refetch users list
      queryClient.invalidateQueries({ queryKey: ["users"] });
      // 👉 go back to user management
      navigate("/users");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });
  const onSubmit = (data: FormData) => {
    if (data.password !== data.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    mutate({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      password: data.password,
    });
  };

  return (
    <div className="w-full h-full min-h-[calc(100vh-140px)] py-6 px-4">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pb-10">
          <CardTitle className="text-4xl font-bold flex items-center gap-3">
            <UserPlus className="h-10 w-10 text-[#FBBC05]" />
            Create New User
          </CardTitle>
          <CardDescription className="text-xl mt-2">
            Enter user details to grant access to the system
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <Label className="text-lg">First Name *</Label>
                <Input
                  className="h-16 text-lg"
                  {...register("first_name", { required: "First name is required" })}
                />
                {errors.first_name && <p className="text-red-500 text-sm">{errors.first_name.message}</p>}
              </div>
              <div className="space-y-3">
                <Label className="text-lg">Last Name *</Label>
                <Input
                  className="h-16 text-lg"
                  {...register("last_name", { required: "Last name is required" })}
                />
                {errors.last_name && <p className="text-red-500 text-sm">{errors.last_name.message}</p>}
              </div>
              <div className="space-y-3">
                <Label className="text-lg">Email *</Label>
                <Input
                  type="email"
                  className="h-16 text-lg"
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^[^@]+@[^@]+\.[^@]+$/, message: "Invalid email format" }
                  })}
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
              </div>

              <div className="space-y-3">
                <Label className="text-lg">Password *</Label>
                <Input
                  type="password"
                  min={8}
                  max={8}
                  className="h-16 text-lg"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 8, message: "Password must be at least 8 characters" },
                    maxLength: { value: 8, message: "Password cannot exceed 8 characters" },
                  })}
                />
                {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
              </div>
              <div className="space-y-3">
                <Label className="text-lg">Confirm Password *</Label>
                <Input
                  type="password"
                  className="h-16 text-lg"
                  max={8}
                  min={8}
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    minLength: { value: 8, message: "Password must be at least 8 characters" },
                    maxLength: { value: 8, message: "Password cannot exceed 8 characters" },
                    validate: value => value === watch("password") || "Passwords do not match"
                  })}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm">
                    {errors.confirmPassword.message}
                  </p>
                )}

                {!errors.confirmPassword &&
                  watch("confirmPassword") &&
                  watch("confirmPassword") === watch("password") && (
                    <p className="text-green-600 text-sm">
                      Passwords is a match
                    </p>
                  )}
              </div>
            </div>

            <div className="flex justify-end gap-6 pt-10 border-t">
              <Button type="button" variant="outline" className="h-16 px-10 text-xl" onClick={() => window.history.back()}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-[#FBBC05] hover:bg-[#e5a900] text-white h-16 px-16 text-xl font-bold"
              >
                {isPending ? "Creating..." : "Create User"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}