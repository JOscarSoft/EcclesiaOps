import { ApiProperty } from '@nestjs/swagger';

export class UpdateChurchDto {
  @ApiProperty({ example: 'Iglesia Central', description: 'Nombre de la iglesia', required: false })
  name?: string;

  @ApiProperty({ example: 'Av. Principal 123', description: 'Dirección', required: false })
  address?: string;

  @ApiProperty({ example: '+1 809-555-1234', description: 'Teléfono', required: false })
  phone?: string;

  @ApiProperty({ example: 'iglesia@email.com', description: 'Correo electrónico', required: false })
  email?: string;

  @ApiProperty({ example: '60d5f484f1a2c8b1f8e4e1a1', description: 'ID del miembro asignado como pastor', required: false })
  pastor?: string;
}
