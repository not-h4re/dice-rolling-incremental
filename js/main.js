// vscode please let me access the top of my code


function update(diff, isoffline=false) {
  player.minroll = getMinRoll()
  player.maxroll = getMaxRoll()
  if(player.points.gte(1e11)) player.unl.gambling = true
  if(miles[13].isOwned()) player.unl.sacrifice = true
  if(player.started==0){
    player.started=Date.now()
    player.lasttick=Date.now()/1000
  }
  
  if(player.upgs[4].gte(1)) {
    player.points = player.points.add(upgs[4].eff().mul(d(diff)))
  }
  //console.log(diff)
  for(let i=5;i<=9;i++){
    if(player.upgs[i].gt(0)){
      buyupg(i-4,true)
    }
  }
  for(let i=1;i<=9;i++){
    if(player.gamblinglevel.gte(i)){
      buyupg(i,true)
    }
  }
  if(miles.void[2].isOwned()){
    buyupg(1)
    buyupg(2)
    buyupg(3)
    buyupg(4)
    buyupg(5)
  }
  if(miles.void[3].isOwned()){
    buyupg(6)
    buyupg(7)
    buyupg(8)
    buyupg(9)
  }
  if(miles.void[5].isOwned()){
    buyAllLuckUpgrades(4)
    player.luck.upgs[1] = Decimal.max(player.luck.upgs[1], Decimal.log(player.luck.unluck.add(1), 100).sub(4).floor())
    player.luck.upgs[2] = Decimal.max(player.luck.upgs[2], Decimal.log(player.luck.unluck.div(1e9).add(1), 1.5).pow(0.5).floor())
    player.luck.upgs[3] = Decimal.max(player.luck.upgs[3], Decimal.log(player.luck.unluck.add(1), 1000).sub(3).floor())
  }
  player.luck.points = player.luck.points.add(luckPointGen().mul(diff))
  if(player.luck.autoroll) luckRoll()
  if(miles.void[1].isOwned()) player.upgs[4] = Decimal.max(player.upgs[4], 1)
  player.bestpoints=Decimal.max(player.points, player.bestpoints)
  if(miles.void[5].isOwned()){
    player.sac.totalofferings = offeringsFromPoints(player.bestpoints).floor()
    player.sac.offerings=player.sac.totalofferings.sub(player.sac.spentofferings)
  }

  if(miles.void[6].isOwned()){increaseGamblingLevel()}
  detectNaNs()
}

