# Use the same Node version as your local machine
FROM node:20-alpine

WORKDIR /app

# Copy package files first to optimize rebuild speed
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the production assets
RUN npm run build

# Vite Preview defaults to 4173
EXPOSE 4173

# Run vite preview and bind to all network interfaces (0.0.0.0)
# This allows the container to talk to your browser
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "4173"]