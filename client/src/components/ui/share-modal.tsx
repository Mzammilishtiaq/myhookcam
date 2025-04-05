import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clipboard, Mail, MessageSquare, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Clip } from "@shared/schema";

interface ShareModalProps {
  clip: Clip;
  onClose: () => void;
}

export function ShareModal({ clip, onClose }: ShareModalProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [shareMethod, setShareMethod] = useState<"email" | "sms" | "link">("email");
  const [isSharing, setIsSharing] = useState(false);
  
  // Generate a shareable link
  const shareLink = `${window.location.origin}/shared-clip/${clip.key}`;
  
  // Handle share submission
  const handleShare = async () => {
    setIsSharing(true);
    
    try {
      // Create different API requests based on share method
      if (shareMethod === "email" && email) {
        // Split email string into an array of emails
        const emails = email.split(',').map(e => e.trim()).filter(e => e);
        
        if (emails.length === 0) throw new Error("No valid email addresses provided");
        
        // Share via email
        const response = await fetch("/api/shares", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clipKey: clip.key,
            date: clip.date,
            clipTime: clip.startTime,
            recipientEmails: emails, // Send as array
            message: message.trim(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week
            shareMethod: "email"
          }),
        });
        
        if (!response.ok) throw new Error("Failed to share via email");
        
        toast({
          title: "Clip shared!",
          description: emails.length > 1 
            ? `Email sent to ${emails.length} recipients` 
            : `Email sent to ${emails[0]}`,
        });
      } 
      else if (shareMethod === "sms" && phone) {
        // Split phone string into an array of phone numbers
        const phones = phone.split(',').map(p => p.trim()).filter(p => p);
        
        if (phones.length === 0) throw new Error("No valid phone numbers provided");
        
        // Share via SMS
        const response = await fetch("/api/shares", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clipKey: clip.key,
            date: clip.date,
            clipTime: clip.startTime,
            recipientPhones: phones, // Send as array
            message: message.trim(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week
            shareMethod: "sms"
          }),
        });
        
        if (!response.ok) throw new Error("Failed to share via SMS");
        
        toast({
          title: "Clip shared!",
          description: phones.length > 1 
            ? `SMS sent to ${phones.length} recipients` 
            : `SMS sent to ${phones[0]}`,
        });
      }
      else if (shareMethod === "link") {
        // Copy link to clipboard
        await navigator.clipboard.writeText(shareLink);
        
        toast({
          title: "Link copied!",
          description: "Share link copied to clipboard",
        });
      }
      
      onClose();
    } catch (error) {
      console.error("Share error:", error);
      toast({
        title: "Share failed",
        description: "There was an error sharing this clip",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };
  
  // Format clip time for display
  const formatClipTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const amPm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${amPm}`;
  };
  
  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-[#555555]">Share Clip</DialogTitle>
          <DialogDescription>
            Share clip from {formatClipTime(clip.startTime)} on {clip.date}
          </DialogDescription>
        </DialogHeader>
        
        {/* Message input section */}
        <div className="space-y-2 mb-4">
          <Label htmlFor="message" className="text-[#555555]">Message (optional)</Label>
          <Textarea 
            id="message" 
            placeholder="Add a message to include with this clip..." 
            value={message} 
            onChange={(e) => setMessage(e.target.value)}
            className="border-[#BCBBBB] focus-visible:ring-[#FBBC05] h-20 resize-none"
          />
        </div>
        
        <Tabs defaultValue="email" className="w-full" onValueChange={(v) => setShareMethod(v as any)}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="email" className="data-[state=active]:bg-[#FBBC05] data-[state=active]:text-[#000000]">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </TabsTrigger>
            <TabsTrigger value="sms" className="data-[state=active]:bg-[#FBBC05] data-[state=active]:text-[#000000]">
              <MessageSquare className="h-4 w-4 mr-2" />
              SMS
            </TabsTrigger>
            <TabsTrigger value="link" className="data-[state=active]:bg-[#FBBC05] data-[state=active]:text-[#000000]">
              <Clipboard className="h-4 w-4 mr-2" />
              Copy Link
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="email" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#555555]">Email address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="border-[#BCBBBB] focus:border-[#FBBC05] focus:ring-[#FBBC05]"
              />
              <p className="text-xs text-[#555555]">
                The recipient(s) will receive an email with a link to view this clip.
                You can enter multiple emails separated by commas.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="sms" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[#555555]">Phone number</Label>
              <Input 
                id="phone" 
                type="tel" 
                placeholder="(555) 123-4567" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                className="border-[#BCBBBB] focus:border-[#FBBC05] focus:ring-[#FBBC05]"
              />
              <p className="text-xs text-[#555555]">
                The recipient(s) will receive a text message with a link to view this clip.
                You can enter multiple phone numbers separated by commas.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="link" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="link" className="text-[#555555]">Shareable link</Label>
              <div className="flex items-center space-x-2">
                <Input 
                  id="link" 
                  readOnly 
                  value={shareLink}
                  className="border-[#BCBBBB] focus:border-[#FBBC05] focus:ring-[#FBBC05]"
                />
                <Button 
                  type="button"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(shareLink);
                    toast({
                      title: "Link copied!",
                      description: "Share link copied to clipboard",
                    });
                  }}
                  className="bg-[#FBBC05] hover:bg-[#FBBC05]/90 text-[#000000]"
                >
                  <Clipboard className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-[#555555]">
                This link provides temporary access to view this clip.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-[#555555] text-[#555555] hover:bg-[#FBBC05]/10"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleShare}
            disabled={
              (shareMethod === "email" && !email) || 
              (shareMethod === "sms" && !phone) || 
              isSharing
            }
            className="bg-[#FBBC05] hover:bg-[#FBBC05]/90 text-[#000000]"
          >
            {isSharing ? "Sharing..." : "Share"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}