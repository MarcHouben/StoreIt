import React, { useState, KeyboardEvent, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllTags } from "@/lib/actions/file.action";

interface TagInputProps {
  initialTags?: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
}

const TagInput: React.FC<TagInputProps> = ({ initialTags = [], onTagsChange, placeholder = "Add tags..." }) => {
  const [inputValue, setInputValue] = useState("");
  const [tags, setTags] = useState<string[]>(initialTags);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedSelectValue, setSelectedSelectValue] = useState<string>("");

  useEffect(() => {
    const fetchTags = async () => {
      const tags = await getAllTags();
      setAvailableTags(tags);
    };
    fetchTags();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (!tags.includes(newTag)) {
        const updatedTags = [...tags, newTag];
        setTags(updatedTags);
        onTagsChange(updatedTags);
      }
      setInputValue("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(updatedTags);
    onTagsChange(updatedTags);
  };

  const handleSelectTag = (tag: string) => {
    if (!tags.includes(tag)) {
      const updatedTags = [...tags, tag];
      setTags(updatedTags);
      onTagsChange(updatedTags);
    }
    setSelectedSelectValue("");
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Input
          type="text"
          placeholder="Enter tags (press Enter)"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          className="flex-1"
        />
        <Select onValueChange={handleSelectTag} value={selectedSelectValue}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select tag" />
          </SelectTrigger>
          <SelectContent>
            {availableTags
              .filter(tag => !tags.includes(tag))
              .map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {tags.map((tag) => (
          <Badge
            key={tag}
            className="flex items-center gap-1 px-3 py-1 text-xs bg-brand-100/20 text-brand-100 rounded-full font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="ml-1 rounded-full p-0.5 hover:bg-white/20 focus:outline-none focus:ring-0"
            >
              <Image
                src="/assets/icons/close-dark.svg"
                alt="Remove tag"
                width={10}
                height={10}
              />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default TagInput; 