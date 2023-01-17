export default function getLeafs(tree: object) {
  const leafs: string[][] = []

  function traverse(tree: object, path: string[]) {
    Object.keys(tree).forEach((key: any) => {
      if (typeof (tree as any)[key] === 'object') {
        traverse((tree as any)[key], [...path, key])
      } else {
        leafs.push([...path, key])
      }
    })
  }

  traverse(tree, [])

  return leafs
}
