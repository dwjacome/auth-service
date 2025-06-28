import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class OperatorDto extends PartialType(CreateUserDto) {
    @ApiProperty({ description: 'Id Admin of the user', example: 'hbsbsnk2763735sfbssj' })
    @IsString()
    @IsNotEmpty()
    id_admin: string;
}
