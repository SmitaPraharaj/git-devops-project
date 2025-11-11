FROM node:18-alpine

WORKDIR /app

# Copy only package files first to leverage layer caching
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source
COPY . ./

EXPOSE 5000
CMD ["npm", "start"]