setInterval(function() {
  if(gameLoaded){
    if(hasNaN && !NaNalerted){
      alert("there is a NaN. refresh to revert to an older save. you may lose a small amount of progress")
      NaNalerted = true
      player.needsBackup = true
    }
    if(!hasNaN){
      let diff = (Date.now()/1000) - player.lasttick
      if(!player.offlineprogress) diff = Math.min(diff, 1)
      //console.log(diff)
      update(diff)
      player.lasttick = Date.now()/1000
    }
  }
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
  a = a.add(upgs[3].eff())
  if(miles[3].isOwned()) a=a.pow(1.3)
  if(miles.void[4].isOwned()) a=a.pow(20)
  // a dice cant have negative sides
  a = a.min(player.maxroll)
  return a
}
function getMaxRoll() {
  let a = D(1)
  a = a.add(upgs[1].eff())
  a = a.mul(upgs[2].eff())
  if(miles[3].isOwned()) a=a.pow(1.18)
  if(miles.void[4].isOwned()) a=a.pow(20)
  return a
}
function pointMul() {
  let m = D(3)
  m=m.mul(upgs[6].eff())
  m=m.mul(upgs[8].eff().max(1))
  if(player.gamblinglevel.gte(1)) m=m.mul(5)
  m=m.mul(gamblingLevelToPointMulti())
  if(miles[2].isOwned()) m=m.mul(Decimal.pow(2, player.gamblinglevel))
  m=m.mul(getPointBoostFromLuck())
  m=m.mul(upgs.luck[1].eff())
  if(miles.void[8].isOwned()) m=m.mul(miles.void[8].eff())
  if(hasBlessing(11)) m=m.pow(1.2)
  if(hasBlessing(21)) m=m.pow(1.16)
  if(hasBlessing(31)) m=m.pow(1.15)
  if(hasBlessing(41)) m=m.pow(1.12)
  if(miles[15].isOwned()) m=m.pow(1.5)
  if(miles.void[9].isOwned()) m=m.pow(1.3)
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
  m=m.mul(upgs[7].eff())
  if(miles[2].isOwned()) m=m.mul(20)
  return m
}
const upgs = {
  1: {
    description() {return `+`+f(D(1).mul(upgs[9].eff()))+` to max roll`},
    cost() {
      return D(10).mul(upgs[1].costi().pow(player.upgs[1].add(1)))
      .div(upgCostMod()).pow(miles[9].isOwned()?0.5:1)
    },
    costi() {
      let base = D(1.13)
      base = base.add(player.upgs[1].div(100))
      return base
    },
    effDis() {return "+"+f(upgs[1].eff())},
    unlocked() {return true},
    eff() {return player.upgs[1].mul(upgs[9].eff()).pow(miles[4].isOwned()?1.3:1)},
    curr: "points",
    cap() {return miles.offering[2].isOwned()?d(1000):D(100)},
  },
  2: {
    description() { return `x`+f(D(1.21).pow(miles[5].isOwned()?2:1))+` to max roll`},
    cost() {
      return D(10).mul(D(1.15).pow(D(1.15).pow(player.upgs[2].add(20)))).div(3)
      .div(upgCostMod()).pow(miles[9].isOwned()?0.5:1)
    },
    effDis() {return f(upgs[2].eff())+"x"},
    unlocked() {return player.maxroll.gte(6) || player.unl.gambling},
    eff() {return D(1.21).pow(miles[5].isOwned()?2:1).pow(player.upgs[2])},
    curr: "points",
    cap() {return miles.offering[2].isOwned()?d(1000):D(35)},
  },
  3: {
    description() {return `+`+f(upgs[5].eff().mul(1.5))+` to min roll`},
    cost() {
      return D(25).mul(D(1.2).add(player.upgs[3].div(66)).pow(player.upgs[3]))
      .div(upgCostMod()).pow(miles[9].isOwned()?0.5:1)
    },
    effDis() {return "+"+f(upgs[3].eff())},
    unlocked() {return player.maxroll.gte(25) || player.unl.gambling},
    eff() {return player.upgs[3].mul(1.5).mul(upgs[5].eff()).pow(miles[4].isOwned()?1.3:1)},
    curr: "points",
    cap() {return miles.offering[2].isOwned()?d(1000):D(175)},
  },
  4: {
    description() {return `Passively gain points`},
    cost() {
      return D(500).mul(D(9.99).pow(player.upgs[4])).pow(player.upgs[4].gte(35)?player.upgs[4].div(33.333).add(0.1).max(1):D(1))
      .div(upgCostMod()).pow(miles[9].isOwned()?0.5:1)
    },
    effDis() {return f(upgs[4].eff())+"/s"},
    unlocked() {return player.minroll.gte(16) || player.unl.gambling},
    eff() {
      let eff = player.upgs[4].gte(1)?D(2).pow(player.upgs[4].sub(1)).pow(0.777):D(0)
      if(eff.gte(74.33)) eff=eff.sub(74.33).pow(0.7).add(74.33)
      eff = eff.mul(gainEst().mul(20))
      if(miles[6].isOwned()) eff = eff.pow(1.06)
      return eff
    },
    curr: "points",
    cap() {return miles.offering[2].isOwned()?d(1000):D(40)},
  },
  5: {
    description() {return `Upgrade 3s effect base +x`+f(player.upgs[5].mul(miles[6].isOwned()?2:1).add(1), 0)},
    cost() {
      return D(10).add(player.upgs[5].mul(2)).pow(player.upgs[5]).mul(1e3)
      .div(upgCostMod()).pow(miles[9].isOwned()?0.5:1)
    },
    effDis() {return "+x"+f(upgs[5].eff().sub(1),0)},
    eff() {return D(1).mul(player.upgs[5].mul(miles[6].isOwned()?2:1).mul(player.upgs[5].mul(miles[6].isOwned()?2:1).add(1)).div(2)).add(1)},
    unlocked() {return player.maxroll.gte(200) || player.unl.gambling},
    curr: "points",
    cap() {return miles.offering[2].isOwned()?d(1000):D(25)},
  },
  6: {
    description() {return `Multiply point gain`},
    cost() {
      return D(1111.111).mul(D(1.4).pow(D(1.25).pow(player.upgs[6])))
      .div(upgCostMod()).pow(miles[9].isOwned()?0.5:1)
    },
    effDis() {return f(upgs[6].eff())+"x"},
    eff() {
      if(miles[2].isOwned()) return player.upgs[6].add(1).pow(1.25)
      return player.upgs[6].add(1).log(2).pow(1.25).add(1)
    },
    unlocked() {return player.minroll.gte(400) || player.unl.gambling},
    curr: "points",
    cap() {return miles.offering[2].isOwned()?d(1000):D(30)},
  },
  7: {
    description() {return `Divide all upgrades cost`},
    cost() {
      return D(1e5).mul(D(10).pow(D(1.333).pow(player.upgs[7])))
      .div(upgCostMod()).pow(miles[9].isOwned()?0.5:1)
    },
    effDis() {return "/"+f(upgs[7].eff())},
    eff() {return player.upgs[7].pow(1.4 + (miles[3].isOwned()?0.6:0)).add(1)},
    unlocked() {return player.maxroll.gte(530) || player.unl.gambling},
    curr: "points",
    cap() {return miles.offering[2].isOwned()?d(1000):D(20)},
  },
  8: {
    description() {return `Point gain is boosted based on points`},
    cost() {
      return D(1e4).mul(D(1e3).pow(player.upgs[8])).div(upgCostMod()).pow(miles[9].isOwned()?0.5:1)
    },
    effDis() {return f(upgs[8].eff())+"x"},
    eff() {
      let eff = player.upgs[8].gte(1)?player.points.root(3.33 - (miles[3].isOwned()?1:0)).pow(D(0.03).mul(player.upgs[8]).add(0.3)):D(1)
      eff = eff.min("1e350")
      if(miles.void[3].isOwned() && eff.eq("1e350")) eff = eff.mul(Decimal.pow(player.upgs[8].mul(0.0024).add(1), player.points.div("e350").log(6)))
      return eff
    },
    unlocked() {return (player.maxroll.gte(900) && player.minroll.gte(800)) || player.unl.gambling},
    curr: "points",
    cap() {return D(10).add(upgs.luck[3].eff())},
  },
  9: {
    description() {return `+x`+f(player.upgs[9].add(1).mul(D(1).div(miles[4].isOwned()?2:3)))+` to upgrade 1s effect base`},
    cost() {return D(5e7).mul(16).mul(D(2).pow(D(1.88).pow(player.upgs[9]))).div(upgCostMod()).pow(miles[9].isOwned()?0.5:1)},
    effDis() {return f(upgs[9].eff())+`x`},
    eff() {return player.upgs[9].mul(player.upgs[9].add(1)).div(2).mul(D(1).div(miles[4].isOwned()?2:3)).add(1)},
    unlocked() {return player.maxroll.gte(1.25e3) || player.unl.gambling},
    curr: "points",
    cap() {return miles.offering[2].isOwned()?d(1000):D(10)},
  },
  11: {
    description() {return `Add 0.01 to the luck point gain base`},
    cost() {return Decimal.pow(10,10500).mul(Decimal.pow("1e250", player.upgs[11].pow(1.4)))},
    eff() {return player.upgs[11].mul(0.01)},
    effDis() {return "+"+format(this.eff(), 2)},
    unlocked() {return miles.offering[4].isOwned()},
    cap() {return D(35)},
    curr: "points"
  },
  12: {
    description() {return `The unluck effect becomes unluck^(1.9+0.1x)`},
    cost() {return Decimal.pow(10,12500).mul(Decimal.pow("1e1000", player.upgs[12].pow(1.3)))},
    eff() {return player.upgs[12].mul(0.1).add(1.9)},
    effDis() {return "x^"+format(this.eff())},
    unlocked() {return miles.offering[4].isOwned()},
    cap() {return D(81)},
    curr: "points"
  },

  luck: {
    1: {
      description() {return `Multiply point gain by 10`},
      cost() {return Decimal.pow(100, player.luck.upgs[1].add(4))},
      eff() {return Decimal.pow(10, player.luck.upgs[1])},
      effDis() {return f(upgs.luck[1].eff())+`x`},
      curr: "unluck",
      unlocked: true,
    },
    2: {
      description() {return `Double unluck gain`},
      cost() {return D(1e9).mul(Decimal.pow(1.5, player.luck.upgs[2].pow(2)))},
      eff() {return Decimal.pow(2, player.luck.upgs[2])},
      effDis() {return f(upgs.luck[2].eff())+`x`},
      curr: "unluck",
      unlocked: true,
    },
    3: {
      description() {return `Add 1 to the upgrade 8 cap`},
      cost() {return Decimal.pow(1000, player.luck.upgs[3].add(3))},
      eff() {return player.luck.upgs[3].min(miles.void[3].isOwned?90+(miles.offering[2].isOwned?60:0):9999999999)},
      effDis() {return `+`+f(upgs.luck[3].eff())},
      curr: "unluck",
      unlocked: true,
    },
    4: {
      description() {return `Add 1 to the gambling level 10 effect base`},
      cost() {
        if(player.luck.upgs[4].lt(1)) return D(1e14)
        else if(player.luck.upgs[4].lt(2)) return D(1e96)
        else return Infinity
      },
      eff() {return player.luck.upgs[4].min(2)},
      effDis() {return "+"+f(upgs.luck[4].eff())},
      curr: "unluck",
      unlocked: true,
    },
  },
}
function buyupg(x, isfree=false) {
  if(!canAfford(x)) return
  if(!isfree) player[upgs[x].curr] = player[upgs[x].curr].sub(upgs[x].cost())
  player.upgs[x] = player.upgs[x].add(1)
}
function buyluckupg(x){
  if(player.luck.unluck.lt(upgs.luck[x].cost())) return
  player.luck.unluck = player.luck.unluck.sub(upgs.luck[x].cost())
  player.luck.upgs[x] = player.luck.upgs[x].add(1)
}
function canAfford(x){
  return player[upgs[x].curr].gte(upgs[x].cost()) && player.upgs[x].lt(upgs[x].cap())
}
function canAffordLuckUpg(x){
  return player.luck.unluck.gte(upgs.luck[x].cost())
}

// gambling level

function gamblingLevelReq(x){
  let req = d(0)
  let rx = x
  if(hasBlessing(32)) x=x.pow(0.89)
  // point req = 10^(current g.l.^2 + 11) for x < 4
  if(rx.lt(4)) req = Decimal.pow(10, x.pow(2).add(11))
  // point req = 10^(4x+8) for 4 <= x <= 8
  else if(rx.gte(4) && rx.lte(8)) req = Decimal.pow(10, x.mul(4).add(8))
  // point req = 10^(5x+5) for 8 < x < 19
  else if(rx.gt(8) && rx.lt(19)) req = Decimal.pow(10, x.mul(5))
  // point req = 10^103 for x = 19
  else if(rx.eq(19)) req = Decimal.pow(10, 103)
  // point req = 10^(T(x)/2 + 8) for 19 < x < 25
  else if(rx.gt(19) && rx.lt(25)) req = Decimal.pow(10, x.mul(x).add(x).div(4).add(8))
  // point req = 2^(1300 + 256(x-25)) for 25 <= x < 100
  else if(rx.gte(25) && rx.lt(100)) req = Decimal.pow(2, x.sub(25).mul(256).add(1300))
  // point req = 10^(200x - 13600) for x >= 100
  else req = Decimal.pow(10, rx.mul(200).sub(13600))

  req = req.div(unluckEffect())
  if(!miles.void[9].isOwned()){
    if(hasBlessing(12)) req=req.pow(8/9)
    if(hasBlessing(22)) req=req.pow(8/9)
    if(hasBlessing(42)) req=req.pow(0.5)
    if(miles[15].isOwned()) req=req.pow(0.8)
    if(miles.offering[1].isOwned()) req=req.pow(1.5)
    if(miles.offering[2].isOwned()) req=req.pow(1.4)
  }
  return req
}
function canIncreaseGamblingLevel(){
  // points >= req for next g.l.
  return player.points.gte(gamblingLevelReq(player.gamblinglevel))
}
function increaseGamblingLevel(){
  // can they reset?
  if(!canIncreaseGamblingLevel()) return
  
  // reset All The Things
  if(!miles.void[6].isOwned()) resetBaseGame()
  
  // increase gambling level
  if(miles.void[9].isOwned()) player.gamblinglevel = getMaxGamblingLevel()
  else player.gamblinglevel = player.gamblinglevel.add(1)

  // gl10 QoL
  if(miles[9].isOwned()) roll()
}

// non milestone boosts
function gamblingLevelToPointMulti(){
  return Decimal.pow(1.25, player.gamblinglevel)
}
function autoboughtUpgradesFromGamblingLevel(){
  return Decimal.min(player.gamblinglevel, 9)
}
function getMaxGamblingLevel(){
  // (log10(pu)+13600)/200 = x
  let x = Decimal.max(player.points.mul(unluckEffect()).log10().add(13600).div(200).floor().add(1), player.gamblinglevel)
  return x
}

function resetBaseGame(){
  player.points = d(0)
  player.minroll = d(0)
  player.maxroll = d(1)
  player.result = d(0)
  if(!miles[10].isOwned()) player.upgs = [null,d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0),null,d(0),d(0),d(0),d(0),d(0)]
}

