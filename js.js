/**
 * crea un objetode tipo proceso que sea manipulable para las colas
 * @param {int} id  el id del proceso (Pid)
 * @param {int} at  en tiempo de entrada (Arraiving time)
 * @param {int} ext  el tiempo de ejecucion (Execution Time)
 * @param {int} prl  el nivel de prioridad
 * @returns {object} RR process object
 */
function RRprocess(id, at, ext,prl, color) {
    this.id = id;
    this.at = at;
    this.ext = ext;
    this.prl = prl;
    this.totalduration = ext;
    this.realtimeBuffer = ext;
    this.color = color;
  }
  
  var processesCounter = 1;
  var prlis = [];
  var realTimeQuewe = [];
  var currentProcess;
  var burstcounter;
  var quantum;
  var running = false;
  
  function setup() {
    frameRate(12);
    burstcounter = 0;
    currentProcess = {};
    createCanvas(882, 300);
    addTable();
    addcontainer();
    
    quantum = 0 | document.getElementById("inputQ").value;
  }
  
  function draw() {
    updateTables();
    if (running) {
      drawstuff();
    } else {   
      if(realTimeQuewe.length == 0){
          background(225);
      }
    }
  }
  
  /**
   * dibuja lo eferente al canvas
   * @date 2021-03-07
   * @returns {any}
   */
  function drawstuff() {
    drawPNames();
    prlis.forEach((element) => {
      if (element.at == burstcounter) {
        realTimeQuewe.push(element);
        console.log("agregado a la RTQ");
      }
    });
  
    if (realTimeQuewe.length > 0) {
      if (
        realTimeQuewe[0].realtimeBuffer >
          realTimeQuewe[0].totalduration - quantum &&
        realTimeQuewe[0].totalduration - quantum >= 0
      ) {
        realTimeQuewe[0].realtimeBuffer--;
      } else if (
        realTimeQuewe[0].realtimeBuffer == 0 ||
        realTimeQuewe[0].realtimeBuffer ==
          realTimeQuewe[0].totalduration - quantum
      ) {      
        headToBack();
      } else if (
        realTimeQuewe[0].realtimeBuffer > 0 &&
        realTimeQuewe[0].totalduration - quantum < 0
      ) {
        realTimeQuewe[0].realtimeBuffer--;
      }
    }
    drawlines();
    burstcounter++;
  }
  
  /**
   * dibuja las lineas de tiempo
   * @date 2021-03-07
   * @returns {any}
   */
  function drawlines() {  
    strokeWeight(4);
    for (index = 1; index <= prlis.length; index++) {
      if (realTimeQuewe.length > 0) {
        try {
          if (realTimeQuewe[0].id == index) {
            drawRedLine(index,realTimeQuewe[0].color);
          } else {
            drawWhiteLine(index);
          }
        } catch (error) {
          drawWhiteLine(index);
        }
      } else {
        drawWhiteLine(index);
      }
    }
  }
  
  /**
   * dibuja unalinea eferente al proceso con su color
   * @date 2021-03-07
   * @param {any} index
   * @param {any} color
   * @returns {any}
   */
  function drawRedLine(index,color) {
    htime = getHTime();
    var x = 50 + map(burstcounter, 0, htime, 20, 300);
    var y = 29 * index;
    color2 = exToRGB(color);
    stroke(color2.r,color2.g, color2.b);
    line(x, y, x, y + 16);
    stroke(255);
  }
  
  /**
   * convierte exadecimal a rgb
   * @date 2021-03-07
   * @param {any} exColor
   * @returns {any}
   */
  function exToRGB(exColor){
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(exColor); 
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
  
  
  /**
   * dibuja las linear referentes a momentos en los que el proceso no
   * se esta ejecutando
   * @date 2021-03-07
   * @param {any} index
   * @returns {any}
   */
  function drawWhiteLine(index) {
    htime = getHTime();
    var x = 50 + map(burstcounter, 0, htime, 20, 300);
    var y = 29 * index;
    stroke(255, 255, 255);
    line(x, y, x, y + 16);
  }
  
  /**
   * muestra la cola en tiempo real de los procesos
   * @date 2021-03-07
   * @returns {any}
   */
  function headToBack() {
    // reiniciendo el buffer
    if (realTimeQuewe.length > 0) {
      realTimeQuewe[0].totalduration = realTimeQuewe[0].realtimeBuffer;
      if (realTimeQuewe[0].totalduration > 0) {
        var buffer = realTimeQuewe[0];
        realTimeQuewe.splice(0, 1);
        realTimeQuewe.push(buffer);
      } else {
        realTimeQuewe.splice(0, 1);
        //console.log("eliminado de la cabeza");
      }
    }
    // colocando el de mayor prioridad en la cola
    higestP = Math.max.apply(null,realTimeQuewe.map(o => {return parseInt(o.prl);}));  
    prbuffer = realTimeQuewe.filter(o => o.prl == higestP)[0];  
    if(prbuffer){
      realTimeQuewe.splice(realTimeQuewe.indexOf(prbuffer), 1);
      realTimeQuewe.unshift(prbuffer);
      if(prbuffer.prl>1){prbuffer.prl--;}
    }
    
  }
  
  /**
   *dibuja los nobres P1,P2... en el canvas
   * @date 2021-03-07
   * @returns {any}
   */
  function drawPNames() {
    prlis.forEach((process) => {
      textSize(32);
      text("P" + process.id, 9, 15 + 29 * (prlis.indexOf(process) + 1));
    });
  }
  
  /**
   * obtiene el tiempo maximo de ejecucion
   * @date 2021-03-07
   * @returns {any}
   */
  function getHTime() {
    var res = -1;
    prlis.forEach((element) => {
      var at = parseInt("" + element.at);
      var ext = parseInt("" + element.ext);   
      res += ext;
    });
    res = res/prlis.length;// tiempo medio de ejecucion  
    return res+(2.4*prlis.length)*(map(quantum, 1, 1000, 5, 1));
  }
  
  /**
   * metodo que se ejecuta cuando el proceso se pausa
   * @date 2021-03-07
   * @returns {any}
   */
  function drawPause() {
    clear();
    background(225);
    textFont("Georgia");
    textSize(32);
    text("Add processes to the list and then", 50, 130);
    text("Press start to see the Execution timeline", 50, 170);
    fill(0, 102, 153);
  }
  
  /**
   *metodo que coloca la tabla de procesos
   * @date 2021-03-07
   * @returns {any}
   */
  function addTable() {
    tableContainer = createDiv();
    tableContainer.position(100, 210);
    tableContainer.size(1000, 300);
    tableContainer.addClass("tables-container");
    RRproclist = createDiv(`
      <table class="processT">
      <thead>
          <tr>
              <th>#P</th>
              <th>T llegada</th>
              <th>Ráfaga</th>
              <th>Prioridad</th>
          </tr> 
      </thead> 
      <tbody id="processT">    
      </tbody>
      </table>`);
    RRproclist.addClass("processes-table");
    tableContainer.child(RRproclist);
    quewe = createDiv(`
      <table class="processT"">
      <thead>
          <tr>
              <th>cola en t real</th>
          </tr> 
      </thead> 
      <tbody id="processQ">    
      </tbody> 
      </table>`);
    quewe.addClass("quewe-table");
    tableContainer.child(quewe);
  }
  
  /**
   * metodo que agrega el contenedor conde se coloca la mayoria de items
   * @date 2021-03-07
   * @returns {any}
   */
  function addcontainer() {
    container = createDiv();
container.addClass("container-fluid"); // Agregar clase de contenedor de Bootstrap

title = createP("<h1>Round Robin</h1>");
title.addClass("Hola");
container.child(title);

// Crear una fila
let row1 = createDiv();
row1.addClass("row justify-content-center"); // Agregar clase de fila de Bootstrap
container.child(row1);

let row2 = createDiv();
row2.addClass("row justify-content-center"); // Agregar clase de fila de Bootstrap
container.child(row2);

let row3 = createDiv();
row3.addClass("row justify-content-center mt-3"); // Agregar clase de fila de Bootstrap
container.child(row3);




let col1 = createDiv();
col1.addClass("col"); // Establecer el tamaño de la columna utilizando la grilla de Bootstrap
row1.child(col1);

let col2 = createDiv();
col2.addClass("col"); // Establecer el tamaño de la columna utilizando la grilla de Bootstrap
row1.child(col2);

let col3 = createDiv();
col3.addClass("col"); // Establecer el tamaño de la columna utilizando la grilla de Bootstrap
row1.child(col3);

let col4 = createDiv();
col4.addClass("col"); // Establecer el tamaño de la columna utilizando la grilla de Bootstrap
row1.child(col4);



//segundas columnas

let col5 = createDiv();
col5.addClass("col"); // Establecer el tamaño de la columna utilizando la grilla de Bootstrap
row2.child(col5);

let col6 = createDiv();
col6.addClass("col"); // Establecer el tamaño de la columna utilizando la grilla de Bootstrap
row2.child(col6);

let col7 = createDiv();
col7.addClass("col"); // Establecer el tamaño de la columna utilizando la grilla de Bootstrap
row2.child(col7);

let col8 = createDiv();
col8.addClass("col"); // Establecer el tamaño de la columna utilizando la grilla de Bootstrap
row2.child(col8);

//terceras columnas


let col9 = createDiv();
col9.addClass("col align-self-center ms-5"); // Establecer el tamaño de la columna utilizando la grilla de Bootstrap
row3.child(col9);

let col10 = createDiv();
col10.addClass("col align-self-center ms-5"); // Establecer el tamaño de la columna utilizando la grilla de Bootstrap
row3.child(col10);

let col11 = createDiv();
col11.addClass("col align-self-center ms-5"); // Establecer el tamaño de la columna utilizando la grilla de Bootstrap
row3.child(col11);

let col12 = createDiv();
col12.addClass("col align-self-center ms-5"); // Establecer el tamaño de la columna utilizando la grilla de Bootstrap
row3.child(col12);




labelAT = createP("<p>Tiempo de llegada</p>");
col1.child(labelAT);
inputAT = createInput(null, "number");
inputAT.addClass("form-control"); // Agregar clase de formulario de Bootstrap
inputAT.id("inputAT");
col5.child(inputAT);

LabelET = createP("<p>Ráfaga</p>");
col2.child(LabelET);
inputET = createInput(null, "number");
inputET.addClass("form-control"); // Agregar clase de formulario de Bootstrap
inputET.id("inputET");
col6.child(inputET);

LabelPr = createP("<p>Prioridad</p>");
col3.child(LabelPr);
inputPr = createInput(null, "number");
inputPr.addClass("form-control"); // Agregar clase de formulario de Bootstrap
inputPr.id("inputPr");
col7.child(inputPr);

btnSend = createButton("Agregar", "").size(100, 35);
btnSend.mousePressed(addProcess);
btnSend.addClass("btn btn-primary"); // Agregar clases de botón de Bootstrap
col9.child(btnSend);

labelQ = createP("<p>Quantum</p>");
col4.child(labelQ);
inputQ = createInput(10, "number");
inputQ.addClass("form-control"); // Agregar clase de formulario de Bootstrap
inputQ.id("inputQ");
col8.child(inputQ);

btnPlay = createButton("start", "").size(100, 35);
btnPlay.mousePressed(playRR);
btnPlay.addClass("btn btn-success"); // Agregar clases de botón de Bootstrap
col10.child(btnPlay);

btnPause = createButton("pause", "").size(100, 35);
btnPause.mousePressed(pauseRR);
btnPause.addClass("btn btn-warning"); // Agregar clases de botón de Bootstrap
col11.child(btnPause);

btnRestart = createButton("reset", "").size(100, 35);
btnRestart.mousePressed(function () {
  resetThis();
});
btnRestart.addClass("btn btn-danger"); // Agregar clases de botón de Bootstrap
col12.child(btnRestart);

container.addClass("form-Container");
container.size(1000, 850);

  }
  
  
  /**
   * metodo para arancar
   * @date 2021-03-07
   * @returns {any}
   */
  function playRR() {
    quantum = document.getElementById("inputQ").value;
    running = true;
  }
  
  /**
   * metodo para pausar
   * @date 2021-03-07
   * @returns {any}
   */
  function pauseRR() {
    running = false;
  }
  
  /**
   * metodo para agregar un proceso
   * @date 2021-03-07
   * @returns {any}
   */
  function addProcess() {
    inputAT = document.getElementById("inputAT").value;
    inputET = document.getElementById("inputET").value;
    inputPr = document.getElementById("inputPr").value;
    if (inputAT && inputET) {
      newprocess = new RRprocess(
        processesCounter,
        inputAT,
        inputET,
        inputPr,
        getRandomColor()
      );
      processesCounter++;
      prlis.push(newprocess);
    } else {
      alert("Los campos no deben estar vacios");
    }
  }
  
  /**
   * metodo para resetear el sistema
   * @date 2021-03-07
   * @returns {any}
   */
  function resetThis() {
    processesCounter = 1;
    prlis = [];
    realTimeQuewe = [];
    currentProcess = {};
    burstcounter = 0;
    quantum = 0 | document.getElementById("inputET").value;
    running = false;
  }
  
  /**
   * metodo para actualizar las tablas
   * @date 2021-03-07
   * @returns {any}
   */
  function updateTables() {
    document.getElementById("processT").innerHTML = "";
    document.getElementById("processQ").innerHTML = "";
    for (i = 0; i < prlis.length; i++) {
      row = document.getElementById("processT").insertRow(i);
      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);
      var cell3 = row.insertCell(2);
      var cell4 = row.insertCell(3);
      cell1.innerHTML = prlis[i].id;
      cell2.innerHTML = prlis[i].at;
      cell3.innerHTML = prlis[i].ext;
      cell4.innerHTML = prlis[i].prl;
    }
    for (j = 0; j < realTimeQuewe.length; j++) {
      row = document.getElementById("processQ").insertRow(j);
      var cellP = row.insertCell(0);
      try {
        cellP.innerHTML = "P" + realTimeQuewe[j].id+ '-' + realTimeQuewe[j].realtimeBuffer + '-'+realTimeQuewe[j].prl;
      } catch (error) {      
      }
      
    }
  }
  
  /**
   * metodo para obtener un color aleatorio
   * @date 2021-03-07
   * @returns {any}
   */
  function getRandomColor() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }