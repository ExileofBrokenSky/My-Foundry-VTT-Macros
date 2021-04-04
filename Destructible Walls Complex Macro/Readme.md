## Destructable Wall Macro

https://user-images.githubusercontent.com/28786777/113518232-f67a5000-9552-11eb-8c56-343bf11391c8.mp4


Requires Mods:
*		Dynamic Active Effects
*		Combat Utility Belt
*		Token Attacher
*		Select Tool Everywhere (to attach lights)
*		Furnace (maybe)
## Overly Convulted Setup:
*		Design a map with destructable walls in mind.
*		Use your digital graphics skills to make a replica or cracked version of a wall.
*		Make an NPC Actor for the wall, make sure it's prototype tokens are unlinked.
*		Give the prototype token a transparent image or a wall image you made above. 
*		Drag your wall token on screen. 
*		Attach a tile for the wall's image you made above (Optional)
*		Attach a light source of type Universal Light, that is directly atop the token. A radius of 0.01 for dim light allows the token to be targeted without actually lighting up anything.
*		Attach a wall, to provide the movement blocking and line of sight blocking properties of... a wall.
*		Update your token prototype with what you just attached everything to so that you never have to do it again.
*		Use CUB's triggler to make a trigger that activates on 0hp for npc's only
*		Use CUB to make or edit a defeated/dead condition.
*		Copy this macro into your world and name it something.
*		Edit the Active Effect Config of the above condition enter: [macro.execute] [custom] ["the name you gave this macro"]
*		Target and kill the wall and it should disappear, taking the attched wall and other stuff with it.
CUB only works when the DM is on the same scene, thus the same rule applies to this macro.
Players may receive harmless error messages about them not having permission to delete walls/lights/tiles. Those can be safely ignored.

## The Macro
```javascript

const lastArg = args[args.length-1];
let wallToken = canvas.tokens.get(lastArg.tokenId);
			
if (wallToken.data.flags["token-attacher"] && wallToken.data.flags["token-attacher"].attached["Wall"].length > 0) {
	wallToken.delete();
}
```
