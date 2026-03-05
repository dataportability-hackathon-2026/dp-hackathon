import logging
import os

from dotenv import load_dotenv
from livekit.agents import (
    AutoSubscribe,
    JobContext,
    WorkerOptions,
    cli,
    llm,
)
from livekit.agents.pipeline import VoicePipelineAgent
from livekit.plugins import openai, silero

load_dotenv(dotenv_path=".env.local")
logger = logging.getLogger("learning-agent")

AI_GATEWAY_BASE_URL = "https://ai-gateway.vercel.sh/v1"
AI_GATEWAY_API_KEY = os.environ.get("AI_GATEWAY_API_KEY", "")


async def entrypoint(ctx: JobContext):
    initial_ctx = llm.ChatContext().append(
        role="system",
        text=(
            "You are a friendly and knowledgeable learning assistant. "
            "You help students understand concepts, quiz them, and provide "
            "encouragement. Keep responses concise and conversational since "
            "this is a voice interaction. Ask follow-up questions to check "
            "understanding."
        ),
    )

    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    participant = await ctx.wait_for_participant()
    logger.info(f"Participant joined: {participant.identity}")

    agent = VoicePipelineAgent(
        vad=silero.VAD.load(),
        stt=openai.STT(
            base_url=AI_GATEWAY_BASE_URL,
            api_key=AI_GATEWAY_API_KEY,
        ),
        llm=openai.LLM(
            model="openai/gpt-4o-mini",
            base_url=AI_GATEWAY_BASE_URL,
            api_key=AI_GATEWAY_API_KEY,
        ),
        tts=openai.TTS(
            base_url=AI_GATEWAY_BASE_URL,
            api_key=AI_GATEWAY_API_KEY,
        ),
        chat_ctx=initial_ctx,
    )

    agent.start(ctx.room, participant)
    await agent.say(
        "Hi! I'm your learning assistant. What would you like to study today?",
        allow_interruptions=True,
    )


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
        ),
    )
