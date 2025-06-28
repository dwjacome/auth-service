import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, MinLength } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @ApiProperty({ description: 'Name of the user', example: 'John Doe' })
    @IsString()
    @MinLength(3)
    @IsOptional()
    name: string;

    @ApiProperty({ description: 'Birth Date of the user', example: '1738294262' })
    @IsNumber()
    @IsOptional()
    birth_date: number;

    @ApiProperty({ description: 'Status of the user', example: 'inactive' })
    @IsString()
    @IsOptional()
    status: 'active' | 'inactive' | 'locked' | 'deleted';
}