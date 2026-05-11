import { ApiProperty } from '@nestjs/swagger';

export class CreateFinanceTransactionDto {
  @ApiProperty({ example: 1500.00, description: 'Monto de la transacción' })
  amount: number;

  @ApiProperty({ example: '2025-06-01', description: 'Fecha de la transacción' })
  date: string;

  @ApiProperty({ example: '60d5f484f1a2c8b1f8e4e1a3', description: 'ID de la categoría' })
  category: string;

  @ApiProperty({ example: 'Income', enum: ['Income', 'Expense'], description: 'Tipo (Income/Expense)' })
  kind: string;

  @ApiProperty({ example: 'Diezmo de Juan Pérez', description: 'Descripción', required: false })
  description?: string;

  @ApiProperty({ example: '60d5f484f1a2c8b1f8e4e1a4', description: 'ID del miembro (solo Income)', required: false })
  member?: string;

  @ApiProperty({ example: 'CASH', enum: ['CASH', 'TRANSFER', 'CHECK'], description: 'Método de pago (solo Income)', required: false })
  method?: string;

  @ApiProperty({ example: 'Proveedor XYZ', description: 'Destinatario (solo Expense)', required: false })
  recipient?: string;

  @ApiProperty({ example: 'REF-001', description: 'Número de referencia (solo Expense)', required: false })
  referenceNumber?: string;
}
