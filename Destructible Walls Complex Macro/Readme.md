## Destructable Wall Macro
*****No longer works do to a change made in core targeting *****

Required Mods:
*		Dynamic Active Effects
*		Combat Utility Belt
*		Token Attacher
*		Select Tool Everywhere (to attach lights)
*		Furnace (maybe)
## Overly Convoluted Setup:
*	Design a map with destructable walls in mind.
*	Use your digital graphics skills to make a replica or cracked version of a wall. I suggest making it exactly 2 grid squares of mostly transparent with the wall graphic in the center. If your grid size is 100 px per grid, then the image should be 100 x 200
*	Make an NPC Actor for the wall, make sure it's prototype tokens are unlinked.
*	Give the prototype token a transparent image (recommended) or a wall image you made above; edit it's image size to fit if so.
*	Drag your wall token on scene. 
*	Attach a tile for the wall's image you made above (Optional)
*	Attach a wall, to provide the movement blocking and line of sight blocking properties of... a wall.
*	Attach a light source of type Universal Light, that is directly atop the token. This allows the token to be targeted even when out of LOS, which it will be since a wall is blocking it. A radius of 0.01 for dim light allows this without actually lighting up anything.
*	Update your prototype token and use assign it the token that you have manually attacthed the above to so that you never have to do it again.
*	Use CUB's triggler to make a trigger that activates on 0hp for npc's only
*	Use CUB to make or edit a defeated/dead condition.
*	Copy this macro into your world and name it something.
*	Edit the Active Effect Config of the above condition and enter the following: [macro.execute] [custom] ["the name you gave this macro"]
*	Target and kill the wall and it should disappear, taking the attched wall and other stuff with it.
	CUB only works when the DM is on the same scene, thus the same rule applies to this macro.
	Players may receive error messages about them not having permission to delete walls/lights/tiles. Those can be safely ignored as they dont prevent it from working. 
	WIP to get rid of the errors -_-'

## The Macro
```javascript
const lastArg = args[args.length-1];
let wallToken = canvas.tokens.get(lastArg.tokenId);
			
if (wallToken.data.flags["token-attacher"]?.attached?.["Wall"]?.length > 0) {
	if(game.user.isGM){
		wallToken.delete();
	}
}
```
