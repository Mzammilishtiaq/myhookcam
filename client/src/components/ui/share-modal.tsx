import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {}

function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <div
      className={cn("animate-spin rounded-full border-2 border-current border-t-transparent h-4 w-4", className)}
      {...props}
    />
  );
}

import type { Clip } from "@shared/schema";

// Share form schema
const shareFormSchema = z.object({
  recipient: z.string().refine((value) => {
    // Email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Phone number regex - simplified for demonstration
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    return emailRegex.test(value) || phoneRegex.test(value);
  }, {
    message: "Please enter a valid email or phone number",
  }),
  type: z.enum(["email", "sms"]),
  message: z.string().optional(),
});

type ShareFormValues = z.infer<typeof shareFormSchema>;

interface ShareModalProps {
  clip?: Clip;
  onClose: () => void;
}

export function ShareModal({ clip, onClose }: ShareModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(true);

  // Initialize form with default values
  const form = useForm<ShareFormValues>({
    resolver: zodResolver(shareFormSchema),
    defaultValues: {
      recipient: "",
      type: "email",
      message: "",
    },
  });

  // Create share mutation
  const shareClipMutation = useMutation({
    mutationFn: async (data: ShareFormValues & { clipKey: string; date: string; clipTime: string }) => {
      return apiRequest(
        "POST",
        "/api/shares", 
        {
          ...data,
          // Set expiration date to 7 days from now
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shares"] });
      toast({
        title: "Success!",
        description: "Video clip has been shared successfully.",
      });
      handleClose();
    },
    onError: (error) => {
      console.error("Share error:", error);
      toast({
        title: "Failed to share",
        description: "There was an error sharing the video clip. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: ShareFormValues) => {
    if (!clip) return;

    // Add clip data to the form values
    shareClipMutation.mutate({
      ...values,
      clipKey: clip.key,
      date: clip.date,
      clipTime: clip.startTime,
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Video Clip</DialogTitle>
          <DialogDescription>
            Share this video clip via email or SMS.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {clip && (
              <div className="p-3 bg-secondary rounded-md text-sm mb-4">
                <div className="font-medium">Selected Clip:</div>
                <div>Date: {clip.date}</div>
                <div>Time: {clip.startTime}</div>
              </div>
            )}

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Share via</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-2"
                    >
                      <FormItem className="flex items-center space-x-1 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="email" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">Email</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-1 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="sms" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">SMS</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recipient"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {form.watch("type") === "email" ? "Email address" : "Phone number"}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={form.watch("type") === "email" ? "Email address" : "Phone number"}
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    {form.watch("type") === "email" 
                      ? "The recipient's email address" 
                      : "The recipient's phone number (e.g., +1234567890)"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add a personal message..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Include an optional message to the recipient.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={shareClipMutation.isPending}
              >
                {shareClipMutation.isPending && (
                  <Spinner className="mr-2" />
                )}
                Share
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}