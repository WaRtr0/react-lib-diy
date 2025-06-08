declare const DEBUG: boolean;
import {currentComponent, componentsState, triggerRerender, getAndIncrementHookIndex} from "./state"

// T est un cast quand le type est renseigner par le user, puis est utiliser en quelque sorte comme variable dans toute la fonction

// useState(<initialValue>) => [<value>, <setState>]
export function useState<T>(initialValue: T): [T, (newValue: T) => void] {
	if (currentComponent === null) {
		throw new Error("useState is called outside of a component");
	}

	// on get le componentId et l'index du hook
	const componentId = currentComponent;

	// on get l'index du nouveau hook
	const index = getAndIncrementHookIndex(componentId);

	if (componentsState[componentId][index] === undefined) {
		if (DEBUG) console.log("useState.ts[useState] - init state", componentId, index, initialValue);
		componentsState[componentId][index] = initialValue;
	}

	const setState = (newValue: T, forceUpdate: boolean = false) => {
		if (forceUpdate || componentsState[componentId][index] !== newValue) {
			if (DEBUG) console.log("useState.ts[useState] - update state", componentId, index, newValue);
			componentsState[componentId][index] = newValue;
			triggerRerender(componentId);
		}
	}

	return [componentsState[componentId][index], setState];
}