"use client"

import { useMemo } from "react"
import { DeckGL } from "@deck.gl/react"
import { ArcLayer } from "@deck.gl/layers"
import { Map } from "react-map-gl/maplibre"
import "maplibre-gl/dist/maplibre-gl.css"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { GeoArtifact, GeoArcData } from "./artifact-store"
import type { MapViewState, PickingInfo } from "@deck.gl/core"

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json"

const ARC_COLORS: [number, number, number][] = [
  [255, 255, 204],
  [199, 233, 180],
  [127, 205, 187],
  [65, 182, 196],
  [29, 145, 192],
  [34, 94, 168],
  [12, 44, 132],
]

function getTooltip({ object }: PickingInfo<GeoArcData>) {
  if (!object) return null
  return `${object.from.name} → ${object.to.name}\nValue: ${object.value}`
}

export function GeoCard({ artifact }: { artifact: GeoArtifact }) {
  const initialViewState: MapViewState = useMemo(
    () => ({
      longitude: artifact.viewState?.longitude ?? 0,
      latitude: artifact.viewState?.latitude ?? 20,
      zoom: artifact.viewState?.zoom ?? 2,
      pitch: artifact.viewState?.pitch ?? 30,
      bearing: artifact.viewState?.bearing ?? 0,
    }),
    [artifact.viewState],
  )

  const maxValue = useMemo(
    () => Math.max(...artifact.arcs.map((a) => a.value)),
    [artifact.arcs],
  )

  const layers = useMemo(
    () => [
      new ArcLayer<GeoArcData>({
        id: `arc-${artifact.id}`,
        data: artifact.arcs,
        getSourcePosition: (d) => d.from.coordinates,
        getTargetPosition: (d) => d.to.coordinates,
        getSourceColor: (d) => {
          const t = d.value / maxValue
          const idx = Math.min(Math.floor(t * ARC_COLORS.length), ARC_COLORS.length - 1)
          return [...ARC_COLORS[idx], 200] as [number, number, number, number]
        },
        getTargetColor: (d) => {
          const t = d.value / maxValue
          const idx = Math.min(Math.floor(t * ARC_COLORS.length), ARC_COLORS.length - 1)
          return [...ARC_COLORS[idx], 200] as [number, number, number, number]
        },
        getWidth: (d) => 1 + (d.value / maxValue) * 4,
        pickable: true,
        greatCircle: true,
      }),
    ],
    [artifact.arcs, artifact.id, maxValue],
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>{artifact.title}</CardTitle>
        <CardDescription>{artifact.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className="relative h-[400px] overflow-hidden rounded-lg border"
          data-testid={`geo-${artifact.id}`}
        >
          <DeckGL
            initialViewState={initialViewState}
            controller
            layers={layers}
            getTooltip={getTooltip}
            style={{ position: "relative", width: "100%", height: "100%" }}
          >
            <Map reuseMaps mapStyle={MAP_STYLE} />
          </DeckGL>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{artifact.arcs.length} connections</span>
          <span>{artifact.createdAt}</span>
        </div>
      </CardContent>
    </Card>
  )
}
