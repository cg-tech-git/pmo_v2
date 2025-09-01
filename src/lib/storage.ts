import { Storage } from '@google-cloud/storage';
import path from 'path';

let storageClient: Storage | null = null;

export function getStorageClient(): Storage {
  if (!storageClient) {
    const credentialsPath = path.join(process.cwd(), 'credentials', 'pmo-service-account-key.json');
    
    storageClient = new Storage({
      projectId: process.env.NEXT_PUBLIC_GCP_PROJECT_ID || 'pmo-v2',
      keyFilename: credentialsPath,
    });
  }
  
  return storageClient;
}

export async function uploadReportToStorage(
  fileName: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<string> {
  const storage = getStorageClient();
  const bucketName = process.env.GCS_BUCKET_NAME || 'pmo-v2-reports';
  
  try {
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(`reports/${fileName}`);
    
    await file.save(fileBuffer, {
      metadata: {
        contentType,
      },
    });
    
    // Generate a signed URL that expires in 7 days
    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    return signedUrl;
  } catch (error) {
    console.error('Error uploading to Cloud Storage:', error);
    throw error;
  }
}

export async function getSignedDownloadUrl(fileName: string): Promise<string> {
  const storage = getStorageClient();
  const bucketName = process.env.GCS_BUCKET_NAME || 'pmo-v2-reports';
  
  try {
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(`reports/${fileName}`);
    
    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      throw new Error('File not found');
    }
    
    // Generate a signed URL that expires in 1 hour
    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000, // 1 hour
    });
    
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
}

export async function deleteReportFromStorage(fileName: string): Promise<void> {
  const storage = getStorageClient();
  const bucketName = process.env.GCS_BUCKET_NAME || 'pmo-v2-reports';
  
  try {
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(`reports/${fileName}`);
    
    await file.delete();
  } catch (error) {
    console.error('Error deleting from Cloud Storage:', error);
    throw error;
  }
}
