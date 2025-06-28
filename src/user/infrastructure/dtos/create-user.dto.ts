import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsNotEmpty, Matches, IsArray, IsEmail, ValidateIf, IsOptional } from 'class-validator';

export class CreateUserDto {

    @ApiProperty({ description: 'Email of the user', example: 'jhon_doe@example.com' })
    @ValidateIf((o) => !o.username)
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    email?: string;

    @ApiProperty({ description: 'Username of the user', example: 'john_doe' })
    @ValidateIf((o) => !o.email)
    @IsString()
    @MinLength(5)
    @IsNotEmpty()
    username?: string;

    @ApiProperty({ description: 'Password of the user', example: 'Password123' })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*$/, { message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' })
    password: string;

    @ApiProperty({ description: 'Roles of the user', example: ['user'] })
    @IsArray()
    @IsNotEmpty()
    roles: string[];
}
