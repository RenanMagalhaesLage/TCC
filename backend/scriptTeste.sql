INSERT INTO properties (name, city, area, createdAt, updatedAt) VALUES 
('Fazenda Rio Verde', 'São Paulo', 500.75, NOW(), NOW()),
('Fazenda Vale Azul', 'Minas Gerais', 300.50, NOW(), NOW()),
('Fazenda Serra Alta', 'Goiás', 800.00, NOW(), NOW()),
('Fazenda Boa Vista', 'Bahia', 450.30, NOW(), NOW());

INSERT INTO user_properties (userId, propertyId, access, createdAt, updatedAt) VALUES
(1, 1, 'owner', NOW(), NOW()),  
(1, 2, 'owner', NOW(), NOW()), 
(1, 3, 'owner', NOW(), NOW()), 
(1, 4, 'owner', NOW(), NOW()); 

INSERT INTO glebas (name, area, propertyId, createdAt, updatedAt) VALUES 
('Gleba 1', 100.25, 1, NOW(), NOW()),
('Gleba 2', 200.50, 1, NOW(), NOW()),
('Gleba 3', 50.30, 2, NOW(), NOW()),
('Gleba 4', 150.00, 2, NOW(), NOW()),
('Gleba 5', 250.75, 3, NOW(), NOW()),
('Gleba 6', 300.00, 3, NOW(), NOW()),
('Gleba 7', 120.00, 4, NOW(), NOW()),
('Gleba 8', 330.50, 4, NOW(), NOW());

INSERT INTO safras (type, status, cultivo, semente, metroLinear, dosagem, toneladas, adubo, dataFimPlantio, dataFimColheita, tempoLavoura, precMilimetrica, umidade, impureza, graosAvariados, graosEsverdeados, graosQuebrados, prodTotal, prodPrevista, prodRealizada, porcentHect, glebaId, createdAt, updatedAt) VALUES
('Planejado', false, 'Milho', 'Semente A', 500, 50, 20.5, 'Adubo X', '2024-03-01', '2024-09-01', 180, 0, 0, 0, 0, 0, 0, 150, 200.5, 0, 0, 1, NOW(), NOW()),
('Planejado', false, 'Soja', 'Semente B', 700, 60, 30.0, 'Adubo Y', '2024-04-01', '2024-10-01', 160, 0, 0, 0, 0, 0, 0, 200, 250.0, 0, 0, 2, NOW(), NOW()),
('Planejado', false, 'Trigo', 'Semente C', 550, 45, 25.0, 'Adubo Z', '2024-05-01', '2024-11-01', 190, 0, 0, 0, 0, 0, 0, 175, 220.0, 0, 0, 3, NOW(), NOW()),
('Planejado', false, 'Algodão', 'Semente D', 650, 70, 40.0, 'Adubo W', '2024-06-01', '2024-12-01', 180, 0, 0, 0, 0, 0, 0, 220, 270.0, 0, 0, 4, NOW(), NOW()),
('Planejado', false, 'Feijão', 'Semente E', 500, 55, 22.5, 'Adubo Q', '2024-07-01', '2024-01-01', 150, 0, 0, 0, 0, 0, 0, 160, 210.5, 0, 0, 5, NOW(), NOW()),
('Planejado', false, 'Arroz', 'Semente F', 600, 65, 35.0, 'Adubo T', '2024-08-01', '2024-02-01', 170, 0, 0, 0, 0, 0, 0, 210, 260.0, 0, 0, 6, NOW(), NOW()),
('Planejado', false, 'Café', 'Semente G', 520, 58, 28.0, 'Adubo U', '2024-09-01', '2024-03-01', 180, 0, 0, 0, 0, 0, 0, 180, 230.0, 0, 0, 7, NOW(), NOW()),
('Planejado', false, 'Milho', 'Semente H', 680, 68, 33.0, 'Adubo V', '2024-10-01', '2024-04-01', 160, 0, 0, 0, 0, 0, 0, 240, 290.0, 0, 0, 8, NOW(), NOW());

INSERT INTO custos (name, unit, quantity, price, category, totalValue, date, note, safraId, status, createdAt, updatedAt) VALUES
('Fertilizante', 'kg', 100, 15.00, 'Insumos', 1500.00, NOW(), 'Fertilizante nitrogenado para solo', 1, false, NOW(), NOW()),
('Pesticida', 'litro', 50, 16.00, 'Insumos', 800.00, NOW(), 'Controle de pragas', 1, false, NOW(), NOW()),
('Transporte', 'viagem', 2, 600.00, 'Logística', 1200.00, NOW(), 'Transporte de grãos', 1, false, NOW(), NOW()),
('Mão de Obra', 'hora', 200, 12.50, 'Serviços', 2500.00, NOW(), 'Trabalhadores rurais', 1, false, NOW(), NOW()),
('Equipamento', 'unidade', 1, 3000.00, 'Capital', 3000.00, NOW(), 'Compra de trator', 1, false, NOW(), NOW()),
('Seguro', 'contrato', 1, 1100.00, 'Seguros', 1100.00, NOW(), 'Seguro da safra', 1, false, NOW(), NOW());

INSERT INTO custos (name, unit, quantity, price, category, totalValue, date, note, safraId, status, type, createdAt, updatedAt) VALUES
('Fertilizante', 'kg', 100, 15.00, 'Insumos', 1500.00, NOW(), 'Fertilizante nitrogenado para solo', 1, false, 'Planejado', NOW(), NOW()),
('Pesticida', 'litro', 50, 16.00, 'Insumos', 800.00, NOW(), 'Controle de pragas', 1, false, 'Planejado', NOW(), NOW()),
('Transporte', 'viagem', 2, 600.00, 'Logística', 1200.00, NOW(), 'Transporte de grãos', 1, false, 'Planejado', NOW(), NOW()),
('Mão de Obra', 'hora', 200, 12.50, 'Serviços', 2500.00, NOW(), 'Trabalhadores rurais', 1, false, 'Planejado', NOW(), NOW()),
('Equipamento', 'unidade', 1, 3000.00, 'Capital', 3000.00, NOW(), 'Compra de trator', 1, false, 'Planejado', NOW(), NOW()),
('Seguro', 'contrato', 1, 1100.00, 'Seguros', 1100.00, NOW(), 'Seguro da safra', 1, false, 'Planejado', NOW(), NOW());

INSERT INTO invites (senderId, reciverId, propertyId,createdAt, updatedAt) VALUES
(2, 1, 5,NOW(), NOW());  -- Exemplo de convite enviado pelo usuário 1 para o usuário 2, referente à propriedade 100



