import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class User {
    @Prop({ required: true, unique: true })
    username: string;

    @Prop({ required: true })
    password: string;

    @Prop()
    roles: string[];

    @Prop()
    status: string;

    @Prop()
    event_date: string;

    @Prop()
    event_time: string;

    @Prop()
    update_date: string;

    @Prop()
    update_time: string;
}

