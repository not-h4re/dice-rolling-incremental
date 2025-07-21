// vscode please let me access the top of my code


function update(diff, isoffline=false) {
  player.minroll = getMinRoll()
  player.maxroll = getMaxRoll()

  if(player.started==0){
    player.started=Date.now()
    player.lasttick=Date.now()/1000
  }
  if(player.points.gte(1e10)) player.unl.gambling = true
  if(miles[14].owned()) player.unl.dice = true

  //console.log(diff)
  /*for(let i=5;i<=9;i++){
    if(player.upgs[i].gt(0)){
      buyupg(i-4,true)
    }
  }*/
  
  player.bestpoints = Decimal.max(player.points, player.bestpoints)

  if(player.gamblinglevel.gte(2)){
    buyupg(1)
    buyupg(2)
    buyupg(3)
  }
  if(player.gamblinglevel.gte(3)){
    buyupg(4)
    buyupg(5)
    buyupg(6)
  }
  if(player.gamblinglevel.gte(4)){
    buyupg(7)
    buyupg(8)
    buyupg(9)
    buyupg(10)
  }
  if(miles[10].owned()){
    buyupg(11, true)
    buyupg(12, true)
    buyupg(13, true)
    buyupg(14, true)
    buyupg(15, true)
    buyupg(16, true)
    buyupg(17, true)
    buyupg(18, true)
    buyupg(19, true)
    buyupg(20, true)
  }
  if(player.auto){
    roll()
  }
  if(player.luck.auto){
    luckRoll()
  }
  player.luck.points = player.luck.points.add(luckPointGen().mul(diff))
  if(miles[12].owned()){player.luck.freeupgs[5] = player.gamblinglevel.sub(13).pow(2).mul(5).min(200)}
  player.dice.shards = player.dice.shards.add(diceShardGain().mul(diff))
}

setInterval(function() {
  update(Math.min(1, (Date.now()/1000) - player.lasttick))
  player.lasttick = Date.now()/1000
}, 50)

function D(x) {
  return new Decimal(x)
}
function d(x){
  return new Decimal(x)
}

