interface Feature {
  name: string
  competitor: string | boolean
  postaify: string | boolean
}

interface ComparisonTableProps {
  competitorName: string
  features: Feature[]
}

export function ComparisonTable({
  competitorName,
  features,
}: ComparisonTableProps) {
  const renderValue = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <span className="text-green-400">Yes</span>
      ) : (
        <span className="text-red-400">No</span>
      )
    }
    return <span className="text-zinc-300">{value}</span>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-zinc-800">
            <th className="px-4 py-4 text-left font-semibold text-zinc-400">
              Feature
            </th>
            <th className="px-4 py-4 text-center font-semibold text-yellow-400">
              POSTAIFY
            </th>
            <th className="px-4 py-4 text-center font-semibold text-zinc-400">
              {competitorName}
            </th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature, index) => (
            <tr
              key={index}
              className="border-b border-zinc-800/50 transition-colors hover:bg-zinc-900/30"
            >
              <td className="px-4 py-4 font-medium">{feature.name}</td>
              <td className="px-4 py-4 text-center">
                {renderValue(feature.postaify)}
              </td>
              <td className="px-4 py-4 text-center">
                {renderValue(feature.competitor)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
