import { create } from "@web3-storage/w3up-client";
import { PinataSDK } from "pinata";

const FIXED_EMAIL = "thryec@gmail.com";
const FIXED_SPACE_NAME = "aurient";

let client: Awaited<ReturnType<typeof create>> | null = null;

async function getClient() {
  if (client) return client;
  client = await create();
  console.log("attempting login");
  // Always login (no agent persistence)
  const account = await client.login(FIXED_EMAIL);
  console.log("account", account);
  await account.plan.wait();
  console.log("plan", account.plan);
  console.log("logged in");

  // Create or get the space (avoid type error by always using DID string)
  let spaceDid: string | undefined;
  const spaceObj = client.spaces().find((s) => s.name === FIXED_SPACE_NAME);
  if (spaceObj) {
    spaceDid = spaceObj.did();
  } else {
    const ownedSpace = await client.createSpace(FIXED_SPACE_NAME, { account });
    spaceDid = ownedSpace.did();
  }
  console.log("space did", spaceDid);
  if (!spaceDid) throw new Error("Failed to create or find the space");
  await client.setCurrentSpace(spaceDid as any);

  return client;
}

export async function uploadToW3Up(file: File): Promise<string> {
  console.log("uploading to w3up");
  const client = await getClient();
  const cid = await client.uploadFile(file);
  return cid.toString();
}

export async function uploadToPinata(file: File): Promise<string> {
  const urlRequest = await fetch("/api/pinata-signed-url"); // Fetches the temporary upload URL
  const urlResponse = await urlRequest.json();
  console.log("urlResponse", urlResponse);
  try {
    console.log("uploading to pinata");
    // 1. Get a signed upload URL from the API route
    const urlReq = await fetch(
      `/api/pinata-signed-url?name=${encodeURIComponent(file.name)}`
    );
    const { url } = await urlReq.json();
    if (!url) throw new Error("Failed to get signed Pinata upload URL");

    // 2. Upload the file using the Pinata SDK and the signed URL
    const pinata = new PinataSDK(); // No JWT needed for signed URL
    console.log("pinata", pinata);
    const upload = await pinata.upload.public.file(file).url(url);
    console.log("upload", upload);
    if (!upload?.cid) throw new Error("Pinata upload failed");
    return upload.cid;
  } catch (error) {
    console.error("Pinata upload error:", error);
    throw new Error(
      `Pinata upload failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
