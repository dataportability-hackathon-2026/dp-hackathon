type Scene = {
  prompt: string;
  durationSeconds: number;
};

type VideoScript = {
  id: string;
  title: string;
  tagline: string;
  scenes: Scene[];
};

export const videoScripts: VideoScript[] = [
  {
    id: "have-you-ever",
    title: "Have You Ever...",
    tagline: "Learning that adapts to you, not the other way around.",
    scenes: [
      {
        prompt:
          "A young professional woman sitting at a cluttered desk late at night, overwhelmed by stacks of textbooks and scattered notes, rubbing her temples in frustration. Warm desk lamp casting golden light, shallow depth of field, cinematic 4K. Camera slowly dollies in on her expression of exhaustion. Moody, relatable, real-life documentary style.",
        durationSeconds: 8,
      },
      {
        prompt:
          "Close-up of a modern smartphone screen showing an elegant learning app interface with adaptive quiz cards, progress rings filling up in real-time, and personalized topic recommendations. Soft white studio lighting reflected on the glass screen. Camera tilts up slowly. Clean, aspirational, tech-forward aesthetic.",
        durationSeconds: 6,
      },
      {
        prompt:
          "A diverse group of three medical students in white coats studying together in a bright modern library, smiling and pointing at a tablet screen showing 3D anatomy visualizations. Natural daylight streaming through floor-to-ceiling windows. Camera tracks laterally across the group. Warm, collaborative, hopeful mood.",
        durationSeconds: 8,
      },
      {
        prompt:
          "A confident young man walking out of a modern glass office building into golden hour sunlight, putting on sunglasses with a satisfied smile, city skyline in the background. Camera follows from a low angle, steadicam movement. Cinematic lens flare, aspirational, triumphant energy. The feeling of having mastered something important.",
        durationSeconds: 8,
      },
    ],
  },
  {
    id: "do-you-wish",
    title: "Do You Wish...",
    tagline: "Your learning path, intelligently mapped.",
    scenes: [
      {
        prompt:
          "A college student in a hoodie scrolling endlessly through a generic online course platform on a laptop, looking bored and disengaged. Flat overhead fluorescent lighting in a dorm room. Camera slowly zooms out to reveal the messy, uninspiring environment. Muted colors, monotonous, stagnant feeling.",
        durationSeconds: 8,
      },
      {
        prompt:
          "Dramatic transition: the same laptop screen transforms into a vibrant, personalized learning dashboard with flowing animated knowledge graphs, glowing neural network connections, and a clear progress pathway lighting up. Camera pushes in dynamically. Rich blues and purples, energetic, futuristic UI animation.",
        durationSeconds: 8,
      },
      {
        prompt:
          "A professional woman in business attire confidently presenting to a boardroom of colleagues, gesturing at a data visualization on a large screen. She speaks with authority. Soft corporate lighting, shallow depth of field on her face. Camera captures nodding approval from the audience. Empowered, polished, real-world success.",
        durationSeconds: 6,
      },
      {
        prompt:
          "Aerial drone shot slowly rising above a vibrant university campus at golden hour, students walking along tree-lined pathways. Text-friendly negative space in the sky area. Warm cinematic color grading, lens flare from the setting sun. Sweeping, inspirational, the feeling of unlimited potential and a bright future ahead.",
        durationSeconds: 8,
      },
    ],
  },
  {
    id: "if-you-could",
    title: "If You Could...",
    tagline: "Master anything. Forget nothing.",
    scenes: [
      {
        prompt:
          "Extreme close-up of human eyes reflecting a glowing screen with scrolling code and formulas. The iris catches the blue-white light. Macro lens, shallow depth of field, dark background. Camera holds steady with slight breathing movement. Mysterious, intense, the moment of deep focus and concentration.",
        durationSeconds: 6,
      },
      {
        prompt:
          "A time-lapse style shot of a person at a minimalist desk, day turning to night through the window behind them. Books and notes organize themselves, a coffee cup empties and refills. Smooth motion, warm-to-cool color temperature shift. Camera locked off, centered composition. The passage of dedicated learning time.",
        durationSeconds: 6,
      },
      {
        prompt:
          "Split screen showing four diverse professionals in different settings: a nurse checking patient data on a tablet, a lawyer reviewing case files, a software engineer debugging code, and a teacher preparing interactive lessons. All show moments of confident competence. Bright, varied lighting per scene. Dynamic, multicultural, real-world application.",
        durationSeconds: 6,
      },
      {
        prompt:
          "A person's hands interacting with a sleek tablet showing a spaced repetition learning interface — cards flipping, retention scores climbing, streak counters incrementing. Beautiful UI with smooth animations. Overhead camera angle, soft directional lighting casting gentle shadows. Satisfying, tactile, the pleasure of measurable progress.",
        durationSeconds: 6,
      },
      {
        prompt:
          "Wide cinematic shot of a young graduate standing at the edge of a rooftop terrace overlooking a city at twilight, arms slightly spread, wind in their hair. City lights beginning to twinkle below. Camera slowly orbits around them. Silhouette against a gradient sky of orange to deep blue. Triumphant, limitless, the culmination of a learning journey.",
        durationSeconds: 6,
      },
    ],
  },
];
