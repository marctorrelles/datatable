import { Projection } from '.'

// WARNING!!!!
// Dear dev, this is a mess and quite under - performant, made only for the sake of prototyping.
// PLEASE DO NOT USE THIS CODE IN PRODUCTION!

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

  const dataPart = data[pathPart]
  if (!dataPart) {
    throw new Error('Data does not contain path: ' + fullPath)
  }

  const isArray = Array.isArray(dataPart)

  if (isArray) {
    if (accessedArray) {
      // TODO: Check how to handle this, at it would mean having a third dimension on the table
      console.error({ pathPart, fullPath, previousPath, data, accessedArray })
      throw new Error(
        'Paths cannot have more than one array element. Path: ' + fullPath
      )
    }

    return dataPart.map(
      (item: any) =>
        getFieldsByPath(fullPath, currentPath, item, true) as string
    )
  } else {
    const dataPart = data[pathPart]

    if (typeof dataPart === 'object') {
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
    if ('fields' in projection) {
      const { resolver, fields } = projection
      const args = fields.map((path) => {
        const parts = getFieldsByPath(path, path, data) as string[]
        return parts
      })
      for (let index = 0; index < args[0].length; index++) {
        const currentArgs = args.map((arg) => arg[index])
        newData[projectionIndex].push(resolver(...currentArgs))
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