function currentTime() {
  return Date.now()
}
function tab(tab, subtab=undefined) {
  if(subtab != undefined) player.subtab = subtab
  else if(player.subtab != "none"){
    player.prevtab[player.tab] = player.subtab
    player.subtab = "none"
  }
  player.tab = tab.toString()
}
function checkTab(tab, subtab=undefined){
  return player.tab==tab && (subtab==undefined || player.subtab==subtab)
}
function getMinRoll() {
  let a = D(1)
  a = a.add(upgs[8].eff())
  a = a.mul(upgs[4].eff()[0])
  a = a.mul(upgs[12].eff())

  // a dice cant have negative sides
  a = a.min(player.maxroll)
  return a
}
function getMaxRoll() {
  let a = D(1)
  a = a.add(upgs[1].eff())
  a = a.mul(upgs[4].eff()[1])
  a = a.mul(upgs[7].eff())
  a = a.mul(upgs[13].eff())
  return a
}
function pointMul() {
  let m = D(1)
  m = m.add(upgs[9].eff())
  m = m.mul(upgs[3].eff())
  m = m.mul(upgs[6].eff())
  m = m.pow(upgs[5].eff()) // mrow
  m = m.mul(upgs[10].eff())
  m = m.mul(gamblingPointBoost())
  m = m.mul(luckToPointBoost())
  m = m.mul(upgs[11].eff())
  m = m.mul(upgs.luck[4].eff())
  m = m.mul(getItemBoost(1))
  if(diceUpgOwned(11)) m = m.mul(DICEUPGS[11].effect())
  if(diceUpgOwned(12)) m = m.mul(DICEUPGS[12].effect())
  if(diceUpgOwned(13)) m = m.mul(DICEUPGS[13].effect())
  if(diceUpgOwned(14)) m = m.mul(DICEUPGS[14].effect())
  return m
}
function rollnum() {
  let r = D(Math.random())
  let e = player.maxroll.sub(player.minroll).mul(r).add(player.minroll)
  return e
}
function gainEst() {
  return pointMul().mul(player.maxroll.sub(player.minroll).div(2).add(player.minroll))
}
function roll(a=false) {
  let x = rollnum(a)
  player.result = x
  x=x.mul(pointMul())
  player.points = player.points.add(x)
}
function upgCostMod() {
  let m = D(1)
  m = m.mul(getItemBoost(2))
  return m
}
const upgs = {
  1: {
    description() {return `+`+f(D(1).add(upgs[2].eff()))+` to max roll`},
    cost() {
      return Decimal.pow(2, player.upgs[1]).div(upgCostMod())
    },
    effDis() {return "+"+formatWhole(upgs[1].eff())},
    unlocked() {return true},
    eff() {return player.upgs[1].mul(D(1).add(upgs[2].eff()))},
    curr: "points",
    cap() {return D(10)},
  },
  2: {
    description() {return `+1 pu1's effect`},
    cost() {return D(10).mul(Decimal.pow(3, player.upgs[2])).div(upgCostMod())},
    eff() {return player.upgs[2]},
    effDis() {return `+`+formatWhole(upgs[2].eff())},
    unlocked() {return true},
    curr: "points",
    cap() {
      let cap = D(7)
      if(miles[2].owned()) cap = d(10)
      return cap
    },
  },
  3: {
    description() {return `Multiply point gain`},
    cost() {
      if(player.upgs[3].lte(4)) return D(50).mul(Decimal.pow(5, player.upgs[3])).div(upgCostMod())
      else return D(4e12).mul(Decimal.pow(25, player.upgs[3].sub(5).pow(1.5)))
    },
    eff() {return Decimal.pow(1.1, Decimal.pow(player.upgs[3], 2))},
    effDis() {return `x`+f(upgs[3].eff())},
    unlocked() {return true},
    curr: "points",
    cap() {
      let cap = D(5)
      if(miles[3].owned()) cap = d(10)
      return cap
    },
  },
  4: {
    description() {return `x`+f(d(2.5+(miles[4].owned()?0.5:0)))+` minimum roll and x`+f(d(1.25+(miles[4].owned()?1:0)))+` maximum roll`},
    cost() {return D(100).mul(Decimal.pow(4, player.upgs[4])).div(upgCostMod())},
    eff() {return [Decimal.pow(2.5+(miles[4].owned()?0.5:0), player.upgs[4]), Decimal.pow(1.25+(miles[4].owned()?1:0), player.upgs[4])]},
    effDis() {return `x`+f(upgs[4].eff()[0])+`, x`+f(upgs[4].eff()[1])},
    unlocked() {return true},
    curr: "points",
    cap() {
      let cap = D(6)
      if(miles[2].owned()) cap = d(10)
      return cap
    },
  },
  5: {
    description() {return "^+0.1 point gain multiplier"},
    cost() {return D(2000).mul(Decimal.pow(10, player.upgs[5])).div(upgCostMod())},
    eff() {return player.upgs[5].mul(0.1).add(1)},
    effDis() {return `^`+f(upgs[5].eff())},
    unlocked() {return true},
    curr: "points",
    cap() {return D(3)}
  },
  6: {
    description() {return "Multiply point gain based on minimum roll"},
    cost() {return D(10000).mul(Decimal.pow(5, player.upgs[6])).mul(Decimal.pow(10000, player.upgs[6].sub(3).max(0))).div(upgCostMod())},
    eff() {return Decimal.pow(player.upgs[6].mul(0.5).add(1), player.minroll.max(1).log10().max(0)).min(1e10)},
    effDis() {return `x`+f(upgs[6].eff())},
    unlocked() {return true},
    curr: "points",
    cap() {
      let cap = D(4)
      if(miles[6].owned()) cap = d(10)
      return cap
    },
  },
  7: {
    description() {return "Multiply maximum roll based on point gain multiplier"},
    cost() {return D(2e6).mul(Decimal.pow(17, player.upgs[7])).div(upgCostMod())},
    eff() {return pointMul().max(1).log10().mul(player.upgs[7].pow(1.2)).max(1)},
    effDis() {return `x`+f(upgs[7].eff())},
    unlocked() {return true},
    curr: "points",
    cap() {return D(3)},
  },
  8: {
    description() {return "Add 1 to minimum roll before multipliers"},
    cost() {return D(5e6).mul(Decimal.pow(13.5, player.upgs[8])).div(upgCostMod())},
    eff() {return player.upgs[8]},
    effDis() {return `+`+formatWhole(upgs[8].eff())},
    unlocked() {return true},
    curr: "points",
    cap() {return D(3)},
  },
  9: {
    description() {return "Add 0.5 to base point gain multiplier"},
    cost() {return D(1.5e7).mul(Decimal.pow(8, player.upgs[9].pow(0.9))).div(upgCostMod())},
    eff() {return player.upgs[9].mul(0.5).pow(miles[6].owned()?2.2:1)},
    effDis() {return `+`+f(upgs[9].eff())},
    unlocked() {return true},
    curr: "points",
    cap() {
      let cap = D(4)
      if(miles[2].owned()) cap = d(10)
      return cap
    },
  },
  10: {
    description() {return "Total pu1~9 levels multiply point gain"},
    cost() {return D(1e8).mul(Decimal.pow(10, player.upgs[10])).mul(Decimal.pow(1000, player.upgs[10].sub(3).max(0))).div(upgCostMod())},
    eff() {
      let x=d(0)
      for(i=1;i<=9;i++){x=x.add(player.upgs[i])}
      return player.upgs[10].pow(2).mul(x).mul(0.1).add(1)
    },
    effDis() {return `x`+f(upgs[10].eff())},
    unlocked() {return true},
    curr: "points",
    cap() {
      let cap = d(1)
      if(miles[1].owned()) cap = d(3)
      if(miles[5].owned()) cap = d(10)
      return cap
    },
  },
  11: {
    description() {return "Multiply point gain by "+f(d(miles[9].owned()?0.1:0).add(1.05))},
    cost() {return D(1e27).mul(Decimal.pow(1.1, player.upgs[11].pow(2.5-(miles[13].owned()?0.5:0)))).div(upgs[20].eff()).div(upgs.luck[5].eff()).div(upgCostMod())},
    eff() {return Decimal.pow(d(miles[9].owned()?0.1:0).add(1.05), player.upgs[11])},
    effDis() {return `x`+f(upgs[11].eff())},
    unlocked() {return miles[8].owned()},
    curr: "points",
    cap() {return D(10000)},
  },
  12: {
    description() {return "Multiply minimum roll by "+f(d(miles[9].owned()?0.08:0).add(1.04))},
    cost() {return D(1e27).mul(Decimal.pow(1.08, player.upgs[12].pow(2.25-(miles[13].owned()?0.5:0)))).div(upgs[20].eff()).div(upgs.luck[5].eff()).div(upgCostMod())},
    eff() {return Decimal.pow(d(miles[9].owned()?0.08:0).add(1.04), player.upgs[12])},
    effDis() {return `x`+f(upgs[12].eff())},
    unlocked() {return miles[8].owned()},
    curr: "points",
    cap() {return D(10000)},
  },
  13: {
    description() {return "Multiply maximum roll by "+f(d(miles[9].owned()?0.08:0).add(1.04))},
    cost() {return D(1e27).mul(Decimal.pow(1.08, player.upgs[13].pow(2.25-(miles[13].owned()?0.5:0)))).div(upgs[20].eff()).div(upgs.luck[5].eff()).div(upgCostMod())},
    eff() {return Decimal.pow(d(miles[9].owned()?0.08:0).add(1.04), player.upgs[13])},
    effDis() {return `x`+f(upgs[13].eff())},
    unlocked() {return miles[8].owned()},
    curr: "points",
    cap() {return D(10000)},
  },
  14: {
    description() {return "Divide gambling level requirement by "+f(d(miles[9].owned()?0.5:0).add(1.5))},
    cost() {return D(1e27).mul(Decimal.pow(1.2, player.upgs[14].pow(2.5-(miles[13].owned()?0.5:0)))).div(upgs[20].eff()).div(upgs.luck[5].eff()).div(upgCostMod())},
    eff() {return Decimal.pow(d(miles[9].owned()?0.5:0).add(1.5), player.upgs[14])},
    effDis() {return `/`+f(upgs[14].eff())},
    unlocked() {return miles[8].owned()},
    curr: "points",
    cap() {return D(10000)},
  },
  15: {
    description() {return "Multiply the 1/Math.random() in the luck formula by "+f(d(miles[9].owned()?0.15:0).add(1.1))},
    cost() {return D(1e27).mul(Decimal.pow(1.15, player.upgs[15].pow(2-(miles[13].owned()?0.3:0)))).div(upgs[20].eff()).div(upgs.luck[5].eff()).div(upgCostMod())},
    eff() {return Decimal.pow(d(miles[9].owned()?0.15:0).add(1.1), player.upgs[15])},
    effDis() {return `x`+f(upgs[15].eff())},
    unlocked() {return miles[8].owned()},
    curr: "points",
    cap() {return D(10000)},
  },
  16: {
    description() {return "Multiply unluck gain by 1.5"},
    cost() {return D(1e27).mul(Decimal.pow(1.17, player.upgs[16].pow(2.5-(miles[13].owned()?0.5:0)))).div(upgs[20].eff()).div(upgs.luck[5].eff()).div(upgCostMod())},
    eff() {return Decimal.pow(1.5, player.upgs[16])},
    effDis() {return `x`+f(upgs[16].eff())},
    unlocked() {return miles[8].owned()},
    curr: "points",
    cap() {return D(100)},
  },
  17: {
    description() {return "Increase the base of the luck point effect formula by 0.01"},
    cost() {return D(1e27).mul(Decimal.pow(1.15, player.upgs[17].pow(2.75-(miles[13].owned()?0.7:0)))).div(upgs[20].eff()).div(upgs.luck[5].eff()).div(upgCostMod())},
    eff() {return Decimal.mul(0.01, player.upgs[17])},
    effDis() {return `+`+f(upgs[17].eff())},
    unlocked() {return miles[8].owned()},
    curr: "points",
    cap() {return D(100)},
  },
  18: {
    description() {return "Increase the exponent in the unluck effect formula by 0.012"},
    cost() {return D(1e27).mul(Decimal.pow(1.17, player.upgs[18].pow(2.75-(miles[13].owned()?0.7:0)))).div(upgs[20].eff()).div(upgs.luck[5].eff()).div(upgCostMod())},
    eff() {return Decimal.mul(0.012, player.upgs[18])},
    effDis() {return `+`+f(upgs[18].eff())},
    unlocked() {return miles[8].owned()},
    curr: "points",
    cap() {return D(100)},
  },
  19: {
    description() {return "Add 0.02 to the base of the luck point generation formula"},
    cost() {return D(1e27).mul(Decimal.pow(1.21, player.upgs[19].pow(2.75-(miles[13].owned()?0.7:0)))).div(upgs[20].eff()).div(upgs.luck[5].eff()).div(upgCostMod())},
    eff() {return Decimal.mul(0.02, player.upgs[19])},
    effDis() {return `+`+f(upgs[19].eff())},
    unlocked() {return miles[8].owned()},
    curr: "points",
    cap() {return D(100)},
  },
  20: {
    description() {return "Divide the cost of pu11~pu19 by 1.4"},
    cost() {return D(1e27).mul(Decimal.pow(2 - (miles[13].owned()?0.4:0), player.upgs[20].pow(1.3))).div(upgCostMod())},
    eff() {return Decimal.pow(1.4, player.upgs[20])},
    effDis() {return `/`+f(upgs[20].eff())},
    unlocked() {return miles[8].owned()},
    curr: "points",
    cap() {return D(100)},
  },
  luck: {
    1: {
      description() {return `Multiply luck chances by 2`},
      cost() {return D(1000).mul(Decimal.pow(10, player.luck.upgs[1].mul(player.luck.upgs[1].div(27).add(1).floor())))},
      eff() {return Decimal.pow(2, player.luck.upgs[1])},
      effDis() {return `x`+f(upgs.luck[1].eff())},
      unlocked() {return miles[9].owned()},
      curr: "unluck",
      cap() {return D(1000)},
    },
    2: {
      description() {return `Multiply unluck gain by 3`},
      cost() {return D(1000).mul(Decimal.pow(12.5, player.luck.upgs[2].mul(player.luck.upgs[2].div(25).add(1).floor())))},
      eff() {return Decimal.pow(3, player.luck.upgs[2])},
      effDis() {return `x`+f(upgs.luck[2].eff())},
      unlocked() {return miles[9].owned()},
      curr: "unluck",
      cap() {return D(1000)},
    },
    3: {
      description() {return `Multiply luck point gain by 1.5`},
      cost() {return D(1000).mul(Decimal.pow(10, player.luck.upgs[3].mul(player.luck.upgs[3].div(27).add(1).floor())))},
      eff() {return Decimal.pow(1.5, player.luck.upgs[3])},
      effDis() {return `x`+f(upgs.luck[3].eff())},
      unlocked() {return miles[9].owned()},
      curr: "unluck",
      cap() {return D(1000)},
    },
    4: {
      description() {return `Multiply point gain by 4`},
      cost() {return D(1000).mul(Decimal.pow(20, player.luck.upgs[4].mul(player.luck.upgs[4].div(21).add(1).floor())))},
      eff() {return Decimal.pow(4, player.luck.upgs[4])},
      effDis() {return `x`+f(upgs.luck[4].eff())},
      unlocked() {return miles[9].owned()},
      curr: "unluck",
      cap() {return D(1000)},
    },
    5: {
      description() {return `Divide the cost of pu11~pu19 by 10`},
      cost() {return D(1000).mul(Decimal.pow(40, player.luck.upgs[5].mul(player.luck.upgs[5].div(17).add(1).floor())))},
      eff() {return Decimal.pow(10, player.luck.upgs[5].add(player.luck.freeupgs[5]))},
      effDis() {return `/`+f(upgs.luck[5].eff())},
      unlocked() {return miles[9].owned()},
      curr: "unluck",
      cap() {return D(1000)},
    },
  }
}
function buyupg(x, isfree=false) {
  if(!canAfford(x)) return
  if(!isfree) player[upgs[x].curr] = player[upgs[x].curr].sub(upgs[x].cost())
  player.upgs[x] = player.upgs[x].add(1)
}
function buyLuckUpg(x){
  if(!canAffordLuckUpg(x)) return
  player.luck[upgs.luck[x].curr] = player.luck[upgs.luck[x].curr].sub(upgs.luck[x].cost())
  player.luck.upgs[x] = player.luck.upgs[x].add(1)
}
function canAfford(x){
  return player[upgs[x].curr].gte(upgs[x].cost()) && player.upgs[x].lt(upgs[x].cap())
}
function canAffordLuckUpg(x){
  return player.luck[upgs.luck[x].curr].gte(upgs.luck[x].cost()) && player.luck.upgs[x].lt(upgs.luck[x].cap())
}

