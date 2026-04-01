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

//=====================================
// FUNÇÃO: ATIRAR
// Procura um tiro disponível e dispara
//=====================================

function atirar()
{
    // Se está em cooldown, não faz nada:
    if (cooldownAtivo)
    {
        return;
    }

    // Se o jogo não está ativo, não faz nada:
    if (!jogoAtivo)
    {
        return
    }

    // Procura um tiro que NÃO está ativo (disponível)
    for (let i = 0; i < tiros.length; i++)
    {
        if (tiros[i].ativo == false)
        {
            // Encontrou um tiro disponível
            // Posiciona o tiro acima da nave:
            tiros[i].x = naveX + (naveLargure / 2);
            tiros[i].y = naveY;
            tiros[i].ativo = true;

            // Ativa o cooldown:
            cooldownAtivo = true;

            // Desativa o cooldown depois de um tempo:
            setTimeout(function()
            {
                cooldownAtivo = false;
            }, COOLDOWN_TEMPO);

            // Sai do loop (só dispara um tiro por vez)
            return;
        }
    }
}

//=====================================
// FUNÇÃO MOVER
// Move a nave e os tiros
//=====================================
function mover()
{
    // --- MOVE A NAVE ---

    // Se está pressionando ESQUERDA
    if (teclaEsquerda == true)
    {
        naveX = naveX - naveVelocidade;
    }

    // Se está pressionando DIREITA
    if (teclaDireita == true)
    {
        naveX = naveX + naveVelocidade;
    }

    // Impede a nave de sair da tela (esquerda)
    if (naveX < 0)
    {
        naveX = 0;
    }

    // Impede a nave de sair da tela (direita)
    if (naveX > canvas.width - naveLargure)
    {
        naveX = canvas.width - naveLargure;
    }

    // --- MOVE OS TIROS ---
    for (let i = 0; i < tiros.length; i++)
    {
        // Só move se o tiro estiver ativo
        if (tiros[i].ativo == true)
        {
            // Move para cima (diminui Y)
            tiros[i].y = tiros[i].y - TIRO_VELOCIDADE;

            // Se saiu da tela, desativa o tiro
            if (tiros[i].y < 0)
            {
                tiros[i].ativo = false;
            }
        }
    }
}

//=====================================
// FUNÇÃO: TESTAR COLISÃO
// Verifica se um tiro colidiu com um bloco
// Retorna TRUE se colidiu, FALSE se não colidiu
//=====================================
function testarColisao(tiro, bloco)
{
    // Pega o centro do tiro (é uma bolinha)
    let tiroX = tiro.x;
    let tiroY = tiro.y;

    // Pega os limites do bloco
    let blocoEsquerda = bloco.x;
    let blocoDireita = bloco.x + BLOCO_LARGURA;
    let blocoCima = bloco.y;
    let blocoBaixo = bloco.y + BLOCO_ALTURA;

    // Verifica se o centro do tiro está dentro do bloco
    // Assim fica mais fácil de calcular e entender
    if (tiroX > blocoEsquerda && tiroX < blocoDireita)
    {
        if (tiroY > blocoCima && tiroY < blocoBaixo)
        {
            return true;
        }
    }

    return false;
}

//=====================================
// FUNÇÃO: DESTRUIR BLOCO
// Marca o bloco como inativo
//=====================================
function destruirBloco(linha, coluna)
{
    blocos[linha][coluna].ativo = false;
}

//=====================================
// FUNÇÃO: SOMAR PONTOS
// Adiciona pontos e atualiza a tela
//=====================================
function somarPontos(quantidade)
{
    pontos = pontos + quantidade;
    document.getElementById('pontos').textContent = pontos;
}

//=====================================
// FUNÇÃO: VERIFICAR COLISÕES
// Percorre todos os blocos e todos os tiros
//=====================================
function verificarColisoes()
{
    // Percorre todos os TIROS
    for (let t = 0; t < tiros.length; t++)
    {
        // Só faz o teste se o tiro estiver ativo
        if (tiros[t].ativo == false)
        {
            continue; // Pula para o próximo tiro
        }

        // Percorre todas as LINHAS de BLOCOS
        for (let linha = 0; linha < blocos.length; linha++)
        {
            // Percorre todas as COLUNAS dessa linha
            for ()
            {
                
            }
        }
    }
}










