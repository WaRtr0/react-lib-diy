import type { VirtualNode } from "./component";

declare const DEBUG: boolean;

// esbuild va directement remplacer le KEY_DEFINE par "component-" pour optimiser le code...
const KEY_DEFINE = "component-";

/**
 * Cette interface représente une instance de composant.
 * Elle contient les propriétés suivantes :
 * - virtualNode : Le nœud virtuel du composant. (VirtualNode)
 * - dom : Le nœud DOM du composant. (Node)
 * - componentId : L'identifiant du composant. (number)
 */
interface ComponentInstance {
    virtualNode: VirtualNode;
    dom: Node;
    componentId: number;
}

/**
 * Cette variable est une map qui contient les instances de composants.
 * Elle est utilisée pour stocker les instances de composants et les récupérer plus tard.
 */
const componentInstances: Map<string, ComponentInstance> = new Map();
let nextComponentId = 0;

/**
 * Cette fonction est la fonction principale de rendu.
 * Elle est utilisée pour rendre un nœud virtuel dans un nœud DOM.
 * @param virtualNode : Le nœud virtuel à rendre. (VirtualNode)
 * @param container : Le conteneur dans lequel rendre le nœud virtuel. (HTMLElement)
 * @returns : Le nœud DOM rendu. (Node)
 */
export function render(virtualNode: VirtualNode, container: HTMLElement) {
    const oldVirtualNode = container.__virtualNode;

    // Premier rendu ou mise à jour
    if (!oldVirtualNode) {
        const dom = createDom(virtualNode);
        if (DEBUG) {
            console.log("[render] - create First Dom", dom);
        }
        container.appendChild(dom);
        container.__virtualNode = virtualNode;
    } else {
        const dom = updateDom(oldVirtualNode, virtualNode, container);
        if (DEBUG) {
            console.log("[render] - updateDom", dom);
        }
        container.__virtualNode = virtualNode;
    }
    return container.firstChild;
}




/**
 * createDom - Crée un nœud DOM à partir d'un nœud virtuel.
 * chaque component virtual va passer dans cette fonction en recursivité a part si les types de children sont des string ou number.
 * @param virtualNode : Le nœud virtuel à créer. (VirtualNode)
 * @returns : Le nœud DOM créé. (Node)
 */
function createDom(virtualNode: VirtualNode): Node {
    // Gestion du texte brut
    if (typeof virtualNode === "string" || typeof virtualNode === "number") {
        return document.createTextNode(String(virtualNode));
    }

    // on get les components virtuals donc sont sous un type "function"
    if (typeof virtualNode.type === "function") return handleComponent(virtualNode);

    // Élément HTML standard
    const el = document.createElement(virtualNode.type as string);

    // on applique les props de l'element virtuel a l'element dom
    applyProps(el, {}, virtualNode.props ?? {});

    // on ajoute les enfants
    (virtualNode.children || []).forEach(child => {
        if (child != null) {
            el.appendChild(createDom(child));
        }
    });

    return el;
}

/**
 * updateDom - Met à jour un DOM existant en comparant l'ancien et le nouveau VNode.
 */
function updateDom(oldVirtualNode: VirtualNode, newVirtualNode: VirtualNode, parent: HTMLElement) : Node {
    if (oldVirtualNode.type !== newVirtualNode.type) {
        const newDom = createDom(newVirtualNode);
        parent.replaceChild(newDom, parent.firstChild!);
        return newDom;
    }

    // Composant fonctionnel
    if (typeof newVirtualNode.type === "function") return handleComponent(newVirtualNode);

    const element = parent.firstChild as HTMLElement;

    // update props
    applyProps(element, oldVirtualNode.props ?? {}, newVirtualNode.props ?? {});

    // puis on fait en recursivité sur les enfants
    updateChildren(element, oldVirtualNode.children || [], newVirtualNode.children || []);

    return element;
}


/**
 * updateChildren - Met à jour les enfants d'un élément DOM.
 */
function updateChildren(element: HTMLElement, oldChildren: VirtualNode[], newChildren: VirtualNode[]) : void {
    // on prend le plus grand nombre d'enfants
    const maxLength = Math.max(oldChildren.length, newChildren.length);

    // puis on parcourt les enfants
    for (let i = 0; i < maxLength; i++) {
        const oldChild = oldChildren[i];
        const newChild = newChildren[i];

        // Supprimer les enfants qui n'existent plus
        if (newChild === undefined && oldChild !== undefined) {
            element.removeChild(element.childNodes[i]);
            continue;
        }

        // Ajouter les nouveaux enfants
        if (oldChild === undefined && newChild !== undefined) {
            element.appendChild(createDom(newChild));
            continue;
        }

        // Mettre à jour les enfants existants
        if (oldChild && newChild) {
            // Si les enfants sont des strings, on met à jour le texte...
            if (typeof oldChild === "string" && typeof newChild === "string") {
                if (oldChild !== newChild) {
                    element.childNodes[i].textContent = newChild;
                }
            }
        }
        // Sinon on met à jour le dom de l'enfant
        else {
            updateDom(oldChild, newChild, element.childNodes[i] as HTMLElement);
        }
    }
}

