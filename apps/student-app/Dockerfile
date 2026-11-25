FROM node:22-alpine AS build
WORKDIR /workspace
COPY package.json package-lock.json* ./
COPY apps/student-app/package.json apps/student-app/package.json
RUN npm install
COPY apps/student-app apps/student-app
WORKDIR /workspace/apps/student-app
ARG EXPO_PUBLIC_API_BASE_URL=/api/v1
ENV EXPO_PUBLIC_API_BASE_URL=$EXPO_PUBLIC_API_BASE_URL
RUN npm run build:web

FROM nginx:1.27-alpine
COPY infra/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/apps/student-app/dist /usr/share/nginx/html
EXPOSE 80
