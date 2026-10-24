import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateNoteDto {
    @ApiProperty({
        description: 'ID de la nota a modificar',
        example: 'd8e4f1a2-3b4c-5d6e-7f8a-9b0c1d2e3f4a',
    })
    @IsString()
    @IsNotEmpty()
    id: string;

    @ApiPropertyOptional({
        description: 'Nuevo título',
        example: 'Comprar café tostado suave',
    })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiPropertyOptional({
        description: 'Nuevo contenido',
        example: 'Comprar 500g de café',
    })
    @IsString()
    @IsOptional()
    text?: string;

    @ApiPropertyOptional({
        description: 'Nuevos minutos',
        example: 30,
    })
    @IsNumber()
    @IsOptional()
    minutes?: number;

    @ApiPropertyOptional({
        description: 'Marcar como notificada',
        example: true,
    })
    @IsBoolean()
    @IsOptional()
    notified?: boolean;
}
