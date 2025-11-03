import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  rut: string;

  @Prop()
  address: string;

  @Prop()
  phone: string;

  @Prop()
  birthdate: Date;

  @Prop()
  gender: string;

  @Prop({ default: 'customer' })
  role: string; // customer, cashier, admin

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
