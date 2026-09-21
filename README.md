# Edi & Dani — 25 Anos

Landing page comemorativa dos 25 anos de casamento de Edi & Dani, para acompanhar o convite físico do evento (28/11/2026).

## Stack

- HTML + CSS + JavaScript puro (sem framework, sem build step)
- [GSAP](https://gsap.com/) + ScrollTrigger via CDN, para as animações de rolagem
- Google Fonts: Fraunces (títulos), Manrope (corpo), Cormorant Garamond itálico (assinaturas)

## Estrutura de arquivos

```
convite25anos/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── main.js
├── assets/
│   └── img/
│       ├── hero.webp        (1600×2400 — capa)
│       ├── historia-1.webp  (1000×1250 — o encontro/namoro)
│       ├── historia-2.webp  (1000×1250 — o casamento)
│       ├── historia-3.webp  (1000×1250 — nascimento da Lara)
│       ├── historia-4.webp  (1000×1250 — nascimento do Luke)
│       └── final.webp       (1200×1500 — encerramento)
├── scripts/
│   └── gen_placeholders.py  (gera os placeholders acima; não é usado em produção)
└── README.md
```

## Como rodar localmente

Este projeto não precisa de instalação nem build — é HTML/CSS/JS estático. Mas **não abra o `index.html` direto com duplo clique** (`file://`), pois alguns navegadores bloqueiam requisições e módulos em `file://`. Sirva por um servidor local simples:

**Opção 1 — Python (já vem instalado na máquina):**
```bash
cd convite25anos
python -m http.server 8000
```
Depois acesse `http://localhost:8000` no navegador.

**Opção 2 — VS Code:**
Instale a extensão "Live Server" e clique em "Go Live" com o `index.html` aberto.

**Opção 3 — Node (se preferir):**
```bash
npx serve .
```

## Substituindo as fotos placeholder

As imagens em `assets/img/` são placeholders gerados automaticamente (gradiente grafite/vinho com o nome da seção), apenas para manter as proporções corretas durante o desenvolvimento. Para usar as fotos reais:

1. Exporte/converta cada foto para `.webp` nas dimensões indicadas na tabela acima (pode variar levemente, mas mantenha a proporção 2:3 para as fotos de história e capa/final).
2. Substitua o arquivo correspondente em `assets/img/`, mantendo o mesmo nome.
3. Recarregue a página — não é necessário alterar HTML/CSS.

Se quiser gerar novos placeholders (por exemplo, com outras proporções), rode:
```bash
python scripts/gen_placeholders.py
```
(requer a biblioteca Pillow: `pip install Pillow`)

## Sobre o formulário de confirmação de presença

O formulário na seção "Confirme sua presença" já está implementado com:
- Validação client-side (nome, CPF com dígito verificador, RG)
- Feedback acessível de erros (`aria-live`, `aria-invalid`)
- Máscara automática de CPF
- Envio dos dados para uma planilha do Google Sheets, via Google Apps Script (HTTPS)

### Configurando o Google Sheets

O envio usa uma planilha do Google como "banco de dados" simples, através de um Apps Script publicado como Web App. Os dados trafegam por HTTPS diretamente para esse script — nada é exposto em texto puro nem enviado por e-mail/link no código.

1. Crie uma Google Sheet nova. Na primeira linha, adicione os cabeçalhos:
   `Data/Hora | Nome | CPF | RG | Mensagem`
2. Na planilha, vá em **Extensões > Apps Script**.
3. Apague o conteúdo padrão do arquivo `Code.gs` e cole o conteúdo de [`scripts/google-apps-script.gs`](scripts/google-apps-script.gs) deste projeto.
4. Clique em **Implantar > Nova implantação**.
   - Tipo: **Aplicativo da web**
   - Executar como: **Eu** (sua conta)
   - Quem pode acessar: **Qualquer pessoa**
5. Autorize as permissões pedidas (é a sua própria planilha, então é seguro aceitar).
6. Copie a URL do aplicativo da web gerada (algo como `https://script.google.com/macros/s/AKfycb.../exec`).
7. Abra [`js/main.js`](js/main.js) e substitua o valor de `RSVP_ENDPOINT_URL` (no topo do arquivo) por essa URL.

Até que essa URL seja configurada, o formulário continua validando os campos normalmente, mas avisa que o envio ainda não está disponível — ele nunca tenta mandar dados para um endereço inválido.

**Sobre segurança:** como o Apps Script Web App não responde aos cabeçalhos CORS de forma tradicional, o site envia a requisição em modo `no-cors`. Isso significa que não conseguimos ler a resposta do Google (ela chega "opaca" ao navegador) — então a mensagem de sucesso exibida ao convidado assume que o envio funcionou sempre que não há erro de rede. Se quiser confirmação mais rigorosa (por exemplo, checar duplicidade de CPF antes de gravar), o próximo passo seria trocar esse Apps Script por um backend próprio.

## Acessibilidade e performance

- HTML semântico (`header`, `main`, `section`, `footer`, `address`, `dl`)
- Contraste de cor verificado para a paleta definida
- Foco visível em todos os elementos interativos
- `prefers-reduced-motion` respeitado (animações são desativadas/simplificadas)
- Imagens com `loading="lazy"` (exceto a foto de capa, que carrega prioritariamente) e `width`/`height` definidos para evitar layout shift
- Fallback com `IntersectionObserver`/`requestAnimationFrame` caso GSAP não carregue
