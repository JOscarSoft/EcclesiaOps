import { ApiProperty } from '@nestjs/swagger';

export class RecordAttendanceDto {
  @ApiProperty({ example: '2025-06-15', description: 'Fecha de la asistencia' })
  date: string;

  @ApiProperty({ example: 'SUNDAY', enum: ['SUNDAY', 'MIDWEEK', 'SPECIAL'], description: 'Tipo de evento' })
  eventType: string;

  @ApiProperty({ example: true, description: 'Indica si estuvo presente' })
  present: boolean;
}
