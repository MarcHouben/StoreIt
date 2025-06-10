import React, { useState, useEffect } from "react";
import { Models } from "node-appwrite";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { updateFileDetails } from "@/lib/actions/file.action";
import Image from "next/image";
import TagInput from "@/components/TagInput";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  file: Models.Document;
}

const PostUploadActionsModal = ({ isOpen, onClose, file }: Props) => {
  const [fileName, setFileName] = useState(file.name);
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const path = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    if (file) {
      setFileName(file.name.split(".").slice(0, -1).join("."));
      setTags(file.tags || []);
    }
  }, [file]);

  const handleSave = async () => {
    setIsLoading(true);
    const newExtension = file.extension;
    const newFileNameWithExtension = `${fileName}.${newExtension}`;

    try {
      const success = await updateFileDetails({
        fileId: file.$id,
        name: newFileNameWithExtension,
        tags: tags,
        path,
      });

      if (success) {
        toast({
          description: "File details updated successfully!",
          className: "success-toast",
        });
        onClose();
      } else {
        toast({
          description: "Failed to update file details.",
          className: "error-toast",
        });
      }
    } catch (error) {
      console.error("Error updating file details:", error);
      toast({
        description: "An error occurred while updating file details.",
        className: "error-toast",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="shad-dialog button">
        <DialogHeader className="flex flex-col gap-3">
          <DialogTitle className="text-center text-light-100">
            Edit File Details
          </DialogTitle>
          <div className="flex flex-col gap-4">
            <div>
              <p className="subtitle-2 text-light-100 mb-2">File Name:</p>
              <Input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <p className="subtitle-2 text-light-100 mb-2">Tags:</p>
              <TagInput
                initialTags={tags}
                onTagsChange={setTags}
                placeholder="Enter tags (press Enter to add)"
              />
              <p className="text-sm text-light-200 mt-1">Add tags to categorize your files (e.g. work, personal, project)</p>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-3 md:flex-row">
          <Button onClick={onClose} className="modal-cancel-button">
            Cancel
          </Button>
          <Button onClick={handleSave} className="modal-submit-button" disabled={isLoading}>
            <p>Save</p>
            {isLoading && (
              <Image
                src="/assets/icons/loader.svg"
                alt="loader"
                width={24}
                height={24}
                className="animate-spin"
              />
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PostUploadActionsModal; 