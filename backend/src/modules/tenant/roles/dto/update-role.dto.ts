import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleDto {
  @ApiProperty({ example: 'Líder de Ministerio', description: 'Nombre del rol', required: false })
  name?: string;

  @ApiProperty({ example: ['VIEW_MEMBERS', 'MANAGE_ACTIVITIES'], description: 'Lista de permisos del rol', required: false })
  permissions?: string[];
}
