INSERT INTO properties (name, city, area, createdAt, updatedAt) VALUES 
('Fazenda Rio Verde', 'São Paulo', 500.75, NOW(), NOW()),
('Fazenda Vale Azul', 'Minas Gerais', 300.50, NOW(), NOW()),
('Fazenda Serra Alta', 'Goiás', 800.00, NOW(), NOW()),
('Fazenda Boa Vista', 'Bahia', 450.30, NOW(), NOW());

INSERT INTO glebas (name, area, propertyId, createdAt, updatedAt) VALUES 
('Gleba 1', 100.25, 1, NOW(), NOW()),
('Gleba 2', 200.50, 1, NOW(), NOW()),
('Gleba 3', 50.30, 2, NOW(), NOW()),
('Gleba 4', 150.00, 2, NOW(), NOW()),
('Gleba 5', 250.75, 3, NOW(), NOW()),
('Gleba 6', 300.00, 3, NOW(), NOW()),
('Gleba 7', 120.00, 4, NOW(), NOW()),
('Gleba 8', 330.50, 4, NOW(), NOW());

INSERT INTO safras (type, status, cultivo, semente, metroLinear, dosagem, toneladas, adubo, dataFimPlantio, dataFimColheita, tempoLavoura, precMilimetrica, umidade, impureza, graosAvariados, graosEsverdeados, graosQuebrados, prodTotal, prodPrevista, prodRealizada, porcentHect, createdAt, updatedAt, areaTotal, name) 
VALUES
  ('Planejado', false, 'Milho', 'Semente A', 500, 50, 20.5, 'Adubo X', '2024-03-01', '2024-09-01', 180, 0, 0, 0, 0, 0, 0, 150, 200.5, 0, 0, NOW(), NOW(), 100, 'Safra 1'),
  ('Planejado', false, 'Soja', 'Semente B', 700, 60, 30.0, 'Adubo Y', '2024-04-01', '2024-10-01', 160, 0, 0, 0, 0, 0, 0, 200, 250.0, 0, 0, NOW(), NOW(), 120, 'Safra 2'),
  ('Planejado', false, 'Trigo', 'Semente C', 550, 45, 25.0, 'Adubo Z', '2024-05-01', '2024-11-01', 190, 0, 0, 0, 0, 0, 0, 175, 220.0, 0, 0, NOW(), NOW(), 110, 'Safra 3'),
  ('Planejado', false, 'Algodão', 'Semente D', 650, 70, 40.0, 'Adubo W', '2024-06-01', '2024-12-01', 180, 0, 0, 0, 0, 0, 0, 220, 270.0, 0, 0, NOW(), NOW(), 140, 'Safra 4'),
  ('Planejado', false, 'Feijão', 'Semente E', 500, 55, 22.5, 'Adubo Q', '2024-07-01', '2024-01-01', 150, 0, 0, 0, 0, 0, 0, 160, 210.5, 0, 0, NOW(), NOW(), 95, 'Safra 5'),
  ('Planejado', false, 'Arroz', 'Semente F', 600, 65, 35.0, 'Adubo T', '2024-08-01', '2024-02-01', 170, 0, 0, 0, 0, 0, 0, 210, 260.0, 0, 0, NOW(), NOW(), 130, 'Safra 6');

INSERT INTO custos (name, unit, quantity, price, category, totalValue, expirationDate, note, safraId, status, type, createdAt, updatedAt, glebaId) VALUES
('Calcário', 'tonelada', 10, 120.00, 'Corretivos e Fertilizantes', 1200.00, NOW(), 'Aplicação de calcário no solo', 1, false, 'Planejado', NOW(), NOW(), 1),
('Herbicida', 'litro', 30, 18.00, 'Defensivos', 540.00, NOW(), 'Controle de ervas daninhas', 1, false, 'Planejado', NOW(), NOW(), 2),
('Combustível', 'litro', 500, 5.00, 'Operações', 2500.00, NOW(), 'Combustível para máquinas agrícolas', 1, false, 'Planejado', NOW(), NOW(), 1),
('Semente de Milho', 'saco', 200, 100.00, 'Semente', 20000.00, NOW(), 'Sementes para plantio de milho', 1, false, 'Planejado', NOW(), NOW(), 2),
('Arrendamento de Terra', 'hectare', 50, 1000.00, 'Arrendamento', 50000.00, NOW(), 'Arrendamento para cultivo de soja', 1, false, 'Planejado', NOW(), NOW(), 1),
('Adubo Orgânico', 'kg', 200, 8.00, 'Corretivos e Fertilizantes', 1600.00, NOW(), 'Adubo orgânico para solo', 1, false, 'Planejado', NOW(), NOW(), 2),
('Manejo de Irrigação', 'hora', 100, 20.00, 'Operações', 2000.00, NOW(), 'Serviços de manejo de irrigação', 1, false, 'Planejado', NOW(), NOW(), 1),
('Seguro Agrícola', 'contrato', 1, 5000.00, 'Administrativo', 5000.00, NOW(), 'Seguro para safra de soja', 1, false, 'Planejado', NOW(), NOW(), 2),
('Máquinas e Equipamentos', 'unidade', 1, 15000.00, 'Administrativo', 15000.00, NOW(), 'Aquisição de novos equipamentos agrícolas', 1, false, 'Planejado', NOW(), NOW(), 1),
('Fertilizante', 'kg', 100, 15.00, 'Corretivos e Fertilizantes', 1500.00, NOW(), 'Fertilizante nitrogenado para solo', 1, false, 'Planejado', NOW(), NOW(), 2),
('Pesticida', 'litro', 50, 16.00, 'Defensivos', 800.00, NOW(), 'Controle de pragas', 1, false, 'Planejado', NOW(), NOW(), 1),
('Transporte', 'viagem', 2, 600.00, 'Operações', 1200.00, NOW(), 'Transporte de grãos', 1, false, 'Planejado', NOW(), NOW(), 2),
('Mão de Obra', 'hora', 200, 12.50, 'Operações', 2500.00, NOW(), 'Trabalhadores rurais', 1, false, 'Planejado', NOW(), NOW(), 1),
('Equipamento', 'unidade', 1, 3000.00, 'Administrativo', 3000.00, NOW(), 'Compra de trator', 1, false, 'Planejado', NOW(), NOW(), 2),
('Seguro', 'contrato', 1, 1100.00, 'Administrativo', 1100.00, NOW(), 'Seguro da safra', 1, false, 'Planejado', NOW(), NOW(), 1),
('Calcário', 'tonelada', 10, 120.00, 'Corretivos e Fertilizantes', 1200.00, NOW(), 'Aplicação de calcário no solo', 2, false, 'Planejado', NOW(), NOW(), 3),
('Herbicida', 'litro', 30, 18.00, 'Defensivos', 540.00, NOW(), 'Controle de ervas daninhas', 2, false, 'Planejado', NOW(), NOW(), 4);

