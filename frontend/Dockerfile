FROM node:18-alpine

WORKDIR /app

# Install dependencies using lockfile for reproducibility
COPY package*.json ./
RUN npm ci

# Copy application source
COPY . ./

# Ensure CRA dev server binds to all interfaces
ENV HOST=0.0.0.0

EXPOSE 3000
CMD ["npm", "start"]



