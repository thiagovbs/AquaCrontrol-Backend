💧 AquaControl - Sistema de Gestão de Água
Sistema completo para gestão de leituras de hidrômetros, faturamento e controle de unidades.

🏗️ Arquitetura e Deploy
O projeto está dividido em três componentes principais, cada um operando em um ambiente específico para garantir escalabilidade e gratuidade no deploy.

🔙 1. Backend (API REST)
Responsável pela lógica de negócio, autenticação JWT e comunicação com o banco de dados.

Tecnologias: Node.js, Express, Prisma ORM.

Banco de Dados: PostgreSQL (Hospedado no Neon.tech).

Onde está sendo executado: Render

Comandos de Build:

Build Command: npm install && npx prisma generate && npx prisma migrate deploy

Start Command: npm start

Variáveis de Ambiente Necessárias:

DATABASE_URL: String de conexão do Neon.

JWT_SECRET: Chave secreta para tokens.
