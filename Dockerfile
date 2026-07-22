FROM node:22-slim
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy local artifacts built on host
COPY . .

# Expose port 3000
EXPOSE 3000

CMD ["node_modules/.bin/next", "start"]
