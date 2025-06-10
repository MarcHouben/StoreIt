import React from "react";
import Sort from "@/components/Sort";
import DateFilter from "@/components/DateFilter";
import { getFiles, getTotalSpaceUsed } from "@/lib/actions/file.action";
import { Models } from "node-appwrite";
import Card from "@/components/Card";
import { getFileTypesParams } from "@/lib/utils";
import TagFilter from "@/components/TagFilter";

const Page = async ({ searchParams, params }: SearchParamProps) => {
  const type = ((await params)?.type as string) || "";
  const searchText = ((await searchParams)?.query as string) || "";
  const sort = ((await searchParams)?.sort as string) || "";
  const startDate = ((await searchParams)?.startDate as string) || "";
  const endDate = ((await searchParams)?.endDate as string) || "";
  const filterTags = ((await searchParams)?.filterTags as string) || "";

  const types = getFileTypesParams(type) as FileType[];
  const [files, totalSpace] = await Promise.all([
    getFiles({
      types,
      searchText,
      sort,
      startDate,
      endDate,
      tags: filterTags.split(",").filter((tag) => tag !== ""),
    }),
    getTotalSpaceUsed(),
  ]);

  // Use the first type if available, otherwise fallback to 'other'
  const typeKey = types.length === 1 ? types[0] : "other";
  const totalSizeInMB = totalSpace[typeKey]?.size
    ? (totalSpace[typeKey].size / (1024 * 1024)).toFixed(2)
    : "0.00";

  return (
    <div className="page-container">
      <section className="w-full">
        <h1 className="h1 capitalize">{type}</h1>

        <div className="total-size-section">
          <p className="body-1">
            Total: <span className="h5">{totalSizeInMB} MB</span>
          </p>
        </div>

        {/* Align DateFilter and Sort on the same row */}
        <div className="filter-sort-row mt-4 flex w-full flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <DateFilter />
          <TagFilter />
          <div className="sort-container">
            <p className="body-1 hidden text-light-200 sm:block">Sort by:</p>
            <Sort />
          </div>
        </div>
      </section>

      {/* Render the files */}
      {files.total > 0 ? (
        <section className="file-list">
          {files.documents.map((file: Models.Document) => (
            <Card key={file.$id} file={file} />
          ))}
        </section>
      ) : (
        <p className="empty-list">No files uploaded</p>
      )}
    </div>
  );
};

export default Page;