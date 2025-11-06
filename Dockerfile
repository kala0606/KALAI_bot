FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY kalai_system_prompt.txt ./
COPY index.js ./
RUN npm install --production
CMD ["npm", "start"]