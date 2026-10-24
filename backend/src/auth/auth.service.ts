import {
    Injectable,
    ConflictException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export interface User {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
}

@Injectable()
export class AuthService {
    // Lista en memoria (podés cambiarla por persistencia en archivo/DB luego)
    private users: User[] = [];

    constructor(private readonly jwtService: JwtService) { }

    async register(dto: RegisterDto) {
        const email = dto.email.toLowerCase();
        const exists = this.users.find((u) => u.email === email);
        if (exists) {
            throw new ConflictException('Ese email ya está registrado.');
        }

        const passwordHash = await bcrypt.hash(dto.password, 10);
        const user: User = {
            id: crypto.randomUUID(),
            name: dto.name,
            email,
            passwordHash,
        };
        this.users.push(user);

        const token = await this.jwtService.signAsync({
            sub: user.id,
            email: user.email,
        });

        return {
            user: { name: user.name, email: user.email },
            token,
        };
    }

    async login(dto: LoginDto) {
        const email = dto.email.toLowerCase();
        const user = this.users.find((u) => u.email === email);
        if (!user) {
            throw new UnauthorizedException('Email o contraseña incorrectos.');
        }

        const isValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isValid) {
            throw new UnauthorizedException('Email o contraseña incorrectos.');
        }

        const token = await this.jwtService.signAsync({
            sub: user.id,
            email: user.email,
        });

        return {
            user: { name: user.name, email: user.email },
            token,
        };
    }

    async validateToken(token: string) {
        try {
            const payload = await this.jwtService.verifyAsync(token);
            const user = this.users.find((u) => u.id === payload.sub);
            if (!user) return null;
            return { name: user.name, email: user.email };
        } catch {
            return null;
        }
    }

    findUserById(id: string) {
        return this.users.find((u) => u.id === id) ?? null;
    }
}
