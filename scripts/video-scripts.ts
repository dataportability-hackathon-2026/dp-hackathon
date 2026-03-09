type Scene = {
  prompt: string;
  narration: string;
  durationSeconds: number;
};

type VideoScript = {
  id: string;
  title: string;
  tagline: string;
  voice:
    | "alloy"
    | "ash"
    | "ballad"
    | "coral"
    | "echo"
    | "fable"
    | "nova"
    | "onyx"
    | "sage"
    | "shimmer"
    | "verse";
  voiceInstructions?: string;
  scenes: Scene[];
};

export const videoScripts: VideoScript[] = [
  {
    id: "have-you-ever",
    title: "Have You Ever...",
    tagline: "Learning that adapts to you, not the other way around.",
    voice: "nova",
    scenes: [
      {
        prompt:
          "A young professional woman sitting at a cluttered desk late at night, overwhelmed by stacks of textbooks and scattered notes, rubbing her temples in frustration. Warm desk lamp casting golden light, shallow depth of field, cinematic 4K. Camera slowly dollies in on her expression of exhaustion. Moody, relatable, real-life documentary style.",
        narration:
          "Have you ever felt like no matter how hard you study, nothing sticks? Hours at your desk, and it all just... blurs together.",
        durationSeconds: 8,
      },
      {
        prompt:
          "Close-up of a modern smartphone screen showing an elegant learning app interface with adaptive quiz cards, progress rings filling up in real-time, and personalized topic recommendations. Soft white studio lighting reflected on the glass screen. Camera tilts up slowly. Clean, aspirational, tech-forward aesthetic.",
        narration:
          "What if your learning could adapt to you? Intelligent algorithms that know exactly what you need, exactly when you need it.",
        durationSeconds: 6,
      },
      {
        prompt:
          "A diverse group of three medical students in white coats studying together in a bright modern library, smiling and pointing at a tablet screen showing 3D anatomy visualizations. Natural daylight streaming through floor-to-ceiling windows. Camera tracks laterally across the group. Warm, collaborative, hopeful mood.",
        narration:
          "CoreModel uses spaced repetition and adaptive difficulty to help you truly master your material — not just memorize it.",
        durationSeconds: 8,
      },
      {
        prompt:
          "A confident young man walking out of a modern glass office building into golden hour sunlight, putting on sunglasses with a satisfied smile, city skyline in the background. Camera follows from a low angle, steadicam movement. Cinematic lens flare, aspirational, triumphant energy. The feeling of having mastered something important.",
        narration:
          "CoreModel. Learning that adapts to you, not the other way around. Start your journey today.",
        durationSeconds: 8,
      },
    ],
  },
  {
    id: "do-you-wish",
    title: "Do You Wish...",
    tagline: "Your learning path, intelligently mapped.",
    voice: "coral",
    voiceInstructions:
      "Speak as an intelligent, confident American woman in her late 20s. Your tone is warm with optimistic curiosity — like you're genuinely excited to share a discovery. Pace yourself naturally with purposeful pauses between sentences. Sound like a TED speaker, not a commercial narrator.",
    scenes: [
      {
        prompt:
          "A college student in a hoodie scrolling endlessly through a generic online course platform on a laptop, looking bored and disengaged. Flat overhead fluorescent lighting in a dorm room. Camera slowly zooms out to reveal the messy, uninspiring environment. Muted colors, monotonous, stagnant feeling.",
        narration:
          "Most learning still looks like this. Long nights. Endless notes. Trying to piece together ideas that never quite connect. But what if the system actually understood what you know — and what you're ready to discover next?",
        durationSeconds: 8,
      },
      {
        prompt:
          "A sleek modern presentation screen showing elegant data visualizations, charts with upward trends, and insight cards with key metrics. A confident presenter gestures toward the screen in a bright, well-lit conference room. Camera slowly pushes in on the screen. Clean, professional, aspirational tech aesthetic.",
        narration:
          "Introducing CoreModel. Because the real advantage isn't studying more. It's seeing the structure behind the knowledge — the patterns others miss. The people who learn this way don't just keep up. They move ahead.",
        durationSeconds: 8,
      },
      {
        prompt:
          "A beautiful animated knowledge network visualization — glowing nodes representing concepts connected by luminous edges, with new connections lighting up in sequence across the screen. Camera slowly orbits through the 3D network. Rich blues, purples, and warm gold highlights. Futuristic, elegant, the feeling of understanding clicking into place.",
        narration:
          "It maps your understanding in real time. It finds the hidden gaps between ideas and turns them into your next insight. Not memorization. Discovery.",
        durationSeconds: 6,
      },
      {
        prompt:
          "Aerial drone shot slowly rising above a vibrant university campus at golden hour, students walking along tree-lined pathways. Text-friendly negative space in the sky area. Warm cinematic color grading, lens flare from the setting sun. Sweeping, inspirational, the feeling of unlimited potential and a bright future ahead.",
        narration:
          "A new generation of thinkers is learning this way. The only question is how far ahead they'll be. CoreModel. Your learning path, intelligently mapped. Start free today.",
        durationSeconds: 8,
      },
    ],
  },
  {
    id: "if-you-could",
    title: "If You Could...",
    tagline: "Master anything. Forget nothing.",
    voice: "shimmer",
    scenes: [
      {
        prompt:
          "Extreme close-up of human eyes reflecting a glowing screen with scrolling code and formulas. The iris catches the blue-white light. Macro lens, shallow depth of field, dark background. Camera holds steady with slight breathing movement. Mysterious, intense, the moment of deep focus and concentration.",
        narration:
          "If you could remember everything you learned — every concept, every detail — how would that change your life?",
        durationSeconds: 6,
      },
      {
        prompt:
          "A time-lapse style shot of a person at a minimalist desk, day turning to night through the window behind them. Books and notes organize themselves, a coffee cup empties and refills. Smooth motion, warm-to-cool color temperature shift. Camera locked off, centered composition. The passage of dedicated learning time.",
        narration:
          "The science of memory isn't magic. It's timing. CoreModel uses proven spaced repetition to lock knowledge into long-term memory.",
        durationSeconds: 6,
      },
      {
        prompt:
          "Split screen showing four diverse professionals in different settings: a nurse checking patient data on a tablet, a lawyer reviewing case files, a software engineer debugging code, and a teacher preparing interactive lessons. All show moments of confident competence. Bright, varied lighting per scene. Dynamic, multicultural, real-world application.",
        narration:
          "Whether you're in medicine, law, engineering, or education — CoreModel adapts to your field and your pace.",
        durationSeconds: 6,
      },
      {
        prompt:
          "A person's hands interacting with a sleek tablet showing a spaced repetition learning interface — cards flipping, retention scores climbing, streak counters incrementing. Beautiful UI with smooth animations. Overhead camera angle, soft directional lighting casting gentle shadows. Satisfying, tactile, the pleasure of measurable progress.",
        narration:
          "Watch your retention climb. Track your streaks. Feel the difference when learning actually works.",
        durationSeconds: 6,
      },
      {
        prompt:
          "Wide cinematic shot of a young graduate standing at the edge of a rooftop terrace overlooking a city at twilight, arms slightly spread, wind in their hair. City lights beginning to twinkle below. Camera slowly orbits around them. Silhouette against a gradient sky of orange to deep blue. Triumphant, limitless, the culmination of a learning journey.",
        narration:
          "CoreModel. Master anything. Forget nothing. Your future starts now.",
        durationSeconds: 6,
      },
    ],
  },
];
