import { evalite } from "evalite"
import { generateSpatial } from "../src/lib/ai/generate-artifact"
import type { ArtifactInput } from "../src/lib/ai/generate-artifact"
import type { SpatialArtifactData } from "../src/lib/ai/schemas"
import { LINEAR_ALGEBRA_CONCEPTS } from "./fixtures"
import { spatialPositionSpread, spatialConnectionValidity } from "./scorers"

type SpatialEvalInput = ArtifactInput & { concepts: string[] }

const spatialObjectCount = {
  name: "Spatial Object Count",
  description: "Checks that the model has a meaningful number of objects (4-10)",
  scorer: ({ output }: { input: SpatialEvalInput; output: SpatialArtifactData }) => {
    if (output.objects.length >= 4 && output.objects.length <= 10) return 1
    if (output.objects.length >= 2) return 0.5
    return 0
  },
}

const spatialColorValidity = {
  name: "Spatial Color Validity",
  description: "Checks that all colors are valid hex codes",
  scorer: ({ output }: { input: SpatialEvalInput; output: SpatialArtifactData }) => {
    const hexPattern = /^#[0-9a-fA-F]{6}$/
    const valid = output.objects.filter((o) => hexPattern.test(o.color))
    return valid.length / output.objects.length
  },
}

const spatialBoundsCheck = {
  name: "Spatial Bounds Check",
  description: "Checks that all positions are within -5 to 5 range",
  scorer: ({ output }: { input: SpatialEvalInput; output: SpatialArtifactData }) => {
    const inBounds = output.objects.filter(
      (o) =>
        o.x >= -5 && o.x <= 5 &&
        o.y >= -5 && o.y <= 5 &&
        o.z >= -5 && o.z <= 5,
    )
    return inBounds.length / output.objects.length
  },
}

evalite<SpatialEvalInput, SpatialArtifactData>(
  "Spatial Artifact Generation",
  {
    data: () => [
      {
        input: {
          subject: "Linear Algebra",
          concepts: LINEAR_ALGEBRA_CONCEPTS,
          priorKnowledgeLevel: "beginner",
          goalType: "exam",
        },
        expected: undefined,
      },
      {
        input: {
          subject: "Chemistry",
          concepts: [
            "Molecular Structure",
            "Chemical Bonds",
            "Electron Orbitals",
            "Periodic Table Trends",
          ],
          priorKnowledgeLevel: "intermediate",
          goalType: "fluency",
        },
        expected: undefined,
      },
    ],
    task: async (input) => {
      return generateSpatial(input)
    },
    scorers: [
      spatialObjectCount,
      spatialColorValidity,
      spatialBoundsCheck,
      spatialPositionSpread,
      spatialConnectionValidity,
    ],
  },
)
