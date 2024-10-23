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
('Planejado', false, 'Milho', 'Semente A', '500', 50, 20.5, 'Adubo X', '2024-03-01', '2024-09-01', 180, 200, 15.5, 3.2, 1.5, 0.8, 0.9, 150, 200.5, 180.3, 90.5, 1, NOW(), NOW()),
('Realizado', true, 'Soja', 'Semente B', '700', 60, 30.0, 'Adubo Y', '2024-02-01', '2024-08-01', 160, 180, 18.0, 2.0, 1.8, 1.0, 1.2, 200, 250.0, 230.4, 92.1, 2, NOW(), NOW()),
('Planejado', false, 'Trigo', 'Semente C', '550', 45, 25.0, 'Adubo Z', '2024-04-10', '2024-10-10', 190, 210, 12.5, 2.5, 1.2, 0.7, 0.6, 175, 220.0, 190.0, 86.4, 3, NOW(), NOW()),
('Realizado', true, 'Algodão', 'Semente D', '650', 70, 40.0, 'Adubo W', '2024-05-15', '2024-11-15', 180, 250, 14.0, 3.0, 2.0, 1.1, 1.3, 220, 270.0, 240.6, 89.2, 4, NOW(), NOW()),
('Planejado', false, 'Feijão', 'Semente E', '500', 55, 22.5, 'Adubo Q', '2024-06-01', '2024-12-01', 150, 180, 10.2, 1.8, 1.0, 0.5, 0.4, 160, 210.5, 190.0, 90.0, 5, NOW(), NOW()),
('Realizado', true, 'Arroz', 'Semente F', '600', 65, 35.0, 'Adubo T', '2024-07-01', '2025-01-01', 170, 240, 16.0, 2.2, 1.4, 1.0, 1.1, 210, 260.0, 250.0, 95.8, 6, NOW(), NOW());
('Planejado', false, 'Café', 'Semente G', '520', 58, 28.0, 'Adubo U', '2024-08-01', '2025-02-01', 180, 220, 14.8, 2.8, 1.6, 0.9, 1.0, 180, 230.0, 210.0, 91.0, 7, NOW(), NOW()),
('Realizado', true, 'Milho', 'Semente H', '680', 68, 33.0, 'Adubo V', '2024-09-01', '2025-03-01', 160, 260, 13.0, 3.1, 1.9, 1.2, 1.4, 240, 290.0, 270.5, 93.2, 8, NOW(), NOW());
