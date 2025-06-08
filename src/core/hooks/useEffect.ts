import { currentComponent, getAndIncrementHookIndex, effectsState } from "./state";

declare const DEBUG: boolean;

export function useEffect(effect: () => (() => void) | void, deps?: any[]) {
	if (currentComponent === null) {
		throw new Error("useEffect is called outside of a component");
	}

	// on get le componentId exactement comme pour useState...
	const componentId = currentComponent;

	// on get l'index du nouveau hook
	const index = getAndIncrementHookIndex(componentId);

	const currentEffect = effectsState[componentId][index];

	// on regarde si c'est premier mount ou update
	const depsChanged = !currentEffect || !deps ||
	  deps.length !== currentEffect.deps?.length ||
	  deps.some((dep, i) => dep !== currentEffect.deps?.[i]);

	if (depsChanged) {
		if (DEBUG) console.log("useEffect.ts[useEffect] - deps changed", componentId, index, deps);
		// on clean le current effect si il existe (unmount)
		if (currentEffect?.cleanup) {
			if (DEBUG) console.log("useEffect.ts[useEffect] - cleanup (unmount)", componentId, index, currentEffect.cleanup);
			currentEffect.cleanup();
		}

		if (DEBUG) console.log("useEffect.ts[useEffect] - effect (mount)", componentId, index, effect);

		// on execute l'effect et on get son cleanup si existant
		const cleanup = effect();

		// on stocke le nouvel effect pour le prochain render
		effectsState[componentId][index] = {
			deps,
			effect,
			cleanup: typeof cleanup === 'function' ? cleanup : undefined
		  };
	}
}