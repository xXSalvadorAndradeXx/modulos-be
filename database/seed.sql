INSERT INTO products(sku,name,category,description,unit,price,needs_review,image_url) VALUES
('WS-GR-001','Granito Negro Absoluto','Granito','Piedra natural para cubiertas y espacios contemporáneos.','m2',125.00,true,'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=850'),
('WS-MA-001','Mármol Blanco Carrara','Mármol','Mármol de vetas elegantes para proyectos interiores.','m2',175.00,true,'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=850'),
('WS-CU-001','Cuarzo Blanco Polar','Cuarzo','Superficie de cuarzo de mantenimiento sencillo.','m2',145.00,true,'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=850'),
('WS-GR-002','Granito Gris Perla','Granito','Acabado sobrio para cocina y baño.','m2',115.00,true,'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=850') ON CONFLICT(sku) DO NOTHING;
