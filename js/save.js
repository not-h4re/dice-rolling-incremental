var player={}
gameLoaded = false
hasNaN = false
NaNalerted = false
// "gameLoaded is not defined" thats why i'm defining it
// these globals are redundant (except player)

function start(){
  let a={
    // tabs
    tab: "main",
    subtab: "none",
    // other
    lasttick: 0,
    unl: {
      gambling: false,
      dice: false,
    },
    // base game
    points: d(0),
    bestpoints: d(0),
    minroll: d(0),
    maxroll: d(1),
    result: d(0),
    upgs: [null,d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0)],
    auto: false,
    // gambling
    gamblinglevel: D(0),
    bestgl: D(0),
    // luck
    luck: {
      luck: D(0),
      points: D(0),
      unluck: D(0),
      lastroll: D(0),
      upgs: [null, d(0),d(0),d(0),d(0),d(0)],
      freeupgs: [null, d(0),d(0),d(0),d(0),d(0)],
      auto: false,
    },
    // dice
    dice: {
      amount: d(0),
      total: D(0),
      items: [null,d(0),d(0),d(0),d(0)],
      upgattempts: [null,d(0),d(0),d(0),d(0)],
      lastattempt: [null,d(0),d(0),d(0),d(0)],
      shards: d(0),
      resets: 0,
      upgs: [],
      tokens: d(0),
      totaltokens: d(0),
      chal: {
        current: 0,
        best: [null,d(0),d(0),d(0),d(0)]
      },
    },
    // options
    offlineprogress: true,
    lastsaved: 0,
    digitsep: ",",
    // secrets :3
    gwaed: false,
    tacocatside: false,
  }
  return a
}
function save(){
  localStorage.setItem("dice rolling incremental save",btoa(JSON.stringify(player)))
  //$.notify('Saved game', 'success') artifact of when i used jQuery to do this
  player.lastsaved  = Date.now()
}
function fixSave() {
    let defaultData = start();
    fixData(defaultData, player);
}

function fixData(defaultData, newData) {
    for (item in defaultData) {
        if (defaultData[item] == null) {
            if (newData[item] === undefined)
                newData[item] = null;
        }
        else if (Array.isArray(defaultData[item])) {
            if (newData[item] === undefined)
                newData[item] = defaultData[item];
            else
                fixData(defaultData[item], newData[item]);
        }
        else if (defaultData[item] instanceof Decimal) { // Convert to Decimal
            if (newData[item] === undefined)
                newData[item] = defaultData[item];
            else
                newData[item] = new Decimal(newData[item]);
        }
        else if ((!!defaultData[item]) && (typeof defaultData[item] === "object")) {
            if (newData[item] === undefined || (typeof defaultData[item] !== "object"))
                newData[item] = defaultData[item];
            else
                fixData(defaultData[item], newData[item]);
        }
        else {
            if (newData[item] === undefined)
                newData[item] = defaultData[item];
        }
    }
}

function load() {
	let get = localStorage.getItem("dice rolling incremental save");
	if (get === null || get === undefined) {
		player = start();
	}
	else {
		player = Object.assign(start(), JSON.parse(decodeURIComponent(escape(atob(get)))));
		fixSave();
	}
  (app = new Vue({
      el: "#app",
      data: {
        player,
        Decimal,
        format,
        formatWhole,
        upgs,
        f,
        ITEM_NAMES,
        BOOST_TEXT,
        DICEUPGS
      },
    }))
}

setInterval(function () {save()}, 10000);
setInterval(function(){
  localStorage.setItem("dice rolling incremental backup", btoa(JSON.stringify(player)))
}, 60000)
window.onload=function(){load()};

function exportSave() {
  let str = btoa(JSON.stringify(player)); 
  const el = document.createElement("textarea");	
  el.value = str;	
  document.body.appendChild(el);	
  el.select();
  el.setSelectionRange(0, 999999);
  document.execCommand("copy");
  document.body.removeChild(el);
}

function importSave(imported = undefined) {
  if (imported === undefined) imported = prompt("paste your save here")
  if(imported == "gwa"){
    player.gwaed = true
    return
  }
  if(imported == "taco cat side"){
    player.tacocatside = true
    return
  }
  player =JSON.parse(atob(imported))
  player.needsBackup=false
  save()
  window.location.reload();
}
    
function hardReset(){
  if(confirm("This will reset all game progress! It is not a prestige and will give no reward!! Are you sure??")){
    player=start()
    window.location.reload();
    save()
  }
}

function toggleDigitSep(){
  if(player.digitsep == ",") {
    player.digitsep = " "
  } else {
    player.digitsep = ","
  }
}
function digitSepText(){
  if(player.digitsep == ",") {
    return "comma"
  } else {
    return "space"
  }
}