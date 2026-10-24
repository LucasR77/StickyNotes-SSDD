import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { CurrentUserPayload } from './current-user.decorator';

declare global {
    namespace Express {
        interface Request {
            user?: CurrentUserPayload;
        }
    }
}

const SESSION_COOKIE = 'session';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const token = request.cookies?.[SESSION_COOKIE];

        if (!token) {
            throw new UnauthorizedException('No autorizado');
        }

        try {
            const payload = await this.jwtService.verifyAsync<CurrentUserPayload>(token);
            // Guardamos los datos del usuario en la request para que el controlador los use
            request.user = payload; // contiene { sub: userId, email }
            return true;
        } catch {
            throw new UnauthorizedException('No autorizado');
        }
    }
}
