import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

export interface Note {
  id: string;
  userId: string;
  title: string;
  text: string;
  minutes: number;
  createdAt: number;
  notified: boolean;
}

@Injectable()
export class NotesService {
  // Almacenamiento en memoria (similar a users en AuthService)
  private notes: Note[] = [];

  // Obtiene solo las notas que pertenecen al usuario autenticado
  findAllByUser(userId: string): Note[] {
    return this.notes.filter((note) => note.userId === userId);
  }

  // Crea una nueva nota asociada al usuario
  create(userId: string, dto: CreateNoteDto): Note {
    const note: Note = {
      id: crypto.randomUUID(),
      userId,
      title: dto.title,
      text: dto.text,
      minutes: dto.minutes,
      createdAt: Date.now(),
      notified: false,
    };
    this.notes.push(note);
    return note;
  }

  // Actualiza una nota verificando que pertenezca al usuario
  update(userId: string, dto: UpdateNoteDto): Note {
    const note = this.notes.find(
      (n) => n.id === dto.id && n.userId === userId,
    );
    if (!note) {
      throw new NotFoundException('Nota no encontrada');
    }

    if (dto.title !== undefined) note.title = dto.title;
    if (dto.text !== undefined) note.text = dto.text;
    if (dto.minutes !== undefined) note.minutes = dto.minutes;
    if (dto.notified !== undefined) note.notified = dto.notified;

    return note;
  }

  // Elimina una nota verificando que pertenezca al usuario
  remove(userId: string, id: string): { ok: true } {
    const index = this.notes.findIndex(
      (n) => n.id === id && n.userId === userId,
    );
    if (index === -1) {
      throw new NotFoundException('Nota no encontrada');
    }

    this.notes.splice(index, 1);
    return { ok: true };
  }
}
