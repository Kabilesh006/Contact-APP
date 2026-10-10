FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production
ENV PORT=3000
ENV MONGODB_URI="mongodb+srv://kabileshwaranjaganathan_db_user:kabilesh_0911@cluster0.syvvxet.mongodb.net/contact_management?retryWrites=true&w=majority&appName=Cluster0"

EXPOSE 3000

CMD ["npm", "start"]
