
//-------------------drawing-tools--------------------------

function clearCanvas(canvas, context, bgColor) {
  context.fillStyle = bgColor;
  context.fillRect(0,0,canvas.width, canvas.height);
}

function writeText(context, text, x, y, color = 'black', size = '20px', font = 'Arial') {
  context.fillStyle = color;
  context.font = size + ' ' + font;
  context.fillText(text, x, y);
}

function drawCirc(context, x, y, r, fillColor=null, outlineCol='black'){
  context.fillStyle = fillColor;
  context.strokeStyle = outlineCol;
  context.beginPath();
  context.arc(x, y, r, 0, 2 * Math.PI);
  context.stroke();
  if (fillColor!=null){
    context.fill();
  }
}

function concentricCircs(context, x, y, r0, quantity, spacing, outlineCol='black') {

  var r = r0;

  for (var i=0;i<quantity;i++){
    drawCirc(context, x, y, r, null, outlineCol);
    r += spacing;
  }

}

//-----------------html elements------------------------------------

var elementPicker = document.getElementById('element-picker');
var chargePicker = document.getElementById('charge-picker');
var canvas = document.getElementById('chem-view');
var canvasContainer = document.getElementById('canvas-container');
var shellTable = document.getElementById('shell-config-table');
var elementProperties = document.getElementById('chem-properties-container');
var electronConfig = document.getElementById('electron-config');

//-----------------event-functions-----------------------------------

function getEConfig() {
  var charge = Number(chargePicker.value);
  var value = elementPicker.value;
  var selectedElement = new Atom( ['name', value], charge);

  electronConfig.innerHTML = '' //reset content

  var eConfigP = document.createElement('p');
  var content = '';
  var eConfigStr = selectedElement.electronConfigString;
  var stringCount = 0;
  var shellConfigIndex = 1;

  for (i=0;i<eConfigStr.length;i++){

    if (eConfigStr[i] === '|') {
      shellConfigIndex=0;
      content += '</sup>'
    } else if (shellConfigIndex===3) {
      content += '<sup>' + eConfigStr[i];
    } else {
      content += eConfigStr[i];
    }

    if (stringCount >= 30 && eConfigStr[i] === '|') {
      content += '<br>';
      stringCount = 0;
    }

    stringCount++;
    shellConfigIndex++;
  }

  eConfigP.innerHTML = content;
  eConfigP.style.display = 'inline-block';
  eConfigP.style.height = '100%';
  electronConfig.appendChild(eConfigP); //add new content

}

function resetCharge() {
  chargePicker.value = 0;
}

function newShellTable() {

  //first delete contents of current table
  shellTable.innerHTML = '';

  //create table header
  //list the text that should go in each cell
  var thTextArr = ['shell', 'no. electrons'];
  //create the containing row
  var thRow = document.createElement('tr');
  //create and insert cells into row
  for (i=0;i < thTextArr.length;i++) {
    //create cell
    var thData = document.createElement('th');
    var thText = document.createTextNode(thTextArr[i]);
    //insert the text into cell
    thData.appendChild(thText);
    //insert the cell into the row
    thRow.appendChild(thData);
  }
  //insert the header into the table
  shellTable.appendChild(thRow);

  //get shell info of selected element
  var charge = Number(chargePicker.value);
  var value = elementPicker.value;
  var selectedElement = new Atom( ['name', value], charge);
  var shellNum = selectedElement.shellConfig.length;

  //create the main content of the table
  for (var i=0;i<shellNum;i++) {
    var shellConfig = selectedElement.shellConfig[i].split(':');
    var shellIndex = 'n=' + shellConfig[0];
    var shellCount = shellConfig[1];
    //create a single row
    //list the text that should go in each cell
    var textArr = [shellIndex, shellCount];
    //create the row
    var row = document.createElement('tr');
    //create and insert cells into row
      for (var j=0;j<2;j++) {
        //create cell
        var cell = document.createElement('td');
        var text = document.createTextNode( textArr[j] );
        //insert the text into cell
        cell.appendChild(text);
        //insert the cell into the row
        row.appendChild(cell);
      }
      //insert the row into the table
      shellTable.appendChild(row);
    }

    //create table footer
    //list the text that should go in each cell
    var electronNumber = selectedElement.protonNumber - charge;
    var footerTextArr = ['total', electronNumber];
    //create the containing row
    var footerRow = document.createElement('tfoot');
    //create and insert cells into row
    for (var i=0;i<footerTextArr.length;i++) {
      //create cell
      var footerCell = document.createElement('td');
      var footerText = document.createTextNode( footerTextArr[i] );
      //insert the text into cell
      footerCell.appendChild(footerText);
      //insert the cell into the row
      footerRow.appendChild(footerCell);
    }
    //insert the header into the table
    shellTable.appendChild(footerRow);

  }

