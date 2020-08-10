// Variables

let collarSurfDens = 3000; // gr/m2
let materialSurfDens = 220; // gr/m2

const inputData = {
  component: {
    compX: 0,
    compY: 0,
    compZ: 0,
    compWgt: 0, // kg
    compTurn: 0,
  },
  hu: {
    outerHeight: 990,
  },
  huActive: {
    e1208: false,
    e1210: false,
    e1308: false,
    e1512: false,
    e1612: false,
  },
  mbActive: {
    cfs: false,
    cpst: false,
    cpsf: false,
  },
};

const truckInnerDims = {
  // truckLength: 13600,
  // truckWidth: 2450,
  truckHeight: 2400,
  // truckPayload: 24000,
};

const mbSettings = {
  cfsSet: {
    active: false,
    sideGapX: 5,
    sideGapY: 5,
    bottomGap: 5,
  },

  cpstSet: {
    active: false,
    sideGapBtwEs: 46,
    sideGapAlgEs: 30,
    mbToEs: 13, // MB to top of easy slide
    topGap: 0,
    btwLayGap: 20,
  },

  cpsfSet: {
    active: false,
    sideGapX: 5,
    ringReinf: 62,
    wallCut: 100,
    frontGapY() {
      return this.wallCut - 10 + 35;
    },
    rearGapY: 13,
    topGap: 0,
    bottomGap: 20,
  },
}


function getCompDims() {
  const arr = [];
  arr.push(inputData.component.compX, inputData.component.compY, inputData.component.compZ);
  return arr.sort((a, b) => b - a);
}

function outerZ() {
  return inputData.hu.outerHeight;
}
function calcInnerX() {
  return this.outerX - this.innerMinusX;
}
function calcInnerY() {
  return this.outerY - this.innerMinusY;
}
function calcInnerZ() {
  return this.outerZ() - this.innerMinusZ;
}
function calcCollarZ() {
  return inputData.hu.outerHeight - this.collarMinusZ;
}
function calcCollarWgt() { // Convert gr/m2 to kg/mm2 (result in kg)
  return (
    Math.round(this.collarLth * this.calcCollarZ() * (collarSurfDens / 1e9) * 10) / 10
  );
}
function calcEcoWgt() {
  return Math.round((this.palletWgt + this.lidWgt + this.calcCollarWgt()) * 10) / 10;
}
function calcInTruckQty() {
  return this.inTruckOneL * Math.floor(truckInnerDims.truckHeight / inputData.hu.outerHeight);
}

const ecoSet = {
  e1208: {
    box: 'E1208',
    outerX: 1200,
    outerY: 800,
    outerZ,
    innerMinusX: 60,
    innerMinusY: 65,
    innerMinusZ: 220,
    calcInnerX,
    calcInnerY,
    calcInnerZ,
    collarMinusZ: 120,
    calcCollarZ,
    collarLth: 3800,
    palletWgt: 7.9,
    lidWgt: 5.2,
    calcCollarWgt,
    calcEcoWgt,
    inTruckOneL: 33,
    calcInTruckQty,
  },
  e1210: {
    box: 'E1210',
    outerX: 1200,
    outerY: 1000,
    outerZ,
    innerMinusX: 70,
    innerMinusY: 70,
    innerMinusZ: 225,
    calcInnerX,
    calcInnerY,
    calcInnerZ,
    collarMinusZ: 140,
    calcCollarZ,
    collarLth: 4170,
    palletWgt: 9.8,
    lidWgt: 6.8,
    calcCollarWgt,
    calcEcoWgt,
    inTruckOneL: 26,
    calcInTruckQty,
  },
  e1308: {
    box: 'E1308',
    outerX: 1350,
    outerY: 820,
    outerZ,
    innerMinusX: 65,
    innerMinusY: 65,
    innerMinusZ: 210,
    calcInnerX,
    calcInnerY,
    calcInnerZ,
    collarMinusZ: 115,
    calcCollarZ,
    collarLth: 4125,
    palletWgt: 8.8,
    lidWgt: 6.2,
    calcCollarWgt,
    calcEcoWgt,
    inTruckOneL: 26,
    calcInTruckQty,
  },
  e1512: {
    box: 'E1512',
    outerX: 1500,
    outerY: 1200,
    outerZ,
    innerMinusX: 70,
    innerMinusY: 70,
    innerMinusZ: 195,
    calcInnerX,
    calcInnerY,
    calcInnerZ,
    collarMinusZ: 125,
    calcCollarZ,
    collarLth: 5170,
    palletWgt: 14.6,
    lidWgt: 10.2,
    calcCollarWgt,
    calcEcoWgt,
    inTruckOneL: 18,
    calcInTruckQty,
  },
  e1612: {
    box: 'E1612',
    outerX: 1600,
    outerY: 1200,
    outerZ,
    innerMinusX: 60,
    innerMinusY: 65,
    innerMinusZ: 205,
    calcInnerX,
    calcInnerY,
    calcInnerZ,
    collarMinusZ: 125,
    calcCollarZ,
    collarLth: 5400,
    palletWgt: 15.8,
    lidWgt: 10.9,
    calcCollarWgt,
    calcEcoWgt,
    inTruckOneL: 16,
    calcInTruckQty,
  },
};

