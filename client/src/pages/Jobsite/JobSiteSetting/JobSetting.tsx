import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MapPin, UserPlus, X, Trash2, Camera, Plus } from "lucide-react";

export default function JobsiteSetting() {
  const { toast } = useToast();
  const [siteName, setSiteName] = useState("Downtown Construction");
  const [inviteEmail, setInviteEmail] = useState("");
  const [assignedManagers, setAssignedManagers] = useState([
    "manager1@example.com",
    "pm@acme-construction.com"
  ]);

  const handleInvite = () => {
    if (!inviteEmail) return;
    setAssignedManagers([...assignedManagers, inviteEmail]);
    toast({ title: "Manager Invited", description: `Invitation sent to ${inviteEmail}` });
    setInviteEmail("");
  };

  const removeManager = (email: string) => {
    setAssignedManagers(assignedManagers.filter(m => m !== email));
    toast({ title: "Manager Removed", description: "Access has been revoked." });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this jobsite? All associated camera settings will be removed.")) {
      toast({ title: "Jobsite Deleted", variant: "destructive" });
    }
  };

  return (
    <div className="w-full h-full min-h-[calc(100vh-140px)] py-6 px-4 bg-gray-50/50">
      <div className="bg-white p-8 shadow-sm">
        <div className="flex flex-row items-center justify-between space-y-0 pb-10">
          <div>
            <h1 className="flex items-center gap-3 text-4xl font-bold text-[#555555]">
              <MapPin className="h-10 w-10 text-[#FBBC05]" />
              Jobsite Settings
            </h1>
            <p className="mt-2 text-xl text-gray-500">
              Update site details and manage manager access
            </p>
          </div>
          <Button 
            variant="outline" 
            size="lg" 
            className="text-red-500 hover:text-red-700 border-red-100 h-14 px-6 text-lg rounded-none"
            onClick={handleDelete}
          >
            <Trash2 className="h-6 w-6 mr-2" />
            Delete Site
          </Button>
        </div>
        <div className="space-y-12">
          <div className="space-y-4">
            <Label className="text-xl font-bold text-[#555555]">Jobsite Name</Label>
            <div className="flex gap-4">
              <Input 
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="h-16 text-xl max-w-2xl rounded-none border-[#BCBBBB]"
              />
              <Button className="h-16 px-10 text-xl bg-[#FBBC05] hover:bg-[#e5a900] rounded-none">Update Name</Button>
            </div>
          </div>

          <div className="pt-10 border-t space-y-6">
            <h4 className="text-2xl font-bold flex items-center gap-3 text-[#555555]">
              <Camera className="h-6 w-6 text-[#FBBC05]" />
              Add New Camera to this Site
            </h4>
            <div className="flex gap-4">
              <Button 
                className="h-16 px-10 text-xl bg-[#FBBC05] hover:bg-[#e5a900] rounded-none"
                onClick={() => {
                  toast({ title: "Redirecting", description: "Navigating to Camera Settings to add new device." });
                  // In a real app, this would pass the jobsite ID to the camera management page
                  window.location.href = "/cameras-admin";
                }}
              >
                <Plus className="h-6 w-6 mr-2" />
                Add Camera
              </Button>
            </div>
          </div>

          <div className="pt-10 border-t space-y-6">
            <h4 className="text-2xl font-bold flex items-center gap-3 text-[#555555]">
              <UserPlus className="h-6 w-6 text-[#FBBC05]" />
              Invite Manager to this Site
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <Label className="text-lg text-[#555555]">Manager Email</Label>
                <div className="flex gap-4">
                  <Input 
                    placeholder="manager@example.com" 
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="h-14 text-lg rounded-none border-[#BCBBBB]"
                  />
                  <Button className="h-14 px-8 text-lg bg-[#FBBC05] hover:bg-[#e5a900] rounded-none" onClick={handleInvite}>Invite</Button>
                </div>
              </div>
              <div className="space-y-4">
                <Label className="text-sm text-gray-500 uppercase font-black tracking-[0.2em]">Site Managers</Label>
                <div className="flex flex-wrap gap-4">
                  {assignedManagers.map(email => (
                    <div key={email} className="px-5 py-3 bg-gray-50 border border-[#BCBBBB] rounded-none text-lg flex items-center gap-4 text-[#555555]">
                      {email}
                      <X 
                        className="h-5 w-5 cursor-pointer text-gray-400 hover:text-red-500" 
                        onClick={() => removeManager(email)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
