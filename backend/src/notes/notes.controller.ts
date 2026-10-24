import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { CurrentUserPayload } from '../auth/current-user.decorator';

@ApiTags('notes')
@ApiCookieAuth('session')
@Controller('notes')
@UseGuards(AuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) { }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva nota' })
  @ApiResponse({ status: 201, description: 'Nota creada con éxito' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateNoteDto,
  ) {
    const note = this.notesService.create(user.sub, dto);
    return { note };
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las notas del usuario actual' })
  @ApiResponse({ status: 200, description: 'Listado de notas del usuario' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findAll(@CurrentUser() user: CurrentUserPayload) {
    const notes = this.notesService.findAllByUser(user.sub);
    return { notes };
  }

  @Patch()
  @ApiOperation({ summary: 'Actualizar una nota existente o marcarla como notificada' })
  @ApiResponse({ status: 200, description: 'Nota actualizada con éxito' })
  @ApiResponse({ status: 404, description: 'Nota no encontrada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  update(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateNoteDto,
  ) {
    const note = this.notesService.update(user.sub, dto);
    return { note };
  }

  @Delete()
  @ApiOperation({ summary: 'Eliminar una nota por ID' })
  @ApiQuery({ name: 'id', description: 'ID de la nota a eliminar', example: 'd8e4f1a2-...' })
  @ApiResponse({ status: 200, description: 'Nota eliminada con éxito' })
  @ApiResponse({ status: 400, description: 'Falta el parámetro id' })
  @ApiResponse({ status: 404, description: 'Nota no encontrada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  remove(
    @CurrentUser() user: CurrentUserPayload,
    @Query('id') id: string,
  ) {
    if (!id) {
      throw new BadRequestException('Falta el parametro id');
    }
    return this.notesService.remove(user.sub, id);
  }
}
