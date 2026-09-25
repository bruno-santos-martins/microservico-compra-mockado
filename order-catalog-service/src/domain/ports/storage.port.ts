export const STORAGE_PORT = Symbol('STORAGE_PORT');

export interface StoragePort {
  uploadPrescription(fileName: string, fileBuffer: Buffer, contentType: string): Promise<string>;
}
