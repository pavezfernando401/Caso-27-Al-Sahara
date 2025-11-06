-- Usa el schema que tengas en .env (ajusta si usas 'alsahara' en minúscula)
USE alsahara;

-- SESSIONS
CREATE TABLE IF NOT EXISTS sessions (
  id CHAR(64) PRIMARY KEY,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES usuarios(id)
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_exp ON sessions(expires_at);

-- CARRITO
CREATE TABLE IF NOT EXISTS carritos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS carrito_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  carrito_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  agregado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (carrito_id) REFERENCES carritos(id),
  FOREIGN KEY (producto_id) REFERENCES productos(id),
  UNIQUE KEY uniq_item (carrito_id, producto_id)
);

-- PEDIDOS
CREATE TABLE IF NOT EXISTS pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total INT NOT NULL,
  estado ENUM('pendiente','pagado','preparacion','despachado','entregado','cancelado') DEFAULT 'pendiente',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS pedido_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  producto_id INT NOT NULL,
  precio_unit INT NOT NULL,
  cantidad INT NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

USE alsahara;

-- Extender tabla productos
ALTER TABLE productos
  ADD COLUMN category VARCHAR(40) NULL,
  ADD COLUMN ingredients JSON NULL,
  ADD COLUMN tags JSON NULL,
  ADD COLUMN featured TINYINT(1) NOT NULL DEFAULT 0;

-- Inserta 20 productos (JSON válido en ingredients/tags)
INSERT INTO productos (id, nombre, descripcion, valor, imagen, activo, category, ingredients, tags, featured)
VALUES
(1,'Shawarma de Pollo',NULL,6900,'https://fishandmeat.hk/wp-content/uploads/2025/05/arabic-chicken-shawarma-sandwich-recipe-1747792750.jpg',1,'Shawarma',
  JSON_ARRAY('Pollo asado','Lechuga','Tomate','Pepinillos','Salsa tahini','Pan pita'),
  JSON_ARRAY('Popular'), 1),
(2,'Shawarma de Cordero',NULL,7500,'https://www.simplyquinoa.com/wp-content/uploads/2023/05/chicken-shawarma-gyros-9.jpg',1,'Shawarma',
  JSON_ARRAY('Cordero especiado','Cebolla morada','Perejil','Salsa yogurt','Pan pita'),
  JSON_ARRAY('Picante'), 0),
(3,'Shawarma Mixto',NULL,7900,'https://www.bekiacocina.com/images/cocina/0000/184-h.jpg',1,'Shawarma',
  JSON_ARRAY('Pollo y cordero','Vegetales mixtos','Hummus','Salsa especial','Pan pita'),
  JSON_ARRAY('Clásico'), 1),
(4,'Shawarma Vegetariano',NULL,6500,'https://mrkebab.cl/wp-content/uploads/2021/11/SHAWARMA-DE-FALAFEL.jpg',1,'Shawarma',
  JSON_ARRAY('Berenjenas','Pimientos','Champiñones','Tahini','Pan pita'),
  JSON_ARRAY('Vegano'), 0),
(5,'Shawarma Premium',NULL,8500,'https://imag.bonviveur.com/shawarma-de-pollo.jpg',1,'Shawarma',
  JSON_ARRAY('Carne premium','Queso feta','Aceitunas','Salsa especial','Pan artesanal'),
  JSON_ARRAY('Premium'), 0),

(6,'Falafel Clásico',NULL,5800,'https://imag.bonviveur.com/falafel-recien-hechos.jpg',1,'Falafel',
  JSON_ARRAY('Garbanzos','Perejil','Cilantro','Especias','Salsa Tahini'),
  JSON_ARRAY('2x1','Promoción'), 1),
(7,'Falafel Picante',NULL,6200,'https://images.cookforyourlife.org/wp-content/uploads/2022/06/Baked_Falafel.png',1,'Falafel',
  JSON_ARRAY('Garbanzos','Jalapeños','Comino','Salsa picante'),
  JSON_ARRAY('Picante','Vegano'), 0),
