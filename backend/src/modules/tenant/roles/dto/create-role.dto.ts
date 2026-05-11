import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ example: 'Líder de Ministerio', description: 'Nombre del rol' })
  name: string;

  @ApiProperty({ example: ['VIEW_MEMBERS', 'MANAGE_ACTIVITIES'], description: 'Lista de permisos del rol' })
  permissions: string[];
}