function getSelectedEcopacks() {
  let ecoArr = [];
  for (let key in inputData.huActive) {
    if (inputData.huActive[key] === true) ecoArr.push(ecoSet[key]);
  }
  return ecoArr;
}

function Cfs(ecoObj, opt1, opt2, id) {
  this.id = id;
  this.bagType = 'cfs';
  this.boxType = ecoObj.box;
  this.name = `${this.boxType}<br>${this.bagType} ${opt1}${opt2}`;
  this.bagMaterial = 'royal fabric';
  this.outerX = ecoObj.outerX;
  this.outerY = ecoObj.outerY;
  this.outerZ = ecoObj.outerZ();
  this.innerX = ecoObj.calcInnerX();
  this.innerY = ecoObj.calcInnerY();
  this.innerZ = ecoObj.calcInnerZ();
  this.innerRX = this.innerX - mbSettings.cfsSet.sideGapX * 2;
  this.innerRY = this.innerY - mbSettings.cfsSet.sideGapY * 2;
  this.innerRZ = this.innerZ - mbSettings.cfsSet.bottomGap;
  if (opt2 === '1') [this.partZ, this.partX, this.partY] = getCompDims();
  if (opt2 === '2') [this.partZ, this.partY, this.partX] = getCompDims();
  // Mx
  this.matrixX = Math.floor(this.innerRX / this.partX);
  this.matrixY = Math.floor(this.innerRY / this.partY);
  this.matrixZ = Math.floor(this.innerRZ / this.partZ) <= 2 ? Math.floor(this.innerRZ / this.partZ) : 2;
  // Qty
  this.boxInTruckQty = ecoObj.calcInTruckQty();
  this.partsInBoxQty = this.matrixX * this.matrixY * this.matrixZ;
  this.partsInTruckQty = this.boxInTruckQty * this.partsInBoxQty;
  this.boxRequredQty = Math.ceil(inputData.component.compTurn / this.partsInBoxQty);
  this.truckRequredQty = Math.ceil(inputData.component.compTurn / this.partsInTruckQty);
  // Pct sz
  this.pocketX = Math.floor(this.innerRX / this.matrixX);
  this.pocketY = Math.floor(this.innerRY / this.matrixY);
  this.pocketZ = Math.floor(this.innerRZ / this.matrixZ);
  // Wgt
  this.bagWeight = Math.round(
    (((this.innerRX * (this.matrixY + 1)) + this.innerRY * (this.matrixX + 1))
    * this.innerRZ // verticals + dividers
    + (this.innerRX * this.innerRY) * this.matrixY) // bottoms
    * (materialSurfDens / 1e9) * 10) / 10;
  this.boxWeight = ecoObj.calcEcoWgt();
  this.solWeight = Math.round((this.bagWeight + this.boxWeight) * 10) / 10;
  this.partsInBoxWeight = Math.round(this.partsInBoxQty * inputData.component.compWgt * 10) / 10;
  this.boxLoadedWeight = Math.round((this.solWeight + this.partsInBoxWeight) * 10) / 10;
  this.truckLoadedWeight = Math.round(this.boxInTruckQty * this.boxLoadedWeight * 10) / 10;
}

