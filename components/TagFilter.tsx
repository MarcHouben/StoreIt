"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllTags } from "@/lib/actions/file.action";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const TagFilter = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchTags = async () => {
      const tags = await getAllTags();
      setAvailableTags(tags);
    };
    fetchTags();
  }, []);

  useEffect(() => {
    const tagsFromUrl = searchParams.get("filterTags");
    if (tagsFromUrl) {
      setSelectedTags(tagsFromUrl.split(",").filter(tag => tag !== ""));
    } else {
      setSelectedTags([]);
    }
  }, [searchParams]);

  const handleTagChange = useCallback((tag: string) => {
    const params = new URLSearchParams(searchParams.toString());
    let currentTags = selectedTags;

    if (currentTags.includes(tag)) {
      currentTags = currentTags.filter((t) => t !== tag);
    } else {
      currentTags = [...currentTags, tag];
    }

    setSelectedTags(currentTags);

    if (currentTags.length > 0) {
      params.set("filterTags", currentTags.join(","));
    } else {
      params.delete("filterTags");
    }

    router.push(`${pathname}?${params.toString()}`);
  }, [selectedTags, searchParams, pathname, router]);

  const handleClear = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("filterTags");
    setSelectedTags([]);
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, pathname, router]);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <Select onValueChange={handleTagChange} value="">
        <SelectTrigger className="tag-filter-trigger w-[200px] sm:w-[250px]">
          {selectedTags.length > 0 ? (
            <div className="flex flex-wrap gap-1 max-w-[calc(100%-20px)]">
              {selectedTags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-brand-100/20 text-brand-100 rounded-full text-xs font-medium truncate max-w-[80px]"
                >
                  {tag}
                </span>
              ))}
              {selectedTags.length > 2 && (
                <span className="whitespace-nowrap px-2 py-0.5 bg-brand-100/20 text-brand-100 rounded-full text-xs font-medium">
                  +{selectedTags.length - 2} more
                </span>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">Filter by tags</span>
          )}
          <SelectValue className="hidden" />
        </SelectTrigger>
        <SelectContent>
          {availableTags.length > 0 ? (
            availableTags.map((tag) => (
              <SelectItem key={tag} value={tag} className="cursor-pointer">
                <div className="flex items-center justify-between w-full">
                  <span>{tag}</span>
                  {selectedTags.includes(tag) && (
                    <Check className="h-4 w-4 ml-2" />
                  )}
                </div>
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-tags" disabled>
              No tags available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      {selectedTags.length > 0 && (
        <Button
          type="button"
          onClick={handleClear}
          className="mt-5 h-10 rounded-lg border border-light-300 bg-white px-4 py-2 text-brand hover:bg-brand hover:text-white transition-all sm:mt-0"
        >
          Clear Tags
        </Button>
      )}
    </div>
  );
};

export default TagFilter; 