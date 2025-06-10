// lib/appwrite/config.ts
const appwriteConfig = {
  endpointurl: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT,
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
  usersCollectionId: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION,
  filesCollectionId: process.env.NEXT_PUBLIC_APPWRITE_FILES_COLLECTION,
  bucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET,
  secretKey: process.env.NEXT_APPWRITE_KEY,
};

// Debug: Log config values to verify they are loaded
console.log("Appwrite Config Loaded:", {
  endpointurl: appwriteConfig.endpointurl,
  projectId: appwriteConfig.projectId,
  databaseId: appwriteConfig.databaseId,
  usersCollectionId: appwriteConfig.usersCollectionId,
  filesCollectionId: appwriteConfig.filesCollectionId,
  bucketId: appwriteConfig.bucketId,
  secretKey: appwriteConfig.secretKey ? "[REDACTED]" : undefined,
});

if (!appwriteConfig.usersCollectionId) {
  console.error("Error: NEXT_PUBLIC_APPWRITE_USERS_COLLECTION is undefined in .env");
  throw new Error("Missing usersCollectionId in appwriteConfig");
}

export { appwriteConfig };