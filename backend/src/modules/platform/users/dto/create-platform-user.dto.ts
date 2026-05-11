import { ApiProperty } from '@nestjs/swagger';

export class CreatePlatformUserDto {
  @ApiProperty({ example: 'admin', description: 'Nombre de usuario' })
  username: string;

  @ApiProperty({ example: 'admin@ecclesiaops.com', description: 'Correo electrónico', required: false })
  email?: string;

  @ApiProperty({ example: 'Admin Principal', description: 'Nombre completo' })
  name: string;

  @ApiProperty({ example: '123456', description: 'Contraseña' })
  password: string;
}
