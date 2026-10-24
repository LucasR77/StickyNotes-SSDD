import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NotesService } from './notes.service';

describe('NotesService', () => {
  let service: NotesService;

  beforeEach(async () => {
    // Creamos un módulo de prueba aislado para cada test
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotesService],
    }).compile();

    service = module.get<NotesService>(NotesService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debe crear una nueva nota con valores por defecto', () => {
      const dto = { title: 'Comprar leche', text: 'Descremada', minutes: 10 };
      const note = service.create('user-1', dto);

      expect(note).toBeDefined();
      expect(note.id).toBeDefined();
      expect(note.userId).toBe('user-1');
      expect(note.title).toBe('Comprar leche');
      expect(note.text).toBe('Descremada');
      expect(note.minutes).toBe(10);
      expect(note.notified).toBe(false);
      expect(typeof note.createdAt).toBe('number');
    });
  });

  describe('findAllByUser', () => {
    it('debe devolver solo las notas que pertenecen al usuario', () => {
      service.create('user-1', { title: 'Nota 1 de user 1', text: '', minutes: 5 });
      service.create('user-1', { title: 'Nota 2 de user 1', text: '', minutes: 5 });
      service.create('user-2', { title: 'Nota de user 2', text: '', minutes: 5 });

      const notesUser1 = service.findAllByUser('user-1');
      const notesUser2 = service.findAllByUser('user-2');

      expect(notesUser1).toHaveLength(2);
      expect(notesUser2).toHaveLength(1);
      expect(notesUser2[0].title).toBe('Nota de user 2');
    });
  });

  describe('update', () => {
    it('debe actualizar los campos de una nota existente', () => {
      const created = service.create('user-1', { title: 'Viejo', text: 'Viejo', minutes: 5 });
      const updated = service.update('user-1', {
        id: created.id,
        title: 'Nuevo título',
        notified: true,
      });

      expect(updated.title).toBe('Nuevo título');
      expect(updated.notified).toBe(true);
      expect(updated.text).toBe('Viejo'); // Mantiene los campos no modificados
    });

    it('debe lanzar NotFoundException si la nota no existe', () => {
      expect(() => {
        service.update('user-1', { id: 'inexistente', title: 'Nuevo' });
      }).toThrow(NotFoundException);
    });

    it('debe lanzar NotFoundException si la nota pertenece a otro usuario', () => {
      const created = service.create('user-1', { title: 'Nota de user 1', text: '', minutes: 5 });

      expect(() => {
        service.update('user-2', { id: created.id, title: 'Intento de hack' });
      }).toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('debe eliminar la nota correctamente', () => {
      const created = service.create('user-1', { title: 'Borrarme', text: '', minutes: 5 });
      const result = service.remove('user-1', created.id);

      expect(result).toEqual({ ok: true });
      expect(service.findAllByUser('user-1')).toHaveLength(0);
    });

    it('debe lanzar NotFoundException al intentar borrar nota ajena o inexistente', () => {
      expect(() => {
        service.remove('user-1', 'inexistente');
      }).toThrow(NotFoundException);
    });
  });
});
