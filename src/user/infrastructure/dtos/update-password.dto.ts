import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class PasswordDto {
    @ApiProperty({
        description: 'User of the user',
        example: 'john_doe',
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*$/, { message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' })
    password: string;
}