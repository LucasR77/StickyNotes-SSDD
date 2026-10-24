import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
    @ApiProperty({ example: 'Lucas', description: 'Nombre completo del usuario' })
    @IsString()
    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    name: string;

    @ApiProperty({ example: 'lucas@test.com', description: 'Correo electrónico único' })
    @IsEmail({}, { message: 'El email no es válido' })
    email: string;

    @ApiProperty({ example: '123456', description: 'Contraseña (mínimo 6 caracteres)' })
    @IsString()
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    password: string;
}
