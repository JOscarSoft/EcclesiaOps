import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { BibleService } from './bible.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@ApiTags('Platform - Bible')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('platform/bible')
export class BibleController {
  constructor(private readonly bibleService: BibleService) {}

  @Get('bookList')
  @ApiOperation({ summary: 'Obtener listado de todos los libros de la biblia' })
  getBookList() {
    return this.bibleService.getBookList();
  }

  @Get(':bookKey/:chapter/:verse')
  @ApiOperation({ summary: 'Obtener un versículo específico' })
  @ApiParam({ name: 'bookKey', description: 'Clave del libro (ej: genesis, salmos)' })
  @ApiParam({ name: 'chapter', description: 'Número de capítulo' })
  @ApiParam({ name: 'verse', description: 'Número de versículo' })
  getVerse(
    @Param('bookKey') bookKey: string,
    @Param('chapter', ParseIntPipe) chapter: number,
    @Param('verse', ParseIntPipe) verse: number,
  ) {
    return this.bibleService.getVerse(bookKey, chapter, verse);
  }
}
