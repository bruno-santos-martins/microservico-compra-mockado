import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { StoragePort } from '../../domain/ports/storage.port';

@Injectable()
export class LocalstackS3Adapter implements StoragePort, OnModuleInit {
  private readonly logger = new Logger(LocalstackS3Adapter.name);
  private readonly bucketName = process.env.S3_BUCKET_PRESCRIPTIONS ?? 'click-prescriptions';
  private readonly endpoint = process.env.AWS_ENDPOINT ?? 'http://localhost:4566';

  private readonly s3 = new S3Client({
    endpoint: this.endpoint,
    region: process.env.AWS_REGION ?? 'us-east-1',
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? 'test',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? 'test',
    },
  });

  private async ensureBucket(): Promise<void> {
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: this.bucketName }));
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown head bucket error';
      this.logger.warn(
        `Bucket ${this.bucketName} not reachable on ${this.endpoint}. Trying to create. Cause: ${message}`
      );
      await this.s3.send(new CreateBucketCommand({ Bucket: this.bucketName }));
      this.logger.log(`Bucket ${this.bucketName} created.`);
    }
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.ensureBucket();
    } catch {
      this.logger.warn(
        `Could not verify or create bucket ${this.bucketName} during startup. Upload will retry on demand.`
      );
    }
  }

  async uploadPrescription(fileName: string, fileBuffer: Buffer, contentType: string): Promise<string> {
    const key = `prescriptions/${Date.now()}-${fileName}`;

    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: fileBuffer,
          ContentType: contentType,
        })
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown put object error';
      this.logger.warn(`Initial upload failed for ${key}. Retrying after ensureBucket. Cause: ${message}`);
      await this.ensureBucket();
      try {
        await this.s3.send(
          new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: fileBuffer,
            ContentType: contentType,
          })
        );
      } catch (retryError) {
        const retryMessage = retryError instanceof Error ? retryError.message : 'unknown retry upload error';
        this.logger.error(
          `Upload failed after retry for bucket ${this.bucketName} on ${this.endpoint}. Cause: ${retryMessage}`
        );
        throw retryError;
      }
    }

    const endpoint = process.env.AWS_PUBLIC_ENDPOINT ?? process.env.AWS_ENDPOINT ?? 'http://localhost:4566';
    return `${endpoint.replace(/\/$/, '')}/${this.bucketName}/${key}`;
  }
}
