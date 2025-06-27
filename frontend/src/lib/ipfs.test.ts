// Simple test for IPFS functionality
import { uploadFileToIPFS, uploadMetadataToIPFS } from "./ipfs";

// Mock File object for testing
const createMockFile = (name: string, content: string, type: string): File => {
  const blob = new Blob([content], { type });
  return new File([blob], name, { type });
};

// Test IPFS upload functionality
export const testIPFSFunctionality = async () => {
  try {
    console.log("Testing IPFS functionality...");

    // Test file upload
    const testFile = createMockFile(
      "test.json",
      '{"test": "data"}',
      "application/json"
    );
    const fileHash = await uploadFileToIPFS(testFile);
    console.log("File uploaded to IPFS:", fileHash);

    // Test metadata upload
    const testMetadata = {
      name: "Test Health Data",
      description: "Test health data for IPFS",
      type: "json",
      timestamp: Date.now(),
    };
    const metadataHash = await uploadMetadataToIPFS(testMetadata);
    console.log("Metadata uploaded to IPFS:", metadataHash);

    return { fileHash, metadataHash };
  } catch (error) {
    console.error("IPFS test failed:", error);
    throw error;
  }
};
