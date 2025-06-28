import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class SubclientDto extends PartialType(CreateUserDto) {
    @ApiProperty({ description: 'Id Client of the user', example: 'hbsbsnk2763735sfbssj' })
    @IsString()
    @IsNotEmpty()
    id_client: string;
}
