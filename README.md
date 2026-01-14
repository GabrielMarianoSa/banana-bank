# Banana Bank 🍌

Aplicativo bancário fictício desenvolvido como projeto de estudo, com frontend em React Native (Expo) e backend em Node.js.

O objetivo é simular fluxos comuns de um app financeiro, como login, visualização de saldo e criação/confirmação de pagamentos, utilizando uma API simples e banco de dados local.

---

## Visão geral

O Banana Bank é um app mobile e web que permite ao usuário:

- Fazer login (modo demonstração)
- Visualizar saldo
- Realizar operações como pagamentos/transferências
- Consultar transações

O projeto foi pensado para praticar a comunicação entre frontend e backend, persistência de dados e organização básica de um sistema full-stack.

---

## Funcionalidades

- Login em modo demo (credenciais de teste)
- Armazenamento local do usuário (AsyncStorage)
- Visualização de saldo
- Criação de pagamentos via API
- Confirmação de pagamentos (paid / failed)
- Histórico de transações (local e/ou backend)
- Modo “demo” automático quando o backend não está disponível
- Versão mobile (Android/iOS) e web

---

## Tecnologias

### Frontend

- Expo
- React Native
- TypeScript
- Expo Router / React Navigation
- AsyncStorage

### Backend

- Node.js
- Express
- TypeScript

### Banco de dados

- Prisma ORM
- SQLite (ambiente de desenvolvimento)

---

## Arquitetura

O projeto é dividido em duas partes principais:

/app → frontend (mobile + web)
/backend → API REST

markdown
Copy code

No frontend:

- `app/` → telas (login, splash, home, transferir, etc.)
- `components/` → componentes reutilizáveis
- `services/` → comunicação com API, fake API e armazenamento local

No backend:

- `index.ts` → inicialização do servidor
- `payments.ts` → rotas de pagamentos
- `prisma/schema.prisma` → modelos do banco

---

## Fluxos principais

### Splash

Tela inicial com animação simples e redirecionamento automático para login.

### Login

- Usuário informa email e senha
- Validação feita via `fakeLogin`
- Usuário é salvo localmente
- Redirecionamento para a tela principal

Credenciais de teste:

email: teste@banana.com
senha: 123456

yaml
Copy code

### Pagamentos

- App envia requisição para a API (`POST /payments`)
- Backend valida os dados e cria o pagamento com status `pending`
- Pagamento pode ser confirmado como `paid` ou `failed`
- Transações são exibidas no app

### Modo demo

Quando o backend não está disponível, o app funciona em modo demonstração, salvando os dados localmente.

---

## API (endpoints)

### Criar pagamento

POST /payments

css
Copy code

Body:

```json
{
  "amount": 100,
  "method": "PIX"
}
Buscar pagamento
bash
Copy code
GET /payments/:id
Confirmar pagamento
bash
Copy code
POST /payments/:id/confirm
Body:

json
Copy code
{
  "status": "paid"
}
Como rodar o projeto
Backend
bash
Copy code
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
A API ficará disponível em:

arduino
Copy code
http://localhost:4000
Frontend (mobile / web)
bash
Copy code
npm install
npx expo start
Se o Expo Go não conectar via LAN:

bash
Copy code
npx expo start --tunnel
Configuração da URL do backend
O app usa a variável:

nginx
Copy code
EXPO_PUBLIC_API_URL
Casos comuns:

Web / iOS simulator:


Copy code
http://localhost:4000
Android emulator:


Copy code
http://10.0.2.2:4000
Celular físico:
Use o IP da sua máquina na rede local, por exemplo:


Copy code
http://192.168.0.10:4000
Crie um arquivo .env baseado em .env.example.

Após alterar:

bash
Copy code
npx expo start -c

Aviso
Este projeto é educacional e não foi desenvolvido para uso em produção ou para manipular dados reais.

```
