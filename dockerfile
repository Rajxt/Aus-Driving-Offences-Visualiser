# Use Nginx to serve static files
FROM nginx:alpine

# Copy all your HTML/CSS/JS files to the default Nginx folder
COPY . /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
