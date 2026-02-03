import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast, useToast } from "@/hooks/use-toast";
import {
  Edit2,
  Mail,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Clock,
  UserPlus,
} from "lucide-react";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import { backendCall } from "@/Utlis/BackendService";
import { UserManagementModule, UserManagementProps } from "@/Module/usermanagement";
import { useNavigate } from "react-router-dom";
import { useDeleteUser } from "@/pages/Admin/User/useDeleteUser"


const getUsers = async (): Promise<UserManagementProps[]> => {
  try {
    const response: any = await backendCall({
      url: "/users",
      method: "GET",
      dataModel: UserManagementModule,
    });

    console.log("API response:", response);

    // Make sure we return the array inside "data"
    if (response?.status === "success") {
      toast({
        title: "Users fetched successfully",
        description: `Fetched ${response.data.length} users.`,
      });
      return response.data;
    }

    toast({
      title: "Error",
      description: response?.message || "Unable to fetch users",
      variant: "destructive",
    });
    return [];
  } catch (err: any) {
    console.error("Error fetching users:", err.message || err);
    toast({
      title: "Error",
      description: err.message || "Unable to fetch users",
      variant: "destructive",
    });
    return [];
  }
};


export default function UserManagement() {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const deleteUser = useDeleteUser();
  const { data, isLoading, isError, error } = useQuery<UserManagementProps[]>({
    queryKey: ["/users"],
    queryFn: getUsers,
  });
  useEffect(() => {
    if (isError) {
      toast({
        title: "Error",
        description: error?.message || "Unable to fetch users",
        variant: "destructive",
      });
    }
  }, [isError]);

  const usersPerPage = 20;
  const totalPages = Math.ceil(data?.length || 0 / usersPerPage);

  const currentUsers = data?.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  ) || [];

  const handleEdit = (userId: string) => {
    navigate(`/user-management/update/${userId}`);
    toast({
      title: "Edit User",
      description: `Editing user ID ${userId}`,
    });
  };

  const handleDelete = (userId: string) => {
    deleteUser.mutate(userId);
    toast({
      title: "Delete User",
      description: `Deleting user ID ${userId}`,
      variant: "destructive",
    });
  };

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (isError) {
    return (
      <div className="p-6 text-red-500">
        Failed to load users
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-140px)] py-6 px-4">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pb-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-3xl">User Management</CardTitle>
            <CardDescription className="text-lg">
              Manage system access and permissions
            </CardDescription>
          </div>

          <Button className="bg-[#FBBC05] hover:bg-[#e5a900] text-black rounded-none h-12 px-6 font-bold">
            <UserPlus className="mr-2 h-5 w-5" />
            Add New User
          </Button>
        </CardHeader>

        <CardContent className="px-0">
          <div className="bg-white border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-500">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-500">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-500">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-500 hidden md:table-cell">
                    Created
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {currentUsers.length > 0 ? (
                  currentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-400 flex items-center gap-1">
                          {user.first_name} {user.last_name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-400 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] px-2 py-1 rounded ${user.status ? "bg-green-500" : "bg-red-500"} text-white uppercase font-bold border`}>
                          {user.status ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] px-2 py-1 rounded bg-gray-100 text-gray-600 uppercase font-bold border">
                          {user.role}
                        </span>
                      </td>

                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(user?.id)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(user?.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-8">
              <p className="text-sm text-gray-500">
                Showing {(currentPage - 1) * usersPerPage + 1} to{" "}
                {Math.min(currentPage * usersPerPage, data?.length || 0)} of{" "}
                {data?.length || 0}
              </p>

              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    setCurrentPage((p) => Math.max(1, p - 1))
                  }
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Button
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(totalPages, p + 1)
                    )
                  }
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