(8,'Falafel Bowl',NULL,7500,'https://www.realsimple.com/thmb/NFIGTxuGlJTsfKdUmyGOwyhB2M4=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/1023COO-falafel-bites-ad6de43586164252ab670be6b5ad4750.jpg',1,'Falafel',
  JSON_ARRAY('Falafels','Ensalada','Hummus','Tabulé','Pan pita'),
  JSON_ARRAY('Vegano','Saludable'), 0),
(9,'Falafel Wrap',NULL,6400,'https://cookingwithayeh.com/wp-content/uploads/2024/03/Falafel-Wrap-SQ-1.jpg',1,'Falafel',
  JSON_ARRAY('Falafels','Lechuga','Tomate','Pepino','Tortilla'),
  JSON_ARRAY('Vegano'), 0),
(10,'Falafel Plate',NULL,8200,'https://thishealthykitchen.com/wp-content/uploads/2020/04/Baked-Falafel-Wraps-Feat-Image-Square.jpg',1,'Falafel',
  JSON_ARRAY('6 falafels','Hummus','Ensalada','Pan pita'),
  JSON_ARRAY('Vegano'), 0),

(11,'Kebab de Pollo',NULL,7200,'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=400&h=300&fit=crop',1,'Kebab',
  JSON_ARRAY('Pechuga de pollo','Pimientos','Cebolla','Especias','Pan árabe'),
  JSON_ARRAY('Popular'), 0),
(12,'Kebab de Cordero',NULL,8100,'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=400&h=300&fit=crop',1,'Kebab',
  JSON_ARRAY('Cordero marinado','Vegetales asados','Salsa yogurt','Pan árabe'),
  JSON_ARRAY('Clásico'), 0),
(13,'Kebab Mixto',NULL,7900,'https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=400&h=300&fit=crop',1,'Kebab',
  JSON_ARRAY('Pollo y cordero','Vegetales','Salsa especial','Pan árabe'),
  JSON_ARRAY('2x1','Promoción'), 1),
(14,'Kebab Vegetariano',NULL,6800,'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=400&h=300&fit=crop',1,'Kebab',
  JSON_ARRAY('Vegetales a la parrilla','Hummus','Tahini','Pan integral'),
  JSON_ARRAY('Vegano'), 0),
(15,'Kebab Premium',NULL,9200,'https://images.unsplash.com/photo-1606787366850-de6330128bfc?q=80&w=400&h=300&fit=crop',1,'Kebab',
  JSON_ARRAY('Carne premium','Vegetales gourmet','Salsa especial','Pan artesanal'),
  JSON_ARRAY('Premium'), 0),

(16,'Salsa Tahini',NULL,1500,'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?q=80&w=400&h=300&fit=crop',1,'Salsa',
  JSON_ARRAY('Semillas de sésamo','Limón','Ajo','Aceite de oliva'),
  JSON_ARRAY('Clásica'), 0),
(17,'Hummus',NULL,2500,'https://www.gourmet.cl/wp-content/uploads/2016/09/Hummus.jpg',1,'Salsa',
  JSON_ARRAY('Garbanzos','Tahini','Limón','Ajo'),
  JSON_ARRAY('Popular'), 0),

(18,'Coca Cola',NULL,1500,'https://images.unsplash.com/photo-1554866585-cd94860890b7?q=80&w=400&h=300&fit=crop',1,'Bebida',
  JSON_ARRAY('Bebida gasificada'),
  JSON_ARRAY('Refrescante'), 0),
(19,'Agua Mineral',NULL,1200,'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?q=80&w=400&h=300&fit=crop',1,'Bebida',
  JSON_ARRAY('Agua mineral natural'),
  JSON_ARRAY('Natural'), 0),
(20,'Jugo Natural Naranja',NULL,2500,'https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=400&h=300&fit=crop',1,'Bebida',
  JSON_ARRAY('Jugo de naranja recién exprimido'),
  JSON_ARRAY('Natural'), 0);
