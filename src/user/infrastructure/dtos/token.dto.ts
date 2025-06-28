import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class Token {
    @ApiProperty({ description: 'Refresh token of the user', example: 'hbsbsnk2763735sfbssj' })
    @IsString()
    @IsNotEmpty()
    token: string;
}
