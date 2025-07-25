function diceGain(floor = true){
  // gain = log[100 000, points/1e95] * 1.1 ** (gambling level - 21), floored
  let gain = player.points.div(1e95).max(1).log(100000).max(0).mul(Decimal.pow(1.1, player.gamblinglevel.sub(21)))
  gain = gain.mul(chalEffect(3))
  if(miles[17].owned()) gain = gain.mul(10)
  if(floor) gain = gain.floor()
  return gain
}
function canDiceReset() {
  return player.points.gte(1e100) && player.gamblinglevel.gte(21)
}
function diceReset(force=false){
  if(!canDiceReset() && !force) return

  player.dice.amount = player.dice.amount.add(diceGain())
  player.dice.total = player.dice.total.add(diceGain())
  player.dice.resets += 1

  // reset automation giving stuff
  player.luck.auto = false
  player.auto = false
  player.gamblinglevel = d(0)

  // now reset everything else
  player.luck.luck = d(0)
  player.luck.points = d(0)
  player.luck.upgs = [null, d(0),d(0),d(0),d(0),d(0)]
  player.luck.freeupgs = [null, d(0),d(0),d(0),d(0),d(0)]
  player.luck.lastroll = d(0)
  player.luck.unluck = d(0)
  player.points = d(0)
  player.result = d(0)
  player.upgs = [null,d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0),d(0)]

  // why here? i felt like it
  let startGL = d(0)
  if(DICEMILES[1].owned()) startGL = d(4)
  player.gamblinglevel = startGL
  if(DICEMILES[4].owned()){
    player.auto = true
    player.luck.auto = true
  }
}

function diceShardGain(){
  let gain = d(0.1)
  gain = gain.mul(player.dice.total)
  if(diceUpgOwned(41)) gain = gain.mul(DICEUPGS[41].effect())
  if(diceUpgOwned(42)) gain = gain.mul(DICEUPGS[42].effect())
  if(diceUpgOwned(43)) gain = gain.mul(DICEUPGS[43].effect())
  if(diceUpgOwned(44)) gain = gain.mul(DICEUPGS[44].effect())
  if(DICEMILES[5].owned()) gain = gain.mul(100)
  return gain
}

// the "null" makes the below constants align with the player.dice.items
const ITEM_NAMES = [null, "point booster", "cost cutter", "gambling reducer", "lucky clover"]
const BOOST_TEXT = [null, "multiplying point gain", "dividing point upgrade costs", "dividing gambling level requirement", "multiplying luck chances"]

// the itemID is its position in ITEM_NAMES
function getItemBoost(itemID){
  let base = d(3)
  if(diceUpgOwned(31)) base = base.add(DICEUPGS[31].effect())
  if(diceUpgOwned(32)) base = base.add(DICEUPGS[32].effect())
  if(diceUpgOwned(33)) base = base.add(DICEUPGS[33].effect())
  if(diceUpgOwned(34)) base = base.add(DICEUPGS[34].effect())
  let boost = Decimal.pow(base, player.dice.items[itemID])
  return boost
}
function upgradeChance(){
  let cha = 0.2 // i don't think i need to decimalise this
  if(DICEMILES[5].owned()) cha += 0.1
  if(diceUpgOwned(21)) cha = cha+DICEUPGS[21].effect()
  if(diceUpgOwned(22)) cha = cha+DICEUPGS[22].effect().toNumber()
  if(diceUpgOwned(23)) cha = cha+DICEUPGS[23].effect().toNumber()
  if(diceUpgOwned(24)) cha = cha+DICEUPGS[24].effect().toNumber()
  return cha
}
function upgradeItem(itemID){
  if(player.dice.shards.lt(upgradeCost(itemID))) return
  player.dice.shards = player.dice.shards.sub(upgradeCost(itemID))
  let tier = 1
  let fail = false
  while(!fail){
    if(Math.random() < upgradeChance()){
      tier += 1
    } else {
      fail = true
    }
  }
  player.dice.upgattempts[itemID] = player.dice.upgattempts[itemID].add(1)
  player.dice.items[itemID] = Decimal.max(player.dice.items[itemID], d(tier))
  player.dice.lastattempt[itemID] = d(tier)
}
function upgradeCost(itemID){
  let attempts = player.dice.upgattempts[itemID]
  return attempts.pow(2).add(attempts).div(2)
}

