import { ApiProperty } from '@nestjs/swagger';

export class CreateActivityTypeDto {
  @ApiProperty({ example: 'Culto General', description: 'Nombre del tipo de actividad' })
  name: string;

  @ApiProperty({ example: '#1976d2', description: 'Color del tipo de actividad', required: false })
  color?: string;

  @ApiProperty({ example: 'schedule', description: 'Icono del tipo de actividad', required: false })
  icon?: string;
}
