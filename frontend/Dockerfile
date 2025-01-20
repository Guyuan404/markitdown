# 构建阶段
FROM node:18-alpine as build

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 只复制必要的源代码
COPY src ./src
COPY public ./public
COPY tailwind.config.js .
COPY postcss.config.js .
COPY nginx.conf .
COPY .env.production .env.production

# 构建应用
RUN npm run build

# 生产阶段
FROM nginx:alpine-slim

# 复制构建产物到 Nginx
COPY --from=build /app/build /usr/share/nginx/html

# 复制 nginx 配置
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