function gamblingPointBoost(){
  return Decimal.pow(player.gamblinglevel.add(1), 2)
}
function gamblingReset(){
  if(!canGamblingReset(player.gamblinglevel)) return
  player.points = d(0)
  player.upgs = [null,d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0)]
  player.result = d(0)

  player.gamblinglevel = player.gamblinglevel.add(1)
}
function gamblingReq(x){
  let req = d(0)
  // 0~6 - 100^(x+4)
  if(x.lt(7)) req = Decimal.pow(100, x.add(5))
  // 7 - 10^26
  else if(x.eq(7)) req = Decimal.pow(10, 26)
  // 8~16 - 10^(3x+5)
  else if(x.gt(7) && x.lt(16)) req = Decimal.pow(10, x.mul(3).add(5))
  // 17+ - 10^(10x-77)
  else if(x.gte(16)) req = Decimal.pow(10, x.mul(10).sub(77))
  req = req.div(unluckEffect())
  req = req.div(upgs[14].eff())
  req = req.div(getItemBoost(3))
  if(req.eq(0)) req = Infinity
  return req
}
function canGamblingReset(){
  return player.points.gte(gamblingReq(player.gamblinglevel))
}
const miles = {
  0: {owned() {return true}}, // fix for thing idk
  1: {
    name: "Gambling Level 1",
    effect: "Increase the cap of pu10 to 3",
    owned() {return player.gamblinglevel.gte(1)},
  },
  2: {
    name: "Gambling Level 2",
    effect: "Increase the cap of pu2, pu4 and pu9 to 10, and autobuy pu1~3",
    owned() {return player.gamblinglevel.gte(2)},
  },
  3: {
    name: "Gambling Level 3",
    effect: "Increase the cap of pu3 to 10, but its base cost and scaling increase harshly after level 5, and autobuy pu4~6",
    owned() {return player.gamblinglevel.gte(3)},
  },
  4: {
    name: "Gambling Level 4",
    effect: "Increase the effect bases on pu4 from 2.5 -> 3 and 1.25 -> 2.25, and autobuy pu7~10",
    owned() {return player.gamblinglevel.gte(4)}
  },
  5: {
    name: "Gambling Level 6",
    effect: "Increase the cap of pu10 to 10, but its cost scales faster after having level 3",
    owned() {return player.gamblinglevel.gte(6)}
  },
  6: {
    name: "Gambling Level 7",
    effect: "Increase the cap of pu6 to 10, and its cost scales faster after having level 4... is this getting boring yet? Also, the pu9 effect is raised to 2.2",
    owned() {return player.gamblinglevel.gte(7)},
  },
  7: {
    name: "Gambling Level 8",
    effect: "Unlock luck and automatically perform regular rolls",
    owned() {return player.gamblinglevel.gte(8)}
  },
  8: {
    name: "Gambling Level 10",
    effect: "Unlock 10 new point upgrades",
    owned() {return player.gamblinglevel.gte(10)},
  },
  9: {
    name: "Gambling Level 11",
    effect: "Boost pu11~pu15's effect and unlock luck upgrades",
    owned() {return player.gamblinglevel.gte(11)},
  },
  10: {
    name: "Gambling Level 12",
    effect: "Autobuy pu11~pu20 without spending points (you still have to have enough points to buy them, but you don't lose points when purchasing them)",
    owned() {return player.gamblinglevel.gte(12)}
  },
  11: {
    name: "Gambling Level 13",
    effect: "Automate luck rolling and triple unluck gain per gambling level, starting at 13",
    owned() {return player.gamblinglevel.gte(13)},
  },
  12: {
    name: "Gambling Level 14",
    effect: "Gain 5 free levels of lu5. This amount is multiplied by (gambling level - 13)^2 and capped at 200 (only bought upgrades count towards upgrade caps)",
    owned() {return player.gamblinglevel.gte(14)}
  },
  13: {
    name: "Gambling Level 16",
    effect: "The scaling of pu11~pu20 is reduced",
    owned() {return player.gamblinglevel.gte(16)}
  },
  14: {
    name: "Gambling Level 21",
    effect: "Unlock dice",
    owned() {return player.gamblinglevel.gte(21)}
  }
}

