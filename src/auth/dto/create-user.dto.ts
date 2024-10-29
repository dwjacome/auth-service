import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class UserDto {
    @ApiProperty({ description: 'Username of the user', example: 'john_doe' })
    @IsString()
    @MinLength(8)
    @IsNotEmpty()
    username: string;

    @ApiProperty({ description: 'Paaword of the user', example: 'john_doe' })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    //@Matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/, { message: 'Password too weak' })
    password: string;
}
