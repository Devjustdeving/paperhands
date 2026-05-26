import Image from "next/image";
import { WalletSearch } from "@/components/WalletSearch";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
      <div className="text-center space-y-4 animate-fade-in">
        <Image src="/logo.png" alt="PaperHands Club" width={120} height={120} className="mx-auto rounded-2xl" />
        <h1 className="text-5xl md:text-7xl font-bold">
          <span className="text-accent">Paper</span>Hands
        </h1>
        <p className="text-muted text-lg md:text-xl max-w-md mx-auto">
          Check how <span className="text-accent font-semibold">jeet</span> you are.
          See how much you left on the table.
        </p>
      </div>

      <WalletSearch />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mt-8 animate-fade-in">
        <FeatureCard icon="📊" title="Track Fumbles" desc="See every token you sold too early" />
        <FeatureCard icon="🏆" title="Leaderboard" desc="Top jeeters ranked by fumbled value" />
        <FeatureCard icon="🔥" title="AI Roast" desc="Get roasted for your trading decisions" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl animate-fade-in">
        <FeatureCard icon="🔮" title="What If" desc="Simulate holding longer on any trade" />
        <FeatureCard icon="⚔️" title="Compare" desc="Head-to-head wallet comparison" />
        <FeatureCard icon="💎" title="Badges" desc="Earn achievements based on your trades" />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="p-4 bg-card border border-border rounded-xl hover:border-accent/30 transition-all cursor-default">
      <span className="text-2xl">{icon}</span>
      <p className="font-semibold mt-2 text-sm">{title}</p>
      <p className="text-muted text-xs">{desc}</p>
    </div>
  );
}