function luckPointGen() {
  let x = d(0)
  if(player.luck.luck.gt(0)) x = Decimal.pow(upgs[19].eff().add(3), player.luck.luck)
  else return D(0)
  x = x.mul(upgs.luck[3].eff())
  return x
}
function luckToPointBoost(){
  return Decimal.pow(upgs[17].eff().add(2), player.luck.points.max(1).log(5)).max(1)
}
function unluckGain(){
  let gain = d(1)
  gain = gain.mul(upgs[16].eff())
  gain = gain.mul(upgs.luck[2].eff())
  if(miles[11].owned()) gain = gain.mul(Decimal.pow(3, player.gamblinglevel.sub(12)))
  return gain
}
function unluckEffect(){
  return player.luck.unluck.max(1).log(1.1).pow(upgs[18].eff().add(0.8)).max(1)
}
function luckRoll(){
  /*
  * since the bounds of Math.random() are [0,1),
  * and 1/0 is undefined,
  * it is necessary to do 1-Math.random() in case it returns 0
  */
  let num = 1-(Math.random())
  let base = d(1/num).mul(luckChanceMulti()).log(2).add(1)

  if(base.gt(player.luck.luck)) player.luck.luck = base
  else player.luck.unluck = player.luck.unluck.add(unluckGain())
  player.luck.lastroll = base
}
function luckChanceMulti(){
  let m = d(1)
  m = m.mul(upgs[15].eff())
  m = m.mul(upgs.luck[1].eff())
  m = m.mul(getItemBoost(4))
  return m
}