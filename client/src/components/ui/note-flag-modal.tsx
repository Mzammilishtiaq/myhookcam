import { useState } from 'react';
import { Clip } from '@shared/schema';
import { formatVideoTime } from '@/lib/time';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface NoteFlagModalProps {
  clip: Clip;
  date: string;
  onSave: (content: string | null, isFlag: boolean) => void;
  onClose: () => void;
}

export function NoteFlagModal({
  clip,
  date,
  onSave,
  onClose,
}: NoteFlagModalProps) {
  const [content, setContent] = useState<string>('');
  const [isFlag, setIsFlag] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  const handleSave = () => {
    // Pass null if content is empty string
    onSave(content.trim() === '' ? null : content.trim(), isFlag);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-[#555555]">Add Note / Flag</DialogTitle>
          <DialogDescription className="text-[#555555]/80">
            Create a note or flag for clip at {clip.startTime}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note" className="text-[#555555]">
              Note (optional)
            </Label>
            <Textarea
              id="note"
              placeholder="Enter notes about this clip..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-y text-[#555555]"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="flag"
              checked={isFlag}
              onCheckedChange={(checked) => setIsFlag(checked as boolean)}
            />
            <Label
              htmlFor="flag"
              className="text-sm font-medium cursor-pointer text-[#555555] leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Flag this clip for follow-up
            </Label>
          </div>
        </div>
        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="border-[#555555] text-[#555555] hover:bg-[#FBBC05]/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[#FBBC05] hover:bg-[#FBBC05]/90 text-[#000000]"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}