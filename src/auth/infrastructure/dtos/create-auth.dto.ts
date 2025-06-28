import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsNotEmpty, Matches, IsEmail, ValidateIf } from 'class-validator';

export class CreateAuthDto {
    @ApiProperty({ description: 'Email of the auth', example: 'jhon_doe@example.com' })
    @ValidateIf((o) => !o.username)
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    email?: string;

    @ApiProperty({ description: 'Username of the auth', example: 'john_doe' })
    @ValidateIf((o) => !o.email)
    @IsString()
    @MinLength(5)
    @IsNotEmpty()
    username?: string;

    @ApiProperty({ description: 'Password of the auth', example: 'Password123' })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*$/, { message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' })
    password: string;
}
