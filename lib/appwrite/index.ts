// "use server";

// import { Account, Avatars, Client, Databases, Storage } from "node-appwrite"
// import { appwriteConfig } from "./config"
// import { cookies } from "next/headers"

// export const createSessionClient = async () => {
//     const client  = new Client().setEndpoint(appwriteConfig.endpointurl).setProject(appwriteConfig.projectId)

//     const session = (await cookies()).get('appwrite-session')
//     if(!session || !session.value) throw new  Error('No Session')
//     client.setSession(session.value)

//     return {
//         get account() {
//             return new Account(client);
//         },
//         get databases() {
//             return new Databases(client);
//         }
//     }
// }

// export const createAdminClient = async () => {
//     const client  = new Client().setEndpoint(appwriteConfig.endpointurl).setProject(appwriteConfig.projectId).setKey(appwriteConfig.secretKey)

//     return {
//         get account() {
//             return new Account(client);
//         },
//         get databases() {
//             return new Databases(client);
//         },
//         get storage() {
//             return new Storage(client);
//         },
//         get avatars() {
//             return new Avatars(client);
//         }
//     }
// }


"use server";

import { Account, Avatars, Client, Databases, Storage } from "node-appwrite";
import { appwriteConfig } from "./config";
import { cookies } from "next/headers";

export const createSessionClient = async () => {
  try {
    if (!appwriteConfig.endpointurl || !appwriteConfig.projectId) {
      throw new Error("Missing endpointurl or projectId in appwriteConfig");
    }

    const client = new Client()
      .setEndpoint(appwriteConfig.endpointurl)
      .setProject(appwriteConfig.projectId);

    const session = (await cookies()).get("appwrite-session");
    if (!session || !session.value) {
      console.error("No session found in cookies");
      throw new Error("No Session");
    }
    client.setSession(session.value);

    return {
      get account() {
        return new Account(client);
      },
      get databases() {
        return new Databases(client);
      },
    };
  } catch (error) {
    console.error("Failed to create session client:", error);
    throw error;
  }
};

export const createAdminClient = async () => {
  try {
    if (!appwriteConfig.endpointurl || !appwriteConfig.projectId || !appwriteConfig.secretKey) {
      throw new Error("Missing endpointurl, projectId, or secretKey in appwriteConfig");
    }

    const client = new Client()
      .setEndpoint(appwriteConfig.endpointurl)
      .setProject(appwriteConfig.projectId)
      .setKey(appwriteConfig.secretKey);

    return {
      get account() {
        return new Account(client);
      },
      get databases() {
        return new Databases(client);
      },
      get storage() {
        return new Storage(client);
      },
      get avatars() {
        return new Avatars(client);
      },
    };
  } catch (error) {
    console.error("Failed to create admin client:", error);
    throw error;
  }
};