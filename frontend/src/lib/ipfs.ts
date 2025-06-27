import { createHelia } from "helia";
import { unixfs } from "@helia/unixfs";
import { dagJson } from "@helia/dag-json";

let helia: any = null;
let fs: any = null;
let dag: any = null;

// Initialize Helia IPFS instance
export const initializeIPFS = async () => {
  if (helia) return { helia, fs, dag };

  try {
    helia = await createHelia();

    fs = unixfs(helia);
    dag = dagJson(helia);

    return { helia, fs, dag };
  } catch (error) {
    console.error("Failed to initialize IPFS:", error);
    throw error;
  }
};

// Upload file to IPFS
export const uploadFileToIPFS = async (file: File): Promise<string> => {
  try {
    const { fs } = await initializeIPFS();

    // Convert file to Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Add file to IPFS
    const cid = await fs.addFile({
      path: file.name,
      content: uint8Array,
    });

    return cid.toString();
  } catch (error) {
    console.error("Failed to upload file to IPFS:", error);
    throw error;
  }
};

// Upload metadata to IPFS
export const uploadMetadataToIPFS = async (metadata: any): Promise<string> => {
  try {
    const { dag } = await initializeIPFS();

    // Add metadata as DAG-JSON
    const cid = await dag.add(metadata);

    return cid.toString();
  } catch (error) {
    console.error("Failed to upload metadata to IPFS:", error);
    throw error;
  }
};

// Get file from IPFS
export const getFileFromIPFS = async (cid: string): Promise<Uint8Array> => {
  try {
    const { fs } = await initializeIPFS();

    const chunks = [];
    for await (const chunk of fs.cat(cid)) {
      chunks.push(chunk);
    }

    // Combine chunks
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return result;
  } catch (error) {
    console.error("Failed to get file from IPFS:", error);
    throw error;
  }
};

// Get metadata from IPFS
export const getMetadataFromIPFS = async (cid: string): Promise<any> => {
  try {
    const { dag } = await initializeIPFS();

    const metadata = await dag.get(cid);
    return metadata;
  } catch (error) {
    console.error("Failed to get metadata from IPFS:", error);
    throw error;
  }
};

// Stop IPFS instance
export const stopIPFS = async () => {
  if (helia) {
    await helia.stop();
    helia = null;
    fs = null;
    dag = null;
  }
};