const DICEUPGS = {
  symbolsByRow: [`x`,`+`,`+`,`x`],
  11: {
    description: "Boost point gain based on total dice",
    effect() {return player.dice.total.add(1).log10().mul(10).add(1)}
  },
  12: {
    description: "Boost point gain based on total item tier",
    effect() {
      let eff = d(0)
      for(let i=1;i<=4;i++){
        eff = eff.add(player.dice.items[i])
      }
      return eff.max(1).pow(1.5)
    }
  },
  13: {
    description: "Boost point gain based on points",
    effect() {return player.points.max(1).log10().pow(0.5).max(1)}
  },
  14: {
    description: "Boost point gain based on luck",
    effect() {return player.luck.luck.max(1).pow(0.5)}
  },
  21: {
    description: "Increase the base in item tier generation by 0.08",
    effect() {return 0.08}
  },
  22: {
    description: "Increase the base in item tier generation based on gambling level",
    effect() {return player.gamblinglevel.div(1000).min(0.08)},
  },
  23: {
    description: "Increase the base in item tier generation based on dice upgrades owned",
    effect() {return D(player.dice.upgs.length).div(200).min(0.08)}
  },
  24: {
    description: "Increase the base in item tier generation based on this upgrades cost",
    effect() {return diceUpgCost(24).max(DICEMILES[9].owned()?100:0).div(7700).mul(8).min(0.08)}
  },
  31: {
    description: "Increase the base in item effects by 0.5",
    effect() {return d(0.5)}
  },
  32: {
    description: "Increase the base in item effects based on total dice",
    effect() {return player.dice.total.div(400).min(0.5)}
  },
  33: {
    description: "Increase the base in item effects based on points",
    effect() {return player.points.max(1).log10().div(1000).min(0.5)}
  },
  34: {
    description: "Increase the base in item effects based on gambling level",
    effect() {return player.gamblinglevel.div(400).min(0.5)}
  },
  41: {
    description: "Multiply dice shard gain by 10",
    effect() {return d(10)}
  },
  42: {
    description: "Multiply dice shard gain based on total item tier",
    effect() {
      let eff = d(0)
      for(let i=1;i<=4;i++){
        eff = eff.add(player.dice.items[i])
      }
      return eff.pow(0.5).max(1)
    }
  },
  43: {
    description: "Multiply dice shard gain based on luck",
    effect() {return player.luck.luck.div(10).pow(0.5).add(1)}
  },
  44: {
    description: "Multiply dice shard gain based on this upgrades cost",
    effect() {return diceUpgCost(44).max(DICEMILES[9].owned()?100:0).div(7.7).add(1)}
  }
}
function diceUpgCost(id){
  // cost = 3^(owned upgs in row) - owned upgs in column
  let x = [0,0]
  for(i in player.dice.upgs){
    if(Math.floor(player.dice.upgs[i]/10) == Math.floor(id/10)) x[0] += 1 // row check, all will have constant x in some id xy
    if(player.dice.upgs[i]%10 == id%10) x[1] += 1 // column check, all will have constant y in some id xy
  }
  //console.log("upgrade "+id+": x = "+x)
  let cost = d(1)
  cost = cost.mul(Decimal.pow(3, x[0]))
  cost = cost.sub(x[1])

  if(DICEMILES[3].owned()) cost = cost.sub(4)
  if(DICEMILES[10].owned()) cost = cost.sub(15)
  return cost.max(1).round()
}
function diceUpgOwned(id){
  return player.dice.upgs.includes(id)
}
function buyDiceUpg(id){
  //console.log("buyDiceUpg ran with id "+id+" with a cost of "+f(diceUpgCost(id)))
  if(player.dice.tokens.lt(diceUpgCost(id))) return
  if(diceUpgOwned(id)) return
  player.dice.tokens = player.dice.tokens.sub(diceUpgCost(id))
  player.dice.upgs.push(id)
}
function respecDiceUpgs(){
  if(!confirm("Are you sure? This will force a dice reset, reset your dice upgrades and give you all your upgrade tokens back")) return
  diceReset(true) // likely the only use of diceReset(true)
  player.dice.upgs = []
  player.dice.tokens = player.dice.totaltokens.round()
}

