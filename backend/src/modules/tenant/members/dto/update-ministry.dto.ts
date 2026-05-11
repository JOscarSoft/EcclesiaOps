import { ApiProperty } from '@nestjs/swagger';

export class UpdateMinistryDto {
  @ApiProperty({ example: 'Alabanza', description: 'Nombre del ministerio', required: false })
  name?: string;

  @ApiProperty({ example: 'Ministerio de alabanza y adoración', description: 'Descripción', required: false })
  description?: string;

  @ApiProperty({ example: '60d5f484f1a2c8b1f8e4e1a1', description: 'ID del líder del ministerio', required: false })
  leader?: string;
}
