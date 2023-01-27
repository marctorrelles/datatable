import { Projection } from '../../../datatable.graphql'

type Props<T> = {
  currentProjections: Projection<T>[]
  initialProjections: Projection<T>[]
  setCurrentProjections: (projections: Projection<T>[]) => void
}

function getProjectionKey<T>(projection: Projection<T>) {
  return projection.fields.join('')
}

function ColumnSelectorButton<T>({
  currentProjections,
  initialProjections,
  setCurrentProjections,
}: Props<T>) {
  return (
    <div>
      <div>
        Visible fields (click to hide):{' '}
        {currentProjections.map((projection) => (
          <button
            key={getProjectionKey<T>(projection)}
            onClick={() =>
              setCurrentProjections(
                currentProjections.filter(
                  (currentProjection) =>
                    getProjectionKey(currentProjection) !==
                    getProjectionKey(projection)
                )
              )
            }
          >
            {projection.title}
          </button>
        ))}
      </div>
      <div>
        Not visible fields (click to show):{' '}
        {initialProjections
          .filter(
            (projection) =>
              !currentProjections.some(
                (currentProjection) =>
                  getProjectionKey(currentProjection) ===
                  getProjectionKey(projection)
              )
          )
          .map((projection) => (
            <button
              key={getProjectionKey(projection)}
              onClick={() =>
                setCurrentProjections([...currentProjections, projection])
              }
            >
              {projection.title}
            </button>
          ))}
      </div>
    </div>
  )
}

export default ColumnSelectorButton