function Cpst(ecoObj, opt1, opt2, id) {
  this.bagType = 'cps-t';
  this.id = id;
  this.boxType = ecoObj.box;
  this.name = `${this.boxType}<br>${this.bagType} ${opt1}${opt2}`;
  this.bagMaterial = 'royal fabric';
  if (opt1 === 'A') {
    this.outerX = ecoObj.outerX;
    this.outerY = ecoObj.outerY;
    this.innerX = ecoObj.calcInnerX();
    this.innerY = ecoObj.calcInnerY();
  }
  if (opt1 === 'B') {
    this.outerX = ecoObj.outerY;
    this.outerY = ecoObj.outerX;
    this.innerX = ecoObj.calcInnerY();
    this.innerY = ecoObj.calcInnerX();
  }
  this.innerRX = this.innerX - mbSettings.cpstSet.sideGapBtwEs * 2;
  this.innerRY = this.innerY - mbSettings.cpstSet.sideGapAlgEs * 2;
  this.outerZ = ecoObj.outerZ();
  this.innerZ = ecoObj.calcInnerZ();
  this.innerRZ = this.innerZ - mbSettings.cpstSet.mbToEs - mbSettings.cpstSet.topGap;
  [this.partX, this.partZ, this.partY] = getCompDims();
  // Mx
  this.matrixX = Math.floor(this.innerRX / this.partX);
  this.matrixY = Math.floor(this.innerRY / this.partY);
  this.matrixZ = Math.floor(this.innerRZ / (this.partZ + mbSettings.cpstSet.btwLayGap));
  // Qty
  this.boxInTruckQty = ecoObj.calcInTruckQty();
  this.partsInBoxQty = this.matrixX * this.matrixY * this.matrixZ;
  this.partsInTruckQty = this.boxInTruckQty * this.partsInBoxQty;
  this.boxRequredQty = Math.ceil(inputData.component.compTurn / this.partsInBoxQty);
  this.truckRequredQty = Math.ceil(inputData.component.compTurn / this.partsInTruckQty);
  // Pct sz
  this.pocketX = Math.floor(this.innerRX / this.matrixX);
  this.pocketY = Math.floor(this.innerRY / this.matrixY);
  this.pocketZ = Math.floor((this.innerRZ - mbSettings.cpstSet.btwLayGap * this.matrixZ) / this.matrixZ);
  // Wgt
  this.bagWeight = Math.round(
    ((((this.innerRX * (this.matrixY + 1)) + this.innerRY * (this.matrixX + 1))
    * this.pocketZ // verticals + sides
    + (this.innerRX * this.innerRY)) * this.matrixZ) // bottoms
    * (materialSurfDens / 1e9) * 10) / 10;
  this.boxWeight = ecoObj.calcEcoWgt();
  this.solWeight = Math.round((this.bagWeight + this.boxWeight) * 10) / 10;
  this.partsInBoxWeight = Math.round(this.partsInBoxQty * inputData.component.compWgt * 10) / 10;
  this.boxLoadedWeight = Math.round((this.solWeight + this.partsInBoxWeight) * 10) / 10;
  this.truckLoadedWeight = Math.round(this.boxInTruckQty * this.boxLoadedWeight * 10) / 10;
}

