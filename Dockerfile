# Base stage
FROM node:20-alpine AS base
WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# Build stage
FROM base AS build

# Accept build arguments
ARG CMS_URL
ARG ORDER_URL

# Set as environment variables for the build
ENV CMS_URL=${CMS_URL}
ENV ORDER_URL=${ORDER_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production stage
FROM base AS production
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/.output ./.output
COPY package.json ./

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]