import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { JwtService } from '@nestjs/jwt';

describe('NotesController', () => {
  let controller: NotesController;
  let service: NotesService;

  const mockUser = { sub: 'user-1', email: 'test@example.com' };

  // Mockeamos los métodos del servicio
  const mockNotesService = {
    create: jest.fn(),
    findAllByUser: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotesController],
      providers: [
        {
          provide: NotesService,
          useValue: mockNotesService, // Inyectamos el servicio simulado
        },
        {
          provide: JwtService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<NotesController>(NotesController);
    service = module.get<NotesService>(NotesService);
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('debe llamar a service.create con el userId y devolver { note }', () => {
      const dto = { title: 'Comprar pan', text: 'Casero', minutes: 5 };
      const expectedNote = { id: 'note-1', userId: 'user-1', ...dto, createdAt: 100, notified: false };
      mockNotesService.create.mockReturnValue(expectedNote);

      const result = controller.create(mockUser, dto);

      expect(service.create).toHaveBeenCalledWith('user-1', dto);
      expect(result).toEqual({ note: expectedNote });
    });
  });

  describe('findAll', () => {
    it('debe llamar a service.findAllByUser con el userId y devolver { notes }', () => {
      const notesList = [
        { id: '1', title: 'Nota A', text: '', minutes: 5, createdAt: 1, notified: false, userId: 'user-1' },
      ];
      mockNotesService.findAllByUser.mockReturnValue(notesList);

      const result = controller.findAll(mockUser);

      expect(service.findAllByUser).toHaveBeenCalledWith('user-1');
      expect(result).toEqual({ notes: notesList });
    });
  });

  describe('update', () => {
    it('debe llamar a service.update con el userId y devolver { note }', () => {
      const dto = { id: 'note-1', title: 'Modificado' };
      const updatedNote = { id: 'note-1', userId: 'user-1', title: 'Modificado', text: '', minutes: 5, createdAt: 1, notified: false };
      mockNotesService.update.mockReturnValue(updatedNote);

      const result = controller.update(mockUser, dto);

      expect(service.update).toHaveBeenCalledWith('user-1', dto);
      expect(result).toEqual({ note: updatedNote });
    });
  });

  describe('remove', () => {
    it('debe llamar a service.remove con el id y devolver { ok: true }', () => {
      mockNotesService.remove.mockReturnValue({ ok: true });

      const result = controller.remove(mockUser, 'note-1');

      expect(service.remove).toHaveBeenCalledWith('user-1', 'note-1');
      expect(result).toEqual({ ok: true });
    });

    it('debe lanzar BadRequestException si el id viene vacío', () => {
      expect(() => {
        controller.remove(mockUser, '');
      }).toThrow(BadRequestException);
    });
  });
});
