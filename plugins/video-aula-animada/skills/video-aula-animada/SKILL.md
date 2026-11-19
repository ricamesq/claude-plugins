---
name: video-aula-animada
description: Monta uma vídeo-aula curta e animada (1 a 3 minutos, 16:9) a partir de um roteiro em JSON, com imagens, rótulos que aparecem na hora certa, contas linha a linha, gráfico de barras, cartões de conceitos, legenda e narração opcional. Usa o Remotion, gratuito para estudantes. Use quando o aluno pedir para fazer um vídeo explicativo de um conceito (fisiologia, farmacologia, bioquímica, saúde coletiva), transformar um resumo em vídeo, ou adaptar o exemplo do débito cardíaco.
---

# Vídeo-aula animada

O modelo em `modelo/` já vem com um exemplo pronto: o débito cardíaco. O aluno troca o roteiro e as imagens, e o
vídeo sai com o mesmo padrão visual.

## Preparar o computador (uma vez)

1. Instalar o Node.js LTS (nodejs.org).
2. Copiar a pasta `modelo/` para um lugar de trabalho, abrir um terminal dentro dela e rodar `npm install`.
3. Conferir com `npm run estudio`: abre o Remotion Studio no navegador com o exemplo, para ver e ajustar ao vivo.
4. Para gerar o arquivo: `npm run video`. O vídeo sai em `saida/aula.mp4`.

## Como montar uma aula nova

Trabalhe com o aluno nesta ordem, sem pular etapas:

1. **Conceito e fonte.** Peça o conceito e o livro ou artigo de referência. Todo número do vídeo vem dessa fonte,
   e não da memória do modelo de IA. Refaça as contas antes de colocar no roteiro.
2. **Roteiro falado.** Escreva o texto de cada cena como será dito em voz alta, em frases curtas. Cinco a nove
   cenas dão de 1 a 2 minutos. Um conceito por cena.
3. **Imagens.** Coloque em `public/`. Use desenho próprio, imagem com licença aberta (citar o autor) ou imagem
   gerada por IA (declarar no fecho, por exemplo "Ilustração gerada por IA"). Imagem de IA erra anatomia com
   frequência: confira contra o livro antes de usar e descarte a que estiver errada.
4. **Preencher `public/roteiro.json`** com os tipos de cena abaixo.
5. **Conferir no Studio** (`npm run estudio`) se cada rótulo aponta para a estrutura certa e se nada fica
   escondido atrás da legenda.
6. **Gerar o vídeo** (`npm run video`).

## Tipos de cena

Cada cena tem `tipo`, `duracao` (em segundos) e `legenda` (o texto falado). Os elementos entram no segundo
indicado em `em`, contado do início da cena.

| tipo | serve para | campos |
|---|---|---|
| `imagem` | mostrar a estrutura real | `imagem`, `titulo`, `subtitulo`, `pulso` (batimentos por minuto, faz a imagem pulsar), `rotulos` [`em`, `texto`, `x`, `y`], `destaque` [`em`, `texto`, `subtexto`] |
| `conta` | fórmula e cálculo passo a passo | `titulo`, `linhas` [`em`, `texto`, `resultado`: true pinta de âmbar] |
| `barras` | comparar valores | `titulo`, `unidade`, `barras` [`em`, `rotulo`, `valor`] |
| `cartoes` | dois a quatro conceitos lado a lado | `titulo`, `itens` [`em`, `nome`, `descricao`] |
| `fecho` | créditos e referência | `linhas` [`em`, `texto`] |

**Rótulos:** `x` e `y` são frações da imagem original (0 a 1, a partir do canto superior esquerdo). Para achar o
ponto, abra a imagem, meça a posição em pixels e divida pela largura e pela altura dela. O modelo recalcula o
ponto para a tela, então a imagem pode ter qualquer proporção. Imagem larga preenche a tela e perde um pouco das
bordas; imagem vertical ou quadrada aparece inteira, com fundo escuro dos lados. Confira no Studio. O texto
do rótulo aparece à esquerda, então deixe o lado esquerdo da imagem livre.

**Barras:** pelo menos uma barra com valor maior que zero. Sem isso, o modelo para com uma mensagem de erro.

**Cores:** uma cor para cada função, a mesma no vídeo todo (âmbar para resultado, verde-azulado para rótulo,
vermelho para a barra). Para trocar, acrescente `"cores": {"resultado": "#..."}` no roteiro.

## Narração (opcional)

- **Sem narração:** a legenda conduz o vídeo. Com só o campo `legenda`, o texto é dividido em trechos iguais
  ao longo da cena. Ajuste `duracao` para dar tempo de ler (cerca de 3 palavras por segundo).
- **Com a própria voz:** grave a leitura do roteiro inteiro no celular, salve como `public/narracao.mp3` e
  acrescente `"narracao": "narracao.mp3"` no roteiro. Meça no áudio quanto dura cada cena e copie para `duracao`.
  A divisão automática da legenda não acompanha pausas nem mudanças de ritmo. Para a legenda andar junto com a
  voz, troque `legenda` por `legenda_trechos`: `[{"em": 0, "texto": "O coração bate"}, {"em": 1.8, "texto":
  "cerca de setenta vezes por minuto"}]`, com o segundo em que cada trecho começa a ser falado. Faça o mesmo com
  os `em` dos rótulos e das linhas.
- Voz sintética ou clonada, só a própria e com o serviço escolhido pelo aluno. Nunca a voz de outra pessoa.

## Regras que não mudam

- **Nenhum dado nem imagem de paciente.** Isso vale também para foto de exame, prontuário ou caso real, mesmo sem
  nome.
- **Todo número tem fonte.** A referência vai no fecho, no formato da ABNT.
- **Imagem gerada por IA vem declarada** no fecho.
- **O texto descreve o conceito,** sem frase de efeito e sem exagero.
- **Licença:** o Remotion é gratuito para pessoa física e para empresa de até três pessoas. Acima disso, a
  empresa precisa da licença paga (remotion.dev/docs/license/pricing).
- **Rede:** as fontes Rubik e Public Sans são baixadas do Google Fonts na hora de gerar o vídeo, então gere com
  internet.

## Se der erro

- `npm` não encontrado: o Node.js não foi instalado ou o terminal foi aberto antes da instalação. Feche e abra
  de novo.
- A tela fica preta numa cena: o nome da imagem no roteiro está diferente do arquivo em `public/`.
- JSON inválido: falta vírgula entre as cenas, ou há vírgula sobrando depois da última. O Studio mostra a linha.
