import { Prisma } from '@prisma/client';
import { prisma } from './prisma';
import type {
  CreatePaymentInput,
  PaymentRecord,
  PaymentRepositoryPort,
  UpdatePaymentInput,
} from '../../domain/ports/payment-repository.port';

function mapPayment(record: Prisma.PaymentGetPayload<object>): PaymentRecord {
  return {
    id: record.id,
    orderId: record.orderId,
    amount: Number(record.amount),
    status: record.status,
    providerRef: record.providerRef,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export class PaymentRepository implements PaymentRepositoryPort {
  async create(input: CreatePaymentInput): Promise<PaymentRecord> {
    const created = await prisma.payment.create({
      data: {
        orderId: input.orderId,
        amount: new Prisma.Decimal(input.amount),
        status: input.status,
        providerRef: input.providerRef,
      },
    });

    return mapPayment(created);
  }

  async findAll(): Promise<PaymentRecord[]> {
    const records = await prisma.payment.findMany({ orderBy: { createdAt: 'desc' } });
    return records.map(mapPayment);
  }

  async findById(id: string): Promise<PaymentRecord | null> {
    const record = await prisma.payment.findUnique({ where: { id } });
    return record ? mapPayment(record) : null;
  }

  async update(id: string, input: UpdatePaymentInput): Promise<PaymentRecord | null> {
    try {
      const updated = await prisma.payment.update({
        where: { id },
        data: {
          amount: input.amount !== undefined ? new Prisma.Decimal(input.amount) : undefined,
          status: input.status,
          providerRef: input.providerRef,
        },
      });
      return mapPayment(updated);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.payment.delete({ where: { id } });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }
}
