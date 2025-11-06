export default function MachinesList({ machines }: { machines: any[] }) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {machines.map((machine) => (
        <div key={machine.id} className="p-4 bg-white rounded shadow">
          <h4 className="text-lg font-medium mb-2">{machine.name}</h4>
          <p className="mb-4">{machine.description}</p>
          <a href={route('moderator.machines.edit', machine.id)} className="inline-block px-4 py-2 bg-indigo-600 text-white rounded">
            Edytuj
          </a>
        </div>
      ))}
    </div>
  );
}
