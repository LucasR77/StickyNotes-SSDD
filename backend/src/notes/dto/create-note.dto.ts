import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateNoteDto {
    @ApiProperty({
        description: 'Título de la nota',
        example: 'Sacar turno en la barberia',
    })
    @IsString()
    @IsNotEmpty({ message: 'El título es obligatorio' })
    title: string;

    @ApiProperty({
        description: 'Contenido o detalle de la nota',
        example: 'Cortarse el pelo',
    })
    @IsString()
    @IsNotEmpty({ message: 'El texto es obligatorio' })
    text: string;

    @ApiProperty({
        description: 'Minutos de validez antes de la notificación',
        example: 15,
    })
    @IsNumber({}, { message: 'Los minutos deben ser un número' })
    minutes: number;
}
