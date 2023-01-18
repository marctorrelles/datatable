import { Projection } from '..'

type Props = {
  currentProjections: Projection[]
  initialProjections: Projection[]
  setCurrentProjections: (projections: Projection[]) => void
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
            key={projection.identifier}
            onClick={() =>
              setCurrentProjections(
                currentProjections.filter(
                  (currentProjection) =>
                    currentProjection.identifier !== projection.identifier
                )
              )
            }
          >
            {projection.name}
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
                  currentProjection.identifier === projection.identifier
              )
          )
          .map((projection) => (
            <button
              key={projection.identifier}
              onClick={() =>
                setCurrentProjections([...currentProjections, projection])
              }
            >
              {projection.name}
            </button>
          ))}
      </div>
    </div>
  )
}

export default ColumnSelectorButton
