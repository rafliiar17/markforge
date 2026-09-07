FROM oven/bun:1.4.0-debian

# Install LibreOffice Writer and headless fonts for 1:1 parity rendering
RUN apt-get update && apt-get install -y --no-install-recommends \
    libreoffice-writer \
    fonts-liberation \
    fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy root workspace and package manifests
COPY package.json ./
COPY packages/core/package.json ./packages/core/
COPY packages/cli/package.json ./packages/cli/
COPY packages/mcp/package.json ./packages/mcp/
COPY packages/web/package.json ./packages/web/

RUN bun install

# Copy application source
COPY . .

# Build packages and web app
RUN bun run build

EXPOSE 3030

CMD ["bun", "run", "--cwd", "packages/web", "start"]