const miles = {
  0:{
    isOwned() {return true},
  },
  1:{
    name: "Gambling Level 1",
    effect: "Multiply point gain by 5. All upgrades remain unlocked on gambling reset",
    isOwned() {return player.gamblinglevel.gte(1)}
  },
  2:{
    name: "Gambling Level 2",
    effect: "Divide all upgrades cost by 20 and remove the log2 in upgrade 6 formula. Also multiplies point gain by 2 per gambling level",
    isOwned() {return player.gamblinglevel.gte(2)},
  },
  3: {
    name: "Gambling Level 3",
    effect: "Raise min roll to 1.3 and max roll to 1.18. Upgrades 7 and 8 are stronger",
    isOwned() {return player.gamblinglevel.gte(3)},
  },
  4: {
    name: "Gambling Level 4",
    effect: "Raise point gain to 1.2. Upgrades 1, 3 and 9 are stronger",
    isOwned() {return player.gamblinglevel.gte(4)},
  },
  5: {
    name: "Gambling Level 5",
    effect: "Upgrade 2 effect base is squared",
    isOwned() {return player.gamblinglevel.gte(5)},
  },
  6: {
    name: "Gambling Level 7",
    effect: "Upgrades 4 and 5 are stronger",
    isOwned() {return player.gamblinglevel.gte(7)},
  },
  7: {
    name: "Gambling Level 8",
    effect: "Unlock luck",
    isOwned() {return player.gamblinglevel.gte(8)}
  },
  8: {
    name: "Gambling Level 9",
    effect: "Per gambling level starting at 8 and ending at 20, multiply the 1/Math.random() in luck formula by 1.2 and add 0.5 to the unluck effect exponent [hardcaps at +4.1]",
    isOwned() {return player.gamblinglevel.gte(9)}
  },
  9: {
    name: "Gambling Level 10",
    effect: "Automatically roll once after gambling level reset. Unluck gain is multiplied by 100 and tripled for every OoM of unluck, hardcapping at 100 OoMs. Upgrade costs are square rooted",
    isOwned() {return player.gamblinglevel.gte(10)}
  },
  10: {
    name: "Gambling Level 11",
    effect: "Keep all upgrades on gambling reset, unlock auto luck roll and gives the luck feature a few upgrades",
    isOwned() {return player.gamblinglevel.gte(11)}
  },
  11: {
    name: "Gambling Level 12",
    effect: "Multiply unluck gain by 6 per gambling level starting at 12",
    isOwned() {return player.gamblinglevel.gte(12)}
  },
  12: {
    name: "Gambling Level 20",
    effect: "Unlock prestige luck",
    isOwned() {return player.gamblinglevel.gte(20)}
  },
  13: {
    name: "Gambling Level 27",
    effect: "Unlock sacrifice",
    isOwned() {return player.gamblinglevel.gte(27)},
  },
  14: {
    name: "Gambling Level 60",
    effect: "Increase void essence gain by +50% and x1.1 per gambling level starting at 60 and ending at 80",
    isOwned() {return player.gamblinglevel.gte(60)},
  },
  15: {
    name: "Gambling Level 150",
    effect: "^1.5 point gain, ^0.8 gambling level requirement",
    isOwned() {return player.gamblinglevel.gte(150)}
  },
  void: {
    1: {
      name: "1 void favor",
      effect: "Always have 1 level of point generation and unlock a button for easier point and luck upgrades purchasing",
      isOwned() {return voidFavorLevel().gte(1)}
    },
    2: {
      name: "2 void favor",
      effect: "Autobuy the first 5 point upgrades. x1.2 void essence gain",
      isOwned() {return voidFavorLevel().gte(2)}
    },
    3: {
      name: "3 void favor",
      effect: "Autobuy the next 4 point upgrades. Upgrade 8s hardcap becomes a softcap, but hardcap luck upgrade 3s effect at +90. Total void essence multiplies luck chances and adds to prestige luck hardcap (this effect caps at +145)",
      isOwned() {return voidFavorLevel().gte(3)}
    },
    4: {
      name: "4 void favor",
      effect: "Boost minimum and maximum roll by the small amount of ^20",
      isOwned() {return voidFavorLevel().gte(4)},
    },
    5: {
      name: "8 void favor",
      effect: "Autobuy luck upgrades and unlock a new feature",
      isOwned(){return voidFavorLevel().gte(8)},
    },
    6: {
      name: "10 void favor",
      effect: "Gambling level automatically updates without resetting anything. Start with 250 of point upgrades 1-7 and 9 (100 for 8) and 250 prestige luck after void resets. Auto roll no longer resets",
      isOwned() {return voidFavorLevel().gte(10)},
    },
    7: {
      name: "11 void favor",
      effect: "x4 void essence gain",
      isOwned() {return voidFavorLevel().gte(11)},
    },
    8: {
      name: "14 void favor",
      effect: "Start at gambling level 100. Point gain is boosted based on total void essence and void favor (total ve^min(125, 5*vf) + 1)",
      isOwned() {return voidFavorLevel().gte(14)},
      eff() {return player.sac.totalve.pow(voidFavorLevel().mul(5).min(125).max(1)).add(1)}
    },
    9: {
      name: "18 void favor",
      effect: "^1.3 point gain, but all effects raising gambling level requirement to a power become ineffective. You can buy max gambling level",
      isOwned() {return voidFavorLevel().gte(18)},
    }
  },
  offering: {
    1: {
      name: "1 sacrificed offering",
      effect: "Raise gambling level requirement to 1.5. The prestige luck hardcap is increased by 750 and boost the luck point effect formula",
      isOwned() {return player.sac.spentofferings.gte(1)}
    },
    2: {
      name: "2 sacrificed offerings",
      effect: "Raise gambling level requirement to 1.4. Add 60 to the luck upgrade 3 cap and increase point upgrades 1-7 and 9 cap to 1000",
      isOwned() {return player.sac.spentofferings.gte(2)}
    },
    3: {
      name: "3 sacrificed offerings",
      effect: "Gambling Blessing III no longer works when gambling level >= 100. Unlock the fourth row of blessings",
      isOwned() {return player.sac.spentofferings.gte(3)}
    },
    4: {
      name: "5 sacrificed offerings",
      effect: "Unlock 2 new point upgrades",
      isOwned() {return player.sac.spentofferings.gte(5)}
    }
  }
}

