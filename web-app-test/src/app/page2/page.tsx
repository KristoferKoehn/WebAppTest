import Header from '../components/header';
import FeatureCard from '../components/FeatureCard';
import Footer from '../components/Footer';

export default function Page2() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 to-indigo-950 text-white">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <h2 className="text-4xl font-bold mb-10 text-center">🚀 Explore Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            title="Live Updates"
            description="See real-time updates with hot reload built-in."
            emoji="⚡"
          />
          <FeatureCard
            title="Modular Design"
            description="Break your UI into reusable components."
            emoji="🧩"
          />
          <FeatureCard
            title="Tailwind Styling"
            description="Design quickly with utility-first CSS classes."
            emoji="🎨"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
