import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadPrescriptionUseCase } from '../../../application/use-cases/upload-prescription.use-case';

@Controller('prescriptions')
export class PrescriptionController {
  constructor(private readonly uploadPrescriptionUseCase: UploadPrescriptionUseCase) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required.');
    }

    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('File content is required.');
    }

    return this.uploadPrescriptionUseCase.execute(
      file.originalname,
      file.buffer,
      file.mimetype ?? '',
      file.size ?? file.buffer.length
    );
  }
}
