import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";

export default function CreateUser() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    toast({ title: "User Created", description: "The user has been successfully added to the system." });
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
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <Label className="text-lg">First Name *</Label>
                <Input 
                  required
                  className="h-16 text-lg"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
              </div>
              <div className="space-y-3">
                <Label className="text-lg">Last Name *</Label>
                <Input 
                  required
                  className="h-16 text-lg"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
              </div>
              <div className="space-y-3">
                <Label className="text-lg">Email *</Label>
                <Input 
                  required
                  type="email"
                  className="h-16 text-lg"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-3">
                <Label className="text-lg">Phone</Label>
                <Input 
                  className="h-16 text-lg"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="space-y-3">
                <Label className="text-lg">Password *</Label>
                <Input 
                  required
                  type="password"
                  className="h-16 text-lg"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <div className="space-y-3">
                <Label className="text-lg">Confirm Password *</Label>
                <Input 
                  required
                  type="password"
                  className="h-16 text-lg"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                />
              </div>
            </div>

            <div className="flex justify-end gap-6 pt-10 border-t">
              <Button type="button" variant="outline" className="h-16 px-10 text-xl" onClick={() => window.history.back()}>
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-[#FBBC05] hover:bg-[#e5a900] text-white h-16 px-16 text-xl font-bold"
              >
                Create User
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
