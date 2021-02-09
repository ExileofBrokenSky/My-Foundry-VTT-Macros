# Macros and Mods to make things cool in foundry. Tested on Foundry 0.7.9 with DND5e 1.2.4

Requires a minimum of the mods DAE, Midi-QOL, and Time's Up installed

## Ongoing Fire Damage
* Make a macro named Burning and set it to run as script

Copy paste the following. Original [here:](https://gitlab.com/tposney/times-up)
```javascript
if (args[0] === "each") {
    const lastArg = args[args.length-1];
    let tactor;
    if (lastArg.tokenId) tactor = canvas.tokens.get(lastArg.tokenId).actor;
    else tactor = game.actors.get(lastArg.actorId);
    let token = canvas.tokens.get(lastArg.tokenId);
    let item = lastArg.efData.flags.dae.itemData;
    const saveType = item.data.save.ability;
    const DC = item.data.save.dc;
    const flavor = `${CONFIG.DND5E.abilities[saveType]} DC${DC} ${item.name}`;
    let save = (await tactor.rollAbilitySave(saveType, {flavor, fastforward: true, chatMessage: true})); // could use LMRTFY instead
    if (save.total > DC) {
      if (tactor) tactor.deleteEmbeddedEntity("ActiveEffect", lastArg.effectId);
    } else { // take more damage
      let damageRoll = new Roll(item.data.formula).roll(); // could be passed as an argument
      new MidiQOL.DamageOnlyWorkflow(actor, token, damageRoll.total, "fire", [token], damageRoll, {flavor: `Failed Save for ${item.name}`, item})
    }
  }
```
* Get a spell/power that has a saving throw
