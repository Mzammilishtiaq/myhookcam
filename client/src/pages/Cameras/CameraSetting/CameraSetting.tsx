import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Camera, Trash2, UserPlus, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@radix-ui/react-checkbox";

interface CameraData {
  id: number;
  companyName: string;
  streamUrl: string;
  projectName: string;
  simPhone: string;
  anyDeskId: string;
  craneId: string;
  commentLog: string;
  zoomToggle: boolean;
}

export default function CameraManagement() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Omit<CameraData, 'id'>>({
    companyName: "ACME Construction",
    streamUrl: "rtsp://admin:pass@192.168.1.100:554/live",
    projectName: "Downtown Tower",
    simPhone: "+1 (555) 123-4567",
    anyDeskId: "123 456 789",
    craneId: "Crane-A1",
    commentLog: "Initial setup complete. Signal strength stable.",
    zoomToggle: true,
  });
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("");
  const [permissions, setPermissions] = useState({
    canViewLive: false,
    canViewRecordings: false,
    recordingDays: "7",
    canPTZ: false
  });
  const [assignedManagers, setAssignedManagers] = useState([
    "manager1@example.com",
    "pm@acme-construction.com"
  ]);
  const [assignedUsers, setAssignedUsers] = useState([
    { email: "user1@example.com", role: "site_manager" },
    { email: "user2@example.com", role: "viewer" }
  ]);

  const handleInvite = () => {
    if (!inviteEmail) return;
    setAssignedManagers([...assignedManagers, inviteEmail]);
    toast({ title: "Manager Invited", description: `Invitation sent to ${inviteEmail}` });
    setInviteEmail("");
  };

  const removeUser = (email: string) => {
    setAssignedUsers(assignedUsers.filter(u => u.email !== email));
    toast({ title: "User Removed", description: "Access has been revoked." });
  };
  const handleSubmit = () => {
    toast({ title: "Settings Saved", description: "Camera configuration has been updated." });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this camera? This action cannot be undone.")) {
      toast({
        title: "Camera Deleted",
        description: "The camera has been removed from the system.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-full h-full min-h-[calc(100vh-140px)] py-6 px-4">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-10 px-0">
          <div>
            <CardTitle className="flex items-center gap-3 text-4xl font-bold">
              <Camera className="h-10 w-10 text-[#FBBC05]" />
              Camera Settings
            </CardTitle>
            <CardDescription className="mt-2 text-xl">
              Configure hardware settings and connection details for this device
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="lg"
            className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-100 h-14 px-6 text-lg"
            onClick={handleDelete}
          >
            <Trash2 className="h-6 w-6 mr-2" />
            Delete Camera
          </Button>
        </CardHeader>
        <CardContent className="space-y-10 px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <Label className="text-lg">Company Name</Label>
              <Input
                className="h-14 text-lg"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
            </div>
            <div className="space-y-3">
              <Label className="text-lg">Project Name</Label>
              <Input
                className="h-14 text-lg"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
              />
            </div>
            <div className="space-y-3 md:col-span-2">
              <Label className="text-lg">Stream URL</Label>
              <Input
                className="h-14 text-lg"
                value={formData.streamUrl}
                onChange={(e) => setFormData({ ...formData, streamUrl: e.target.value })}
              />
            </div>
            <div className="space-y-3">
              <Label className="text-lg">SIM Phone #</Label>
              <Input
                className="h-14 text-lg"
                value={formData.simPhone}
                onChange={(e) => setFormData({ ...formData, simPhone: e.target.value })}
              />
            </div>
            <div className="space-y-3">
              <Label className="text-lg">AnyDesk ID</Label>
              <Input
                className="h-14 text-lg"
                value={formData.anyDeskId}
                onChange={(e) => setFormData({ ...formData, anyDeskId: e.target.value })}
              />
            </div>
            <div className="space-y-3">
              <Label className="text-lg">Crane ID</Label>
              <Input
                className="h-14 text-lg"
                value={formData.craneId}
                onChange={(e) => setFormData({ ...formData, craneId: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between p-6 border rounded-none bg-white md:col-span-2">
              <div className="space-y-1">
                <Label className="text-2xl font-bold">Camera Zoom Control</Label>
                <div className="text-base text-gray-500">Allow operators to adjust zoom remotely</div>
              </div>
              <Switch
                className="scale-150"
                checked={formData.zoomToggle}
                onCheckedChange={(val) => setFormData({ ...formData, zoomToggle: val })}
              />
            </div>
          </div>

          <div className="pt-10 border-t space-y-6">
            <h4 className="text-2xl font-bold flex items-center gap-3 text-[#555555]">
              <UserPlus className="h-6 w-6 text-[#FBBC05]" />
              Invite User to this Site
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-lg text-[#555555]">User Email</Label>
                  <Input
                    placeholder="user@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="h-14 text-lg rounded-none border-[#BCBBBB]"
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-lg text-[#555555]">Role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger className="h-14 text-lg rounded-none border-[#BCBBBB]">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="site_manager">Site Manager</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {inviteRole === "viewer" && (
                  <div className="space-y-6 p-6 bg-gray-50 border border-[#BCBBBB]">
                    <h5 className="font-bold text-[#555555]">
                      Viewer Permissions
                    </h5>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="live"
                          checked={permissions.canViewLive}
                          onCheckedChange={(checked) =>
                            setPermissions({
                              ...permissions,
                              canViewLive: !!checked,
                            })
                          }
                        />
                        <Label
                          htmlFor="live"
                          className="text-base font-medium cursor-pointer"
                        >
                          Can View Live Stream
                        </Label>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="recordings"
                            checked={permissions.canViewRecordings}
                            onCheckedChange={(checked) =>
                              setPermissions({
                                ...permissions,
                                canViewRecordings: !!checked,
                              })
                            }
                          />
                          <Label
                            htmlFor="recordings"
                            className="text-base font-medium cursor-pointer"
                          >
                            Can View Recordings
                          </Label>
                        </div>

                        {permissions.canViewRecordings && (
                          <div className="pl-8 space-y-3">
                            <Label className="text-sm text-gray-500 uppercase font-bold tracking-wider">
                              Recording Days Access
                            </Label>
                            <Select
                              value={permissions.recordingDays}
                              onValueChange={(val) =>
                                setPermissions({
                                  ...permissions,
                                  recordingDays: val,
                                })
                              }
                            >
                              <SelectTrigger className="h-12 text-base rounded-none border-[#BCBBBB] bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="7">7 Days</SelectItem>
                                <SelectItem value="30">30 Days</SelectItem>
                                <SelectItem value="90">90 Days</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="ptz"
                          checked={permissions.canPTZ}
                          onCheckedChange={(checked) =>
                            setPermissions({
                              ...permissions,
                              canPTZ: !!checked,
                            })
                          }
                        />
                        <Label
                          htmlFor="ptz"
                          className="text-base font-medium cursor-pointer"
                        >
                          Can PTZ
                        </Label>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full h-14 text-lg bg-[#FBBC05] hover:bg-[#e5a900] rounded-none"
                  onClick={handleInvite}
                >
                  Send Invitation
                </Button>
              </div>

              <div className="space-y-4">
                <Label className="text-sm text-gray-500 uppercase font-black tracking-[0.2em]">
                  Currently Assigned
                </Label>
                <div className="space-y-3">
                  {assignedUsers.map((user) => (
                    <div
                      key={user.email}
                      className="p-4 bg-white border border-[#BCBBBB] rounded-none text-lg flex items-center justify-between group"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-[#555555]">
                          {user.email}
                        </span>
                        <span className="text-sm text-[#FBBC05] font-bold uppercase tracking-wider">
                          {user.role}
                        </span>
                      </div>
                      <X
                        className="h-6 w-6 cursor-pointer text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeUser(user.email)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-lg">Comment Log / Maintenance History</Label>
            <Textarea
              value={formData.commentLog}
              onChange={(e) => setFormData({ ...formData, commentLog: e.target.value })}
              className="min-h-[200px] text-lg p-4"
              placeholder="Record maintenance notes here..."
            />
          </div>

          <div className="flex justify-end gap-6 pt-10 border-t">
            <Button variant="outline" className="h-16 px-10 text-xl">Discard Changes</Button>
            <Button
              className="bg-[#FBBC05] hover:bg-[#e5a900] text-white h-16 px-16 text-xl font-bold"
              onClick={handleSubmit}
            >
              Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
