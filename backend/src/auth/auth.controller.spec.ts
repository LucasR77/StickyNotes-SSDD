import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import type { Response, Request } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  // Mock del servicio de autenticación
  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    validateToken: jest.fn(),
  };

  // Mock del objeto Response de Express para espiar cookies
  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('debe registrar un usuario y configurar la cookie de sesión', async () => {
      const dto = { name: 'Lucas', email: 'lucas@test.com', password: '123' };
      const res = mockResponse();
      mockAuthService.register.mockResolvedValue({
        user: { name: 'Lucas', email: 'lucas@test.com' },
        token: 'token-abc',
      });

      const result = await controller.register(dto, res);

      expect(service.register).toHaveBeenCalledWith(dto);
      expect(res.cookie).toHaveBeenCalledWith(
        'session',
        'token-abc',
        expect.objectContaining({ httpOnly: true, path: '/' }),
      );
      expect(result).toEqual({ name: 'Lucas', email: 'lucas@test.com' });
    });
  });

  describe('login', () => {
    it('debe loguear un usuario y configurar la cookie de sesión', async () => {
      const dto = { email: 'lucas@test.com', password: '123' };
      const res = mockResponse();
      mockAuthService.login.mockResolvedValue({
        user: { name: 'Lucas', email: 'lucas@test.com' },
        token: 'token-xyz',
      });

      const result = await controller.login(dto, res);

      expect(service.login).toHaveBeenCalledWith(dto);
      expect(res.cookie).toHaveBeenCalledWith(
        'session',
        'token-xyz',
        expect.objectContaining({ httpOnly: true }),
      );
      expect(result).toEqual({ name: 'Lucas', email: 'lucas@test.com' });
    });
  });

  describe('me', () => {
    it('debe devolver el usuario si la cookie de sesión es válida', async () => {
      const req = { cookies: { session: 'token-valido' } } as unknown as Request;
      mockAuthService.validateToken.mockResolvedValue({ name: 'Lucas', email: 'lucas@test.com' });

      const result = await controller.me(req);

      expect(service.validateToken).toHaveBeenCalledWith('token-valido');
      expect(result).toEqual({ name: 'Lucas', email: 'lucas@test.com' });
    });

    it('debe lanzar UnauthorizedException si no hay cookie de sesión', async () => {
      const req = { cookies: {} } as unknown as Request;

      await expect(controller.me(req)).rejects.toThrow(UnauthorizedException);
    });

    it('debe lanzar UnauthorizedException si el token es inválido', async () => {
      const req = { cookies: { session: 'token-invalido' } } as unknown as Request;
      mockAuthService.validateToken.mockResolvedValue(null);

      await expect(controller.me(req)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('debe limpiar la cookie de sesión y devolver { ok: true }', () => {
      const res = mockResponse();

      const result = controller.logout(res);

      expect(res.clearCookie).toHaveBeenCalledWith('session', { path: '/' });
      expect(result).toEqual({ ok: true });
    });
  });
});
