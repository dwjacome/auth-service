import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class PasswordDto {
    @ApiProperty({
        description: 'User of the user',
        example: 'john_doe',
    })
    @IsString()
    @MinLength(8)
    //@Matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/, { message: 'Password too weak' })
    password: string;
}