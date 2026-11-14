import {
  Boxes, Type, GitBranch, FunctionSquare, Braces, CandlestickChart, TrendingUp,
  Wallet, Clock, ShieldCheck, Zap, BookOpen, Layers, Database, Workflow, FlaskConical,
  Brain, Server, AlertTriangle, Map, Table2, GraduationCap, Code2, type LucideIcon
} from 'lucide-react'

const REGISTRY: Record<string, LucideIcon> = {
  boxes: Boxes,
  type: Type,
  branch: GitBranch,
  function: FunctionSquare,
  braces: Braces,
  chart: CandlestickChart,
  trend: TrendingUp,
  wallet: Wallet,
  clock: Clock,
  shield: ShieldCheck,
  zap: Zap,
  book: BookOpen,
  layers: Layers,
  database: Database,
  workflow: Workflow,
  flask: FlaskConical,
  brain: Brain,
  server: Server,
  alert: AlertTriangle,
  map: Map,
  table: Table2,
  cap: GraduationCap,
  code: Code2
}

export default function Icon({ name, size = 18, className = '' }: { name: string; size?: number; className?: string }) {
  const Cmp = REGISTRY[name] ?? Code2
  return <Cmp size={size} className={className} />
}
