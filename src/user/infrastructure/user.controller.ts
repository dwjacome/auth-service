import { Controller, Post, Body, Param, Put, Get, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { LoginDto, UpdateUserDto } from './dtos';
import { Auth } from 'src/auth/infrastructure/decorators';
import { IValidRoles } from 'src/common/interfaces/valid-roles.interface';
import { ResponsesUtil } from 'src/common/utils';
import { CreateUserDto } from './dtos';
import { UserService } from '../application/user.service';

@Controller('user')
@ApiBearerAuth()
@ApiTags('User')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post()
    async create(@Body() body: CreateUserDto): Promise<ResponsesUtil> {
        return await this.userService.create(body);
    }

    @Get(':id')
    async finOne(@Param('id') id: string): Promise<ResponsesUtil> {
        return await this.userService.findOne(id);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() body: UpdateUserDto): Promise<ResponsesUtil> {
        return await this.userService.update(id, body);
    }

    @Delete(':id')
    @Auth(IValidRoles.superadmin, IValidRoles.admin, IValidRoles.client)
    async delete(@Param('id') id: string): Promise<ResponsesUtil> {
        return await this.userService.delete(id);
    }

    @Post('login')
    async login(@Body() body: LoginDto): Promise<ResponsesUtil> {
        return await this.userService.login(body);
    }

}
