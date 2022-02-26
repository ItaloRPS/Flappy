function novoElemento(tagName,className){
    const elemt = document.createElement(tagName)
    elemt.className = className
    return elemt
}

function Barreira(reversa = false){
    this.elemento = novoElemento('div','barreira')

    const borda  = novoElemento('div','borda')
    const corpo  = novoElemento('div','corpo')

    this.elemento.appendChild(reversa? corpo:borda)
    this.elemento .appendChild(reversa? borda:corpo)

    this.setAltura = altura =>corpo.style.height = `${altura}px`
}

//const b = new Barreira(true)
//b.setAltura(320)
//document.querySelector('[wm-flappy]').appendChild(b.elemento)

function parDeBarreiras(altura,abertura,posicaoX){
    this.elemento = novoElemento('div','par-de-barreiras')

    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)
    
    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sorteiaAltura = ()  =>{
     const alturaSuperior = Math.random() * (altura - abertura)
     const alturaInferior =   altura - abertura - alturaSuperior 
     this.superior.setAltura(alturaSuperior)
     this.inferior.setAltura(alturaInferior)
    }   

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x =>this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth

    this.sorteiaAltura()
    this.setX(posicaoX)


}


//var teste2 = new parDeBarreiras(700,300,500)
//document.querySelector('[wm-flappy]').appendChild(teste2.elemento)


function Barreiras(altura,largura,abertura,espaco,notificarPonto){

    this.pares = [ 
        new parDeBarreiras(altura,abertura,largura),
        new parDeBarreiras(altura,abertura,largura + espaco),
        new parDeBarreiras(altura,abertura,largura + espaco * 2),
        new parDeBarreiras(altura,abertura,largura + espaco * 3),
      ] 

    const deslocamento = 3
    this.animar = () =>{
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento )

            //quando o elemento sair da area do jogo
            if (par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length)
                par.sorteiaAltura()
            }

            const meio = largura /2
            const cruzouMeio = par.getX() + deslocamento >= meio && par.getX() < meio
            if (cruzouMeio) {
                var audioElement = new Audio('audio/pontos.mp3');
                audioElement.play()
                notificarPonto()
            
            }
        });
    }
}
 

function Passaro(alturaJogo){
    let voando = false
    this.elemento = novoElemento('img','passaro')
    this.elemento.src = 'imgs/passaro.png'
    this.getY = ()=>parseInt( this.elemento.style.bottom.split('px')[0])
    this.setY = Y => this.elemento.style.bottom = `${Y}px`

    window.onkeydown = e => e.keyCode=== 32? voando = true:voando = false
    window.onkeyup = e => voando = false

    this.animar = ()=>{
       const novoY = this.getY()  + (voando?6:-3)
       const alturaMaxima = alturaJogo - this.elemento.clientHeight

       if(novoY <= 0){
           this.setY(0)
       } else if (novoY >= alturaMaxima) {
           this.setY(alturaMaxima)           
       } else {
            this.setY(novoY)
       }
    }
    this.setY(alturaJogo /2)   
}

// const barreira = new  Barreiras(600,1200,250,400)
// const areaDoJogo = document.querySelector('[wm-flappy]')
// const passaro = new  Passaro(700)

// barreira.pares.forEach(par => areaDoJogo.appendChild(par.elemento));
// areaDoJogo.appendChild(passaro.elemento)

// setInterval(()=>{
//     barreira.animar()
//     passaro.animar()
// },20)


function Progresso(){
    this.elemento = novoElemento('span','progresso')
    this.atualizarPontos = pontos=> {
        this.elemento.innerHTML = pontos
    }

    this.atualizarPontos(0)
}

function FlappyBird(){
    let pontos = 0

    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    const progresso = new  Progresso()
    const barreiras = new  Barreiras(altura, largura, 200, 400, () => progresso.atualizarPontos(pontos++))
    const passaro = new Passaro(altura)

    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    this.start = () => {
        var start = document.querySelector('#Start').remove()
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

            if (colidiu(passaro, barreiras)) {
                clearInterval(temporizador)
                window.onkeydown = e => {
                    e.keyCode=== 116?window.location.reload():null}
                    var audioElement = new Audio('audio/gameOver.mp3');
                    audioElement.play()
                  
            }
        }, 20)
    }

}

 

 function EstaoSobrePostos(elementoA,elementoB){
     const a = elementoA.getBoundingClientRect()
     const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top
     return horizontal && vertical  

 }
 function colidiu(passaro,barreiras){
     let colidiu = false
     barreiras.pares.forEach(parDeBarreiras =>{
         if(!colidiu){
             const inferior = parDeBarreiras.inferior.elemento  
             const superior = parDeBarreiras.superior.elemento
             colidiu = EstaoSobrePostos(passaro.elemento,superior) || EstaoSobrePostos(passaro.elemento,inferior)
         }
     })
     return colidiu
 }


 function StartFlap(){
  
  this.iniciar = () =>{
    window.onkeydown = e => {
        e.keyCode=== 13?new FlappyBird().start():null}
        var start = document.querySelector('#Start')
        start = document.onclick = () => new FlappyBird().start()
        start.remove()
 }
 }

 new StartFlap().iniciar()