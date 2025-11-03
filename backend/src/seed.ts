import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ProductsService } from './products/products.service';
import { UsersService } from './users/users.service';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const productsService = app.get(ProductsService);
  const usersService = app.get(UsersService);

  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear usuario admin
  try {
    await usersService.create({
      email: 'admin@alsahara.cl',
      password: 'Admin123',
      name: 'Administrador',
      role: 'admin',
      address: 'Oficina Central',
      phone: '+56912345678',
    });
    console.log('✅ Usuario admin creado');
  } catch (error) {
    console.log('⚠️ Usuario admin ya existe');
  }

  // Crear usuario cajero
  try {
    await usersService.create({
      email: 'cajero@alsahara.cl',
      password: 'Cajero123',
      name: 'Cajero Virtual',
      role: 'cashier',
      address: 'Restaurant',
      phone: '+56912345679',
    });
    console.log('✅ Usuario cajero creado');
  } catch (error) {
    console.log('⚠️ Usuario cajero ya existe');
  }

  // Productos de Kebab
  const kebabProducts = [
    {
      name: 'Kebab de Pollo',
      description: 'Delicioso kebab de pollo marinado con especias árabes, acompañado de vegetales frescos y salsa de yogurt',
      price: 6500,
      category: 'Kebab',
      imageUrl: '/images/kebab-pollo.jpg',
      stock: 50,
      featured: true,
      tags: [],
    },
    {
      name: 'Kebab de Cordero',
      description: 'Auténtico kebab de cordero con hierbas mediterráneas, tomate, lechuga y salsa tahini',
      price: 7500,
      category: 'Kebab',
      imageUrl: '/images/kebab-cordero.jpg',
      stock: 40,
      featured: false,
      tags: [],
    },
    {
      name: 'Kebab Mixto',
      description: 'Combinación perfecta de pollo y cordero con vegetales y salsas especiales',
      price: 7000,
      category: 'Kebab',
      imageUrl: '/images/kebab-mixto.jpg',
      stock: 45,
      featured: true,
      tags: [],
    },
  ];

  // Productos de Shawarma
  const shawarmaProducts = [
    {
      name: 'Shawarma de Pollo',
      description: 'Shawarma tradicional de pollo con pepinillos, tomate y salsa de ajo',
      price: 5500,
      category: 'Shawarma',
      imageUrl: '/images/shawarma-pollo.jpg',
      stock: 60,
      featured: true,
      tags: [],
    },
    {
      name: 'Shawarma de Carne',
      description: 'Shawarma de carne de res marinada con especias árabes y vegetales frescos',
      price: 6000,
      category: 'Shawarma',
      imageUrl: '/images/shawarma-carne.jpg',
      stock: 50,
      featured: false,
      tags: [],
    },
    {
      name: 'Shawarma Épico',
      description: 'Shawarma jumbo con doble porción de carne, queso y salsas premium',
      price: 8000,
      category: 'Shawarma',
      imageUrl: '/images/shawarma-epico.jpg',
      stock: 30,
      featured: true,
      tags: ['Picante'],
    },
  ];

  // Productos de Falafel
  const falafelProducts = [
    {
      name: 'Falafel Clásico',
      description: 'Croquetas de garbanzo con hierbas frescas, hummus y tahini',
      price: 5000,
      category: 'Falafel',
      imageUrl: '/images/falafel-clasico.jpg',
      stock: 70,
      featured: false,
      tags: ['Vegano', 'Sin Gluten'],
    },
    {
      name: 'Falafel Premium',
      description: 'Falafel con aguacate, queso feta y salsa de yogurt especial',
      price: 6500,
      category: 'Falafel',
      imageUrl: '/images/falafel-premium.jpg',
      stock: 40,
      featured: true,
      tags: [],
    },
  ];

  const allProducts = [...kebabProducts, ...shawarmaProducts, ...falafelProducts];

  for (const product of allProducts) {
    try {
      await productsService.create(product);
      console.log(`✅ Producto creado: ${product.name}`);
    } catch (error) {
      console.log(`⚠️ Producto ya existe: ${product.name}`);
    }
  }

  console.log('🎉 Seed completado exitosamente!');
  await app.close();
}

seed().catch((error) => {
  console.error('❌ Error en seed:', error);
  process.exit(1);
});