INSERT INTO storage_items (storedLocation, name, unit, quantity, price, category, totalValue, expirationDate, note, propertyId, createdAt, updatedAt)
VALUES
('Armazém de Fertilizantes', 'Fertilizante', 'kg', 500, 20.00, 'Corretivos e Fertilizantes', 10000.00, NOW(), 'Fertilizante químico para solo', 1, NOW(), NOW()),
('Armazém de Produtos Químicos', 'Pesticida', 'litro', 300, 25.00, 'Defensivos', 7500.00, NOW(), 'Pesticida para controle de pragas em soja', 2, NOW(), NOW()),
('Armazém de Equipamentos', 'Sementes', 'saco', 100, 150.00, 'Semente', 15000.00, NOW(), 'Sementes de milho para plantio', 3, NOW(), NOW()),
('Armazém de Ferramentas', 'Trator', 'unidade', 2, 50000.00, 'Capital', 100000.00, NOW(), 'Tratores para preparo do solo', 4, NOW(), NOW()),
('Armazém de Ferramentas', 'Plantar', 'unidade', 5, 3000.00, 'Capital', 15000.00, NOW(), 'Plantar para semear o milho', 4, NOW(), NOW()),
('Armazém de Proteção', 'Roupas de Proteção', 'unidade', 50, 100.00, 'Capital', 5000.00, NOW(), 'Roupas de proteção para operários', 1, NOW(), NOW()),
('Armazém de Fertilizantes', 'Calcário', 'kg', 1000, 10.00, 'Corretivos e Fertilizantes', 10000.00, NOW(), 'Calcário para correção do solo', 1, NOW(), NOW()),
('Armazém de Produtos Químicos', 'Herbicida', 'litro', 200, 30.00, 'Defensivos', 6000.00, NOW(), 'Herbicida para controle de plantas daninhas', 2, NOW(), NOW()),
('Armazém de Equipamentos', 'Colheitadeira', 'unidade', 1, 150000.00, 'Capital', 150000.00, NOW(), 'Colheitadeira para grãos', 3, NOW(), NOW()),
('Armazém de Ferramentas', 'Roçadeira', 'unidade', 10, 2000.00, 'Capital', 20000.00, NOW(), 'Roçadeiras para corte de capim', 4, NOW(), NOW()),
('Armazém de Proteção', 'Máscaras de Proteção', 'unidade', 200, 15.00, 'Capital', 3000.00, NOW(), 'Máscaras de proteção para pulverização', 3, NOW(), NOW()),
('Armazém de Insumos', 'Adubo Orgânico', 'kg', 800, 8.00, 'Corretivos e Fertilizantes', 6400.00, NOW(), 'Adubo orgânico para plantio', 1, NOW(), NOW()),
('Armazém de Insumos', 'Fungicida', 'litro', 100, 40.00, 'Defensivos', 4000.00, NOW(), 'Fungicida para controle de doenças', 1, NOW(), NOW()),
('Armazém de Equipamentos', 'Arado', 'unidade', 4, 7000.00, 'Capital', 28000.00, NOW(), 'Arados para preparo do solo', 3, NOW(), NOW());

INSERT INTO safra_glebas (statusSafra, safraId, glebaId, createdAt, updatedAt) VALUES
(false,1, 1, NOW(), NOW()),  -- Safra 1 associada à Gleba 1
(false,1, 2, NOW(), NOW()),  -- Safra 1 associada à Gleba 2
(false,2, 3, NOW(), NOW()),  -- Safra 2 associada à Gleba 1
(false,2, 4, NOW(), NOW()),  -- Safra 2 associada à Gleba 3
(false,3, 5, NOW(), NOW()),  -- Safra 3 associada à Gleba 2
(false,3, 6, NOW(), NOW());  -- Safra 3 associada à Gleba 3

INSERT INTO invites (senderId, reciverId, propertyId,createdAt, updatedAt) VALUES
(2, 1, 5,NOW(), NOW());  -- Exemplo de convite enviado pelo usuário 1 para o usuário 2, referente à propriedade 100

INSERT INTO user_properties (userId, propertyId, access, createdAt, updatedAt) VALUES
(1, 1, 'owner', NOW(), NOW()),  
(1, 2, 'owner', NOW(), NOW()), 
(1, 3, 'owner', NOW(), NOW()), 
(1, 4, 'owner', NOW(), NOW()); 


