export default function ExperienceCard({ experiences }: { experiences: any }) {
  return (
    <div>
      <h1>Moje dotychczasowe doświadczenie zawodowe</h1>
      <ul>
        {experiences.map((experience: any) => (
          <li key={experience.id}>{experience.title}</li>
        ))}
      </ul>
    </div>
  );
}
