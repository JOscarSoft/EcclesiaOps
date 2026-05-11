import { ApiProperty } from '@nestjs/swagger';

export class CreateChurchDto {
  @ApiProperty({ example: 'Iglesia Central', description: 'Nombre de la iglesia' })
  name: string;

  @ApiProperty({ example: 'Av. Principal 123', description: 'Dirección', required: false })
  address?: string;

  @ApiProperty({ example: '+1 809-555-1234', description: 'Teléfono', required: false })
  phone?: string;

  @ApiProperty({ example: 'iglesia@email.com', description: 'Correo electrónico', required: false })
  email?: string;
}