/**
 * applyProps - Applique les propriétés d'un VNode à un élément DOM.
 * @param element : L'élément DOM à mettre à jour. (HTMLElement)
 * @param oldProps : Les anciennes propriétés. (Record<string, any>)
 * @param newProps : Les nouvelles propriétés. (Record<string, any>)
 * @returns : void
 */
function applyProps(element: HTMLElement, oldProps: Record<string, any>, newProps: Record<string, any>) : void {
    // Supprimer les anciennes props qui n'existent plus
    Object.keys(oldProps).forEach(key => {
        if (key === "children") return;
        if (!(key in newProps)) {
            // on supprime l'ancien event listener si il existe et qui soit bien une fonction
            if (key.startsWith("on") && typeof oldProps[key] === "function") {
                element.removeEventListener(key.toLowerCase().substring(2), oldProps[key]);
                if (DEBUG) {
                    console.log("[applyProps] - remove event listener", key);
                }
            } else {
                element.removeAttribute(key);
                if (DEBUG) {
                    console.log("[applyProps] - remove attribute", key);
                }
            }
        }
    });

    // Ajouter ou mettre à jour les nouvelles props
    Object.keys(newProps).forEach(key => {
        if (key === "children") return;

        const oldValue = oldProps[key];
        const newValue = newProps[key];

        if (oldValue !== newValue) {
            if (key.startsWith("on") && typeof newValue === "function") {
                // Gestion des événements
                // onClick, onMouseOver, onMouseOut, etc.

                // on supprime l'ancien event listener si il existe
                if (oldValue) {
                    element.removeEventListener(key.toLowerCase().substring(2), oldValue);
                    if (DEBUG) {
                        console.log("[applyProps] - remove event listener - oldValue", key, oldValue);
                    }
                }
                element.addEventListener(key.toLowerCase().substring(2), newValue);
                if (DEBUG) {
                    console.log("[applyProps] - add event listener - newValue", key, newValue);
                }
            } else if (key === "className" && typeof newValue === "string") {
                // On gere le cas spécial pour la classe CSS
                element.className = newValue;
                if (DEBUG) {
                    console.log("[applyProps] - set className", key, newValue);
                }
            } else if (key === "style" && typeof newValue === "object" && newValue != null) {
                // On gere le cas spécial pour les styles
                Object.assign(element.style, newValue);
                if (DEBUG) {
                    console.log("[applyProps] - set style", key, newValue);
                }
            } else {
                // other attributs

                // si la valeur est true, on l'ajoute comme attribut mais sans valeur
                if (newValue === true) {
                    element.setAttribute(key, "");
                    if (DEBUG) {
                        console.log("[applyProps] - set attribute (vide)", key);
                    }
                }
                // si la valeur est une string, on l'ajoute comme attribut
                else if (newValue !== false && newValue != null && typeof newValue === "string") {
                    element.setAttribute(key, newValue);
                    if (DEBUG) {
                        console.log("[applyProps] - set attribute", key, newValue);
                    }
                }
                else {
                    if (DEBUG) {
                        console.log("[applyProps] - remove attribute", key);
                    }
                    element.removeAttribute(key);
                }
            }
        }
    });
}

/**
 * handleComponent - Gère le rendu d'un composant fonctionnel.
 */
function handleComponent(virtualNode: VirtualNode) : Node {
    const componentId = nextComponentId++;
    //ATTEMTION
    // initHooks(componentId);

    // on execute le component avec ses props pour obtenir le virtualNode enfant (rendu)
    const renderedVirtualNode = (virtualNode.type as Function)(virtualNode.props ?? {});

    // puis on crée le dom de l'enfant, ce qui part dans une nouvelle recursivité...
    const dom = createDom(renderedVirtualNode as VirtualNode);

    // puis on stocke l'instance du composant
    setUpdateInstance(componentId, renderedVirtualNode, dom);

    return dom;
}

/**
 * setUpdateInstance - Met à jour l'instance du composant.
 * @param componentId : L'identifiant du composant. (number)
 * @param virtualNode : Le nœud virtuel à mettre à jour. (VirtualNode)
 * @param dom : Le nœud DOM à mettre à jour. (Node)
 * @returns : void
 */
function setUpdateInstance(componentId: number, virtualNode: VirtualNode, dom: Node) : void {
    // Stocker l'instance du composant
    // pourquoi on utilise une key et pour on besoin de la recuperer plus tard ?
    // On utilise une clé unique (`component-${componentId}`) pour stocker l'instance du composant
    // dans la Map `componentInstances`. Cela nous permet de :
    // 1. Associer chaque instance de composant à un identifiant unique
    // 2. Retrouver facilement cette instance lors des mises à jour ou pour les hooks
    // 3. Gérer efficacement le cycle de vie des composants et leur état
    // Cette approche est essentielle pour implémenter les hooks comme useState et useEffect
    // qui ont besoin de conserver leur contexte entre les rendus !
    const key = KEY_DEFINE+componentId;
    componentInstances.set(key, {
        virtualNode,
        dom,
        componentId
    });
}

