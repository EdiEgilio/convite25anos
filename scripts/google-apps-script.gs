/**
 * Script para o Google Apps Script — recebe as confirmações de presença
 * do site (nome, CPF, RG, mensagem) e grava como uma nova linha na planilha.
 *
 * COMO USAR (veja também o passo a passo no README.md):
 * 1. Crie uma Google Sheet nova. Na primeira linha, adicione os cabeçalhos:
 *    Data/Hora | Nome | CPF | RG | Mensagem
 * 2. Na planilha, vá em Extensões > Apps Script.
 * 3. Apague o conteúdo padrão do arquivo Code.gs e cole todo este arquivo.
 * 4. Clique em "Implantar" > "Nova implantação".
 *    - Tipo: "Aplicativo da web"
 *    - Executar como: "Eu" (sua conta)
 *    - Quem pode acessar: "Qualquer pessoa"
 * 5. Autorize as permissões pedidas (é a sua própria planilha).
 * 6. Copie a URL do aplicativo da web gerada.
 * 7. Cole essa URL na constante RSVP_ENDPOINT_URL em js/main.js.
 */

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    new Date(),
    data.nome || "",
    data.cpf || "",
    data.rg || "",
    data.mensagem || "",
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}
