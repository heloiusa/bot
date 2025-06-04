# 🩺 Ordenare - Chatbot de Agendamento Médico via Telegram
Ordenare é um chatbot desenvolvido com Node.js para facilitar o agendamento de consultas médicas via Telegram, integrado ao sistema Consulare. A aplicação guia o usuário por um fluxo simples e eficiente de perguntas, armazena os dados localmente em um arquivo .csv e posteriormente envia essas informações para uma planilha do Google Sheets, centralizando os agendamentos.

## Funcionalidades
Interação automática com o usuário via Telegram

Coleta de dados: nome, telefone, especialidade, dia e horário da consulta

Armazenamento temporário em agendamento.csv

Integração com Google Sheets via API

Processo automatizado para transferência dos dados do .csv para a planilha

Interface intuitiva e responsiva com teclados personalizados

---

## Tecnologias Utilizadas
- [Node.js](https://nodejs.org/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [`node-telegram-bot-api`](https://github.com/yagop/node-telegram-bot-api)
- [`csv-writer`](https://www.npmjs.com/package/csv-writer)
- [`googleapis`](https://www.npmjs.com/package/googleapis)
- [Google Cloud Functions ou Google Apps Script](https://cloud.google.com/functions)

---

## Estrutura do Projeto
ordenare-chatbot/
├── agendamento.csv # Dados coletados das interações

├── bot.js # Lógica principal do chatbot

├── sheets.js # Integração com Google Sheets

├── .env # Token do bot (não versionado)

├── package.json # Dependências e scripts

└── README.md # Documentação do projeto

---

## ▶️ Como Executar

1. **Clone o repositório:**
```bash
git clone https://github.com/heloiusa/ordenare-chatbot.git
cd bot
```
2. **Instale as Dependências**
```bash
npm install
```
3. **Configure o arquivo .env**
TELEGRAM_TOKEN=seu_token_do_telegram
GOOGLE_SERVICE_ACCOUNT=suas_credenciais_google
---
