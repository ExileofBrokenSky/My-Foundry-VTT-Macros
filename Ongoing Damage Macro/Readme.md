# Macros and Mods to make things cool in foundry.

Tested on Foundry 0.7.9 with DND5e 1.2.4

Requires a minimum of the mods DAE, Midi-QOL, and Time's Up installed

## Ongoing Fire Damage

Say you just blasted someone with a sheet of fire, they took the damage but the spell or power says that flammable objects should keep burning, yet, often this gets overlooked and is tedious for GM's to track manually. Enter the burning effect.

* Make a macro named Burning and set it to run as script

Copy paste the following. Original [here](https://gitlab.com/tposney/times-up) from the creator of these mods. I'm just here to spell things out a little bit for the less tech savvy.
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

![](https://github.com/ExileofBrokenSky/My-Foundry-VTT-Macros/blob/main/Images/fire%20spell.png "A fire power with a saving throw")

* I duplicated it for safety, then added damage the ongoing damage to the `other formula` field.

* Adding `[fire]` after the die roll let's Midi recognize the damage type so it can automate resistance or immunity, since the damage type dropdown just above is not looked at when using the other formula.

* For more generic use, You could add any string there from typical damage types or custom, as long as the target has a matching or custom (non case sensitive) damage resistance/immunity/vulnerability, Midi it will apply it properly. *I.E.* `[silver]` `[dark]`

![](https://github.com/ExileofBrokenSky/My-Foundry-VTT-Macros/blob/main/Images/fire%20spell%202.png "Add the ongoing burn damage to the 'Other Formula' field")

* Create a new active effect through DAE, and set the macro repeat to 'Start of each turn..." Since this effect will be slapped on the target, it will happen at the start of the burning creature's turn.

![](https://github.com/ExileofBrokenSky/My-Foundry-VTT-Macros/blob/main/Images/fire%20spell%203.png "Setting when the damage macro to run at the start of the turn")

* Set the effect to Macro Execute, and give it the name of the macro we created above: Burning.

![](https://github.com/ExileofBrokenSky/My-Foundry-VTT-Macros/blob/main/Images/fire%20spell%204.png "Set the call to the 'Burning' macro")

* Now equip the spell-item and start a combat in Foundry and use the spell on an enemy. Should they fail the save, they will have the effect applied.

* I gave this enemy fire resistance to show that it auto reduced the damage.

![](https://github.com/ExileofBrokenSky/My-Foundry-VTT-Macros/blob/main/Images/fire%20spell%205.png "Behold: Fire!")

* When their turns begins the macro will be called and immediately ask for a save (at least with my Midi-QOL settings for saving throws)

![](https://github.com/ExileofBrokenSky/My-Foundry-VTT-Macros/blob/main/Images/fire%20spell%206.png "Ongoing Damage")

* When they finally do make a save, the effect will remove itself without rolling the damage.

![](https://github.com/ExileofBrokenSky/My-Foundry-VTT-Macros/blob/main/Images/fire%20spell%207.png "Fire Supression System complete!")

* Once you have the Burning macro made, with a bit of work you can add the `Other Formula` damage and a similar `DAE effect` that executes the Burning macro to any applicable power, though the power/weapon/feature must require a saving throw or the macro will fail.

FLAME ON!
