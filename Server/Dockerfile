# Node.js Stage
FROM node:20-alpine3.19 as node_stage

WORKDIR /app

COPY package.json .
RUN npm install

# Copy all other source code
COPY . .

RUN npm run build

# Final Stage
FROM node:20-alpine3.19

LABEL name="lhd_backend"

EXPOSE 3000

WORKDIR /app

# Copy built files and node_modules from previous stage
COPY --from=node_stage /app/build ./build
COPY --from=node_stage /app/node_modules ./node_modules

RUN npm init es6

# ARG DB_HOST
# ARG DB_USER
# ARG BD_DATABASE_NAME
ENV DB_HOST=localhost
ENV DB_USER=root
ENV BD_DATABASE_NAME=who_wrote_that

EXPOSE 3000

CMD ["node", "build/index.js"]
