import { Controller, Post, Body, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { ValidRoles } from './interfaces';
import { PasswordDto, UserDto } from './dto';
import { Auth } from './decorators';

@Controller('auth')
@ApiBearerAuth()
@ApiTags('Auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(@Body() body: UserDto) {
        return this.authService.login(body);
    }

    @Post('create-client')
    async createClient(@Body() body: UserDto): Promise<any> {
        return await this.authService.createUser(body, [ValidRoles.client]);
    }

    @Post('create-user')
    @Auth(ValidRoles.superadmin, ValidRoles.admin)
    async createUser(@Body() body: UserDto): Promise<any> {
        return await this.authService.createUser(body, [ValidRoles.user]);
    }

    @Post('create-admin')
    @Auth(ValidRoles.superadmin)
    async createAdmin(@Body() body: UserDto): Promise<any> {
        return await this.authService.createUser(body, [ValidRoles.admin]);
    }

    @Put('update/password/:username')
    @Auth()
    async updateUser(@Param('username') username: string, @Body() body: PasswordDto): Promise<any> {
        return await this.authService.updateUser(username, body);
    }

    @Put('delete/:username')
    @Auth(ValidRoles.superadmin, ValidRoles.admin)
    async deleteUser(@Param('username') username: string): Promise<any> {
        return await this.authService.deleteUser(username);
    }
}
