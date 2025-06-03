const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, 'credentials.json'), 
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheetId = '1WvzcD_tjbKgC2PYoxAfdaI-hHikN8GEYEUlN-N9kJSI';

async function salvarAgendamentoNaPlanilha(agendamento) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const valores = [
    [
      agendamento.nome,
      agendamento.telefone,
      agendamento.especialidade,
      agendamento.dia,
      agendamento.horario,
    ]
  ];

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'agendamentos',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: valores,
      },
    });

    console.log('✅ Agendamento salvo na planilha com sucesso.');
  } catch (error) {
    console.error('❌ Erro ao salvar na planilha:', error);
  }
}

module.exports = { salvarAgendamentoNaPlanilha };
