export default class HandGestureView {
  #handsCanvas = document.querySelector('#hands')
  #canvasContext = this.#canvasContext.getContext('2d')
  #fingerLookIndexes
  #styler
  constructor({fingerLookIndexes, styler}){
    //tamanho disponivel da tela
    this.#handsCanvas = globalThis.screen.availWidth
    this.#handsCanvas = globalThis.screen.availHeight
    this.#fingerLookIndexes = fingerLookIndexes
    this.#styler = styler

    // carrega os estilos assincronamente (evitar travar a tela enquanto carregar)
    setTimeout(()=>styler.loadDocumentStyle(), 200); 
  }

  clearCanvas(){
    this.#canvasContext.clearRect(0,0,this.#handsCanvas.width, this.#handsCanvas.height)
  }

  drawResults(hands){
    for(const {keypoints, handedness} of hands){
      if(!keypoints) continue

      this.#canvasContext.fillStyle = handedness === "Left" ? "rgb(44, 212, 103)" : "rgb(44, 212, 103)" 
      this.#canvasContext.strokeStyle = "white"
      this.#canvasContext.lineWidth = 8
      this.#canvasContext.lineJoin = "round"
    
      //juntas
     this.#drawJoients(keypoints) 
     //dedos
     this.#drawFingerAndHoverElements(keypoints)
    }
  }

  clickOnElement(x, y){
    const element = document.elementFromPoint(x, y)
    if(!element) return;
    
    const rect = element.getBoundingClientRect()
    const event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX: rect.left + x,
      clientY: rect.top + y
    })

    element.dispatchEvent(event)
  }

  #drawJoients(keypoints){
    for (const {x, y} of keypoints){
      this.#canvasContext.beginPath()
      const newX = x - 2
      const newY = y - 2
      const radius = 3
      const starAngle = 0
      const endAngle = 2 * Math.PI

      this.#canvasContext.arc(newX, newY, radius, starAngle, endAngle)
      this.#canvasContext.fill()
    }
  }

  #drawFingerAndHoverElements(keypoints){
    const fingers = Object.keys(this.#fingerLookIndexes)
    for (const finger of fingers){
      const points = this.#fingerLookIndexes[finger].map(
        index => keypoints[index]
      )
      const region = new Path2D()
      //[0] ?? a palma da m??o (writs)
      const [{x, y}] = points 
      region.moveTo(x, y)
      for(const point of points){
        region.lineTo(point.x, point.y)
      }
      this.#canvasContext.stroke(region)
      this.#hoverElement(finger, points)
    }
  }

  #hoverElement(finger, points){
    if(finger !== "indexFinger") return
    const tip = points.find(item => item.name === "index_finger_tip")
    const element = document.elementFromPoint(tip.x, tip.y)
    if(!element) return;
    const fn = () => this.#styler.toggleStyle(element, 'hover')
    fn()
    setTimeout(() => fn(), 500);
  }

  loop(fn) {
    requestAnimationFrame(fn)
  }

  scrollPage(top) {
    scroll({
      top,
      behavior: "smooth"
    })
  }

}