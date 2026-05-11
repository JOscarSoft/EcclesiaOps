import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: 'oldPassword123', description: 'Contraseña actual' })
  currentPassword: string;

  @ApiProperty({ example: 'newPassword456', description: 'Nueva contraseña' })
  newPassword: string;
}
