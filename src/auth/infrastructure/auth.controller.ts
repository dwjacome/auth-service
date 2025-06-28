import { Controller, Post, Body, Param, Put, Get, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AuthService } from '../application/auth.service';
import { CreateAuthDto, LoginAuthDto, UpdateAuthDto, CreateTokenDto } from './dtos';
import { ResponsesUtil } from '../../common/utils';
import { Auth } from './decorators';

@Controller('auth')
@ApiBearerAuth()
@ApiTags('Auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post()
    async create(@Body() body: CreateAuthDto): Promise<ResponsesUtil> {
        return await this.authService.create(body);
    }

    @Auth()
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<ResponsesUtil> {
        return await this.authService.findOne(id);
    }

    @Auth()
    @Put(':id')
    async update(@Param('id') id: string, @Body() body: UpdateAuthDto): Promise<ResponsesUtil> {
        return await this.authService.update(id, body);
    }

    @Auth()
    @Delete(':id')
    async delete(@Param('id') id: string): Promise<ResponsesUtil> {
        return await this.authService.delete(id);
    }

    @Post('token')
    async createToken(@Body() refresh: CreateTokenDto): Promise<ResponsesUtil> {
        return await this.authService.createToken(refresh);
    }

    @Post('login')
    async login(@Body() body: LoginAuthDto): Promise<ResponsesUtil> {
        return await this.authService.login(body);
    }

}
