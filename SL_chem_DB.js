const orbitals = ['s', 'p', 'd', 'f', 'g', 'h']
const orbitalData = [['s', 2, 1], ['p', 6, 3], ['d', 10, 5], ['f', 14, 7], ['g', 18, 9], ['h', 22, 11]];
//[orbital, capacity, number of suborbitals]

const periodicTable = [ //[name, sym, mass number, proton number, period(row), group(column), category]
  ['Hydrogen', 'H', 1, 1], //H
  ['Oxygen', 'O', 16, 8], //O
  ['Carbon', 'C', 12, 6], //C
  ['Nitrogen', 'N', 14, 7], //N
  ['Helium', 'He', 4, 2], //He
  ['Uranium', 'U', 238, 92]
];

function getElementData(elementProperty) {//2 item array which details any of the following: name, symbol, mass number, proton number

  if (!Array.isArray(elementProperty) || elementProperty.length !== 2){
    console.log('invalid format for arg1: elementProperty!');
  }

  var elementData = []; //[name, symbol, mass number, proton number]

  var error; //1 = property name invalid, 2 = element not on periodic table

  var propertyIndex;

  switch(elementProperty[0]) {
    case 'name':
     propertyIndex = 0;
     break;
    case 'symbol':
     propertyIndex = 1;
     break;
    case 'MN':
     propertyIndex = 2;
     break;
    case 'PN':
     propertyIndex = 3;
     break;
    default:
     console.log('getElementData() result:  "' + elementProperty[0] + '" is not a valid property');
     error = 1
     return error;
}

  for (var i=0;i<periodicTable.length;i++) {
    if (periodicTable[i][propertyIndex] === elementProperty[1]) {
      elementData = periodicTable[i];
      return elementData;
    }
  }

  console.log('getElementData() result: element not found in periodic table');
  error = 2;
  return error;

}

console.log( getElementData(['PN', 1]) );


function getFillingOrder(highest='6h') {
  var fillOrder = []; //default 1s-6h
  fillOrderLoop:
  for (var n=1;n<7;n++){
   for ( var o=1;o<n+1;o++){
    var j = n;
     for (var i=o;i>=1;i--) {
      var orbital = j + orbitalData[i-1][0];
      if ( fillOrder.includes(orbital) ){continue;}
      fillOrder.push(orbital);
      if (orbital === highest) {break fillOrderLoop;}
      j++;
    }
   }
  }
  return fillOrder;
}

var fillOrder = getFillingOrder();

console.log(fillOrder);

function getOrbCap(orbital) {
  for (var i=0;i<orbitalData.length;i++) {
    if ( orbitalData[i].includes(orbital) ) {
      var orbCap = orbitalData[i][1];
      break;
    }
  }
  if (!orbCap) {
    console.log('orbital: ' + orbital.toString() + ' does not exist')
  } else {
    return orbCap;
  }
}

function getNumSO(orbital) { //number of sub-orbitals
  for (var i=0;i<orbitalData.length;i++) {
    if ( orbitalData[i].includes(orbital) ) {
      var numSO = orbitalData[i][2];
      break;
    }
  }
  if (!numSO) {
    console.log('orbital: ' + orbital.toString() + ' does not exist')
  } else {
    return numSO;
  }
}

