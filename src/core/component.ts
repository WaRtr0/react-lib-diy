declare const DEBUG: boolean;

/**
 * Cette interface représente le type d'un élément virtuel (VirtualNode).
 * Elle peut être soit une chaîne de caractères (le nom de l'élément virtuel)
 * soit une fonction qui prend des propriétés et retourne un élément virtuel.
 */
export type VirtualNodeType = string | ((props: any) => VirtualNode);

/**
 * Cette interface représente un élément virtuel (VirtualNode).
 * Elle contient les propriétés suivantes :
 * - type : Le type de l'élément virtuel. (VirtualNodeType)
 * - props : Les propriétés de l'élément virtuel. (Record<string, any> | null)
 * - children : Les enfants de l'élément virtuel. (any[])
 * - key : La clé de l'élément virtuel. (string | number | undefined)
 */
export interface VirtualNode {
  type: VirtualNodeType;
  props: Record<string, any> | null;
  children: any[];
  key?: string | number;
}
/**
 * Cette fonction est la fonction principale.
 * Elle permet de créer des éléments virtuels (VirtualNode) à partir de leur type, de leurs propriétés et de leurs enfants.
 * Elle est appelée lorsque nous écrivons du JSX dans nos fichiers TSX, le compilateur TypeScript (configuré via tsconfig) transforme automatiquement ce JSX en appels à notre fonction `component`.
 *
 * @example
 * <div id="coucou">
 *   salut
 * </div>
 *
 * sera convertie en :
 *
 * createComponent('div', { id: 'coucou' }, 'salut')
 *
 * @param type : Le type de l'élément virtuel. (VirtualNodeType)
 * @param props : Les propriétés de l'élément virtuel. (Record<string, any> | null)
 * @param children : Les enfants de l'élément virtuel. (any[])
 * @returns : L'élément virtuel créé. (VirtualNode)
 */
export function createComponent(
  type: VirtualNodeType,
  props: Record<string, any> | null,
  ...children: any[]
): VirtualNode {
  const { key, ...restProps } = props || {};

  const flatChildren = children
    .filter(child => child != null)
    .reduce((acc: any[], child) => {
      if (Array.isArray(child)) {
        acc.push(...child);
      } else {
        acc.push(child);
      }
      return acc;
    }, []);

  if (DEBUG) {
    console.log("createComponent", type, props, children);
  }

  return { type, props: restProps, children: flatChildren, key };
}

/**
 * Cette fonction est un fragment.
 * Elle permet de regrouper des éléments sans nœud DOM supplémentaire.
 * Elle est appelée lorsque nous écrivons du JSX dans nos fichiers TSX, le compilateur TypeScript (configuré via tsconfig) transforme automatiquement ce JSX en appels à notre fonction `Fragment`.
 *
 * @example
 * <Fragment>
 *   <div>Premier élément</div>
 *   <div>Deuxième élément</div>
 * </Fragment>
 *
 * ou
 *
 * <>
 *   <div>Premier élément</div>
 *   <div>Deuxième élément</div>
 * </>
 *
 * sera convertie en :
 *
 * Fragment(null, [
 *   createComponent('div', null, 'Premier élément'),
 *   createComponent('div', null, 'Deuxième élément'),
 * ])
 *
 * @param children : Les enfants du fragment. (any[])
 * @returns : Le fragment. (any[])
 */
export function Fragment({ children }: { children: any }) {
  if (DEBUG) {
    console.log("Fragment", children);
  }

  return children;
}

export default createComponent;