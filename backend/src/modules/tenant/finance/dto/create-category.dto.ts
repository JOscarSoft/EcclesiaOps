import { ApiProperty } from '@nestjs/swagger';

export class CreateFinanceCategoryDto {
  @ApiProperty({ example: 'Diezmos', description: 'Nombre de la categoría' })
  name: string;

  @ApiProperty({ example: 'INCOME', enum: ['INCOME', 'EXPENSE'], description: 'Tipo de categoría' })
  type: string;
}
