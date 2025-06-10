"use server";

import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { InputFile } from "node-appwrite/file";
import { appwriteConfig } from "@/lib/appwrite/config";
import { ID, Models, Query } from "node-appwrite";
import { constructFileUrl, getFileType, parseStringify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/actions/user.actions";

const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};

declare interface UploadFileProps {
  file: File;
  ownerId: string;
  accountId: string;
  path: string;
  tags?: string[];
}

declare interface UpdateFileDetailsProps {
  fileId: string;
  name: string;
  tags: string[];
  path: string;
}

declare interface GetFilesProps {
  types: FileType[];
  searchText?: string;
  sort?: string;
  limit?: number;
  startDate?: string;
  endDate?: string;
  tags?: string[];
}

declare interface RenameFileProps {
  fileId: string;
  name: string;
  extension: string;
  path: string;
}

declare interface UpdateFileUsersProps {
  fileId: string;
  emails: string[];
  path: string;
}

declare interface DeleteFileProps {
  fileId: string;
  bucketFileId: string;
  path: string;
}

export const uploadFile = async ({
  file,
  ownerId,
  accountId,
  path,
  tags = [],
}: UploadFileProps) => {
  const { storage, databases } = await createAdminClient();

  try {
    const inputFile = InputFile.fromBuffer(file, file.name);

    const bucketFile = await storage.createFile(
      appwriteConfig.bucketId,
      ID.unique(),
      inputFile,
    );

    const fileDocument = {
      type: getFileType(bucketFile.name).type,
      name: bucketFile.name,
      url: constructFileUrl(bucketFile.$id),
      extension: getFileType(bucketFile.name).extension,
      size: bucketFile.sizeOriginal,
      owner: ownerId,
      accountId,
      users: [],
      bucketFileId: bucketFile.$id,
      tags: tags,
    };

    const newFile = await databases
      .createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.filesCollecionId,
        ID.unique(),
        fileDocument,
      )
      .catch(async (error: unknown) => {
        await storage.deleteFile(appwriteConfig.bucketId, bucketFile.$id);
        handleError(error, "Failed to create file document");
      });

    revalidatePath(path);
    return parseStringify(newFile);
  } catch (error) {
    handleError(error, "Failed to upload file");
  }
};

const createQueries = (
  currentUser: Models.Document,
  types: string[],
  searchText: string,
  sort: string,
  limit?: number,
  startDate?: string,
  endDate?: string,
  tags?: string[],
) => {
  const queries = [
    Query.or([
      Query.equal("owner", [currentUser.$id]),
      Query.contains("users", [currentUser.email]),
    ]),
  ];

  if (types.length > 0) queries.push(Query.equal("type", types));
  if (searchText) queries.push(Query.contains("name", searchText));
  if (tags && tags.length > 0) queries.push(Query.contains("tags", tags));
  if (limit) queries.push(Query.limit(limit));

  // Add date range filters
  if (startDate) {
    queries.push(Query.greaterThanEqual("$createdAt", startDate));
  }
  if (endDate) {
    // Add one day to endDate to include the entire end date
    const endDateObj = new Date(endDate);
    endDateObj.setDate(endDateObj.getDate() + 1);
    queries.push(Query.lessThanEqual("$createdAt", endDateObj.toISOString()));
  }

  if (sort) {
    const [sortBy, orderBy] = sort.split("-");

    queries.push(
      orderBy === "asc" ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy),
    );
  }

  return queries;
};

export const getFiles = async ({
  types = [],
  searchText = "",
  sort = "$createdAt-desc",
  limit,
  startDate,
  endDate,
  tags = [],
}: GetFilesProps) => {
  const { databases } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) throw new Error("User not found");

    const queries = createQueries(currentUser, types, searchText, sort, limit, startDate, endDate, tags);

    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollecionId,
      queries,
    );

    console.log({ files });
    return parseStringify(files);
  } catch (error) {
    handleError(error, "Failed to get files");
  }
};

export const renameFile = async ({
  fileId,
  name,
  extension,
  path,
}: RenameFileProps) => {
  const { databases } = await createAdminClient();

  try {
    const newName = `${name}.${extension}`;
    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollecionId,
      fileId,
      {
        name: newName,
      },
    );

    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Failed to rename file");
  }
};

export const updateFileUsers = async ({
  fileId,
  emails,
  path,
}: UpdateFileUsersProps) => {
  const { databases } = await createAdminClient();

  try {
    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollecionId,
      fileId,
      {
        users: emails,
      },
    );

    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Failed to rename file");
  }
};

export const deleteFile = async ({
  fileId,
  bucketFileId,
  path,
}: DeleteFileProps) => {
  const { databases, storage } = await createAdminClient();

  try {
    const deletedFile = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollecionId,
      fileId,
    );

    if (deletedFile) {
      await storage.deleteFile(appwriteConfig.bucketId, bucketFileId);
    }

    revalidatePath(path);
    return parseStringify({ status: "success" });
  } catch (error) {
    handleError(error, "Failed to rename file");
  }
};

export const updateFileDetails = async ({
  fileId,
  name,
  tags,
  path,
}: UpdateFileDetailsProps) => {
  const { databases } = await createAdminClient();

  try {
    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollecionId,
      fileId,
      {
        name: name,
        tags: tags,
      },
    );

    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Failed to update file details");
  }
};

// ============================== TOTAL FILE SPACE USED
export async function getTotalSpaceUsed() {
  try {
    const { databases } = await createSessionClient();
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User is not authenticated.");

    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollecionId,
      [Query.equal("owner", [currentUser.$id])],
    );

    const totalSpace = {
      image: { size: 0, latestDate: "" },
      document: { size: 0, latestDate: "" },
      video: { size: 0, latestDate: "" },
      audio: { size: 0, latestDate: "" },
      other: { size: 0, latestDate: "" },
      used: 0,
      all: 2 * 1024 * 1024 * 1024 /* 2GB available bucket storage */,
    };

    files.documents.forEach((file) => {
      const fileType = file.type as FileType;
      totalSpace[fileType].size += file.size;
      totalSpace.used += file.size;

      if (
        !totalSpace[fileType].latestDate ||
        new Date(file.$updatedAt) > new Date(totalSpace[fileType].latestDate)
      ) {
        totalSpace[fileType].latestDate = file.$updatedAt;
      }
    });

    return parseStringify(totalSpace);
  } catch (error) {
    handleError(error, "Error calculating total space used:, ");
  }
}

export const getAllTags = async () => {
  const { databases } = await createAdminClient();

  try {
    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollecionId,
      [Query.select(["tags"]), Query.limit(5000)] // Fetch all tags, limiting to 5000 documents for now
    );

    const allTags = new Set<string>();
    files.documents.forEach((file) => {
      if (file.tags && Array.isArray(file.tags)) {
        file.tags.forEach((tag: string) => allTags.add(tag));
      }
    });

    return Array.from(allTags);
  } catch (error) {
    handleError(error, "Failed to get all tags");
    return [];
  }
};