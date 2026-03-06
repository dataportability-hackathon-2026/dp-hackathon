FROM oven/bun:1 AS base
WORKDIR /app

ENV NODE_ENV=production

# Install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Copy application files
COPY agent.mjs ./

# Run the agent
CMD ["bun", "run", "agent.mjs", "start"]
