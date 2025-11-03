import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  category: string; // Kebab, Shawarma, Falafel

  @Prop()
  imageUrl: string;

  @Prop({ default: 100 })
  stock: number;

  @Prop({ default: false })
  featured: boolean;

  @Prop({ type: [String], default: [] })
  tags: string[]; // Vegano, Picante, Sin Gluten

  @Prop({ default: true })
  isActive: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