function Atom(elemPropertyOrCustomArr, charge = 0) {//el. prop. = 2 item array which details any of the following: name, symbol, mass number, proton number

  //arg1 error handling
  if ( !Array.isArray(elemPropertyOrCustomArr) ) {
    console.log('failed to build Atom: arg1 should be an array');
  }

  var name, symbol, atomicNumber, protonNumber;

  if (elemPropertyOrCustomArr.length === 4) { //custom array handling
    name = elemPropertyOrCustomArr[0];
    symbol = elemPropertyOrCustomArr[1];
    atomicNumber = elemPropertyOrCustomArr[2];
    protonNumber = elemPropertyOrCustomArr[3];
  } else if (elemPropertyOrCustomArr.length === 2) { //property lookup handling
    var elementData = getElementData(elemPropertyOrCustomArr);
    if ( Array.isArray(elementData) ) {
      name = elementData[0];
      symbol = elementData[1];
      atomicNumber = elementData[2];
      protonNumber = elementData[3];
    } else if (elementData = 1) {
      console.log('failed to build Atom: "' + elemPropertyOrCustomArr[0] + '" is not a valid property' );
      return;
    } else if (elementData = 2) {
      console.log('failed to build Atom: element not found in periodic table');
      return;
    } else {
      console.log('failed to build Atom: unknown error');
      return;
    }
  } else {
    console.log('failed to build Atom: arg1 is an array but wrong length - needs to be length 2 or 4')
    return;
  }

  //arg2 error handling
  var maxCharge = protonNumber - 1;
  var maxNumElectrons = 118; //set to the electron number for the Oganesson (largest on periodic table)
  var minCharge = -(maxNumElectrons - protonNumber)

  if (charge > maxCharge) {
    console.log('the charge exceeds the maximum allowed charge for this element');
    return;
  }

  this.maxCharge = maxCharge;
  this.minCharge = minCharge;
  this.name = name;
  this.symbol = symbol;
  this.atomicNumber = atomicNumber;
  this.protonNumber = protonNumber;
  this.charge = charge;

  var electronNumber = protonNumber - charge;
  var electronConfigArr = [];
  var count=0
  var i=0;
  var j=0;

  while (count < electronNumber) {
    var currOrbital = fillOrder[i];
    //console.log(fillOrder[i]);
    var orbitalCap = getOrbCap(currOrbital.slice(1));
    var numSubOrbs = getNumSO(currOrbital.slice(1));
    //create array breaking down electrons into there sub orbitals
    var SOConfigArr = new Array(numSubOrbs+1);
    SOConfigArr[0] = currOrbital;
    for (var x=1;x<SOConfigArr.length;x++){SOConfigArr[x] = 0;}//setting empty suborbitals
    var j = 0;
    var SOIndex = 1;
    while (j < orbitalCap && count < electronNumber) {//fill orbital
      SOConfigArr[SOIndex]++;
      count++;
      j++;
      SOIndex = (j % numSubOrbs) + 1;
    }
    electronConfigArr.push(SOConfigArr);
    i++;
  }

  var energyConfigArr = [];
  var shellCount;

  for (var i=0;i<electronConfigArr.length;i++){

    var electronCount = 0;
    for(var j=1;j<electronConfigArr[i].length;j++){
      electronCount += electronConfigArr[i][j]
    } //counts nuimber of electrons in an orbital

    var energyLevel = (electronConfigArr[i][0].slice(0,1));
    var energyIndex = energyLevel - 1;

    if (!energyConfigArr[energyIndex]) {
      shellCount = electronCount;
      energyConfigArr[energyIndex] = energyLevel + ':' + shellCount;
    } else {
      //console.log('energyConfigArr[' + energyIndex + ']')
      shellCount = Number(energyConfigArr[energyIndex].slice(2));
      shellCount += electronCount;
      energyConfigArr[energyIndex] = energyLevel + ':' + shellCount;
    }

    var orbitalString = electronConfigArr[i][0] + ':' + electronCount;

    electronConfigArr[i] = orbitalString;

  }

  //sort electron configuration into order of increasing n number
  electronConfigArr.sort(
    function(a, b){
    return a.slice(0,1)-b.slice(0,1);
  }
  );

  this.electronConfig = electronConfigArr;
  this.shellConfig = energyConfigArr;
  this.valenceElectrons = Number(energyConfigArr[energyConfigArr.length-1].slice(2));

  //electron configuration as a string
  var electronConfigStr = '';
  var eachShell = [];
  for (var i=0;i<electronConfigArr.length;i++){
    var orbitalComponent = electronConfigArr[i].split(':').join('');
    if (i==0) {
      electronConfigStr += orbitalComponent;
    } else {
      electronConfigStr += '|' + orbitalComponent;
    }
    var n = electronConfigArr[i].slice(0,1);
    if (!eachShell[n-1]){
      eachShell[n-1] = orbitalComponent;
    } else {
      eachShell[n-1] += '|' + orbitalComponent;
    }
  }

  this.electronConfigString = electronConfigStr;
  this.electronConfigByShell = eachShell;

}

function Molecule() {} //for later


//----------------------TEST CODE:-----------------------
//var Hydrogen = new Atom(['PN', 1]); //Get an element from periodic table by looking up properties
//var Carbon = new Atom(['name', 'Carbon']);
//var Nitrogen = new Atom(['name', 'Nitrogen']);
//var Oxygen = new Atom(['name', 'Oxygen']);
//console.log(atom1);
//console.log(Hydrogen);
//console.log(Carbon);
//console.log(Nitrogen);
//console.log(Oxygen);
