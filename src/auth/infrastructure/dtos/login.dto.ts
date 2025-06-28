import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsNotEmpty, Matches } from 'class-validator';

export class LoginAuthDto {
    @ApiProperty({ description: 'User or Email of the user', example: 'john_doe' })
    @IsString()
    @MinLength(5)
    @IsNotEmpty()
    user: string;

    @ApiProperty({ description: 'Password of the user', example: 'Password123' })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*$/, { message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' })
    password: string;

    @ApiProperty({ description: 'Payload of the login', example: 'Payload' })
    @IsNotEmpty()
    payload: string;
}
