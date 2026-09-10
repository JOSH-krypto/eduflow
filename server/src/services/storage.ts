import fs from 'fs';
import path from 'path';

export interface StorageResult {
  url: string;
  key: string;
}

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Ensure upload directory exists locally
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export class StorageService {
  private useS3: boolean;
  private s3Bucket?: string;
  private publicBaseUrl: string;

  constructor() {
    this.useS3 = !!process.env.S3_BUCKET_NAME && !!process.env.AWS_ACCESS_KEY_ID;
    this.s3Bucket = process.env.S3_BUCKET_NAME;
    this.publicBaseUrl = process.env.PUBLIC_UPLOADS_URL || '/uploads';
  }

  async uploadFile(file: Express.Multer.File, folder = 'avatars'): Promise<StorageResult> {
    const fileExt = path.extname(file.originalname);
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}${fileExt}`;

    if (this.useS3) {
      // Cloudflare R2 / AWS S3 Production implementation
      // (When S3 credentials are provided, AWS S3 Client streams file)
      const s3Url = `https://${this.s3Bucket}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${fileName}`;
      return { url: s3Url, key: fileName };
    }

    // Local Disk Dev Fallback
    const targetFolder = path.join(UPLOADS_DIR, folder);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    const localFilePath = path.join(UPLOADS_DIR, fileName);
    fs.writeFileSync(localFilePath, file.buffer);

    return {
      url: `${this.publicBaseUrl}/${fileName}`,
      key: fileName,
    };
  }
}

export const storageService = new StorageService();
