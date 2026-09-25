import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { STORAGE_PORT, type StoragePort } from '../../domain/ports/storage.port';

@Injectable()
export class UploadPrescriptionUseCase {
  private readonly logger = new Logger(UploadPrescriptionUseCase.name);
  private static readonly MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
  private static readonly EXTENSION_TO_CONTENT_TYPE: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
  };
  private static readonly ALLOWED_CONTENT_TYPES = new Set([
    'application/pdf',
    'application/x-pdf',
    'application/octet-stream',
    'image/png',
    'image/jpeg',
    'image/jpg',
  ]);
  private static readonly GENERIC_CONTENT_TYPES = new Set(['', 'application/octet-stream']);
  private static readonly ALLOWED_EXTENSIONS = new Set(['.pdf', '.png', '.jpg', '.jpeg']);

  constructor(@Inject(STORAGE_PORT) private readonly storage: StoragePort) {}

  private normalizeFileName(fileName: string): string {
    return fileName
      .normalize('NFKD')
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 120);
  }

  private hasAllowedExtension(fileName: string): boolean {
    const lower = fileName.toLowerCase();
    for (const ext of UploadPrescriptionUseCase.ALLOWED_EXTENSIONS) {
      if (lower.endsWith(ext)) return true;
    }
    return false;
  }

  private normalizeContentType(contentType: string): string {
    return (contentType ?? '').toLowerCase().split(';')[0]?.trim() ?? '';
  }

  private getFileExtension(fileName: string): string {
    const lower = fileName.toLowerCase().trim();
    for (const ext of UploadPrescriptionUseCase.ALLOWED_EXTENSIONS) {
      if (lower.endsWith(ext)) return ext;
    }
    return '';
  }

  private resolveUploadContentType(fileName: string, normalizedContentType: string): string {
    const extension = this.getFileExtension(fileName);
    const byExtension = UploadPrescriptionUseCase.EXTENSION_TO_CONTENT_TYPE[extension];

    if (normalizedContentType && !UploadPrescriptionUseCase.GENERIC_CONTENT_TYPES.has(normalizedContentType)) {
      return normalizedContentType;
    }

    return byExtension ?? 'application/octet-stream';
  }

  async execute(fileName: string, fileBuffer: Buffer, contentType: string, fileSize: number) {
    if (!fileBuffer || !fileBuffer.length) {
      throw new BadRequestException('Arquivo vazio nao e permitido.');
    }

    const effectiveFileSize = Number.isFinite(fileSize) && fileSize > 0 ? fileSize : fileBuffer.length;

    if (effectiveFileSize > UploadPrescriptionUseCase.MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException('Arquivo excede o limite de 10MB.');
    }

    const normalizedContentType = this.normalizeContentType(contentType);
    const isAllowedMime = UploadPrescriptionUseCase.ALLOWED_CONTENT_TYPES.has(normalizedContentType);
    const isAllowedExtension = this.hasAllowedExtension(fileName);

    if (!isAllowedExtension) {
      throw new BadRequestException('Extensao invalida. Use .pdf, .jpg, .jpeg ou .png.');
    }

    // Some browsers/proxies may send generic MIME values for valid files.
    const isGenericMime = UploadPrescriptionUseCase.GENERIC_CONTENT_TYPES.has(normalizedContentType);
    if (!isAllowedMime && !isGenericMime) {
      throw new BadRequestException('Tipo de arquivo invalido. Use PDF, JPG ou PNG.');
    }
    
    const safeName = this.normalizeFileName(fileName);
    if (!safeName) {
      throw new BadRequestException('Nome do arquivo invalido.');
    }

    try {
      const uploadContentType = this.resolveUploadContentType(safeName, normalizedContentType);
      const prescriptionUrl = await this.storage.uploadPrescription(
        safeName,
        fileBuffer,
        uploadContentType
      );
      return { prescriptionUrl };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown upload error';
      this.logger.error(`Upload failed for ${safeName}: ${message}`);
      throw new InternalServerErrorException(
        'Falha ao enviar arquivo para armazenamento. Verifique LocalStack/S3 e tente novamente.'
      );
    }
  }
}
