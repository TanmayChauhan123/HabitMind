import {
  Sparkles,
  Accessibility,
  Dumbbell,
  Footprints,
  BookOpen,
  Brain,
  Briefcase,
  HeartPulse,
  Wallet,
  Palette,
  Users,
  Moon,
  Coffee,
  CalendarCheck,
  Bike,
  Apple,
  Droplets,
  Timer,
  Sun,
  BedDouble,
  NotebookPen,
  Wind,
  Utensils,
  Salad,
  Soup,
  Music,
  Headphones,
  Camera,
  PenLine,
  Pencil,
  Laptop,
  Monitor,
  Smartphone,
  MessageCircle,
  Phone,
  Mail,
  Home,
  TreePine,
  Mountain,
  Waves,
  Heart,
  Smile,
  Flower2,
  Leaf,
  CircleDollarSign,
  PiggyBank,
  ShoppingBag,
  ShoppingCart,
  Calculator,
  GraduationCap,
  Library,
  Languages,
  Lightbulb,
  Target,
  ListTodo,
  ClipboardCheck,
  AlarmClock,
  Clock,
  CalendarDays,
  Map,
  Car,
  Train,
  StretchHorizontal,
  PersonStanding,
  GlassWater,
  Bath,
  Pill,
  Stethoscope,
  CookingPot,
  Gamepad2,
  Tv,
  ShieldCheck,
  CheckCircle,
  CircleCheck,
} from "lucide-react";

const iconMap = {
  // Fitness
  fitness_center: Dumbbell,
  fitness: Dumbbell,
  workout: Dumbbell,
  gym: Dumbbell,
  exercise: Dumbbell,

  hiking: Footprints,
  walking: Footprints,
  walk: Footprints,
  running: Footprints,
  jogging: Footprints,

  stretching: StretchHorizontal,
  stretch: StretchHorizontal,

  cycling: Bike,
  biking: Bike,
  bike: Bike,

  // Mindfulness
  mindfulness: Brain,
  meditation: Brain,
  meditate: Brain,

  breathing: Wind,
  breathwork: Wind,
  wind: Wind,

  relaxation: Flower2,
  relax: Flower2,
  calm: Smile,

  // Learning
  learning: BookOpen,
  book: BookOpen,
  books: BookOpen,
  reading: BookOpen,
  read: BookOpen,

  menu_book: BookOpen,
  book_open: BookOpen,

  study: GraduationCap,
  studying: GraduationCap,
  education: GraduationCap,

  library: Library,
  language: Languages,
  languages: Languages,

  // Productivity
  productivity: Briefcase,
  work: Briefcase,
  focus: Target,
  goals: Target,

  planning: CalendarCheck,
  plan: CalendarCheck,

  tasks: ListTodo,
  task: ListTodo,
  todo: ListTodo,

  checklist: ClipboardCheck,

  edit: Pencil,
  pencil: Pencil,

  writing: PenLine,
  journaling: NotebookPen,
  journal: NotebookPen,

  // Health
  health: HeartPulse,
  wellness: HeartPulse,
  heart: Heart,
  healthcare: Stethoscope,

  medicine: Pill,
  medication: Pill,

  recovery: HeartPulse,

  sleep: Moon,
  sleeping: BedDouble,
  bedtime: BedDouble,
  rest: BedDouble,

  // Food / Water
  nutrition: Apple,
  food: Utensils,
  eating: Utensils,

  cooking: CookingPot,
  cook: CookingPot,

  salad: Salad,
  meal: Salad,
  soup: Soup,

  water: Droplets,
  water_drop: Droplets,

  hydration: GlassWater,
  drinking: GlassWater,
  drink: GlassWater,

  wine: GlassWater,

  // Finance
  finance: Wallet,
  money: CircleDollarSign,

  savings: PiggyBank,
  saving: PiggyBank,

  budget: Calculator,

  shopping: ShoppingBag,
  shopping_bag: ShoppingBag,
  shopping_cart: ShoppingCart,

  // Creative
  creative: Palette,
  creativity: Palette,
  art: Palette,
  drawing: Palette,
  painting: Palette,

  music: Music,
  singing: Music,

  photography: Camera,
  camera: Camera,

  // Audio
  headphones: Headphones,
  headphone: Headphones,
  audio: Headphones,
  audiobook: Headphones,

  // Social
  social: Users,
  friends: Users,
  friendship: Users,
  family: Users,

  communication: MessageCircle,
  talking: MessageCircle,
  messaging: MessageCircle,

  phone: Phone,
  calling: Phone,

  email: Mail,
  mail: Mail,

  // Digital
  phone_usage: Smartphone,
  smartphone: Smartphone,
  screen_time: Smartphone,
  digital_detox: Smartphone,

  laptop: Laptop,
  computer: Monitor,
  desktop: Monitor,

  gaming: Gamepad2,
  game: Gamepad2,

  television: Tv,
  tv: Tv,

  // Outdoors
  nature: Leaf,
  outdoors: TreePine,
  outdoor: TreePine,
  park: TreePine,
  forest: TreePine,

  mountain: Mountain,
  beach: Waves,
  swimming: Waves,

  // Travel
  travel: Map,
  map: Map,
  car: Car,
  driving: Car,
  train: Train,

  // Home
  home: Home,
  cleaning: Home,
  chores: Home,
  household: Home,

  bath: Bath,
  bathing: Bath,

  // Routine
  timer: Timer,
  time: Clock,

  morning: Sun,
  sunrise: Sun,

  evening: Moon,
  night: Moon,

  alarm: AlarmClock,
  schedule: CalendarDays,
  calendar: CalendarDays,

  // General
  accessibility: Accessibility,

  selfcare: Heart,
  self_care: Heart,

  positivity: Smile,
  positive: Smile,

  personal_growth: Target,
  growth: Leaf,

  lightbulb: Lightbulb,
  idea: Lightbulb,

  target: Target,

  habit: CheckCircle,
  consistency: CircleCheck,
  safety: ShieldCheck,
};

export default function HabitIcon({ icon, size = 20, className = "" }) {
  if (!icon) {
    return <Sparkles size={size} className={className} strokeWidth={1.8} />;
  }

  const key = String(icon)
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_");

  const Icon = iconMap[key];

  if (Icon) {
    return <Icon size={size} className={className} strokeWidth={1.8} />;
  }

  // Safe fallback for unknown AI-generated icon names
  return <Sparkles size={size} className={className} strokeWidth={1.8} />;
}