function Cpsf(ecoObj, opt1, opt2, id) {
  this.bagType = 'cps-f';
  this.id = id;
  this.boxType = ecoObj.box;
  this.name = `${this.boxType}<br>${this.bagType} ${opt1}${opt2}`;
  this.bagMaterial = 'royal fabric';
  if (opt1 === 'A') {
    this.outerX = ecoObj.outerX;
    this.outerY = ecoObj.outerY;
    this.innerX = ecoObj.calcInnerX();
    this.innerY = ecoObj.calcInnerY();
  }
  if (opt1 === 'B') {
    this.outerX = ecoObj.outerY;
    this.outerY = ecoObj.outerX;
    this.innerX = ecoObj.calcInnerY();
    this.innerY = ecoObj.calcInnerX();
  }
  this.innerRX = this.innerX - mbSettings.cpsfSet.sideGapX * 2;
  this.innerRY = this.innerY - mbSettings.cpsfSet.frontGapY() - mbSettings.cpsfSet.rearGapY;
  this.outerZ = ecoObj.outerZ();
  this.innerZ = ecoObj.calcInnerZ();
  this.innerRZ = this.innerZ - mbSettings.cpsfSet.ringReinf - mbSettings.cpsfSet.topGap - mbSettings.cpsfSet.bottomGap;
  if (opt2 === '1') [this.partY, this.partX, this.partZ] = getCompDims();
  if (opt2 === '2') [this.partY, this.partZ, this.partX] = getCompDims();
  
  // Mx
  this.matrixX = Math.floor(this.innerRX / this.partX);
  this.matrixY = Math.floor(this.innerRY / this.partY) === 1 ? 1 : 0;
  this.matrixZ = Math.floor(this.innerRZ / this.partZ);
  // Qty
  this.boxInTruckQty = ecoObj.calcInTruckQty();
  this.partsInBoxQty = this.matrixX * this.matrixY * this.matrixZ;
  this.partsInTruckQty = this.boxInTruckQty * this.partsInBoxQty;
  this.boxRequredQty = Math.ceil(inputData.component.compTurn / this.partsInBoxQty);
  this.truckRequredQty = Math.ceil(inputData.component.compTurn / this.partsInTruckQty);
  // Pct sz
  this.pocketX = Math.floor(this.innerRX / this.matrixX);
  this.pocketY = Math.floor(this.innerRY / this.matrixY);
  this.pocketZ = Math.floor(this.innerRZ / this.matrixZ);
  // Wgt
  this.bagWeight = Math.round(
    (((this.innerRY * (this.matrixX + 1)) * (this.innerRZ + mbSettings.cpsfSet.ringReinf)) // verticals
    + (this.innerRX * this.innerRZ)// backstop
    + (this.innerRX * (this.matrixZ + 1) * this.innerRY))// horizontals
    * (materialSurfDens / 1e9) * 10) / 10;
  this.boxWeight = ecoObj.calcEcoWgt();
  this.solWeight = Math.round((this.bagWeight + this.boxWeight) * 10) / 10;
  this.partsInBoxWeight = Math.round(this.partsInBoxQty * inputData.component.compWgt * 10) / 10;
  this.boxLoadedWeight = Math.round((this.solWeight + this.partsInBoxWeight) * 10) / 10;
  this.truckLoadedWeight = Math.round(this.boxInTruckQty * this.boxLoadedWeight * 10) / 10;
}

function createSolutions() {
  const solutions = [];
  let idCount = 0;
  const createOption = (Type, par1, par2, par3) => {
    const obj = new Type(par1, par2, par3, idCount);
    if (obj.partsInBoxQty > 0 && obj.partsInBoxQty !== Infinity) {
      idCount += 1;
      return solutions.push(obj);
    }
    return false;
  };
  for (let i = 0; i < getSelectedEcopacks().length; i += 1) {
    if (inputData.mbActive.cfs === true) {
      createOption(Cfs, getSelectedEcopacks()[i], 'A', '1');
      createOption(Cfs, getSelectedEcopacks()[i], 'A', '2');
    }
    if (inputData.mbActive.cpst === true) {
      createOption(Cpst, getSelectedEcopacks()[i], 'A', '1');
      createOption(Cpst, getSelectedEcopacks()[i], 'B', '1');
    }
    if (inputData.mbActive.cpsf === true) {
      createOption(Cpsf, getSelectedEcopacks()[i], 'A', '1');
      createOption(Cpsf, getSelectedEcopacks()[i], 'A', '2');
      createOption(Cpsf, getSelectedEcopacks()[i], 'B', '1');
      createOption(Cpsf, getSelectedEcopacks()[i], 'B', '2');
    }
  }
  return solutions;
}
