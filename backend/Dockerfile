FROM node:20 as build

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

# Copy package.json and install production dependencies only
COPY package*.json ./
RUN npm install --only=production

# Copy built files from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/typescript ./node_modules/typescript

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

EXPOSE 3000

CMD ["node", "dist/index.js"]