function luckRoll(){
  let num = Math.random()
  let base = d(1/num).mul(luckChanceMulti()).log(2).add(1)

  if(base.gt(player.luck.luck)) player.luck.luck = base
  else player.luck.unluck = player.luck.unluck.add(unluckGain())
  player.luck.lastroll = base
}
function luckPointGen(){
  let gen = player.luck.luck.mul(Decimal.pow(upgs[11].eff().add(1.25), player.luck.luck))
  return gen
}
function getPointBoostFromLuck(){
  let eff = player.luck.points.add(1).log(2).pow(2).max(1)
  if(miles.offering[1].isOwned()) eff = player.luck.points.add(1).pow(player.luck.points.add(1).log(10).min(20))
  return eff
}
function luckChanceMulti(){
  let x=d(1)
  x=x.mul(miles[8].isOwned()?(Decimal.pow(1.2,player.gamblinglevel.min(20).sub(7))):1)
  if(hasBlessing(13)) x=x.mul(8)
  if(hasBlessing(23)) x=x.mul(6)
  if(miles.void[3].isOwned()) x=x.mul(player.sac.totalve)
  if(hasBlessing(33)) x=x.pow(4)
  if(hasBlessing(43)) x=x.pow(5)
  return x
}
function unluckEffect(){
  if(player.upgs[12].lt(1)) return player.luck.unluck.add(1).log(1.1).pow(miles[8].isOwned()?(d(0.9).add(player.gamblinglevel.min(20).sub(7).mul(0.5).min(4.1))):0.9).add(1)
  else return player.luck.unluck.add(1).pow(upgs[12].eff())
}
function unluckGain(){
  let x = d(1)
  if(miles[9].isOwned()) x=x.mul(100).mul(player.luck.unluck.max(1).log(10).floor().min(100).pow_base(d(3).add(upgs.luck[4].eff())))
  if(miles[11].isOwned()) x=x.mul(Decimal.pow(6, player.gamblinglevel.sub(11)))
  x = x.mul(upgs.luck[2].eff())
  x = x.mul(pluckEffect())
  return x
}

