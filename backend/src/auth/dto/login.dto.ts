import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
    @ApiProperty({ example: 'lucas@test.com', description: 'Correo electrónico' })
    @IsEmail({}, { message: 'El email no es válido' })
    email: string;

    @ApiProperty({ example: '123456', description: 'Contraseña' })
    @IsString()
    @IsNotEmpty({ message: 'La contraseña es obligatoria' })
    password: string;
}
