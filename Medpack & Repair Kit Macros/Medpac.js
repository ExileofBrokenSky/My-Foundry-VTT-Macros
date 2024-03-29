//For use with Midi-Qol - with the workflow setting: Add macro to call on use checked. Make a macro and copy paste this text into it and make sure the macro is set to 'script' and save it. Then on your item that will be a medpac, in its 'On Use Macro' field in the details tab enter that name of the macro.
//If set the item's rarity level it will scale up how much the item heals for.
// !!----!!You must have an actor selected (different from targeted!!) for the macro to work it will give an error otherwise. With no target, the macro will default to self target, otherwise it will attempt to work on the target.

/*Standard Medpac desc:
A medpac is a quick-acting syringe filled with a concentrated dose of kolto. As an action, you can use this medpac to restore hit points to a beast or humanoid within 5 feet. The creature rolls one die equal to the size of their Hit Die and regains hit points equal to the amount rolled + their Constitution modifier (minimum of one hit point). If the creature has Hit Dice of different sizes, use whichever Hit Die size they have the most of.
*/

// Variable Variables
	
	let dieCount="1"; //this is how many dice are rolled when healing.
	let rarity; //this is used to multiply the healing amount
	switch (args[0].item.data.rarity) /* "" 1 (same as common) | "common" 1 | "uncommon" 2 | "rare" 3 | "veryRare" 4 | "legendary" 5 | "artifact" 6*/ {
		case "artifact":
		  rarity=6;
		  break;
		case "legendary":
		  rarity=5;
		  break;
		case "veryRare":
		  rarity=4;
		  break;
		case "rare":
		  rarity=3;
		  break;
		case "uncommon":
		  rarity=2;
		  break;
		case "common":
		  rarity=1;
		  break;
		case "":
		  rarity=1;
		  break;
		default:
		  rarity=1;
	}
	//console.log("Arguments - Item Rarity:", args[0].item.data.rarity, "Rarity Value: ", rarity);
	let s_actor = canvas.tokens.controlled[0]?.actor || game.user.character;     	
//Is the target good?
	let targets = game.user.targets;
	let target;
	// ?more than one target. error message! but default to first target, since object gets consumed regardless of this macro's results.
	if (targets.size > 1) {		
		console.error("You can only target one token to use a medpac, so you use it on your first target.");
		ui.notifications.error("You can only target one token to use a medpac, so you use it on your first target.");
		target = game.user.targets.values().next().value.document.actor;
	}
	// ?1 target- Use it	
	else if (targets.size == 1) {
		target = game.user.targets.values().next().value.document.actor;
	}
	//no target, assume target is controlled token
	else {
		target = s_actor;
	}
	let healDie;
//Is target of type NPC?
	if (target.data.type === "npc"){
		// ?yes, Is the creature type unhealable? if so deny and exit.
		let unhealables = ["undead","construct","force entity","droid"]
		if (unhealables.indexOf(target.data.data.details.type) > -1) {
			console.error("The medpac fails to effect this type of creature.");
			return ui.notifications.error("The medpac fails to effect this type of creature.");			
		} 
		else if (target.data.data.details.type.custom?.toLowerCase().includes("droid")){
			console.error("The medpac fails to effect droids.");
			return ui.notifications.error("The medpac fails to effect droids.");			
		}
		//NPCs hd size is based on their size.
		switch(target.data.data.traits.size) {
			case "tiny":
				healDie = "d4";
				break;
			case "sm":
				healDie = "d6";
				break;
			case "med":
				healDie = "d8";
				break;
			case "lg":
				healDie = "d10";
				break;
			case "huge":
				healDie = "d12";
				break;
			case "grg":
				healDie = "d20";
				break;
			default:			
		}		
		//Healing Portion
		Healing(target,dieCount,healDie);
	}
	else if (target.data.type === "character"){ //?no, Is target of type Character?
		// ?Yes. Is character a droid? if so, deny and exit.
			if (target.data.data.details.species.toLowerCase().includes("droid")) {
				console.error("The Medpac is wasted on droids.");
				return ui.notifications.error("The Medpac is wasted on droids.");				
			} 
		//Character HD size for medpacs is based on highest level class
		let highestIndex = 0;
		let highest = 0;
		let index = 0;
		//Get all classes, loop through and find the level of them all
		let classes = Object.entries(target.data.data.classes)
		classes.forEach(c => {
			if (c[1].levels > highest) {
				highest = c[1].levels;
				highestIndex = index;
			}
		index++;
		})
		index = 0;
		//group together all classes that have the same, highest level
		let highestClasses = [];
		classes.forEach(c => 
			{if (c[1].levels == highest){
				highestClasses.push(c);
			}
		})
		//Do the highest leveled classes all have the same hit dice size?
		let testDie = highestClasses[0][1].hitDice
		let pass;
		for (const h of highestClasses) {
			if (h[1].hitDice === testDie) {
				pass = true;
			} else {
				pass = false;
				break;
			}
		}
		// ?all are same, so use the testDie.
		if(pass){
			healDie = testDie;
		}
		else{// ?not the same, 
			//look for highest hitDice that matches the rest and use it (player classes only get 12,10,8,6)
			let pass2 = false;
			let match = "d12"
			//look for d12
			for (const h of highestClasses) {
				if (h[1].hitDice.includes(match)) {
					pass2 = true;					
				}			
			}
			if(!pass2){//look for d10
				match = "d10";
				for (const h of highestClasses) {
					if (h[1].hitDice.includes(match)) {
						pass2 = true;						
					}				
				}
			}
			if(!pass2){//look for d8
				match = "d8"
				for (const h of highestClasses) {
					if (h[1].hitDice.includes(match)) {
						pass2 = true;						
					}			
				}
			}
			//fail above means it must be d6
			if(!pass2){
				match= "d6";
			}			
			healDie=match;						
		}
	//Healing Portion
		Healing(target,dieCount,healDie);		
	}
	else{// ?No, assume it's something else that a medpac can't heal. Deny and exit
		console.error("The medpac is wasted on that.");
		return ui.notifications.error("The medpac is wasted on that.");		
	}
	
 /**
 * Use the controlled token to smite the targeted token.
 * @param {Actor5e} target - the actor that is being healed.
 * @param {string} dieCount - the amount of hit dice being rolled.
 * @param {string} healDie - the number of faces per die.
 */
	function Healing(target, dieCount, healDie) {
		let formula = (parseInt(dieCount) * rarity).toString() + healDie + "+" + (Math.max(target.data.data.abilities.con.mod * rarity,1)).toString();
		let flavorText = {flavor: "Medpac healing", speaker}
		let HealingRoll = new Roll(formula);
		HealingRoll.roll().toMessage(flavorText);
		target.applyDamage(HealingRoll.total,-1);
	}
