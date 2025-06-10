// "use server";

// import { createAdminClient, createSessionClient } from "@/lib/appwrite";
// import { appwriteConfig } from "@/lib/appwrite/config";
// import { Query, ID } from "node-appwrite";
// import { parseStringify } from "@/lib/utils";
// import { cookies } from "next/headers";
// import { avatarPlaceholderUrl } from "@/constants";
// import { redirect } from "next/navigation";

// const getUserByEmail = async (email: string) => {
//   const { databases } = await createAdminClient();

//   const result = await databases.listDocuments(
//     appwriteConfig.databaseId,
//     appwriteConfig.usersCollecionId,
//     [Query.equal("email", [email])],
//   );

//   return result.total > 0 ? result.documents[0] : null;
// };

// const handleError = (error: unknown, message: string) => {
//   console.log(error, message);
//   throw error;
// };

// export const sendEmailOTP = async ({ email }: { email: string }) => {
//   const { account } = await createAdminClient();

//   try {
//     const session = await account.createEmailToken(ID.unique(), email);

//     return session.userId;
//   } catch (error) {
//     handleError(error, "Failed to send email OTP");
//   }
// };

// export const createAccount = async ({
//   fullName,
//   email,
// }: {
//   fullName: string;
//   email: string;
// }) => {
//   const existingUser = await getUserByEmail(email);

//   const accountId = await sendEmailOTP({ email });
//   if (!accountId) throw new Error("Failed to send an OTP");

//   if (!existingUser) {
//     const { databases } = await createAdminClient();

//     await databases.createDocument(
//       appwriteConfig.databaseId,
//       appwriteConfig.usersCollecionId,
//       ID.unique(),
//       {
//         fullName,
//         email,
//         avatar: avatarPlaceholderUrl,
//         accountId,
//       },
//     );
//   }

//   return parseStringify({ accountId });
// };

// export const verifySecret = async ({
//   accountId,
//   password,
// }: {
//   accountId: string;
//   password: string;
// }) => {
//   try {
//     const { account } = await createAdminClient();

//     const session = await account.createSession(accountId, password);

//     (await cookies()).set("appwrite-session", session.secret, {
//       path: "/",
//       httpOnly: true,
//       sameSite: "strict",
//       secure: true,
//     });

//     return parseStringify({ sessionId: session.$id });
//   } catch (error) {
//     handleError(error, "Failed to verify OTP");
//   }
// };

// export const getCurrentUser = async () => {
//   try {
//     const { databases, account } = await createSessionClient();

//     const result = await account.get();

//     const user = await databases.listDocuments(
//       appwriteConfig.databaseId,
//       appwriteConfig.usersCollecionId,
//       [Query.equal("accountId", result.$id)],
//     );

//     if (user.total <= 0) return null;

//     return parseStringify(user.documents[0]);
//   } catch (error) {
//     console.log(error);
//   }
// };

// export const signOutUser = async () => {
//   const { account } = await createSessionClient();

//   try {
//     await account.deleteSession("current");
//     (await cookies()).delete("appwrite-session");
//   } catch (error) {
//     handleError(error, "Failed to sign out user");
//   } finally {
//     redirect("/sign-in");
//   }
// };

// export const signInUser = async ({ email }: { email: string }) => {
//   try {
//     const existingUser = await getUserByEmail(email);

//     // User exists, send OTP
//     if (existingUser) {
//       await sendEmailOTP({ email });
//       return parseStringify({ accountId: existingUser.accountId });
//     }

//     return parseStringify({ accountId: null, error: "User not found" });
//   } catch (error) {
//     handleError(error, "Failed to sign in user");
//   }
// };

"use server";

import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { Query, ID } from "node-appwrite";
import { parseStringify } from "@/lib/utils";
import { cookies } from "next/headers";
import { avatarPlaceholderUrl } from "@/constants";
import { redirect } from "next/navigation";

const handleError = (error, message) => {
  console.error(`${message}:`, error);
  throw error;
};

export const getUserByEmail = async (email: string) => {
  try {
    const { databases } = await createAdminClient();

    if (!appwriteConfig.usersCollectionId) {
      throw new Error("usersCollectionId is undefined in appwriteConfig");
    }

    console.log(`Querying user with email: ${email}`);
    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId, // Fixed typo
      [Query.equal("email", [email])],
    );

    console.log(`Found ${result.total} user(s) for email: ${email}`);
    return result.total > 0 ? result.documents[0] : null;
  } catch (error) {
    handleError(error, "Failed to get user by email");
  }
};

export const sendEmailOTP = async ({ email }: { email: string }) => {
  try {
    const { account } = await createAdminClient();
    const session = await account.createEmailToken(ID.unique(), email);
    console.log(`Sent OTP for email: ${email}, userId: ${session.userId}`);
    return session.userId;
  } catch (error) {
    handleError(error, "Failed to send email OTP");
  }
};

export const createAccount = async ({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}) => {
  try {
    if (!appwriteConfig.usersCollectionId) {
      throw new Error("usersCollectionId is undefined in appwriteConfig");
    }

    const existingUser = await getUserByEmail(email);
    const accountId = await sendEmailOTP({ email });
    if (!accountId) throw new Error("Failed to send OTP");

    if (!existingUser) {
      const { databases } = await createAdminClient();
      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId, // Fixed typo
        ID.unique(),
        {
          fullName,
          email,
          avatar: avatarPlaceholderUrl,
          accountId,
        },
      );
      console.log(`Created user document for email: ${email}`);
    } else {
      console.log(`User already exists for email: ${email}`);
    }

    return parseStringify({ accountId });
  } catch (error) {
    handleError(error, "Failed to create account");
  }
};

export const verifySecret = async ({
  accountId,
  password,
}: {
  accountId: string;
  password: string;
}) => {
  try {
    const { account } = await createAdminClient();
    const session = await account.createSession(accountId, password);

    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    console.log(`Session created for accountId: ${accountId}`);
    return parseStringify({ sessionId: session.$id });
  } catch (error) {
    handleError(error, "Failed to verify OTP");
  }
};

export const getCurrentUser = async () => {
  try {
    const { databases, account } = await createSessionClient();

    if (!appwriteConfig.usersCollectionId) {
      throw new Error("usersCollectionId is undefined in appwriteConfig");
    }

    const result = await account.get();
    const user = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId, // Fixed typo
      [Query.equal("accountId", [result.$id])],
    );

    if (user.total <= 0) {
      console.log("No user document found for accountId:", result.$id);
      return null;
    }

    console.log("Current user fetched:", user.documents[0].email);
    return parseStringify(user.documents[0]);
  } catch (error) {
    console.error("Failed to get current user:", error);
    return null;
  }
};

export const signOutUser = async () => {
  try {
    const { account } = await createSessionClient();
    await account.deleteSession("current");
    (await cookies()).delete("appwrite-session");
    console.log("User signed out successfully");
  } catch (error) {
    handleError(error, "Failed to sign out user");
  } finally {
    redirect("/sign-in");
  }
};

export const signInUser = async ({ email }: { email: string }) => {
  try {
    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      const accountId = await sendEmailOTP({ email });
      console.log(`Sign-in initiated for email: ${email}, accountId: ${accountId}`);
      return parseStringify({ accountId: existingUser.accountId });
    }

    console.log(`No user found for email: ${email}`);
    return parseStringify({ accountId: null, error: "User not found" });
  } catch (error) {
    handleError(error, "Failed to sign in user");
  }
};