/**
 * Script para o Google Apps Script — recebe as confirmações de presença
 * do site (nome, e-mail, CPF, RG, mensagem), grava como uma nova linha na
 * planilha e manda um e-mail de confirmação para o convidado.
 *
 * Também inclui uma função separada (enviarLembretes) para mandar um
 * lembrete por e-mail para todo mundo que já confirmou — útil mais perto
 * da data do evento.
 *
 * COMO USAR (veja também o passo a passo no README.md):
 * 1. Crie uma Google Sheet nova. Na primeira linha, adicione os cabeçalhos:
 *    Data/Hora | Nome | E-mail | CPF | RG | Mensagem
 * 2. Na planilha, vá em Extensões > Apps Script.
 * 3. Apague o conteúdo padrão do arquivo Code.gs e cole todo este arquivo.
 * 4. Clique em "Implantar" > "Nova implantação".
 *    - Tipo: "Aplicativo da web"
 *    - Executar como: "Eu" (sua conta)
 *    - Quem pode acessar: "Qualquer pessoa" (obrigatório — sem isso os
 *      convidados recebem erro 401 ao confirmar presença)
 * 5. Autorize as permissões pedidas (é a sua própria planilha/conta).
 * 6. Copie a URL do aplicativo da web gerada.
 * 7. Cole essa URL na constante RSVP_ENDPOINT_URL em js/main.js.
 *
 * IMPORTANTE: sempre que você editar este script depois de já ter feito a
 * implantação (por exemplo, para mudar o texto do e-mail), é preciso ir em
 * "Implantar > Gerenciar implantações", editar (ícone de lápis) a
 * implantação existente e escolher "Nova versão" antes de salvar — só
 * salvar o script (Ctrl+S) não atualiza a versão que o site já está usando.
 * A URL continua a mesma, não precisa mexer no site de novo.
 */

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    new Date(),
    data.nome || "",
    data.email || "",
    data.cpf || "",
    data.rg || "",
    data.mensagem || "",
  ]);

  if (data.email) {
    try {
      enviarEmailConfirmacao(data.nome, data.email);
    } catch (err) {
      // Mesmo se o e-mail falhar, a confirmação já foi gravada na planilha.
      console.error("Falha ao enviar e-mail de confirmacao: " + err);
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function enviarEmailConfirmacao(nome, email) {
  var primeiroNome = (nome || "").trim().split(" ")[0] || "";
  var assunto = "Presença confirmada — 25 anos de Edi & Dani 💛";
  var corpo =
    "Olá" + (primeiroNome ? ", " + primeiroNome : "") + "!\n\n" +
    "Recebemos a confirmação da sua presença na nossa festa de 25 anos de casados. " +
    "Que alegria saber que você vai estar com a gente nesse dia!\n\n" +
    "Sábado, 28 de novembro de 2026\n" +
    "18h — Recepção\n" +
    "18h30 — Cerimônia\n" +
    "19h30 — Coquetel e confraternização\n\n" +
    "Mesanino Gourmet — Sorocaba\n" +
    "R. Eulália Silva, 454 - Jardim Faculdade, Sorocaba - SP, 18031-000\n\n" +
    "Traje sugerido: esporte fino.\n\n" +
    "Qualquer dúvida, é só chamar a gente:\n" +
    "Edi — (15) 99122-0741\n" +
    "Dani — (15) 99844-3041\n\n" +
    "Com carinho,\n" +
    "Edi & Dani";

  MailApp.sendEmail(email, assunto, corpo);
}

/**
 * Manda um e-mail de lembrete para todos os convidados que já confirmaram
 * presença. Rode esta função manualmente pelo editor do Apps Script
 * (selecione "enviarLembretes" no menu de funções e clique em "Executar")
 * quando quiser — por exemplo, na semana do evento.
 *
 * Assume a mesma ordem de colunas do cabeçalho:
 * Data/Hora | Nome | E-mail | CPF | RG | Mensagem
 */
function enviarLembretes() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var linhas = sheet.getDataRange().getValues();

  // Pula a primeira linha (cabeçalho).
  for (var i = 1; i < linhas.length; i++) {
    var nome = linhas[i][1];
    var email = linhas[i][2];
    if (!email) continue;

    var primeiroNome = (nome || "").trim().split(" ")[0] || "";
    var assunto = "Está chegando a hora! Festa de 25 anos de Edi & Dani 💛";
    var corpo =
      "Olá" + (primeiroNome ? ", " + primeiroNome : "") + "!\n\n" +
      "Faltam poucos dias para a nossa festa de 25 anos de casados, e queremos " +
      "muito ter você com a gente!\n\n" +
      "Sábado, 28 de novembro de 2026\n" +
      "18h — Recepção\n" +
      "18h30 — Cerimônia\n" +
      "19h30 — Coquetel e confraternização\n\n" +
      "Mesanino Gourmet — Sorocaba\n" +
      "R. Eulália Silva, 454 - Jardim Faculdade, Sorocaba - SP, 18031-000\n\n" +
      "Traje sugerido: esporte fino.\n" +
      "O local tem estacionamento próprio (pago).\n\n" +
      "Até lá!\n\n" +
      "Com carinho,\n" +
      "Edi & Dani";

    MailApp.sendEmail(email, assunto, corpo);
  }
}
