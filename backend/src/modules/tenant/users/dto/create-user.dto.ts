import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'jperez', description: 'Nombre de usuario' })
  username: string;

  @ApiProperty({ example: 'Juan', description: 'Nombre del usuario' })
  name: string;

  @ApiProperty({ example: 'jperez@iglesia.com', description: 'Correo electrónico', required: false })
  email?: string;

  @ApiProperty({ example: '123456', description: 'Contraseña' })
  password: string;

  @ApiProperty({ example: 'PASTOR', description: 'ID del rol asignado' })
  role: string;

  @ApiProperty({ example: '60d5f484f1a2c8b1f8e4e1a1', description: 'ID de la iglesia (opcional para roles conciliares)', required: false })
  church?: string;
}