function sizeCanvas() {

  var contWidthStr = window.getComputedStyle(canvasContainer, null).getPropertyValue("width");
  var contWidth = Number(contWidthStr.slice(0, contWidthStr.indexOf('px')));
  var contHeightStr = window.getComputedStyle(canvasContainer, null).getPropertyValue("height");
  var contHeight = Number(contHeightStr.slice(0, contHeightStr.indexOf('px')));
  //canvas.width = 0.95 * contWidth;
  //canvas.height = 0.92 * contHeight;
  canvas.width = 0.98 * contWidth;
  canvas.height = 0.96 * contHeight;

}

function displayAtomicStructure() {

  var context = canvas.getContext('2d');
  var value = elementPicker.value;
  var x_cntr = canvas.width/2;
  var y_cntr = canvas.height/2;

  var charge = Number(chargePicker.value);
  var chargeStr;
  if (charge == 0) {
    chargeStr = '';
  } else if (charge > 0) {
    chargeStr = '(+' + chargePicker.value + ')';
  } else {
    chargeStr = '(' + chargePicker.value + ')';
  }
  var selectedElement = new Atom( ['name', value], charge );
  var chargeMax = selectedElement.maxCharge;
  var chargeMin = selectedElement.minCharge;
  var shellNum = selectedElement.shellConfig.length;
  var nucleonSize = 20;
  var shellSpacing = nucleonSize;
  var r0 = nucleonSize * 2;
  var electronSize = 5;
  var r = r0;

  chargePicker.max = chargeMax.toString();
  chargePicker.min = chargeMin.toString();

  //if (chargePicker.value > chargeMax) {chargePicker.value = chargeMax.toString()}
  //else if (chargePicker.value < chargeMin) {chargePicker.value = chargeMin.toString()}

  clearCanvas(canvas, context, 'white');
  drawCirc(context, x_cntr, y_cntr, nucleonSize,'red', 'red');
  concentricCircs(context, x_cntr, y_cntr, r0, shellNum, shellSpacing, 'black');

  for (var i=0;i<shellNum;i++){

    var shellCount = selectedElement.shellConfig[i].split(':');
    shellCount = shellCount[1];
    var electronSeperation = 2 * Math.PI / shellCount;
    var angle = 0;


    for (var j=0;j<shellCount;j++){
      var x = x_cntr + r * Math.cos(angle);
      var y = y_cntr + r * Math.sin(angle);
      drawCirc(context, x, y, electronSize, 'blue', 'blue');
      angle += electronSeperation;
    }

    r+=shellSpacing;
  }

  writeText(context, selectedElement.symbol + chargeStr, x_cntr, y_cntr, 'black', '12px');

}

//----------------Add Event Listeners----------------------------

//(re)size canvas
window.addEventListener('load', sizeCanvas, false);
window.addEventListener('resize', sizeCanvas, false);
//reset charge on changing element
elementPicker.addEventListener('change', resetCharge, false);
//draw atom
window.addEventListener('load', displayAtomicStructure, false);
elementPicker.addEventListener('change', displayAtomicStructure, false);
chargePicker.addEventListener('change', displayAtomicStructure, false);
window.addEventListener('resize', displayAtomicStructure, false);
//draw shell table
window.addEventListener('load', newShellTable, false);
elementPicker.addEventListener('change', newShellTable, false);
chargePicker.addEventListener('change', newShellTable, false);
//display properties
window.addEventListener('load', getEConfig, false);
elementPicker.addEventListener('change', getEConfig, false);
chargePicker.addEventListener('change', getEConfig, false);
