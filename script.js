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
            for (let coluna = 0; coluna < blocos[linha].length; coluna++)
            {
                // Pega o bloco atual
                let bloco = blocos[linha][coluna];

                // Só faz a verificação se o bloco estiver ativo
                if (bloco.ativo == false)
                {
                    continue; // Pula para o próximo bloco
                }

                // Testa a colisão
                if ( testarColisao(tiros[t], bloco) )
                {
                    // COLIDIU!!!

                    // Destroi o bloco
                    destruirBloco(linha, coluna);

                    // Desativa o tiro
                    tiros[t].ativo = false;

                    // Soma os pontos
                    somarPontos(10);
                }
            }
        }
    }
}

//=====================================
// FUNÇÃO: CONTAR BLOCOS ATIVOS
//  Retorna quantos blocos ainda existem
//=====================================
function contarBlocosAtivos()
{
    let contador = 0;

    for (let linha = 0; linha < blocos.length; linha++)
    {
        for (let coluna = 0; coluna < blocos[linha].length; coluna++)
        {
            if (blocos[linha][coluna].ativo == true)
            {
                //contador = contador + 1;
                //contador += 1;
                contador++;
            }
        }
    }
    return contador;
}

//=====================================
// FUNÇÃO: VERIFICAR VITÓRIA
//=====================================
function verificarVitoria()
{
    let blocosRestantes = contarBlocosAtivos();

    if (blocosRestantes == 0)
    {
        venceu = true;
        jogoAtivo = false; 
    }
}

//=====================================
// FUNÇÃO: REINICIAR JOGO
//=====================================
function reiniciarJogo()
{
    pontos = 0;
    jogoAtivo = true;
    venceu = false;
    naveX = 275;

    document.getElementById('pontos').textContent = '0';

    criarBlocos();
    criarTiros();
}

//=====================================
// FUNÇÃO: DESENHAR TELA DE VITÓRIA
//=====================================
function desenharTelaVitoria()
{
    // Fundo semi-transparente
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Texto de vitória
    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 48px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('VITÓRIA!!', canvas.width / 2, 200);

    // Pontuação

    ctx.fillStyle = '#ffcc00';
    ctx.font = '24px Courier New';
    ctx.fillText('Pontos: ' + pontos, canvas.width / 2, 260);

    // Instruções para reiniciar
    ctx.fillStyle = '88ffcc';
    ctx.font = '18px Courier New';
    ctx.fillText('Clique para jogar novamente', canvas.width / 2, 320);
}

//=====================================
// FUNÇÃO: DESENHAR NAVE
//=====================================
function desenharNave()
{
    ctx.fillStyle = '#00ff88';

    // Desenha um triângulo (nave)
    ctx.beginPath();
    ctx.moveTo(naveX + naveLargure / 2, naveY);
    ctx.lineTo(naveX, naveY + naveAltura);
    ctx.lineTo(naveX + naveLargure, naveY + naveAltura);
    ctx.closePath();
    ctx.fill();

    // Desenha o corpo da nave
    ctx.fillStyle = '#00cc66';
    ctx.fillRect(naveX + 10, naveY + 10, naveLargure - 20, naveAltura - 5);
}

//=====================================
// FUNÇÃO: DESENHAR BLOCOS
//=====================================
function desenharBlocos()
{
    let cores = ['#ffd93d', '#ff6b6b', '#6bcb77', '#4d96ff'];

    for (let linha = 0; linha < blocos.length; linha++)
    {
        for (let coluna = 0; coluna < blocos[linha].length; coluna++)
        {
            let bloco = blocos[linha][coluna];

            if (bloco.ativo == true)
            {
                // Cor do bloco (muda por linha)
                ctx.fillStyle = cores[linha];
                ctx.fillRect(bloco.x, bloco.y, BLOCO_LARGURA, BLOCO_ALTURA);
                // Borda branca
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1;
                ctx.strokeRect(bloco.x, bloco.y, BLOCO_LARGURA, BLOCO_ALTURA);
            }
        }
    }
}


