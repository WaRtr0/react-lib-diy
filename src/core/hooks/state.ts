declare const DEBUG: boolean;
//=========================================
// ## STATE GLOBAL
//=========================================

// il aurait peut etre ete plus simple et peut etre vue plus opti de faire tout dans un seul fichier pas besoin d'export inutile pour les variables globales
// mais c'est plus clair de les mettre dans des fichiers differents...
// Theoriquement cela change rien et de plus avec esbuild a la fin il n'y plus d'export (on a un seul fichier)

// variable globale qui est defini lors du rendu par chaque component,
// initHooks(<componentId>) l'update puis va pouvoir traiter tout les hooks de ce component, qui sa ligne dediee dans componentsState et effectsState
// c'est une variable sequentielle qui change rapidement de "pointeur"
export let currentComponent: number | null = null;

// Tableau pour stocker les states (useState) des composants
export const componentsState: any[][] = [];

// Tableau pour stocker les effect (useEffect) des composants
// deps: dépendances de l'effect
// cleanup: fonction de nettoyage de l'effect
// effect: fonction de l'effect
/**
 *  useEffect(<effect>, <deps>) => <cleanup>
 */
export const effectsState: Array<{ deps: any[] | undefined; cleanup: (() => void) | undefined; effect: () => (() => void) | void }[]> = [];

// Index pour le hook incrementé dedie pour chaque component
// sera utiliser via son mutateur getAndIncrementHookIndex()
// -- let hookIndex = 0; SUPPRIMER remplacer pas une solution plus sur

// version V2 de hookIndex, plus sur pour eviter des problemes lors de hook imbrique...
export const hooksIndexComponent: number[] = [];

// variable qui stocke une fonction qui permet le re-render du component
// triggerRerender(<componentId>)
export let triggerRerender: (componentId: number) => void = () => {
	if (DEBUG) console.log("state.ts[triggerRerender] no re-render ???");
};


//=========================================
// ## FONCTIONS POUR LES HOOKS
//=========================================

// qui est represente en 3 phase
// 1. montage (mount) `initHooks`
// 2. update `triggerRerender`
// 3. demontage (unmount) `cleanupEffects`

// init a chaque fois qu'un component appeler au premier montage ou update...
export function initHooks(componentId: number) {
	if (DEBUG) console.log("state.ts[initHooks] - initHooks (mount)", componentId);

	// on change le pointeur du component
	currentComponent = componentId;
	// index de chaque hook pour chaque component
	hooksIndexComponent[componentId] = 0;

	// on initialise les tableaux si pas deja fait... (dediee pour chaque component)
	if (!componentsState[componentId]) {
		componentsState[componentId] = [];
	}

	if (!effectsState[componentId]) {
		effectsState[componentId] = [];
	}
}

// on set la fonction de re-render du component, toujours un changement de pointeur du component...
// setRerenderFunction(<fn>)
export function setRerenderFunction(fn: (componentId: number) => void) {
	if (DEBUG) console.log("state.ts[setRerenderFunction] - setRerenderFunction (update)");
	triggerRerender = fn;
}
// on get chaque callback qui permet de "nettoyer" l'effect
// on le fait pour chaque effect du component...
export function cleanupEffects(componentId: number) {
	const effects = effectsState[componentId] || [];
	effects.forEach(effect => {
		if (effect.cleanup) {
			effect.cleanup();
		}
	});
	if (DEBUG) console.log("state.ts[cleanupEffects] - cleanupEffects (unmount)", componentId);

	// on supprime les tableaux pour chaque component...
	delete effectsState[componentId];
	delete componentsState[componentId];
	currentComponent = null;
}

//=========================================
// ## FONCTIONS UTILS
//=========================================

//simple mutateur de la variable hookIndex
// domage que c'est pas un simple ++... mais les exports sont en readonly...
// ceci est toutes meme optimiser par esbuild qui va faire "inlining" de la fonction...
export function getAndIncrementHookIndex(componentId: number) {
	return hooksIndexComponent[componentId]++;
}