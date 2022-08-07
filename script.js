/* eslint-disable no-alert */

/**************
 *   SLICE 1
 **************/

function updateCoffeeView(coffeeQty) {
  const coffeeCounter = document.getElementById('coffee_counter');

  coffeeCounter.innerText = Math.floor(coffeeQty);
}

function clickCoffee(data) {
  data.coffee += 1;
  updateCoffeeView(data.coffee);
  renderProducers(data);
}

/**************
 *   SLICE 2
 **************/

function unlockProducers(producers, coffeeCount) {
  
  producers.forEach((val) => {
    if (coffeeCount >= val.price / 2) { val.unlocked = true; }
  })
}

function getUnlockedProducers(data) {
  return data.producers.filter((val) => val.unlocked === true)
}

function makeDisplayNameFromId(id) {
  return id.split('_').map((word) => {
      return word[0].toUpperCase() + word.slice(1);
  }).join(' ')
}

// You shouldn't need to edit this function-- its tests should pass once you've written makeDisplayNameFromId
function makeProducerDiv(producer) {
  const containerDiv = document.createElement('div');
  containerDiv.className = 'producer';
  const displayName = makeDisplayNameFromId(producer.id);
  const currentCost = producer.price;
  const html = `
  <div class="producer-column">
    <div class="producer-title">${displayName}</div>
    <div class="producer-buttons">
      <button type="button" id="buy_${producer.id}">Buy</button>
      <button type="button" id="sell_${producer.id}">Sell @ 80%</button>
    </div>
  </div>
  <div class="producer-column">
    <div>Quantity: ${producer.qty}</div>
    <div>Coffee/second: ${producer.cps}</div>
    <div>Cost: ${currentCost} coffee</div>
  </div>
  `;
  containerDiv.innerHTML = html;
  return containerDiv;
}

function deleteAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

function renderProducers(data) {
  let producerContainer = document.getElementById('producer_container');
  unlockProducers(data.producers, data.coffee);

  data.producers.forEach((producer) => {
    producerContainer.append((makeProducerDiv(producer)))
  })

  deleteAllChildNodes(producerContainer);
  
  data.producers.forEach((producer) => {
    if (producer.unlocked === true) {
      producerContainer.appendChild(makeProducerDiv(producer))
    }
  })
  
}

/**************
 *   SLICE 3
 **************/

function getProducerById(data, producerId) {
  return data.producers.filter((producerObj) => {
    if (producerObj.id === producerId) {  
      return producerObj;
    }
  })[0];
}

function canAffordProducer(data, producerId) {
  return data.coffee >=  getProducerById(data, producerId).price ? true : false;
}

function updateCPSView(cps) {
  const cpsCounter = document.getElementById('cps');
  cpsCounter.innerText = cps;
}

function updatePrice(oldPrice) {
  return Math.floor(oldPrice * 1.25)
}

function attemptToBuyProducer(data, producerId) {
  const currentProducer = getProducerById(data, producerId);

  if (canAffordProducer(data, currentProducer.id)) {
    currentProducer.qty += 1;
    data.coffee -= currentProducer.price;
    currentProducer.price = updatePrice(currentProducer.price);
    data.totalCPS += currentProducer.cps;
    return true;
  }

  return false;
}

function buyButtonClick(event, data) {
  
  if (event.target.tagName === 'BUTTON') {
    
    if (event.target.id.includes('sell')) { 
      const sellProducerId = event.target.id.slice(5);
      const currentProducer = getProducerById(data, sellProducerId);
      if (currentProducer.qty > 0) {
        const sellAmount = currentProducer.price * 0.8;
        data.coffee += sellAmount;
        data.totalCPS -= currentProducer.cps;
        currentProducer.qty -= 1;
        updateCoffeeView(data.coffee);
        updateCPSView(data.totalCPS);
        renderProducers(data);
        return 
      }
      else {
        return window.alert('You dont have any to sell!')
      }
    }
    
    const producerId = event.target.id.slice(4);
    const currentProducer = getProducerById(data, producerId);
    const canAfford = canAffordProducer(data, producerId);

    if (canAfford) {
      let updatedCPS = currentProducer.cps + data.totalCPS;
      attemptToBuyProducer(data, producerId);
      updateCPSView(updatedCPS);
      updateCoffeeView(data.coffee);
      renderProducers(data);
    }
    else {
      window.alert("Not enough coffee!");
    }
  }

}

function saveGame(data) {
  window.localStorage.setItem('prevGame', JSON.stringify(data));
}

function clearGame() {
  window.localStorage.clear();
  window.location.reload();
}

function animation() {
    
    
}

function tick(data) {
  data.coffee += data.totalCPS;
  updateCoffeeView(data.coffee);
  unlockProducers(data.producers, data.coffee);
  renderProducers(data);
}




/*************************
 *  Start your engines!
 *************************/

// You don't need to edit any of the code below
// But it is worth reading so you know what it does!

// So far we've just defined some functions; we haven't actually
// called any of them. Now it's time to get things moving.

// We'll begin with a check to see if we're in a web browser; if we're just running this code in node for purposes of testing, we don't want to 'start the engines'.

// How does this check work? Node gives us access to a global variable /// called `process`, but this variable is undefined in the browser. So,
// we can see if we're in node by checking to see if `process` exists.
if (typeof process === 'undefined') {
  // Get starting data from the window object
  // (This comes from data.js)
  let data = window.data;
  let audioFile = new Audio('gulp.wav');

  if (window.localStorage.getItem('prevGame')) {
    data = JSON.parse(window.localStorage.getItem('prevGame'));

    updateCoffeeView(data.coffee);
    updateCPSView(data.totalCPS);
    renderProducers(data);
  }

  // Add an event listener to the giant coffee emoji
  const bigCoffee = document.getElementById('big_coffee');
  bigCoffee.addEventListener('click', (e) => {
    audioFile.play();
    bigCoffee.classList.remove('big_coffee_class');
    void bigCoffee.offsetWidth; 
    bigCoffee.classList.add('big_coffee_class');
    clickCoffee(data);
  });

  const clearGameButton = document.getElementById('clear-game');
  clearGameButton.addEventListener('click', () => { clearGame() })

  // Add an event listener to the container that holds all of the producers
  // Pass in the browser event and our data object to the event listener
  const producerContainer = document.getElementById('producer_container');

  producerContainer.addEventListener('click', event => {
    buyButtonClick(event, data);
  });


  // Call the tick function passing in the data object once per second
  setInterval(() => tick(data), 1000);
  setInterval(() => saveGame(data), 1000);
  
}
// Meanwhile, if we aren't in a browser and are instead in node
// we'll need to exports the code written here so we can import and
// Don't worry if it's not clear exactly what's going on here;
// We just need this to run the tests in Mocha.
else if (process) {
  module.exports = {
    updateCoffeeView,
    clickCoffee,
    unlockProducers,
    getUnlockedProducers,
    makeDisplayNameFromId,
    makeProducerDiv,
    deleteAllChildNodes,
    renderProducers,
    updateCPSView,
    getProducerById,
    canAffordProducer,
    updatePrice,
    attemptToBuyProducer,
    buyButtonClick,
    tick
  };
}
