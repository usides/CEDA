const table = document.getElementById('results');
const menuHeader = document.getElementById('top-header');
let isInputChanged;
let screenBlock = true;
let currentScreen = document.getElementById('component-select');

function selectMenu(e) {
  const menuItem = e.target.closest('li');
  const screen = document.getElementById(menuItem.dataset.action);
  window.scrollTo(0, 0);

  

  const renderScreen = () => { // render screen and menu func
    // change menu selection
    document.querySelectorAll('.nav-elem').forEach((elem) => elem.classList.remove('active'));
    menuItem.classList.add('active');
    // load screen
    document.querySelectorAll('.screen').forEach((elem) => elem.classList.remove('active'));
    screen.classList.add('active');
    // change header
    menuHeader.innerHTML = menuItem.dataset.header;
  };

  if (screenBlock) {
    return showError('Please fill in correct data');
  }

  if (screen.id === 'component-select' || screen.id === 'ecopack-select' || screen.id === 'mb-select') {
    currentScreen = screen;
    changeScreenHeight();
    renderScreen();
  }

  if (screen.id === 'details' && !screen.classList.contains('active')) return showError('Please select a row from step 4.');

  // calculations screen
  if (screen.id === 'calculations') {
    if (Object.values(inputData.component).includes(0)) return showError('Please fill in correct component data on step 1.');
    if (inputData.hu.outerHeight === 0) return showError('Please fill in HU height on step 2.');
    if (Object.values(inputData.huActive).every((elem) => elem === false)) return showError('Please select HU on step 2.');
    if (Object.values(inputData.mbActive).every((elem) => elem === false)) return showError('Please select MB on step 3.');

    if (createSolutions().length === 0) return showError('solutions are not exist. change your input data.');

    if (isInputChanged === true) {
      const items = createSolutions().slice().sort((a, b) => b.partsInBoxQty - a.partsInBoxQty);
      table.tBodies[0].innerHTML = '';
      document.getElementById('sort-hu').classList.add('active');
      document.getElementById('sort-tr').classList.remove('active');
      for (let i = 0; i < items.length; i += 1) {
        const tr = document.createElement('tr');
        tr.addEventListener('click', () => showDetails(items[i].id, createSolutions()));
        tr.innerHTML = `
        <td>${items[i].name}</td>
        <td>${items[i].partsInBoxQty}</td>
        <td>${items[i].partsInTruckQty}</td>
        <td>${items[i].boxRequredQty}</td>
        `;
        table.tBodies[0].append(tr);
      }
      isInputChanged = false;
    }
    currentScreen = screen;
    changeScreenHeight();
    renderScreen();
  }
}

function clearInput(e) {
  e.target.value = '';
  }

function saveInput(e) {
  const pelem = e.target.dataset.pelem;
  const elem = e.target.dataset.elem;
  const addScreenBlock = () => {
    screenBlock = true;
    e.target.focus();
    setTimeout(() => window.scrollTo(0, 0), 100);
  }
  if (/compX|compY|compZ|compWgt|compTurn|outerHeight/.test(elem) && +e.target.value === 0) {
    showError('input can\'t be empty or 0');
    return addScreenBlock();
  }
  if (/compX|compY|compZ|compWgt|compTurn|outerHeight/.test(elem) 
  && /^0+\d/.test(e.target.value)) {
    showError('input can\'t start with 0');
    return addScreenBlock();
  }
  if (/compX|compY|compZ/.test(elem) && +e.target.value > 1530) {
    showError('dim is overly large');
    return addScreenBlock();
  }
  if (/compWgt/.test(elem) && +e.target.value > 100) {
    showError('component weight is too heavy');
    return addScreenBlock();
  }
  if (/compTurn/.test(elem) && +e.target.value > 999999) {
    showError('t-qty is too big');
    return addScreenBlock();
  }
  if (/outerHeight/.test(elem) && +e.target.value > 2400) {
    showError('hu height is higher than truck inner height');
    return addScreenBlock();
  }
  if (/outerHeight/.test(elem) && +e.target.value < 400) {
    showError('hu height is too short');
    return addScreenBlock();
  }
  inputData[pelem][elem] = +e.target.value;
  isInputChanged = true;
  screenBlock = false;
}

