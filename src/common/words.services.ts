import { Injectable } from '@nestjs/common';

@Injectable()
export class WordsService {
    user = {
        create: 'User created success',
        update: 'User updated success',
        delete: 'User deleted success',
        find: 'User find succes',
        error: 'User incorrect information'
    };
}