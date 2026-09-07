FROM nginx:alpine

# Copy pre-built dist folder
COPY dist/ /usr/share/nginx/html/

# Copy nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
