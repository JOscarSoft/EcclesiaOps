import { ApiProperty } from '@nestjs/swagger';

export class CreateActivityDto {
  @ApiProperty({ example: 'Culto de Domingo', description: 'Título de la actividad' })
  title: string;

  @ApiProperty({ example: '2025-06-15T10:00:00Z', description: 'Fecha y hora de inicio' })
  startDate: string;

  @ApiProperty({ example: '2025-06-15T12:00:00Z', description: 'Fecha y hora de fin', required: false })
  endDate?: string;

  @ApiProperty({ example: '60d5f484f1a2c8b1f8e4e1a3', description: 'ID del tipo de actividad', required: false })
  activityType?: string;

  @ApiProperty({ example: '60d5f484f1a2c8b1f8e4e1a1', description: 'ID de la iglesia (null = conciliar)', required: false })
  church?: string;

  @ApiProperty({ example: 'Predicación sobre la fe', description: 'Descripción', required: false })
  description?: string;
}
