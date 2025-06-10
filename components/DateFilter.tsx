"use client"

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

const DateFilter = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const path = usePathname();

  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";

  const handleDateChange = (type: "startDate" | "endDate", value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(type, value);
    } else {
      params.delete(type);
    }

    router.push(`${path}?${params.toString()}`);
  };

  const handleClear = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("startDate");
    params.delete("endDate");
    router.push(`${path}?${params.toString()}`);
  };

  return (
    <div className="date-filter flex flex-col gap-2 sm:flex-row sm:items-end">
      <div className="flex flex-col gap-1">
        <Label htmlFor="startDate">From</Label>
        <div className="relative">
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => handleDateChange("startDate", e.target.value)}
            className="date-filter-input rounded-lg border border-light-300 bg-white px-4 py-2 pr-10 text-dark-200 focus:border-brand focus:ring-2 focus:ring-brand/30 transition-all"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <Image src="/assets/icons/calendar.svg" alt="calendar" width={18} height={18} />
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="endDate">To</Label>
        <div className="relative">
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => handleDateChange("endDate", e.target.value)}
            className="date-filter-input rounded-lg border border-light-300 bg-white px-4 py-2 pr-10 text-dark-200 focus:border-brand focus:ring-2 focus:ring-brand/30 transition-all"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <Image src="/assets/icons/calendar.svg" alt="calendar" width={18} height={18} />
          </span>
        </div>
      </div>
      {(startDate || endDate) && (
        <button
          type="button"
          onClick={handleClear}
          className="mt-5 h-10 rounded-lg border border-light-300 bg-white px-4 py-2 text-brand hover:bg-brand hover:text-white transition-all sm:mt-0"
        >
          Clear
        </button>
      )}
    </div>
  );
};

export default DateFilter; 