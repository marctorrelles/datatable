import { Projection } from '../../datatable.graphql'

type Props = {
  currentProjections: Projection[]
  initialProjections: Projection[]
  setCurrentProjections: (projections: Projection[]) => void
}

const getProjectionKey = (projection: Projection) => {
  if ('field' in projection) return projection.field
  return projection.fields.join('')
}

const ColumnSelectorButton = ({
  currentProjections,
  initialProjections,
  setCurrentProjections,
}: Props) => {
  return (
    <div>
      <div>
        Visible fields (click to hide):{' '}
        {currentProjections.map((projection) => (
          <button
            key={getProjectionKey(projection)}
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
