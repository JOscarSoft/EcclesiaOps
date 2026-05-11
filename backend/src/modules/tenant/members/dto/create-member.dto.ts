import { ApiProperty } from '@nestjs/swagger';

export class CreateMemberDto {
  @ApiProperty({ example: 'Juan', description: 'Nombre del miembro' })
  firstName: string;

  @ApiProperty({ example: 'Pérez', description: 'Apellido del miembro' })
  lastName: string;

  @ApiProperty({ example: '1990-01-15', description: 'Fecha de nacimiento', required: false })
  birthDate?: string;

  @ApiProperty({ example: 'MALE', enum: ['MALE', 'FEMALE'], description: 'Género', required: false })
  gender?: string;

  @ApiProperty({ example: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE', 'VISITOR'], description: 'Estado del miembro', required: false })
  status?: string;

  @ApiProperty({ example: false, description: 'Indica si está bautizado', required: false })
  baptized?: boolean;

  @ApiProperty({ example: '2010-06-20', description: 'Fecha de bautismo', required: false })
  baptismDate?: string;

  @ApiProperty({ example: '2023-01-01', description: 'Fecha de ingreso', required: false })
  joinDate?: string;

  @ApiProperty({ example: '+1 809-555-5678', description: 'Teléfono', required: false })
  phone?: string;

  @ApiProperty({ example: 'juan@email.com', description: 'Correo electrónico', required: false })
  email?: string;

  @ApiProperty({ example: 'Calle Secundaria 456', description: 'Dirección', required: false })
  address?: string;

  @ApiProperty({ example: '60d5f484f1a2c8b1f8e4e1a1', description: 'ID de la iglesia a la que pertenece', required: false })
  church?: string;

  @ApiProperty({ example: ['60d5f484f1a2c8b1f8e4e1a2'], description: 'IDs de los ministerios', required: false })
  ministries?: string[];

  @ApiProperty({ example: 'Grupo Familiar López', description: 'Grupo familiar', required: false })
  familyGroup?: string;

  @ApiProperty({ example: 'Notas adicionales', description: 'Notas', required: false })
  notes?: string;
}
