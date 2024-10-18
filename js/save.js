var player={}
gameLoaded = false
// "gameLoaded is not defined" mf thats why i'm defining it

function start(){
  let a={
    // tabs
    tab: "main",
    subtab: "none",
    prevtab: {
      gambling: "main",
    },
    // other
    lasttick: 0,
    // Base game
    points: d(0),
    minroll: d(0),
    maxroll: d(1),
    result: d(0),
    upgs: [null,d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0)],
    unl: {
      gambling: false,
    },
    // options
    offlineprogress: true,
    lastsaved: 0,
    // gambling level
    gamblinglevel: d(0),
    // luck stuff
    luck: {
      luck: d(0),
      points: d(0),
      lastsuccess: false,
      lastroll: 0,
      unluck: d(0),
      autoroll: false,
      upgs: [null,d(0),d(0),d(0),d(0)],
    },
    // the gwa is in
    gwaed: false,
  }
  return a
}
function save(){
  localStorage.setItem("dice rolling incremental save",btoa(JSON.stringify(player)))
  //$.notify('Saved game', 'success')
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
        miles,
      },
    }))
  gameLoaded=true
}

setInterval(function () {save()}, 10000);
window.onload=function(){load()};

function exportSave() {
  let str = btoa(JSON.stringify(player)); 
  const el = document.createElement("textarea");	
  el.value = str;	
  document.body.appendChild(el);	
  el.select();
  el.setSelectionRange(0, 99999);
  document.execCommand("copy");
  document.body.removeChild(el);
}

function importSave(imported = undefined) {
  if (imported === undefined) imported = prompt("paste your save here")
  if(imported == "gwa"){
    player.gwaed = true
    return
  }
  player =JSON.parse(atob(imported))
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