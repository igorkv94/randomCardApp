var preId = 'card-flip-';
var backClass = 'back';
var count;
var promises = [];
var preCard = [];
var interval = 1000;
var curInterval;

function chooseImg(id) {
  promises.push(new Promise(function (resolve, reject) {
    var rW = randomWords();
    var feed = new Instafeed({
      get: 'tagged',
      tagName: rW,
      accessToken: '3848585827.ba4c844.d0d3e1b6e8614518b92e464cb1ce3031',
      target: preId + id,
      resolution: 'low_resolution',
      limit: 1,
      template: '<figure class="' + backClass + '"><a href="{{link}}"><img src="{{image}}" /></a></figure>',
      after: function (data) {
        var item = document.getElementById(preId + id).getElementsByClassName(backClass)[0];
        var num = randomId(preCard);
        preCard.splice(preCard.indexOf(num), 1);
        var node = item.cloneNode(true);
        document.getElementById(preId + num).appendChild(node);
        resolve();
      },
      error: function () {
        reject(new Error("Error in API!"));
      }
    });
    feed.run();
  }));
}


var remainingCard = [];
var saved = [];
var fSrc;
var secSrc;
var fId;
var secId;

function CardInfo(id, src) {
  this.getId = function () {
    return id;
  };
  this.getSrc = function () {
    return src;
  };
}

window.onload = function () {
  count = document.getElementsByClassName('card').length;
  for (var i = 0; i < count; i++) {
    remainingCard.push(i);
    preCard.push(i); 
  }
  var halfCount = count / 2;
  for (i = 0; i < halfCount; i++) {
    var num = randomId(preCard);
    preCard.splice(preCard.indexOf(num), 1);
    chooseImg(num);
  }
  Promise.all(promises).then(function (data) {
    curInterval = setInterval(nextStep, interval);
    promises = [];
  });
};

var step = 0;

function nextStep() {
  console.log("Step " + step);
  if (step === 0) {
    fId = randomId();
    flip(fId);
    fSrc = getSrc(fId);
    console.log("F " + fId);
  } else {
    if (step === 1) {
      secId = chooseSecondCard(fId, fSrc);
      console.log("ATTENTION");
      console.log("F " + fId);
      console.log("S " + secId);
      flip(secId);
      secSrc = getSrc(secId);
    } else {
      console.log("F " + fId);
      console.log("S " + secId);

      if (fSrc === secSrc) {
        hide(fId);
        hide(secId);
        deleteCards(fId, secId);
        console.log("deleteCard Done");
        if (remainingCard.length === 0) {
          clearInterval(curInterval);
          saved = [];
          for (var i = 0; i < count; i++) {
            remainingCard.push(i);
            preCard.push(i);
            flip(i);
            hide(i);            
            var child = document.getElementById(preId + i).getElementsByClassName(backClass)[0];
            child.parentNode.removeChild(child);
          }
          var halfCount = count / 2;
          for (i = 0; i < halfCount; i++) {
            var num = randomId(preCard);
            preCard.splice(preCard.indexOf(num), 1);
            chooseImg(num);
          }
          Promise.all(promises).then(function (data) {
            curInterval = setInterval(nextStep, interval);
            promises = [];
          });
          console.log("restart Done");
        }
      } else {
        flip(fId);
        flip(secId);
        addCard(fId, fSrc);
        addCard(secId, secSrc);
      }
    }

  }
  console.log("Done");
  step++;
  if (step === 3) step = 0;
}

function randomId(arr) {
  arr = (typeof arr !== 'undefined') ? arr : remainingCard;
  console.log(arr);
  console.log(remainingCard);
  var n = Math.floor(Math.random() * arr.length);
  console.log(n);
  return arr[n];
}

function getSrc(id) {
  console.log(id);
  return document.getElementById(preId + id).getElementsByClassName(backClass)[0].getElementsByTagName('img')[0].getAttribute('src');
}

function flip(id) {
  document.getElementById(preId + id).classList.toggle("flipped");
}

function hide(id) {
  document.getElementById(preId + id).classList.toggle("hide");
}

function addCard(id, src) {
  var check = 
  saved.some(function (item) {
    if (item.getId() === id) {
      return true;
    }
    return false;
  });
  saved.push(new CardInfo(id, src));
}

function deleteCards(id1, id2) {
  remainingCard.splice(remainingCard.indexOf(id1), 1);
  remainingCard.splice(remainingCard.indexOf(id2), 1);
  console.log(remainingCard);
  saved.forEach(function (item, i, arr) {
    if (item.getId() === id2) {
      arr.splice(i, 1);
    }
  });
  console.log(saved);
}

function havingPair(id, src) {
  var value = -1;
  saved.forEach(function (item, i, arr) {
    if (item.getId() !== id) {
      if (item.getSrc() === src) {
        value = item.getId();
      }
    }
  });
  return remainingCard.indexOf(value);
}

function chooseSecondCard(id, src) {
  var value = havingPair(id, src);

  if (value === -1) {
    if (saved.length === 0) {
      var arr1 = remainingCard.slice();
      arr1.splice(arr1.indexOf(id),1);
      console.log("OOOOOOOOOOOOOOOOOOO "+remainingCard);
      console.log("OOOOOOOOOOOOOOOOOOO "+arr1);
      return randomId(arr1);
    } else {
      var toRemove = saved.map(function (item) {
        return item.getId();
      });
      toRemove.push(fId);

      var arr = remainingCard.filter(function (item) {
        return !toRemove.includes(item);
      });
        console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA ");

      console.log("ERROR in " + toRemove);
      value = randomId(arr);
      console.log("ERROR in " + value);
      console.log("ERROR in " + value);
      console.log("ERROR in " + value);
      return value;
    }
  } else {
        console.log("BBBBBBBBBBBBBBBBBBBBBBBBBB ");
    return remainingCard[value];}
}

