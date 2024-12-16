function voidEssenceGain(){
  // base gain = 2^(sqrt(gambling level - 26))
  let gain = Decimal.pow(2, player.gamblinglevel.sub(26 * (hasBlessing(45)?-1:1)).max(1).sqrt())
  if(player.sac.resets == 0) gain = d(4)

  if(hasBlessing(15)) gain=gain.mul(2)
  if(hasBlessing(25)) gain=gain.mul(3)
  if(hasBlessing(35)) gain=gain.mul(4)
  if(miles.void[7].isOwned()) gain=gain.mul(4)
  if(miles.void[2].isOwned()) gain = gain.mul(1.2)
  if(miles[14].isOwned()) gain = gain.mul(player.gamblinglevel.min(80).sub(59).div(2).add(1)).mul(Decimal.pow(1.1, player.gamblinglevel.min(80).sub(59)))
  return gain
}

function sacrificeReset(force=false){
  if(player.gamblinglevel.lt(27) && !force) return
  player.sac.voidessence = player.sac.voidessence.add(voidEssenceGain())
  player.sac.totalve = player.sac.totalve.add(voidEssenceGain())

  player.gamblinglevel = d(0)
  resetBaseGame()
  resetGambling()
  resetLuck()
  player.luck.upgs = [null,d(0),d(0),d(0),d(0)]
  player.luck.pluck = d(0)
  player.luck.pluckinc = d(0)
  player.luck.lastroll = 0
  player.luck.plastroll = d(0)
  player.luck.autoroll = false

  if(miles.void[6].isOwned()){
    player.upgs=[null,d(250),d(250),d(250),d(250),d(250),d(250),d(250),d(100),d(250),null,d(0),d(0),d(0),d(0),d(0)]
    player.luck.pluck = d(250)
    player.luck.autoroll = true
  }
  if(hasBlessing(44)) player.luck.pluck = d(1000)
  if(miles.void[8].isOwned()) player.gamblinglevel = d(100)

  player.sac.resets += 1
}

const blessings = {
  11: {
    title: "Point Blessing I",
    description: "Raise point gain to 1.2",
    cost() {return D(1)},
  },
  12: {
    title: "Gambling Blessing I",
    description: "Raise gambling level requirement to 8/9",
    cost() {return D(1)},
  },
  13: {
    title: "Luck Blessing I",
    description: "Multiply luck chances by 8",
    cost() {return D(1)},
  },
  14: {
    title: "Prestige Luck Blessing I",
    description: "Add 5 to the prestige luck hardcap",
    cost() {return D(1)},
  },
  15: {
    title: "void Blessing I",
    description: "Gain 2x void essence",
    cost() {return D(3)},
  },
  21: {
    title: "Point Blessing II",
    description: "Raise point gain to 1.16",
    cost() {return D(5)},
  },
  22: {
    title: "Gambling Blessing II",
    description: "Raise gambling level requirement to 8/9 again",
    cost() {return D(5)},
  },
  23: {
    title: "Luck Blessing II",
    description: "Multiply luck chances by 6",
    cost() {return D(5)},
  },
  24: {
    title: "Prestige Luck Blessing II",
    description: "Add 0.2 to the prestige luck effect base",
    cost() {return D(5)},
  },
  25: {
    title: "void Blessing II",
    description: "Gain 3x void essence",
    cost() {return D(10)},
  },
  31: {
    title: "Point Blessing III",
    description: "Raise point gain to 1.15",
    cost() {return Decimal.pow(2, ownedRowThreeUpgrades()).mul(175)},
  },
  32: {
    title: "Gambling Blessing III",
    description: "Gambling level cost uses gl^0.89",
    cost() {return Decimal.pow(2, ownedRowThreeUpgrades()).mul(175)},
  },
  33: {
    title: "Luck Blessing III",
    description: "^4 luck chances",
    cost() {return Decimal.pow(2, ownedRowThreeUpgrades()).mul(175)},
  },
  34: {
    title: "Prestige Luck Blessing III",
    description: "^1.3 prestige luck chances",
    cost() {return Decimal.pow(2, ownedRowThreeUpgrades()).mul(175)},
  },
  35: {
    title: "void Blessing III",
    description: "Multiply void essence gain by 4",
    cost() {return D(25000)},
  },
  41: {
    title: "Points Blessing IV",
    description: "Raise point gain to 1.12",
    cost() {return D(2e6)},
  },
  42: {
    title: "Gambling Blessing IV",
    description: "Square root gambling level requirement",
    cost() {return D(1e7)}
  },
  43: {
    title: "Luck Blessing IV",
    description: "Raise luck chances to the ^5",
    cost() {return D(1e7)}
  },
  44: {
    title: "Prestige Luck Blessing IV",
    description: "Start with 1000 prestige luck",
    cost() {return D(2e7)}
  },
  45: {
    title: "void Blessing IV",
    description: "Add 52 to the number in the sqrt in void essence formula",
    cost() {return D(1e8)}
  }
}

function buyBlessing(n) {
  if(!canAffordBlessing(n)) return

  player.sac.voidessence = player.sac.voidessence.sub(blessings[n].cost())
  player.sac.blessings.push(n)
}
function canAffordBlessing(n){
  let cond = player.sac.voidessence.gte(blessings[n].cost()) && !player.sac.blessings.includes(n)
  if(n > 20) cond = (cond && player.sac.blessings.includes(n-10))
  return cond
}
function hasBlessing(n){
  return player.sac.blessings.includes(n)
}
function ownedRowThreeUpgrades(){
  x = 0
  for(let i=1;i<=4;i++){
    if(hasBlessing(30+i)) x += 1
  }
  return D(x)
}

function voidFavorReq(){
  // requirement for next = 4^(x + 0.5)
  return Decimal.pow(4, voidFavorLevel().add(0.5))
}
function voidFavorLevel(){
  if(player.sac.totalve.lte(0)) return D(0)
  else return Decimal.log(player.sac.totalve, 4).add(0.5).floor()
}

function offeringReq(x){
  return Decimal.pow(10, Decimal.pow(10, x.mul(0.16).add(0.94).pow(1.25).add(2.01)))
}
function offeringsFromPoints(x){
  return x.log10().log10().max(0).sub(2.01).pow(0.8).sub(0.94).div(0.16).max(0)
}
function spendOffering(){
  if(player.sac.offerings.gte(1)) player.sac.spentofferings = player.sac.spentofferings.add(1)
}