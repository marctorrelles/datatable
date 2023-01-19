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
            key={projection.name}
            onClick={() =>
              setCurrentProjections(
                currentProjections.filter(
                  (currentProjection) =>
                    currentProjection.name !== projection.name
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
                  currentProjection.name === projection.name
              )
          )
          .map((projection) => (
            <button
              key={projection.name}
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
