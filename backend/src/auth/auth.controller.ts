import {
    Controller,
    Post,
    Get,
    Body,
    Req,
    Res,
    UnauthorizedException,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiCookieAuth,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const SESSION_COOKIE = 'session';
const COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en ms
};

@ApiTags('auth') // <-- Asocia este controlador a la sección 'auth' en Swagger
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // POST /api/auth/register
    @Post('register')
    @ApiOperation({ summary: 'Registrar un nuevo usuario' })
    @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente y cookie asignada' })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    @ApiResponse({ status: 409, description: 'Email ya registrado' })
    async register(
        @Body() dto: RegisterDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { user, token } = await this.authService.register(dto);
        res.cookie(SESSION_COOKIE, token, COOKIE_OPTIONS);
        return user;
    }

    // POST /api/auth/login
    @Post('login')
    @ApiOperation({ summary: 'Iniciar sesión con email y contraseña' })
    @ApiResponse({ status: 200, description: 'Sesión iniciada exitosamente y cookie asignada' })
    @ApiResponse({ status: 401, description: 'Email o contraseña incorrectos' })
    async login(
        @Body() dto: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { user, token } = await this.authService.login(dto);
        res.cookie(SESSION_COOKIE, token, COOKIE_OPTIONS);
        return user;
    }

    // GET /api/auth/me
    @Get('me')
    @ApiCookieAuth('session')
    @ApiOperation({ summary: 'Obtener datos del usuario actualmente autenticado' })
    @ApiResponse({ status: 200, description: 'Datos del usuario' })
    @ApiResponse({ status: 401, description: 'No autorizado / Sesión inválida' })
    async me(@Req() req: Request) {
        const token = req.cookies?.[SESSION_COOKIE];
        if (!token) {
            throw new UnauthorizedException('No autorizado');
        }

        const user = await this.authService.validateToken(token);
        if (!user) {
            throw new UnauthorizedException('No autorizado');
        }

        return user;
    }

    // POST /api/auth/logout
    @Post('logout')
    @ApiCookieAuth('session')
    @ApiOperation({ summary: 'Cerrar sesión y eliminar cookie' })
    @ApiResponse({ status: 200, description: 'Sesión cerrada exitosamente' })
    logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie(SESSION_COOKIE, { path: '/' });
        return { ok: true };
    }
}
