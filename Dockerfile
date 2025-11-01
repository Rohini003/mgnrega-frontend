FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
# serve with a tiny static server
RUN npm i -g serve
CMD ["serve", "-s", "dist", "-l", "3000"]
