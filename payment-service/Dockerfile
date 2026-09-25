FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run prisma:generate
# Start scripts conforme cada framework:
# NestJS: npm run start:dev
# AdonisJS: npm run dev
CMD ["npm", "run", "dev"]
