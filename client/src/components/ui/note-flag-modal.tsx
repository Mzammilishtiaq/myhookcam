import { useEffect, useState } from 'react';
import { Clip, NoteFlag } from '@shared/schema';
import { formatVideoTime } from '@/lib/time';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface NoteFlagModalProps {
  clip: Clip;
  date: string;
  existingNote?: NoteFlag; // Optional existing note/flag to edit
  onSave: (content: string | null, isFlag: boolean) => void;
  onDelete?: (id: number) => void; // Optional delete callback
  onClose: () => void;
}

export function NoteFlagModal({
  clip,
  date,
  existingNote,
  onSave,
  onDelete,
  onClose,
}: NoteFlagModalProps) {
  const [content, setContent] = useState<string>(existingNote?.content || '');
  const [isFlag, setIsFlag] = useState<boolean>(existingNote?.isFlag || false);
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  
  const isEditing = !!existingNote;
  
  // Update state if props change
  useEffect(() => {
    if (existingNote) {
      setContent(existingNote.content || '');
      setIsFlag(existingNote.isFlag);
    }
  }, [existingNote]);

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  const handleSave = () => {
    // Pass null if content is empty string
    onSave(content.trim() === '' ? null : content.trim(), isFlag);
    setIsOpen(false);
  };
  
  const handleDelete = () => {
    if (existingNote && onDelete) {
      onDelete(existingNote.id);
      setShowDeleteConfirm(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-[#555555]">
              {isEditing ? 'Edit Note / Flag' : 'Add Note / Flag'}
            </DialogTitle>
            <DialogDescription className="text-[#555555]/80">
              {isEditing 
                ? `Edit note or flag for clip at ${clip.startTime}` 
                : `Create a note or flag for clip at ${clip.startTime}`}
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
          <DialogFooter className="flex gap-2 justify-between">
            <div>
              {isEditing && onDelete && (
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="border-red-500 text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
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
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {isFlag ? 'flag' : 'note'}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}