function resetLuck(){
  player.luck.luck = d(0)
  player.luck.points = d(0)
  player.luck.unluck = d(0)
}
function prestigeLuckReset(){
  if(!canPluckReset()) return
  let mult = pluckMult()

  let pluck = d(Math.random()).recip().mul(mult).add(1).log(1.3).add(1)

  if(pluck.gt(player.luck.pluck)) player.luck.pluckinc = player.luck.pluckinc.add(1)
  player.luck.pluck = Decimal.max(player.luck.pluck, pluck).min(pluckCap())
  player.luck.plastroll = pluck
  resetLuck()
  resetBaseGame()
}
function pluckEffect() {
  // multiplies unluck gain
  return Decimal.pow(2.2 + (hasBlessing(24)?0.2:0), player.luck.pluck.pow(1.1))
}
function pluckMult(){
  // luck multiplier formula = 1.15^(gl-20) * 1.12^(luck-10) * min(10^-10, 1.03^log[1.11, (unluck+1)/1e40])
  let mult = Decimal.pow(1.15, player.gamblinglevel.sub(20))
  mult = mult.mul(Decimal.pow(1.12, player.luck.luck - 10))
  mult = mult.mul(Decimal.pow(1.01, player.luck.unluck.add(1).div(1e40).log(1.11).add(0.0000000001)).min(1e50))

  if(hasBlessing(34)) mult=mult.pow(1.3)
  return mult
}
function canPluckReset(){
  return player.gamblinglevel.gte(player.luck.pluckinc.add(20))
}
function pluckRespec(){
  resetLuck()
  resetBaseGame()
  player.luck.pluck = d(0)
  player.luck.pluckinc = d(0)
}
function pluckCap(){
  let x=d(100)
  if(hasBlessing(14))x=x.add(5)
  if(miles.void[3].isOwned()) x=x.add(player.sac.totalve.min(145))
  if(miles.offering[1].isOwned()) x=x.add(750)
  return x
}
function resetGambling(){
  player.gamblinglevel=d(0)
}
function buyAllUpgrades(bulk=1){
  for(let i=1;i<=bulk;i++){
    buyupg(1)
    buyupg(2)
    buyupg(3)
    buyupg(4)
    buyupg(5)
    buyupg(6)
    buyupg(7)
    buyupg(8)
    buyupg(9)
  }
}
function buyAllLuckUpgrades(bulk=1){
  for(let i=1;i<=bulk;i++){
    buyluckupg(1)
    buyluckupg(2)
    buyluckupg(3)
    buyluckupg(4)
  }
}





function isObject(x){
  return typeof x === 'object' && x !== null && !Array.isArray(x)
}
function detectNaNs(){
  checkNaN(player)
  checkNaN(player.sac)
  checkNaN(player.luck)
  checkNaN(upgs)
  checkNaN(upgs.luck)
  checkNaN(miles)
  checkNaN(miles.gambling)
  checkNaN(miles.void)
  checkNaN(miles.offering)
  checkNaN(blessings)
}
function checkNaN(thing){
  if(isObject(thing)){
    let data = Object.values(thing)
    if(data.includes(NaN)) hasNaN = true
  } else {
    if(Number.isNaN(thing)) hasNaN=true
    if(thing == Decimal.dNaN) hasNaN=true
  }
}