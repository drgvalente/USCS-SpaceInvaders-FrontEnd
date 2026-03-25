//=====================================
// CONFIGURAÇÃO DO CANVAS
//=====================================
let canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");

//=====================================
// VARIÁVEIS GLOBAIS DO JOGO
//=====================================
let pontos = 0;
let jogoAtivo = true;
let venceu = false;

//=====================================
// A NAVE (PLAYER)
//=====================================
let naveX = 275;
let naveY = 340;
let naveLargure = 50;
let naveAltura = 30;
let naveVelocidade = 5;

//=====================================
// CONTROLES DO TECLADO
//=====================================

let teclaEsquerda = false;
let teclaDireita = false;

//=====================================
// CONFIGURAÇÕES DOS BLOCOS
//=====================================

const COLUNAS = 8;
const LINHAS = 4;
const BLOCO_LARGURA = 50;
const BLOCO_ALTURA = 25;
const ESPACO = 10;

// MATRIZ DE BLOCOS
//Cada posição guarda: { x, y, ativo }
let blocos = [];

//=====================================
// CONFIGURAÇÃO DOS TIROS
//=====================================
const MAX_TIROS = 3;
const TIRO_VELOCIDADE = 8;
const TIRO_RAIO = 6;

// ARRAY DE TIROS
// Cada posição guarda: {x, y, ativo}
let tiros = [];

//=====================================
// COOLDOWN
//=====================================
let cooldownAtivo = false;
const COOLDOWN_TEMPO = 300;

//=====================================
// FUNÇÃO CRIAR MATRIZ DE BLOCOS 
//=====================================
function criarBlocos()
{
    // Limpa o array
    blocos = [];

    // Calcula posição inicial para centralizar
    let inicioX = (canvas.width - (COLUNAS * (BLOCO_LARGURA + ESPACO))) / 2;
    let inicioY = 50;

    // Percorre as LINHAS
    for (let linha = 0; linha < LINHAS; linha++) 
    {
        // Cria um array vazio para esta linha
        blocos[linha] = [];

        // Percorre as COLUNAS
        for (let coluna = 0; coluna < COLUNAS; coluna++)
        {
            // Calcula a posição x e y desse bloco
            let posX = inicioX + (coluna * (BLOCO_LARGURA + ESPACO));
            let posY = inicioY + (linha * (BLOCO_ALTURA + ESPACO));

            // Cria o bloco e guarda na matriz
            blocos[linha][coluna] =  {
                x: posX,
                y: posY,
                ativo: true
            };
        }
    }
}

//=====================================
// FUNÇÃO: CRIAR ARRAY DE TIROS
//=====================================
function criarTiros() 
{
    // Limpa o array
    tiros = [];

    // Cria 3 tiros (todos começam inativos)
    for (let i = 0; i < MAX_TIROS; i++)
    {
        tiros[i] = {
            x: 0,
            y: 0,
            ativo: false
        };
    }
}
