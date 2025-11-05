import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true, enum: ['Shawarma', 'Falafel', 'Kebab', 'Salsa', 'Bebida'] },
    image: { type: String },
    ingredients: { type: [String], default: [] },
    price: { type: Number, required: true },
    available: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    tags: { type: [String], default: [] }
});

export default mongoose.model('Product', ProductSchema);