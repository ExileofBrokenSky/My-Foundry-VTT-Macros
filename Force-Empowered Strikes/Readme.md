# Force-Empowered Strikes

For this macro you will also need The Furnace mod installed and activated.
This macro will give you a small UI to implement Force-Empowered Strike damage to your Guardian's enemies. It is adapted from the FVTT Community Macro for Divine Smite and this macro in particular has been modified to work with the SW5e System, and won't work fully with regular the DND5e system, unless you have Guardian classes and have added custom damage types.

Make a macro named Force-Empowered Strike and set it to script, then copy-paste in the following:
```javascript
/*
 * Adapted from the FVTT Community Macro for Divine Smite
 * This macro enables use of the Force-Empowered Strike feature of Guardians in SW5e. A number of force points to spend
 * can be selected, which increases the number of damage dice. * 
 * If a token is not selected, the macro will default back to the default character for the Actor. 
 * This allows for the GM to cast the macro on behalf a character that possesses it, 
 * without requiring that a PC have their character selected.
 * The macro will also look for the Improved Force-Empowered Strikes feature and add the damage appropriately.
 * To execute the macro a target MUST be specified and, unless configured otherwise, the character must have at least 1 force point.
 * Make your regular attack and then if you choose to use Force-Empowered Strike, run this macro, or execute it via Dynamic Effects.
 * This macro ASSUMES the damage type of the main weapon is energy.
 * And it assumes that force points are stored as the Primary Resource on the character sheet.
 * It also is rolling crit dice as maximum, you'll have to change that if you want a different crit roll method.
 * Requires The Furnace mod.
 */

let maxSpellSlot = 5; //  Highest force power level that may be used.
let s_actor = canvas.tokens.controlled[0]?.actor || game.user.character;     
let focusedStrikes = getFocusedStrikes(s_actor);
if (s_actor?.data.items.find(i => i.name === "Force-Empowered Strikes") === undefined){
    return ui.notifications.error(`No valid actor selected that can use this macro.`);
}

let confirmed = false;
if (hasAvailableFP(s_actor)) {
    let optionsText = "";
    for (let i = 1; i <= focusedStrikes ; i++) {
       optionsText += `<option value="${i}">Spend ${i} force points. </option>`;
    }

    new Dialog({
        title: "Force-Empowered Strikes Damage",
        content: `
        <form>
        <p>Determine how many force points to spend on Force-Empowered Strikes.</p>
            <div class="form-group">
                <label>Force Points:</label>
                <select name="slot-level">` + optionsText + `</select>
            </div>
            <div class="form-group">
                <label>Critical Hit:</label>
                <input type="checkbox" name="criticalCheckbox">
            </div>
        </form>
        `,
        buttons: {
            one: {
                icon: '<i class="fas fa-check"></i>',
                label: "Strike!",
                callback: () => confirmed = true
            },
            two: {
                icon: '<i class="fas fa-times"></i>',
                label: "Cancel",
                callback: () => confirmed = false
            }
        },
        default: "Cancel",
        close: html => {
            if (confirmed) {
                let forcePoints= parseInt(html.find('[name=slot-level]')[0].value);
                let criticalHit = html.find('[name=criticalCheckbox]')[0].checked;
				if (hasEnoughFP(s_actor,forcePoints)){
					smite(s_actor, forcePoints, criticalHit);
				}
				else{
					return ui.notifications.error(`Not enough Force Points.`);
				}
            }
        }
    }).render(true);

} else {
    return ui.notifications.error(`No force points available to use this feature.`);    
}

//Below are helper functions

/**
 * Returns the maximum amount of force points that are allowed to be spent on one FES based on guardian level.
 * @param {Actor5e} actor - the actor to get level information from.
 * @returns {integer}
 */
 function getFocusedStrikes(actor) {
     let strikes = 0;
     let levels = 0;
     let actorClass = s_actor?.classes.guardian;
     if(actorClass != undefined){   
         levels = actorClass.data.data.levels;
     }
     if (levels > 16){strikes = 6;}
     else if (levels > 12){strikes = 5;}
     else if (levels > 8){strikes = 4;}
     else if (levels > 4){strikes = 3;}
     else if (levels > 1){strikes = 2;}
     else {strikes = 0;}
     return strikes;
 }

/**
 * Returns whether the actor has any force points.
 * @param {Actor5e} actor - the actor to get slot information from.
 * @returns {boolean} True if any force points are available to be used.
 */
 function hasAvailableFP(actor) {
    if (actor.data.data.resources.primary.value > 0) {
         return true;
    }
    return false;
 }

/**
 * Returns whether the actor has enough force points.
 * @param {Actor5e} actor - the actor to get slot information from.
 * @param {integer} cost - the amount of force points the effect should cost
 * @returns {boolean} True if enough force points are available to be used.
 */
function hasEnoughFP(actor, cost) {
	if(actor.data.data.resources.primary.value - cost >= 0){
		return true;
	}
	return false;
}

/**
 * Use the controlled token to smite the targeted token.
 * @param {Actor5e} actor - the actor that is performing the action.
 * @param {integer} forcePoints - the amount of force points being spent.
 * @param {boolean} criticalHit - whether the hit is a critical hit.
 */
function smite(actor, forcePoints, criticalHit) {
    let targets = game.user.targets;
	let minRoll = 1;
	let dieFaces = 8;
    if (targets.size !== 1) {
        return ui.notifications.error("You must target exactly one token to Force Empowered Strike.");
    }

    targets.forEach(target => {
        let numDice = forcePoints;
//look for improved FES feature and implement
        let hasImprovedFES = actor.data.items.find(i => i.name === "Improved Force-Empowered Strikes") != undefined;
        if (hasImprovedFES) numDice += 1;
//look for Gauntlets of the Warrior and implement its changes if so
		let hasGotW = (actor.data.items.find(i => i.name === "Gauntlets of the Warrior") != undefined && actor.classes.guardian.data.data.levels >= 5)
		if(hasGotW) minRoll = Math.max(Math.max(actor.data.data.abil.cha.mod, actor.data.data.abil.wis.mod),1);
//look for Guardian Offensive Augment and implement its changes if so, only handles bumping a d8 to a d10, modify code if bumping to d12
		let hasGOA = actor.data.items.find(i => i.name === "Guardian Offensive Augment") != undefined;
		if(hasGOA) dieFaces = 10;
//roll the dice
        let theRollText = `${numDice}d${dieFaces}min${minRoll}`;
		console.log(theRollText);
        let flavorText = { flavor: "Force-Empowered Strike - Damage Roll (Energy)", speaker };
        if (criticalHit) {
            theRollText+= `+(${numDice}*${dieFaces})`; //use this for Maximized Crit Dice, don't use both
            //theRollText+= `+${numDice}d${dieFaces}min${minRoll}`; //use this for regular double Crit Dice, don't use both
            flavorText = { flavor: "Force-Empowered Strike - Critical Damage Roll (Energy)", speaker };
        }
        let theRoll = new Roll(theRollText);
        theRoll.roll().toMessage(flavorText)
//Assuming Energy damage, if not, replace energy with kinetic or another damage type.
//look for resistance, immunity, or vulnerability in target and factor into damage
        let hasResistance = target.actor.data.data.traits.dr.value.includes("energy");
        let hasImmunity = target.actor.data.data.traits.di.value.includes("energy");
        let hasVulnerability = target.actor.data.data.traits.dv.value.includes("energy");
        let multiplier = 1.0;
        if(hasResistance) multiplier = 0.5;
        if(hasVulnerability) multiplier = 2;
        if(hasResistance && hasVulnerability) multiplier = 1;
        if(hasImmunity) multiplier = 0;
//apply damage        
        target.actor.applyDamage(theRoll.total, multiplier);
    })
//deduct Force Points
    let objUpdate = new Object();
    objUpdate['data.resources.primary.value'] = (s_actor.data.data.resources.primary.value - forcePoints);
    actor.update(objUpdate);
}
```
Yeah, it's a mouthful, once you slap this bad-boy into your macro all you have to do next is a few checks and then call it somehow.
* First, you need a character with Guardian class levels who has Force Points for their Primary Resource.
* Next you need to either attach the macro to a feature and use it, or give the player access to the macro and they can use it that way.
* One way is to use DAE with Macro Execute and give it the name of our macro.
* An even simpler way is to use Midi-QOL's On Use Macro call, which does basically the same thing:

![](https://github.com/ExileofBrokenSky/My-Foundry-VTT-Macros/blob/main/Force-Empowered%20Strikes/On%20Use%20Macro.png)

You can find that setting here:

![](https://github.com/ExileofBrokenSky/My-Foundry-VTT-Macros/blob/main/Force-Empowered%20Strikes/On%20Use%20Macro%20call%20Midi-QOL%20setting.png)

When you use it, A dialogue box will ask how many points you want to spend. If you wish to cancel just close the dialogue. 
You can attach the macro directly to a weapon and just cancel when you don't wish to use it, or keep it seperate on a feature and use it diliberately.
For added functionality if the character has the items/features named exactly "Improved Force-Empowered Strikes", "Gauntlets of the Warrior", or "Guardian Offensive Augment" in their inventory, functionality for those items regarding Force-Empowered strikes will be implimented.

![](https://github.com/ExileofBrokenSky/My-Foundry-VTT-Macros/blob/main/Force-Empowered%20Strikes/FES.png)