function tokenCost(){
  let cost = Decimal.pow(2, player.dice.totaltokens)
  if(DICEMILES[1].owned()) cost = cost.div(4)
  if(DICEMILES[2].owned()) cost = cost.div(4)
  if(DICEMILES[9].owned()) cost = cost.div(16)
  return cost.round()
}
function buyToken(){
  if(player.dice.amount.lt(tokenCost()) && !player.dice.totaltokens.lt(32)) return
  player.dice.amount = player.dice.amount.sub(tokenCost())
  player.dice.tokens = player.dice.tokens.add(1).round()
  player.dice.totaltokens = player.dice.totaltokens.add(1).round()
}

const DICEMILES = {
  0: {owned() {return true}}, // fix for bad code
  1: {
    name: "1e106 points",
    effect: "Start at gambling level 4 after dice resets, and the cost of upgrade tokens is reduced by 75%",
    owned() {return player.bestpoints.gte(1e106)}
  },
  2: {
    name: "Gambling Level 22",
    effect: "Automatically perform gambling level resets without resetting anything, and you can buy max pu11~20, but only if you have the gambling level 16 milestone. Also improve the gambling level effect",
    owned() {return player.bestgl.gte(22)}
  },
  3: {
    name: "1.11e111 points",
    effect: "Automatically buy luck upgrades, and reduce the cost of dice upgrades by 4 upgrade tokens (can't go below 1). Also divide the cost of upgrade tokens by 4",
    owned() {return player.bestpoints.gte(1.11e111)}
  },
  4: {
    name: "8 total upgrade tokens",
    effect: "Roll and luck roll automation are both kept on dice resets",
    owned() {return player.dice.totaltokens.gte(8)}
  },
  5: {
    name: "1e114 points",
    effect: "Multiply dice shard gain by 100, and add 0.1 to the base in item tier generation",
    owned() {return player.bestpoints.gte(1e114)}
  },
  6: {
    name: "1e119 points",
    effect: "Unlock challenges",
    owned() {return player.bestpoints.gte(1e119)}
  },
  7: {
    name: "18 total upgrade tokens",
    effect: "Unlock more gambling level milestones",
    owned() {return player.dice.totaltokens.gte(18)}
  },
  8: {
    name: "3e160 points",
    effect: "Increase the effect of pu11~pu13 to x1.25 per level",
    owned() {return player.bestpoints.gte(3e160)}
  },
  9: {
    name: "Gambling Level 31",
    effect: "Divide upgrade token cost by 16, and dice upgrades reliant on the cost of the upgrade now act as if the cost is 100",
    owned() {return player.bestgl.gte(31)}
  },
  10: {
    name: "24 total upgrade tokens",
    effect: "Reduce the cost of all dice upgrades by 15 upgrade tokens",
    owned() {return player.dice.totaltokens.gte(24)}
  },
  11: {
    name: "50 total item tiers",
    effect: "Boosts from challenges are better",
    owned() {
      let tier = d(0)
      for(let i=1;i<=4;i++){
        tier = tier.add(player.dice.items[i])
      }
      return tier.gte(50)
    }
  }
}

function enterChal(n){
  diceReset(true)
  if(player.dice.chal.current == 0) player.dice.chal.current = n
  else player.dice.chal.current = 0
  diceReset(true)
}
function chalEffect(n){
  let point = player.dice.chal.best[n]
  if(!DICEMILES[11].owned()){
    switch(n){
      case 1:
        return point.max(1).log(2).pow(4).max(1)
      case 2:
        return point.max(1).log(3).pow(3).max(1)
      case 3:
        return point.max(1).log10().max(1)
      case 4:
        return point.max(1).log(2.5).pow(2).max(1)
      default:
        return d(1)
    }
  } else {
    switch(n){
      case 1:
        return Decimal.pow(3, point.max(1).log(10))
      case 2:
        return Decimal.pow(2.5, point.max(1).log(9))
      case 3:
        return Decimal.pow(1.3, point.max(1).log(9))
      case 4:
        return Decimal.pow(2.5, point.max(1).log(10))
      default:
        return d(1)
    }
  }
}