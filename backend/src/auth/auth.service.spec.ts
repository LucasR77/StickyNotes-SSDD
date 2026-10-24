import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mock-token-jwt'),
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('debe registrar un usuario nuevo y devolverlo con un token', async () => {
      const dto = { name: 'Lucas', email: 'lucas@test.com', password: 'password123' };
      const result = await service.register(dto);

      expect(result.user.name).toBe('Lucas');
      expect(result.user.email).toBe('lucas@test.com');
      expect(result.token).toBe('mock-token-jwt');
      expect(mockJwtService.signAsync).toHaveBeenCalled();
    });

    it('debe lanzar ConflictException si el email ya existe', async () => {
      const dto = { name: 'Lucas', email: 'duplicado@test.com', password: 'password123' };
      await service.register(dto);

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('debe autenticar con credenciales correctas', async () => {
      const registerDto = { name: 'Martin', email: 'martin@test.com', password: 'secreto123' };
      await service.register(registerDto);

      const loginResult = await service.login({
        email: 'martin@test.com',
        password: 'secreto123',
      });

      expect(loginResult.user.email).toBe('martin@test.com');
      expect(loginResult.token).toBe('mock-token-jwt');
    });

    it('debe lanzar UnauthorizedException si la contraseña es incorrecta', async () => {
      await service.register({ name: 'Martin', email: 'martin2@test.com', password: 'correcta' });

      await expect(
        service.login({ email: 'martin2@test.com', password: 'equivocada' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe lanzar UnauthorizedException si el usuario no existe', async () => {
      await expect(
        service.login({ email: 'noexiste@test.com', password: '123' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
