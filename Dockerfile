FROM node:lts-slim AS builder

ENV DB_PATH="/data/database.sqlite" TOKEN_SIGN_SECRET="note-sign-secret" BCRYPT_SALT_ROUNDS="12" TOKEN_EXPIRE="24"

# Set the working directory
WORKDIR /app/

COPY . .
# Install all dependencies, type checking via typescript compiler, and transpile the source code into production
RUN npm install

RUN npm install ts-node --global

EXPOSE 3333 3333

# Command To be Run on Start
ENTRYPOINT ["ts-node","src/bin/www.ts"]
