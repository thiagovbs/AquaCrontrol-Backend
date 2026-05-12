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

DATABASE_URL: String de conexão do Neon(base PostgreSQL).

JWT_SECRET: Chave secreta para tokens.

🛠️ Manutenção do Banco (Prisma)
Sempre que houver alteração no arquivo schema.prisma:

Gere a migração local: npx prisma migrate dev --name nome_da_mudanca.

Faça o push dos arquivos gerados em prisma/migrations.

O Render aplicará automaticamente as mudanças no banco de produção via comando migrate deploy.

🚀 Como Rodar Localmente
  1. Clonar este repositório!
  2. Configurar o Backend:
  3. Entre em cd backend.
     
       a) Crie um arquivo .env com sua DATABASE_URL.
     
  5. Rode npm install.
  6. Rode npx prisma migrate dev para sincronizar o banco local.
  7. Inicie com npm run dev.