//=====================================
// FUNÇÃO: DESENHAR TIROS (BOLINHAS)
//=====================================
function desenharTiros()
{
    ctx.fillStyle = '#0ff';
    ctx.shadowColor = '#0ff';
    ctx.shadowBlur = 10;

    for (let i = 0; i < tiros.length; i++)
    {
        if (tiros[i].ativo == true)
        {
            // Desenha um círculo
            ctx.beginPath();
            ctx.arc(tiros[i].x, tiros[i].y, TIRO_RAIO, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
    ctx.shadowBlur = 0;
}

//=====================================
// FUNÇÃO: ATUALIZAR DEBUG
//=====================================
function atualizarDebug()
{
    let blocosAtivos = contarBlocosAtivos();

    let tirosAtivos = 0;
    let tirosDisponiveis = 0;

    for (let i = 0; i < tiros.length; i++)
    {
        if (tiros[i].ativo == true)
        {
            tirosAtivos = tirosAtivos + 1;
        }
        else
        {
            tirosDisponiveis = tirosDisponiveis + 1;
        }
    }
    document.getElementById("debugBlocos").textContent = blocosAtivos;
    document.getElementById("debugTirosAtivos").textContent = tirosDisponiveis;

    if (cooldownAtivo)
    {
        document.getElementById("debugCooldown").textContent = 'Aguarde...';
    }
    else
    {
        document.getElementById("debugCooldown").textContent = 'Pronto!';
    }
}

//=====================================
// FUNÇÃO: DESENHAR JOGO
//=====================================
function desenhar()
{
    // Limpa a tela
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenha os elementos do jogo
    desenharBlocos();
    desenharTiros();
    desenharNave();

    // Se venceu, mostra a tela de vitória
    if (venceu)
    {
        desenharTelaVitoria();
    }
}

//=====================================
// FUNÇÃO: LOOP DO JOGO
// Roda 60 vezes por segundo
//=====================================
function loopDoJogo()
{
    // Só atualiza se o jogo está ativo
    if (jogoAtivo)
    {
        mover();
        verificarColisoes();
        verificarVitoria();
    }

    desenhar();
    atualizarDebug();

    // Chama esta função novamente (cria o loop do jogo)
    requestAnimationFrame(loopDoJogo);
}

//=====================================
// EVENTOS DO TECLADO
//=====================================
// Quando pressiona uma tecla
document.addEventListener('keydown', function(evento){
    if (evento.key == 'ArrowLeft' || evento.key == 'a' || evento.key == 'A')
    {
        teclaEsquerda = true;
    }
    if (evento.key == 'ArrowRight' || evento.key == 'd' || evento.key == 'D')
    {
        teclaDireita = true;
    }
    if (evento.key == '')
    {
        evento.preventDefault();
        atirar();
    }
});

// Quando SOLTA uma tecla
document.addEventListener('keyup', function(evento){
    if (evento.key == 'ArrowLeft' || evento.key == 'a' || evento.key == 'A')
    {
        teclaEsquerda = false;
    }
    if (evento.key == 'ArrowRight' || evento.key == 'd' || evento.key == 'D')
    {
        teclaDireita = false;
    }
});

//=====================================
// EVENTOS DO MOUSE
//=====================================
canvas.addEventListener('click', function(evento){
    // Se venceu, reinicia o jogo
    if (venceu)
    {
        reiniciarJogo();
        return;
    }
    // Caso contrário, atira
    atirar();
});

//=====================================
// INICIA O JOGO
//=====================================
criarBlocos();
criarTiros();
loopDoJogo();

// Mostra as estruturas no console:
console.log('=== MATRIZ DE BLOCOS ===');
console.log('blocos = ', blocos);
console.log('');
console.log('=== ARRAY DE TIROS ===');
console.log('tiros = ', tiros);