// table select options func
function showDetails(elem, sols) {
  document.querySelectorAll('.screen').forEach((elem) => elem.classList.remove('active'));
  document.getElementById('details').classList.add('active');
  document.querySelectorAll('.nav-elem').forEach((elem) => elem.classList.remove('active'));
  document.getElementById('step-5').classList.add('active');
  window.scrollTo(0, 0);
  menuHeader.innerHTML = sols[elem].name.replace('<br>', ' ');

  // populate data from obj
  document.querySelector('[data-detail=p-dims]').innerHTML = `${sols[elem].partX} x ${sols[elem].partY} x ${sols[elem].partZ} mm`;
  document.querySelector('[data-detail=p-wgt]').innerHTML = `${inputData.component.compWgt} kg`;
  document.querySelector('[data-detail=p-t-qty]').innerHTML = `${inputData.component.compTurn} pcs`;
  document.querySelector('[data-detail=box-type]').innerHTML = sols[elem].boxType;
  document.querySelector('[data-detail=box-odims]').innerHTML = `${sols[elem].outerX} x ${sols[elem].outerY} x ${sols[elem].outerZ} mm`;
  document.querySelector('[data-detail=box-idims]').innerHTML = `${sols[elem].innerX} x ${sols[elem].innerY} x ${sols[elem].innerZ} mm`;
  document.querySelector('[data-detail=box-wgt]').innerHTML = `${sols[elem].boxWeight} kg`;
  document.querySelector('[data-detail=mb-type]').innerHTML = sols[elem].bagType;
  document.querySelector('[data-detail=mb-material]').innerHTML = sols[elem].bagMaterial;
  document.querySelector('[data-detail=mb-dims]').innerHTML = `${sols[elem].innerRX} x ${sols[elem].innerRY} x ${sols[elem].innerRZ} mm`;
  document.querySelector('[data-detail=mb-matrix]').innerHTML = `${sols[elem].matrixX} x ${sols[elem].matrixY} x ${sols[elem].matrixZ}`;
  document.querySelector('[data-detail=mb-pocket]').innerHTML = `${sols[elem].pocketX} x ${sols[elem].pocketY} x ${sols[elem].pocketZ} mm`;
  document.querySelector('[data-detail=mb-capacity]').innerHTML = `${sols[elem].partsInBoxQty} pcs`;
  document.querySelector('[data-detail=mb-wgt]').innerHTML = `${sols[elem].bagWeight} kg`;
  document.querySelector('[data-detail=hu-mb-qty]').innerHTML = `${sols[elem].boxRequredQty} pcs`;
  document.querySelector('[data-detail=hu-mb-wgt]').innerHTML = `${sols[elem].solWeight} kg`;
  document.querySelector('[data-detail=hu-mb-pwgt]').innerHTML = `${sols[elem].partsInBoxWeight} kg`;
  document.querySelector('[data-detail=hu-mb-loaded]').innerHTML = `${sols[elem].boxLoadedWeight} kg`;
  document.querySelector('[data-detail=tr-hu-qty]').innerHTML = `${sols[elem].boxInTruckQty} pcs`;
  document.querySelector('[data-detail=tr-comp-qty]').innerHTML = `${sols[elem].partsInTruckQty} pcs`;
  document.querySelector('[data-detail=tr-wgt]').innerHTML = `${sols[elem].truckLoadedWeight} kg`;
  document.querySelector('[data-detail=tr-qty]').innerHTML = `${sols[elem].truckRequredQty} trucks`;
}

function sortTable(e) {
  const th = e.target;
  document.querySelectorAll('.sort-button').forEach((elem) => elem.classList.remove('active'));
  th.classList.add('active');
  const rowsArray = Array.from(table.tBodies[0].rows);
  const compare = (rowA, rowB) => rowB.cells[th.cellIndex].innerHTML
  - rowA.cells[th.cellIndex].innerHTML;
  rowsArray.sort(compare);
  table.tBodies[0].append(...rowsArray);
}

function selectHu(e) {
  if (e.target.id !== 'eco-all-btn') {
    const hu = e.target.dataset.type;
    e.target.classList.toggle('active');
    inputData.huActive[hu] = !inputData.huActive[hu];
  } else {
    document.querySelectorAll('.eco-btn:not([id=eco-all-btn])').forEach((elem) => elem.classList.add('active'));
    for (let key in inputData.huActive) inputData.huActive[key] = true;
  }
  isInputChanged = true;
}

function selectMb(e) {
  if (e.target.id !== 'mb-all-btn') {
    const mb = e.target.dataset.type;
    e.target.classList.toggle('active');
    inputData.mbActive[mb] = !inputData.mbActive[mb];
  } else {
    document.querySelectorAll('.mb-btn:not([id=mb-all-btn])').forEach((elem) => elem.classList.add('active'));
    for (let key in inputData.mbActive) inputData.mbActive[key] = true;
  }
  isInputChanged = true;
}

function showError(msg) {
  const er = document.getElementById('error');
  er.classList.add('active');
  document.getElementById('error-msg').textContent = msg;
  setTimeout(() => {
    er.classList.remove('active');
  }, 2000);
}

function changeScreenHeight() {
  let result = (window.innerHeight - parseInt(getComputedStyle(currentScreen).top, 10)) + "px";
  currentScreen.style.height = result;
  if (parseInt(result, 10) < 280) {
    currentScreen.classList.add('nologo');
  } else {
    currentScreen.classList.remove('nologo');
  }
}

document.querySelectorAll('.nav-elem').forEach((elem) => elem.addEventListener('click', selectMenu));
document.querySelectorAll('.data-input').forEach((elem) => elem.addEventListener('focus', clearInput));
document.querySelectorAll('.data-input').forEach((elem) => elem.addEventListener('blur', saveInput));
document.querySelectorAll('.sort-button').forEach((elem) => elem.addEventListener('click', sortTable));
document.querySelectorAll('.eco-btn').forEach((elem) => elem.addEventListener('click', selectHu));
document.querySelectorAll('.mb-btn').forEach((elem) => elem.addEventListener('click', selectMb));
window.addEventListener('resize', changeScreenHeight);
document.addEventListener('DOMContentLoaded', changeScreenHeight);

// service worker
async function registerSW() {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('./sw.js');
    } catch (e) {
      alert('ServiceWorker registration failed. Sorry about that.');
    }
  }
}
registerSW();
