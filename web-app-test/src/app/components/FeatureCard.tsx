interface Props {
  title: string;
  description: string;
  emoji: string;
}

export default function FeatureCard({ title, description, emoji }: Props) {
  return (
    <div className="bg-white text-black rounded-xl shadow-lg p-6 transform hover:scale-105 transition">
      <div className="text-4xl mb-3">{emoji}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-700">{description}</p>
    </div>
  );
}
