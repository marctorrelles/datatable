import { Projection } from '.'

// Dear dev, this is a mess and quite under-performanet, made only for the sake of prototyping.
// PLEASE DO NOT USE THIS CODE IN PRODUCTION.

const getFieldsByPath = (
  fullPath: string,
  previousPath: string,
  data: any,
  accessedArray = false
): string[] | string | undefined => {
  const pathPart = previousPath.split('.').at(0)
  const currentPath = previousPath.split('.').slice(1).join('.')

  if (!pathPart) {
    console.error('Oooops, error with some path.', {
      fullPath,
      previousPath,
      data,
      accessedArray,
      pathPart,
    })
    throw new Error('Oooops, error with some path.')
  }

  const isArray = pathPart.endsWith('[]')
  if (isArray) {
    if (accessedArray) {
      console.error({ pathPart, fullPath, previousPath, data, accessedArray })
      throw new Error(
        'Paths cannot have more than one array element. Path: ' + fullPath
      )
    }

    const dataPart = data[pathPart.slice(0, -2)]

    if (!dataPart) {
      throw new Error('Data does not contain path: ' + fullPath)
    } else if (Array.isArray(dataPart)) {
      return dataPart.map(
        (item: any) =>
          getFieldsByPath(fullPath, currentPath, item, true) as string
      )
    } else {
      throw new Error(
        'The part of the path provided as an array is not.' + fullPath
      )
    }
  } else {
    const dataPart = data[pathPart]

    if (!dataPart) {
      throw new Error('Data does not contain path: ' + fullPath)
    } else if (typeof dataPart === 'object') {
      return getFieldsByPath(fullPath, currentPath, dataPart, false)
    } else if (dataPart) {
      return dataPart
    } else {
      console.error('Oooops, error with some path.', {
        fullPath,
        previousPath,
        data,
        accessedArray,
        pathPart,
      })
      throw new Error('Oooops, error with some path.')
    }
  }
}

export default function getFieldsForColumns(
  projections: Projection[],
  data: any
): string[][] {
  const newData = new Array(projections.length).fill([])

  projections.forEach((projection, projectionIndex) => {
    // Pffffff :not-proud-marc:
    if ('argsPath' in projection) {
      const { method, argsPath } = projection
      const args = argsPath.map((path) => {
        const parts = getFieldsByPath(path, path, data) as string[]
        return parts
      })
      for (let index = 0; index < args[0].length; index++) {
        const currentArgs = args.map((arg) => arg[index])
        newData[projectionIndex].push(method(...currentArgs))
      }
    } else {
      const parts = getFieldsByPath(
        projection.path,
        projection.path,
        data
      ) as string[]
      newData[projectionIndex] = parts
    }
  })

  if (!newData.length) return []

  // ¯\_(ツ)_/¯
  return newData[0].map((_: any, colIndex: number) =>
    newData.map((row) => row[colIndex])
  )
}
