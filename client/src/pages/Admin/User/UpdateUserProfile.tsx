import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";
import { backendCall } from "@/Utlis/BackendService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form";
import { queryClient } from "@/lib/queryClient";
import { useNavigate } from "react-router-dom";

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 10)

  if (digits.length < 4) return digits
  if (digits.length < 7) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  }

  const dash = String.fromCharCode(45)

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}${dash}${digits.slice(6)}`
}


const updateUserProfile = async (payload: any) => {
  const res: any = await backendCall({
    url: "/accounts/user/profile",
    method: "PUT",
    data: payload,
  })

  if (res?.status !== "success") {
    throw new Error(res?.message || "Update failed")
  }

  return res.data
}

export default function UpdateUserProfile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      currentpassword: "",
      newpassword: ""
    }
  });

  const updateMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your changes have been saved",
      })

      queryClient.invalidateQueries({
        queryKey: ["user-profile"],
      })
      navigate("/user/profile")
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })
  useEffect(() => {
    const sub = form.watch((values) => {
      if (values.currentpassword && !values.newpassword) {
        form.setError("newpassword", {
          message: "New password is required",
        })
      }

      if (values.newpassword && !values.currentpassword) {
        form.setError("currentpassword", {
          message: "Current password is required",
        })
      }
    })

    return () => sub.unsubscribe()
  }, [form])

  const handleSubmit = (data: any) => {
    const payload = {
      first_name: data.firstName,
      last_name: data.lastName,
      current_password: data.currentpassword,
      password: data.newpassword,
    }

    updateMutation.mutate(payload)

  }


  return (
    <div className="w-full h-full min-h-[calc(100vh-140px)] py-6 px-4">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pb-10">
          <CardTitle className="text-4xl font-bold flex items-center gap-3">
            <UserPlus className="h-10 w-10 text-[#FBBC05]" />
            Update User Profile
          </CardTitle>
          <CardDescription className="text-xl mt-2">
            Update user details to grant access to the system
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <Label className="text-lg">First Name *</Label>
                <Input
                  required
                  className="h-16 text-lg"
                  {...form.register("firstName", { required: "First name is required" })}
                />
              </div>
              <div className="space-y-3">
                <Label className="text-lg">Last Name *</Label>
                <Input
                  required
                  className="h-16 text-lg"
                  {...form.register("lastName", { required: "Last name is required" })}
                />
              </div>
              <div className="space-y-3">
                <Label className="text-lg">Email *</Label>
                <Input
                  required
                  type="email"
                  className="h-16 text-lg"
                  {...form.register("email", { required: "Email is required" })}
                />
              </div>
              {/* <div className="space-y-3">
                <Label className="text-lg">Phone *</Label>
                <Input
                  className="h-16 text-lg"
                  placeholder="(___) ___-___"
                  {...form.register("phone", {
                    required: "Phone is required",
                    pattern: {
                      value: /^\(\d{3}\)\s\d{3}\-\d{4}$/,
                      message: "Phone must be in format (000) 000 0000",
                    },
                    onChange: (e) => {
                      e.target.value = formatPhone(e.target.value)
                    },
                  })}
                />
              </div> */}
              <div className="space-y-3">
                <Label className="text-lg">Current Password *</Label>
                <Input
                  type="password"
                  placeholder="Current password"
                  className="h-16 text-lg"
                  {...form.register("currentpassword", {
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                    maxLength: {
                      value: 8,
                      message: "Password must be at most 8 characters",
                    }
                  })}
                />
                {form.formState.errors.currentpassword && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.currentpassword.message}
                  </p>
                )}

              </div>
              <div className="space-y-3">
                <Label className="text-lg">New Password *</Label>
                <Input
                  type="password"
                  placeholder="New password"
                  className="h-16 text-lg"
                  {...form.register("newpassword", {
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                    maxLength: {
                      value: 8,
                      message: "Password must be at most 8 characters",
                    }
                  })}
                />
                {form.formState.errors.newpassword && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.newpassword.message}
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
                className="bg-[#FBBC05] hover:bg-[#e5a900] text-white h-16 px-16 text-xl font-bold"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Updating..." : "Save"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
