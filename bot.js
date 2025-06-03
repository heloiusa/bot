require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { salvarAgendamentoNaPlanilha } = require('./sheets');

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

const csvWriter = createCsvWriter({
  path: 'agendamento.csv',
  header: [
    { id: 'nome', title: 'Nome' },
    { id: 'telefone', title: 'Telefone' },
    { id: 'especialidade', title: 'Especialidade' },
    { id: 'dia', title: 'Dia' },
    { id: 'horario', title: 'Horário' }
  ],
  append: true
});

const usuarios = {};

const especialidades = [
  'Psicologia',
  'Psiquiatria',
  'Terapia Ocupacional',
  'Fisioterapia',
  'Fonoaudiologia',
  'Oftalmologia',
  'Clínica Geral'
];

const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const gerarHorarios = () => {
  const horarios = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
  return horarios.sort(() => 0.5 - Math.random()).slice(0, 4);
};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  usuarios[chatId] = {};
  bot.sendMessage(chatId, `Olá, eu sou Ordenare, a assistente virtual do sistema de agendamento de consultas médicas Consulare. Gostaria de começar agora o seu agendamento?`, {
    reply_markup: {
      keyboard: [['Sim', 'Não']],
      one_time_keyboard: true,
      resize_keyboard: true
    }
  });
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!usuarios[chatId]) return;

  const estado = usuarios[chatId];

  if (text === 'Não') {
    bot.sendMessage(chatId, `Certo, quando quiser é só digitar "/start" que irei lhe auxiliar.`);
    return bot.sendMessage(chatId, `Digite /start para recomeçar.`);
  }

  if (text === 'Sim' && !estado.nome) {
    return bot.sendMessage(chatId, `Certo! Para começarmos, digite seu nome completo:`);
  }

  if (!estado.nome) {
    estado.nome = text;
    return bot.sendMessage(chatId, `Agora digite seu número de telefone com DDD:`);
  }

  if (!estado.telefone) {
    estado.telefone = text;
    return bot.sendMessage(chatId, `Qual especialidade deseja agendar?`, {
      reply_markup: {
        keyboard: [...especialidades.map(e => [e]), ['Voltar ao menu anterior']],
        one_time_keyboard: true,
        resize_keyboard: true
      }
    });
  }

  if (!estado.especialidade && especialidades.includes(text)) {
    estado.especialidade = text;
    return bot.sendMessage(chatId, `Selecione o dia da semana para a consulta (${estado.especialidade}):`, {
      reply_markup: {
        keyboard: diasSemana.map(d => [d]),
        one_time_keyboard: true,
        resize_keyboard: true
      }
    });
  }

  if (!estado.dia && diasSemana.includes(text)) {
    estado.dia = text;
    estado.horariosDisponiveis = gerarHorarios();
    return bot.sendMessage(chatId, `Escolha o horário para o atendimento (${estado.dia}):`, {
      reply_markup: {
        keyboard: estado.horariosDisponiveis.map(h => [h]),
        one_time_keyboard: true,
        resize_keyboard: true
      }
    });
  }

  if (!estado.horario && estado.horariosDisponiveis?.includes(text)) {
    estado.horario = text;

    const resumo = `
Vamos confirmar esse agendamento:
👤 Nome: ${estado.nome}
📞 Telefone: ${estado.telefone}
🩺 Especialidade: ${estado.especialidade}
📅 Data e horário: ${estado.dia} às ${estado.horario}
    `;

    return bot.sendMessage(chatId, resumo, {
      reply_markup: {
        keyboard: [['Sim', 'Não']],
        one_time_keyboard: true,
        resize_keyboard: true
      }
    });
  }

  if (text === 'Sim' && estado.horario) {
    await csvWriter.writeRecords([estado]); // CSV
    await salvarAgendamentoNaPlanilha(estado); // Google Sheets

    bot.sendMessage(chatId, `✅ Consulta confirmada:
👤 Nome: ${estado.nome}
📞 Telefone: ${estado.telefone}
🩺 Especialidade: ${estado.especialidade}
📅 Data e horário: ${estado.dia} às ${estado.horario}`);

    delete usuarios[chatId];
  }

  if (text === 'Não' && estado.horario) {
    return bot.sendMessage(chatId, `Qual informação você deseja ajustar?`, {
      reply_markup: {
        keyboard: [['Nome', 'Telefone'], ['Especialidade', 'Consulta'], ['Voltar ao menu principal']],
        one_time_keyboard: true,
        resize_keyboard: true
      }
    });
  }

  if (['Nome', 'Telefone', 'Especialidade', 'Consulta'].includes(text)) {
    delete estado[text.toLowerCase()];
    return bot.sendMessage(chatId, `Por favor, digite novamente o(a) ${text.toLowerCase()}.`);
  }

  if (text === 'Voltar ao menu principal') {
    delete usuarios[chatId];
    return bot.sendMessage(chatId, 'Voltando ao menu principal...', { reply_markup: { remove_keyboard: true } })
      .then(() => bot.sendMessage(chatId, 'Digite /start para começar novamente.'));
  }
});
